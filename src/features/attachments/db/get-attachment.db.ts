import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const ATTACHMENT_INCLUDE = {
  ticket: {
    select: {
      userId: true,
      id: true,
      organizationId: true,
    },
  },
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
} as const satisfies Prisma.AttachmentInclude;

type GetAttachmentArgs<T extends Prisma.AttachmentInclude> = {
  attachmentId: string;
  options?: { tx?: PrismaClient | Prisma.TransactionClient };
  include?: T;
};

export const getAttachment = async <T extends Prisma.AttachmentInclude>({
  attachmentId,
  options,
  include,
}: GetAttachmentArgs<T>): Promise<Prisma.AttachmentGetPayload<{
  include: T;
}> | null> => {
  const db = options?.tx ?? prisma;

  return (await db.attachment.findUnique({
    where: { id: attachmentId },
    include,
  })) as Prisma.AttachmentGetPayload<{ include: T }> | null;
};

export type AttachmentWithSubject = Awaited<
  ReturnType<typeof getAttachment<typeof ATTACHMENT_INCLUDE>>
>;
