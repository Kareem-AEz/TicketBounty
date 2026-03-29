import { AttachmentEntity } from "@/generated/enums";
import {
  AttachmentSubject,
  isCommentSubjectAttachment,
  isTicketSubjectAttachment,
} from "../types";

export type AttachmentSubjectDTO = {
  entity: AttachmentEntity;
  entityId: string;
  organizationId: string | null;
  userId: string | null;
  ticketId: string;
  commentId: string | null;
};

export const fromTicket = (
  ticket: AttachmentSubject | null,
): AttachmentSubjectDTO | null => {
  if (!ticket || !isTicketSubjectAttachment(ticket)) {
    return null;
  }

  return {
    entity: AttachmentEntity.TICKET,
    entityId: ticket.id,
    organizationId: ticket.organizationId,
    userId: ticket.userId,
    ticketId: ticket.id,
    commentId: null,
  };
};

export const fromComment = (
  comment: AttachmentSubject | null,
): AttachmentSubjectDTO | null => {
  if (!comment || !isCommentSubjectAttachment(comment)) {
    return null;
  }

  return {
    entity: AttachmentEntity.COMMENT,
    entityId: comment.id,
    organizationId: comment.ticket.organizationId,
    userId: comment.userId,
    ticketId: comment.ticket.id,
    commentId: comment.id,
  };
};
