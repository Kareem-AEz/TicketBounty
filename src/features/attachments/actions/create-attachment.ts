"use server";
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

    // -- PHASE 4: S3 UPLOAD + DB WRITE --
    // Delegates to the service which uploads to S3, writes the DB records,
    // and compensates by deleting S3 objects if the DB write fails.
    const createdAttachments = await createAttachments({
      attachments: toUpload,
      entity,
      entityId,
      organizationId,
      storageTicketId: ticketId,
    });

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
