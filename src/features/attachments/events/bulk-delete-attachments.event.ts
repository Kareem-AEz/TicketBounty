import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { eventType } from "inngest";
import { z } from "zod/v4";
import { AttachmentEntity } from "@/generated/enums";
import { s3 } from "@/lib/aws";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { generateS3Key } from "../utils/generate-s3-key";

export const bulkDeleteAttachmentsEvent = eventType(
  "app/attachments.bulk-delete",
  {
    schema: z.object({
      entity: z.enum(AttachmentEntity),
      entityId: z.string(),
      previousDeletedAt: z.date().nullable(),
      attachments: z.array(
        z.object({
          attachmentId: z.string(),
          organizationId: z.string(),
          entityId: z.string(),
          attachmentName: z.string(),
        }),
      ),
    }),
  },
);

export const eventBulkDeleteAttachments = inngest.createFunction(
  {
    id: "bulk-delete-attachments",
    triggers: [bulkDeleteAttachmentsEvent],
  },
  async ({ event, step }) => {
    const { entity, entityId, attachments, previousDeletedAt } = event.data;

    try {
      // -- GENERATE S3 KEYS --
      // This is a critical step that must succeed before we can delete the attachments.
      // If the S3 keys cannot be generated, the attachments should not be deleted.
      const objectsToDelete = attachments.map((attachment) => ({
        Key: generateS3Key({
          entity,
          organizationId: attachment.organizationId,
          entityId,
          attachmentName: attachment.attachmentName,
          attachmentId: attachment.attachmentId,
        }),
      }));

      // -- DELETE ATTACHMENTS FROM S3 --
      // This is a critical step that must succeed before we can delete the ticket.
      // If the attachments cannot be deleted from S3, the ticket should not be deleted.
      await step.run("delete-attachments-from-s3", async () => {
        if (objectsToDelete.length === 0) return;
        const result = await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Delete: {
              Objects: objectsToDelete,
              Quiet: true,
            },
          }),
        );

        return { success: true, data: result };
      });

      // -- DELETE TICKET FROM DB --
      // This is the final step that should only be executed if the attachments were successfully deleted from S3.
      // If the attachments cannot be deleted from S3, the ticket should not be deleted.
      await step.run("delete-entities-from-db", async () => {
        switch (entity) {
          case AttachmentEntity.TICKET:
            await prisma.ticket.delete({
              where: { id: entityId },
            });
            break;
          case AttachmentEntity.COMMENT:
            await prisma.ticketComment.delete({
              where: { id: entityId },
            });
            break;
          default:
            throw new Error("Invalid entity");
        }

        return { success: true, data: { entity, entityId } };
      });
    } catch (error) {
      // -- ROLLBACK TICKET UPDATE --
      // If any step fails, we need to rollback the ticket update.
      // This is a critical step that must be executed to ensure data integrity.
      await step.run("rollback-entities-update", async () => {
        switch (entity) {
          case AttachmentEntity.TICKET:
            await prisma.ticket.update({
              where: { id: entityId },
              data: { deletedAt: previousDeletedAt },
            });
            break;
          case AttachmentEntity.COMMENT:
            await prisma.ticketComment.update({
              where: { id: entityId },
              data: { deletedAt: previousDeletedAt },
            });
            break;
          default:
            throw new Error("Invalid entity");
        }
      });
      throw error;
    }
  },
);
