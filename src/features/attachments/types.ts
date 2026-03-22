import { AttachmentEntity, Prisma } from "@/generated/client";

export type TicketSubjectAttachment = Prisma.TicketGetPayload<{
  select: {
    id: true;
    organizationId: true;
    userId: true;
  };
}> & {
  entity: typeof AttachmentEntity.TICKET;
};

export type CommentSubjectAttachment = Prisma.TicketCommentGetPayload<{
  select: {
    id: true;
    userId: true;
    ticket: {
      select: {
        id: true;
        organizationId: true;
      };
    };
  };
}> & {
  entity: typeof AttachmentEntity.COMMENT;
};

export type AttachmentSubject =
  | TicketSubjectAttachment
  | CommentSubjectAttachment;

export function isTicketSubjectAttachment(
  subject: AttachmentSubject,
): subject is TicketSubjectAttachment {
  return subject.entity === AttachmentEntity.TICKET;
}

export function isCommentSubjectAttachment(
  subject: AttachmentSubject,
): subject is CommentSubjectAttachment {
  return subject.entity === AttachmentEntity.COMMENT;
}
