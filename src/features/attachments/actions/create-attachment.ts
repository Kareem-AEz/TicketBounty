"use server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { MAX_ATTACHMENT_COUNT } from "../constants";
import { createAttachments } from "../service/create-attachments";
import { getAttachmentSubject } from "../service/get-attachment-subject";
import { isTicketSubjectAttachment } from "../types";
import { processAttachments } from "../utils/process-attachments";

type CreateAttachmentArgs = {
  entityId: string;
  entity: AttachmentEntity;
};

export async function createAttachment(
  { entityId, entity }: CreateAttachmentArgs,
  _actionState: ActionState,
  formData: FormData,
) {
  const { id: userId } = await getAuthOrRedirect();

  try {
    // -- PHASE 1: PROCESS FILES (CPU-bound) --
    // Hash and validate files before touching the DB.
    const attachments = Array.from(formData.getAll("attachment"));
    if (attachments.some((att) => typeof att === "string")) {
      throw new Error(
        "Invalid attachment payload: expected only File objects.",
      );
    }
    const files = attachments.filter((att) => att instanceof File);
    const { errors, toAdd } = await processAttachments({
      newAttachments: files,
    });

    if (errors.length > 0) throw new Error("Invalid attachments");

    // -- PHASE 2: READ-ONLY VALIDATION TRANSACTION --
    // Validate ownership, check limits, and extract the storage context
    // (organizationId, ticketId) needed to generate S3 keys.
    // No records are created here — the transaction stays as short as possible.
    const { organizationId, ticketId, existingCount, existingHashes } =
      await prisma.$transaction(async (tx) => {
        const [subject, existingAttachments] = await Promise.all([
          getAttachmentSubject({ entityId, entity, options: { tx } }),
          tx.attachment.findMany({
            where: {
              [entity === AttachmentEntity.TICKET ? "ticketId" : "commentId"]:
                entityId,
            },
            select: { hash: true },
          }),
        ]);

        if (!subject) throw new Error("Subject not found");

        const existingCount = existingAttachments.length;
        if (existingCount >= MAX_ATTACHMENT_COUNT)
          throw new Error(
            `Maximum number of attachments (${MAX_ATTACHMENT_COUNT}) reached`,
          );

        let organizationId: string;
        let ticketId: string;

        if (isTicketSubjectAttachment(subject)) {
          if (!subject.organizationId)
            throw new Error("Ticket is not associated with an organization");
          if (!isOwner(userId, subject.userId ?? undefined))
            throw new Error("You are not the owner of this ticket");

          organizationId = subject.organizationId;
          ticketId = subject.id;
        } else {
          if (!isOwner(userId, subject.userId ?? undefined))
            throw new Error("You are not the owner of this comment");
          if (!subject.ticket.organizationId)
            throw new Error("Comment is not associated with an organization");

          organizationId = subject.ticket.organizationId;
          ticketId = subject.ticket.id;
        }

        return {
          organizationId,
          ticketId,
          existingCount,
          existingHashes: new Set(existingAttachments.map((a) => a.hash)),
        };
      });

    // -- PHASE 3: PREPARE BATCH (in-memory) --
    // De-duplicate within this batch, reject conflicts with existing hashes,
    // apply the slot limit, and pre-generate a stable UUID for each file.
    // These IDs will be used for both the S3 key and the DB record, so we
    // never need to reconcile the two after the fact.
    const seenHashes = new Set<string>();
    const dedupedToAdd = toAdd.filter((a) => {
      if (seenHashes.has(a.hash)) return false;
      seenHashes.add(a.hash);
      return true;
    });

    const duplicates = dedupedToAdd.filter((a) => existingHashes.has(a.hash));
    if (duplicates.length > 0)
      throw new Error(
        `Duplicate attachments found: ${duplicates.map((a) => a.file.name).join(", ")}`,
      );

    const available = MAX_ATTACHMENT_COUNT - existingCount;
    const toUpload = dedupedToAdd
      .slice(0, available)
      .map((a) => ({ ...a, id: createId() }));

    // -- PHASE 4: S3 UPLOADS (I/O-bound) --
    // At this point no DB records exist yet.
    // If this step fails entirely, there is nothing to clean up in the DB.
    // The returned keys are held in memory for compensation in Phase 5.
    const uploadedKeys = await createAttachments({
      attachments: toUpload,
      entity,
      entityId,
      organizationId,
    });

    // -- PHASE 5: WRITE TRANSACTION --
    // S3 uploads are confirmed — now create the DB records.
    // We re-query count and hashes inside the same transaction that performs
    // the insert so validation and write are atomic. Any concurrent upload
    // that slipped in between Phase 2 and here will be caught here.
    // On failure we compensate by deleting the S3 objects we just uploaded.
    // An orphaned S3 object is invisible to users; an orphaned DB record is not.
    let createdAttachments;
    try {
      createdAttachments = await prisma.$transaction(async (tx) => {
        const entityFilter = {
          [entity === AttachmentEntity.TICKET ? "ticketId" : "commentId"]:
            entityId,
        };

        const currentAttachments = await tx.attachment.findMany({
          where: entityFilter,
          select: { hash: true },
        });

        if (currentAttachments.length >= MAX_ATTACHMENT_COUNT)
          throw new Error(
            `Maximum number of attachments (${MAX_ATTACHMENT_COUNT}) reached`,
          );

        const currentHashes = new Set(currentAttachments.map((a) => a.hash));
        const raceDuplicates = toUpload.filter((a) => currentHashes.has(a.hash));
        if (raceDuplicates.length > 0)
          throw new Error(
            `Duplicate attachments found: ${raceDuplicates.map((a) => a.file.name).join(", ")}`,
          );

        const slots = MAX_ATTACHMENT_COUNT - currentAttachments.length;
        const batch = toUpload.slice(0, slots);

        return tx.attachment.createManyAndReturn({
          data: batch.map(({ id, file, hash, mimeType }) => ({
            id,
            ...(entity === AttachmentEntity.TICKET
              ? { ticketId: entityId }
              : { commentId: entityId }),
            entity,
            name: file.name,
            hash,
            mimeType,
            storageOrganizationId: organizationId,
            storageTicketId: ticketId,
          })),
        });
      });
    } catch (dbError) {
      // -- COMPENSATION --
      // The DB write failed. Delete the S3 objects we already uploaded so
      // we don't accumulate unreferenced files. These objects have no DB
      // record yet, so this failure path is invisible to users regardless.
      await Promise.allSettled(
        uploadedKeys.map((key) =>
          s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
            }),
          ),
        ),
      );
      throw dbError;
    }

    revalidatePath(ticketPath(ticketId));

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment created",
      data: createdAttachments,
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
}
