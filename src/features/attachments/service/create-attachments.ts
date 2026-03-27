import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import { ProcessedAttachmentData } from "../types";
import { generateS3Key } from "../utils/generate-s3-key";

type CreateAttachmentsArgs = {
  attachments: (ProcessedAttachmentData & { id: string })[];
  entity: AttachmentEntity;
  entityId: string;
  organizationId: string;
};

// -- THE UPLOADER --
// Uploads each attachment to S3 and returns the generated keys.
// This function has no knowledge of the database — it only moves bytes.
// Compensation (deleting these keys on DB failure) is the caller's responsibility.
export async function createAttachments({
  attachments,
  entity,
  entityId,
  organizationId,
}: CreateAttachmentsArgs): Promise<string[]> {
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
