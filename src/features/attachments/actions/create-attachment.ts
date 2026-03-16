"use server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { s3 } from "@/lib/aws";
import prisma from "@/lib/prisma";
import { generateS3Key } from "../utils/generete-s3-key";
import { processAttachments } from "../utils/process-attachments";

export async function createAttachment(
  ticketId: string,
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
    // console.log(
    //   JSON.stringify(
    //     toAdd.map((a) => ({
    //       hash: a.hash,
    //       name: a.file.name,
    //       mimeType: a.mimeType,
    //     })),
    //     null,
    //     2,
    //   ),
    // );

    if (errors.length > 0) throw new Error("Invalid attachments");

    // 2. DB Transaction (DB-bound) - Create records and return IDs
    const { createdAttachments, organizationId } = await prisma.$transaction(
      async (tx) => {
        const ticket = await tx.ticket.findUnique({
          where: {
            id: ticketId,
          },
        });

        const organizationId = ticket?.organizationId;

        if (!ticket) throw new Error("Ticket not found");
        if (!organizationId)
          throw new Error("Ticket is not associated with an organization");
        if (!isOwner(userId, ticket.userId ?? undefined))
          throw new Error("You are not the owner of this ticket");

        const createdAttachments = await tx.attachment.createManyAndReturn({
          data: toAdd.map((attachment) => ({
            ticketId,
            name: attachment.file.name,
          })),
        });

        return { createdAttachments, organizationId };
      },
    );

    // 3. S3 Uploads (I/O-bound) - Perform after transaction commits
    await Promise.all(
      createdAttachments.map(async (attachment) => {
        const { id, name } = attachment;
        const original = toAdd.find((a) => a.file.name === name);

        if (!original) {
          // Should not happen if data integrity is maintained
          console.error(`Attachment correlation failed for ${name}`);
          return;
        }

        const key = generateS3Key({
          organizationId,
          ticketId,
          attachmentName: name,
          attachmentId: id,
          attachmentHash: original.hash,
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

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment created",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
}
