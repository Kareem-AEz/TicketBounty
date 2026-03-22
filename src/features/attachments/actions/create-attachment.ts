"use server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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
import {
  CommentSubjectAttachment,
  isTicketSubjectAttachment,
  TicketSubjectAttachment,
} from "../types";
import { generateS3Key } from "../utils/generate-s3-key";
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
    // 1. Process Files (CPU-bound) - Perform before transaction to minimize lock time
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

    // 2. DB Transaction (DB-bound) - Create records and return IDs
    const { createdAttachments, organizationId, ticketId } =
      await prisma.$transaction(async (tx) => {
        // -- FETCH SUBJECT + EXISTING ATTACHMENTS IN PARALLEL --
        // We attach the `entity` discriminant so the result becomes an
        // `AttachmentSubject` union that the type guards below can narrow.
        const subjectPromise =
          entity === AttachmentEntity.TICKET
            ? tx.ticket
                .findUnique({
                  where: { id: entityId },
                  select: { id: true, organizationId: true, userId: true },
                })
                .then((t): TicketSubjectAttachment | null =>
                  t ? { ...t, entity: AttachmentEntity.TICKET } : null,
                )
            : tx.ticketComment
                .findUnique({
                  where: { id: entityId },
                  select: {
                    id: true,
                    userId: true,
                    ticket: { select: { id: true, organizationId: true } },
                  },
                })
                .then((c): CommentSubjectAttachment | null =>
                  c ? { ...c, entity: AttachmentEntity.COMMENT } : null,
                );

        const [subject, existingAttachments] = await Promise.all([
          subjectPromise,
          tx.attachment.findMany({
            where: {
              [entity === AttachmentEntity.TICKET ? "ticketId" : "commentId"]:
                entityId,
            },
          }),
        ]);

        if (!subject) throw new Error("Not found");

        if (existingAttachments.length >= MAX_ATTACHMENT_COUNT)
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

        // -- DE-DUPLICATE ATTACHMENTS BY HASH --
        // We want to ensure that within this upload batch (toAdd), no two attachments have the same hash.
        // If a duplicate hash is found, we filter it out here (keeps only the first occurrence).
        // This only blocks *new* duplicates within this upload, not existing ones in the DB (checked later).
        const seenHashes = new Set<string>();
        let attachmentsData = toAdd
          .filter((attachment) => {
            if (seenHashes.has(attachment.hash)) {
              // Skip attachments with duplicate hash in this batch
              return false;
            }
            seenHashes.add(attachment.hash);
            return true;
          })
          .map((attachment) => ({
            ...(entity === AttachmentEntity.TICKET
              ? { ticketId: entityId }
              : { commentId: entityId }),
            entity,
            name: attachment.file.name,
            hash: attachment.hash,
            storageOrganizationId: organizationId,
            storageTicketId: ticketId,
            mimeType: attachment.mimeType,
          }));

        const duplicateAttachments = existingAttachments.filter((attachment) =>
          attachmentsData.some((a) => a.hash === attachment.hash),
        );

        if (duplicateAttachments.length > 0)
          throw new Error(
            `Duplicate attachments found: ${duplicateAttachments.map((a) => a.name).join(", ")}`,
          );

        const availableAttachments =
          MAX_ATTACHMENT_COUNT - existingAttachments.length;

        if (attachmentsData.length > availableAttachments)
          attachmentsData = attachmentsData.slice(0, availableAttachments);

        const createdAttachments = await tx.attachment.createManyAndReturn({
          data: attachmentsData,
        });

        return { createdAttachments, organizationId, ticketId };
      });

    // 3. S3 Uploads (I/O-bound) - Perform after transaction commits

    const fileMap = new Map(toAdd.map((a) => [a.file.name, a]));
    console.log(fileMap);

    await Promise.all(
      createdAttachments.map(async (attachment) => {
        const { id, name } = attachment;
        const original = fileMap.get(name);

        if (!original) {
          // Should not happen if data integrity is maintained
          console.error(`Attachment correlation failed for ${name}`);
          return;
        }

        const key = generateS3Key({
          entity,
          entityId,
          organizationId,
          attachmentName: name,
          attachmentId: id,
        });

        try {
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
              Body: original.buffer,
              ContentType: original.mimeType,
            }),
          );
        } catch (error) {
          console.error(`Failed to upload attachment ${id}:`, error);
          // Compensation: Delete the record if upload fails
          await prisma.attachment.delete({
            where: { id },
          });
        }
      }),
    );

    revalidatePath(ticketPath(ticketId));

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment created",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
}
