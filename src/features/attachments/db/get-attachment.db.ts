import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

const ATTACHMENT_INCLUDE = {
  ticket: {
    select: {
      userId: true,
      id: true,
      organizationId: true,
    },
  },
} satisfies Prisma.AttachmentInclude;
type TicketIncludeType = typeof ATTACHMENT_INCLUDE;

const ATTACHMENT_INCLUDE_COMMENT = {
  comment: {
    select: {
      id: true,
      userId: true,
      ticket: {
        select: {
          userId: true,
          id: true,
          organizationId: true,
        },
      },
    },
  },
} satisfies Prisma.AttachmentInclude;
type CommentIncludeType = typeof ATTACHMENT_INCLUDE_COMMENT;

type Include = {
  ticket?: boolean;
  comment?: boolean;
};

type GetAttachmentArgs<T extends Include> = {
  attachmentId: string;
  options?: {
    tx?: PrismaClient | Prisma.TransactionClient;
  };
  include?: T;
};

// prettier-ignore
type ReturnType<T extends Include> = 
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
((T["ticket"] extends true ? Prisma.AttachmentGetPayload<{ include: TicketIncludeType }> : {}) &
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
(T["comment"] extends true ? Prisma.AttachmentGetPayload<{ include: CommentIncludeType }> : {})
)
export const getAttachment = async <T extends Include>({
  attachmentId,
  options,
  include,
}: GetAttachmentArgs<T>): Promise<ReturnType<T>> => {
  const db = options?.tx ?? prisma;

  const includeTicket = include?.ticket ? ATTACHMENT_INCLUDE : {};
  const includeComment = include?.comment ? ATTACHMENT_INCLUDE_COMMENT : {};

  const attachment = await db.attachment.findUnique({
    where: { id: attachmentId },
    include: { ...includeTicket, ...includeComment },
  });

  return attachment as ReturnType<T>;
};
