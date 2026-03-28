"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { processFiles } from "@/components/files-input/utils/process-files";
import {
  ACCEPTED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE,
} from "@/features/attachments/constants";
import { attachmentsService } from "@/features/attachments/service";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { createComment } from "../db";
import { formSchema } from "../schema";

type CommentUpsertPropsType = {
  content: string;
  attachments: File[];
  ticketId: string;
  commentId?: string;
};

export default async function commentUpsert({
  content,
  attachments,
  ticketId,
  commentId,
}: CommentUpsertPropsType) {
  const user = await getAuthOrRedirect();

  try {
    // -- PHASE 1: VALIDATE & PROCESS (in parallel where possible) --
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { organizationId: true },
    });
    const organizationId = ticket?.organizationId;
    if (!organizationId)
      throw new Error("Ticket is not associated with an organization");

    const { content: validatedContent } = formSchema.parse({ content });

    const { toAdd, errors } = await processFiles({
      newFiles: attachments,
      config: {
        maxFiles: MAX_ATTACHMENT_COUNT,
        maxSize: MAX_ATTACHMENT_SIZE,
        acceptedTypes: ACCEPTED_ATTACHMENT_TYPES,
      },
    });

    if (errors.length > 0) throw new Error("Invalid attachments");

    // -- PHASE 2: PRE-GENERATE IDs --
    // Pre-generate the comment ID so both the S3 key and the DB record share
    // the same commentId. This is required because the S3 upload (Phase 3)
    // must happen before the transaction (Phase 4), but the S3 key for a
    // COMMENT attachment must use the commentId — not the ticketId.
    const targetCommentId = commentId ?? createId();

    const toUpload = toAdd.map((a) => ({
      id: createId(),
      file: a.file,
      buffer: Buffer.from(a.uint8Array),
      hash: a.hash,
      mimeType: a.mimeType,
    }));

    // -- PHASE 3: S3 UPLOADS --
    // No DB records exist at this point.
    // If this throws, there is nothing to compensate in the DB.
    // We use uploadAttachments (S3-only) because the attachment DB records
    // must be created inside the same transaction as the comment upsert below.
    const uploadedKeys = await attachmentsService.uploadAttachments({
      attachments: toUpload,
      entity: AttachmentEntity.COMMENT,
      entityId: targetCommentId,
      organizationId,
    });

    // -- PHASE 4: DB WRITES --
    // Upsert the comment, then create attachment records in one transaction.
    // We call createAttachments with the transaction client so the attachment
    // writes are atomic with the comment upsert. S3 was already handled above,
    // so the service skips uploading and only performs the DB write.
    // On failure we compensate by deleting the S3 objects we already uploaded —
    // an orphaned S3 object is invisible to users; an orphaned DB record is not.
    let comment;
    try {
      comment = await prisma.$transaction(async (tx) => {
        const upsertedComment = await createComment({
          content: validatedContent,
          ticketId,
          userId: user.id,
          id: targetCommentId,
          options: { tx },
        });

        if (toUpload.length > 0) {
          await attachmentsService.createAttachments({
            attachments: toUpload,
            entity: AttachmentEntity.COMMENT,
            entityId: upsertedComment.id,
            organizationId,
            storageTicketId: ticketId,
            options: { tx },
          });
        }

        // -- RE-FETCH AFTER WRITES --
        // Reading the comment before createMany completes would return an
        // empty attachments array. We fetch here so the returned snapshot
        // is consistent with everything written in this transaction.
        return tx.ticketComment.findUniqueOrThrow({
          where: { id: upsertedComment.id },
          select: {
            id: true,
            content: true,
            createdAt: true,
            userId: true,
            ticketId: true,
            user: { select: { username: true } },
            attachments: true,
          },
        });
      });
    } catch (dbError) {
      // -- COMPENSATION --
      // The service does not compensate S3 when a transaction is provided,
      // so we own the cleanup here. Delete the objects uploaded in Phase 3.
      // Promise.allSettled ensures all deletes are attempted even if some fail.
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

    return { success: true, data: comment };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
