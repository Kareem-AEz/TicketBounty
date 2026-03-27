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
    // The same ID drives both the S3 key and the DB record, so the two
    // stores are always in sync without any post-hoc reconciliation.
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
    const uploadedKeys = await attachmentsService.createAttachments({
      attachments: toUpload,
      entity: AttachmentEntity.COMMENT,
      entityId: ticketId,
      organizationId,
    });

    // -- PHASE 4: DB WRITES --
    // Upsert the comment, then create attachment records in one transaction.
    // On failure we compensate by deleting the S3 objects we already uploaded —
    // an orphaned S3 object is invisible to users; an orphaned DB record is not.
    let comment;
    try {
      comment = await prisma.$transaction(async (tx) => {
        const upsertedComment = await tx.ticketComment.upsert({
          where: { id: commentId || "" },
          update: { content: validatedContent },
          create: { content: validatedContent, ticketId, userId: user.id },
          select: { id: true },
        });

        if (toUpload.length > 0) {
          await tx.attachment.createMany({
            data: toUpload.map(({ id, file, hash, mimeType }) => ({
              id,
              commentId: upsertedComment.id,
              entity: AttachmentEntity.COMMENT,
              name: file.name,
              hash,
              mimeType,
              storageOrganizationId: organizationId,
              storageTicketId: ticketId,
            })),
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
      // Delete the S3 objects uploaded in Phase 3 so they don't accumulate.
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
