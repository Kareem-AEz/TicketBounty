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
    const result = await prisma.$transaction(async (tx) => {
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
      // -- SANITY CHECK: Ensure All Attachments Are Files, Not Strings --
      // If any entry (`FormData.getAll` can technically return a string if the form is tampered with or misused),
      // we treat this as an invalid scenario. This check ensures server code doesn't get tricked by malicious data.
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

      // for (const attachment of toAdd) {
      //   const { file, buffer, mimeType } = attachment;

      //   const createdAttachment = await tx.attachment.create({
      //     data: {
      //       ticketId,
      //       name: file.name,
      //     },
      //   });

      //   const key = generateS3Key({
      //     organizationId: ticket.organizationId,
      //     ticketId,
      //     attachmentName: file.name,
      //     attachmentId: createdAttachment.id,
      //   });

      //   await s3.send(
      //     new PutObjectCommand({
      //       Bucket: process.env.R2_BUCKET_NAME,
      //       Key: key,
      //       Body: buffer,
      //       ContentType: mimeType,
      //     }),
      //   );
      // }

      const createdAttachments = await tx.attachment.createManyAndReturn({
        data: toAdd.map((attachment) => ({
          ticketId,
          name: attachment.file.name,
        })),
      });

      await Promise.all(
        createdAttachments.map(async (attachment) => {
          const { id, name } = attachment;

          const original = toAdd.find((a) => a.file.name === name);
          if (!original) throw new Error("Correlation failed");

          // find the attachment in the toAdd array
          const key = generateS3Key({
            organizationId,
            ticketId,
            attachmentName: name,
            attachmentId: id,
          });

          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Key: key,
              Body: original.buffer,
              ContentType: original.mimeType,
            }),
          );
        }),
      );

      return toSuccessActionState({
        status: "SUCCESS",
        message: "Attachment created",
      });
    });

    return result;
  } catch (error) {
    return toErrorActionState(error, formData);
  }
}
