"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { AttachmentEntity } from "@/generated/enums";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { ticketPath } from "@/paths";
import { deleteAttachmentEvent } from "../events/delete-attachment.event";

type DeleteAttachmentProps = {
  attachmentId: string;
};

export const deleteAttachment = async ({
  attachmentId,
}: DeleteAttachmentProps) => {
  const user = await getAuthOrRedirect();
  if (!user) {
    return toErrorActionState(new Error("Unauthorized"));
  }

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        ticket: {
          select: {
            userId: true,
            id: true,
          },
        },
        comment: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!attachment) {
      return toErrorActionState(new Error("Attachment not found"));
    }

    if (attachment.entity === AttachmentEntity.TICKET) {
      if (!isOwner(user.id, attachment.ticket?.userId ?? undefined)) {
        throw new Error("You are not the owner of this attachment");
      }
    } else if (attachment.entity === AttachmentEntity.COMMENT) {
      if (!isOwner(user.id, attachment.comment?.userId ?? undefined)) {
        throw new Error("You are not the owner of this attachment");
      }
    }

    await prisma.attachment.deleteMany({
      where: { id: attachmentId },
    });

    await inngest.send(
      deleteAttachmentEvent.create({
        entity: attachment.entity,
        organizationId: attachment.storageOrganizationId,
        ticketId: attachment.storageTicketId,
        attachmentId: attachment.id,
        attachmentName: attachment.name,
      }),

      revalidatePath(ticketPath(attachment.ticket?.id ?? "")),
    );

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
