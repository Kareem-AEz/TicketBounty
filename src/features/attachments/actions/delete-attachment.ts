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
import { attachmentsDB } from "../db";
import { attachmentSubjectDTO } from "../dto";
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
    const attachment = await attachmentsDB.getAttachment({
      attachmentId,
      include: {
        comment: attachmentsDB.ATTACHMENT_INCLUDE.comment,
        ticket: attachmentsDB.ATTACHMENT_INCLUDE.ticket,
      },
    });

    if (!attachment) {
      return toErrorActionState(new Error("Attachment not found"));
    }

    let subject = null;
    switch (attachment.entity) {
      case AttachmentEntity.TICKET:
        if (attachment.ticket) {
          subject = attachmentSubjectDTO.fromTicket({
            ...attachment.ticket,
            entity: AttachmentEntity.TICKET,
          });
        }
        break;
      case AttachmentEntity.COMMENT:
        if (attachment.comment) {
          subject = attachmentSubjectDTO.fromComment({
            ...attachment.comment,
            entity: AttachmentEntity.COMMENT,
          });
        }
        break;
    }

    if (!subject) {
      return toErrorActionState(new Error("Attachment not found"));
    }

    if (!isOwner(user.id, subject.userId ?? undefined)) {
      return toErrorActionState(
        new Error("You are not the owner of this attachment"),
      );
    }

    await prisma.attachment.deleteMany({
      where: { id: attachmentId },
    });

    await inngest.send(
      deleteAttachmentEvent.create({
        entity: subject.entity,
        organizationId: attachment.storageOrganizationId,
        entityId: subject.entityId,
        attachmentId: attachmentId,
        attachmentName: attachment.name,
      }),
    );

    revalidatePath(ticketPath(subject.ticketId));

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
