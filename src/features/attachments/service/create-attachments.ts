import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Prisma, PrismaClient } from "@/generated/client";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";
import { ProcessedAttachmentData } from "../types";
import { generateS3Key } from "../utils/generate-s3-key";

type AttachmentUploadItem = ProcessedAttachmentData & { id: string };

type UploadAttachmentsArgs = {
  attachments: AttachmentUploadItem[];
  entity: AttachmentEntity;
  entityId: string;
  organizationId: string;
};

// -- THE UPLOADER --
// Moves bytes to S3 and returns the generated keys.
// Has no knowledge of the database — compensation on DB failure
// is the caller's responsibility.
export async function uploadAttachments({
  attachments,
  entity,
  entityId,
  organizationId,
}: UploadAttachmentsArgs): Promise<string[]> {
  return Promise.all(
    attachments.map(async ({ file, buffer, mimeType, id }) => {
      const key = generateS3Key({
        entity,
        entityId,
        organizationId,
        attachmentName: file.name,
        attachmentId: id,
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      return key;
    }),
  );
}

type CreateAttachmentsArgs = UploadAttachmentsArgs & {
  // The parent ticket ID used for the S3 path and the DB storageTicketId.
  // For TICKET entities this equals entityId; for COMMENT entities it is
  // the comment's parent ticket ID.
  storageTicketId: string;
  options?: {
    // When a transaction is provided the caller has already uploaded to S3
    // (S3 I/O must not run inside a DB transaction) and owns S3 compensation
    // on failure. When omitted, this function handles both S3 and compensation.
    tx?: PrismaClient | Prisma.TransactionClient;
  };
};

// -- THE ATTACHMENT CREATOR --
// Without tx: uploads to S3, writes DB records, compensates S3 on DB failure.
// With tx:    skips S3 (caller uploads beforehand), writes into the provided
//             transaction, leaves S3 compensation to the caller.
export async function createAttachments({
  attachments,
  entity,
  entityId,
  organizationId,
  storageTicketId,
  options,
}: CreateAttachmentsArgs) {
  const db = options?.tx ?? prisma;

  // -- S3 UPLOADS --
  // Skipped when a transaction is passed — S3 operations must not run
  // inside a DB transaction as they would hold the connection open.
  let uploadedKeys: string[] = [];
  if (!options?.tx) {
    uploadedKeys = await uploadAttachments({
      attachments,
      entity,
      entityId,
      organizationId,
    });
  }

  // -- DB WRITE + COMPENSATION --
  try {
    return await db.attachment.createManyAndReturn({
      data: attachments.map(({ id, file, hash, mimeType }) => ({
        id,
        ...(entity === AttachmentEntity.TICKET
          ? { ticketId: entityId }
          : { commentId: entityId }),
        entity,
        name: file.name,
        hash,
        mimeType,
        storageOrganizationId: organizationId,
        storageTicketId,
      })),
    });
  } catch (dbError) {
    // Only compensate keys uploaded in this call.
    // When tx is passed the caller owns S3 cleanup.
    if (uploadedKeys.length > 0) {
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
    }
    throw dbError;
  }
}
