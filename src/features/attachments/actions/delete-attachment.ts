"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
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
        ticket: true,
      },
    });
    if (!attachment) {
      return toErrorActionState(new Error("Attachment not found"));
    }
    if (attachment.ticket.userId !== user.id) {
      return toErrorActionState(
        new Error("You are not the owner of this attachment"),
      );
    }

    await Promise.all([
      prisma.attachment.deleteMany({
        where: { id: attachmentId },
      }),
      inngest.send(
        deleteAttachmentEvent.create({
          organizationId: attachment.storageOrganizationId,
          ticketId: attachment.storageTicketId,
          attachmentId: attachment.id,
          attachmentName: attachment.name,
        }),
      ),
    ]);

    revalidatePath(ticketPath(attachment.ticket.id));

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
