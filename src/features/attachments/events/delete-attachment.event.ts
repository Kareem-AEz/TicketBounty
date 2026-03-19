import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { eventType } from "inngest";
import { z } from "zod/v4";
import { s3 } from "@/lib/aws";
import { inngest } from "@/lib/inngest";
import { generateS3Key } from "../utils/generate-s3-key";

export const deleteAttachmentEvent = eventType(
  "app/attachments.delete-attachment",
  {
    schema: z.object({
      attachmentId: z.string(),
      organizationId: z.string(),
      ticketId: z.string(),
      attachmentName: z.string(),
    }),
  },
);

export const eventDeleteAttachment = inngest.createFunction(
  {
    id: "delete-attachment",
    triggers: [deleteAttachmentEvent],
  },
  async ({ event, step }) => {
    const { attachmentId, organizationId, ticketId, attachmentName } =
      event.data;
    const key = generateS3Key({
      organizationId,
      ticketId,
      attachmentName,
      attachmentId,
    });

    const result = await step.run("delete-from-s3", async () => {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }),
      );
    });

    return { success: true, data: result };
  },
);
