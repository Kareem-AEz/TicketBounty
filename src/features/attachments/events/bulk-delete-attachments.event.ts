import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { eventType } from "inngest";
import { z } from "zod/v4";
import { s3 } from "@/lib/aws";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { generateS3Key } from "../utils/generate-s3-key";

export const bulkDeleteAttachmentsEvent = eventType(
  "app/attachments.bulk-delete",
  {
    schema: z.object({
      ticketId: z.string(),
      previousDeletedAt: z.date().nullable(),
      attachments: z.array(
        z.object({
          attachmentId: z.string(),
          organizationId: z.string(),
          ticketId: z.string(),
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
    const { ticketId, attachments, previousDeletedAt } = event.data;

    try {
      // -- GENERATE S3 KEYS --
      // This is a critical step that must succeed before we can delete the attachments.
      // If the S3 keys cannot be generated, the attachments should not be deleted.
      const objectsToDelete = attachments.map((attachment) => ({
        Key: generateS3Key({
          organizationId: attachment.organizationId,
          ticketId: attachment.ticketId,
          attachmentName: attachment.attachmentName,
          attachmentId: attachment.attachmentId,
        }),
      }));

      // -- DELETE ATTACHMENTS FROM S3 --
      // This is a critical step that must succeed before we can delete the ticket.
      // If the attachments cannot be deleted from S3, the ticket should not be deleted.
      await step.run("delete-attachments-from-s3", async () => {
        if (objectsToDelete.length === 0) return;
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Delete: {
              Objects: objectsToDelete,
              Quiet: true,
            },
          }),
        );
      });

      // -- DELETE TICKET FROM DB --
      // This is the final step that should only be executed if the attachments were successfully deleted from S3.
      // If the attachments cannot be deleted from S3, the ticket should not be deleted.
      await step.run("delete-tickets-from-db", async () => {
        await prisma.ticket.delete({
          where: {
            id: ticketId,
          },
        });
      });
    } catch (error) {
      // -- ROLLBACK TICKET UPDATE --
      // If any step fails, we need to rollback the ticket update.
      // This is a critical step that must be executed to ensure data integrity.
      await step.run("rollback-ticket-update", async () => {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { deletedAt: previousDeletedAt },
        });
      });
      throw error;
    }
  },
);
