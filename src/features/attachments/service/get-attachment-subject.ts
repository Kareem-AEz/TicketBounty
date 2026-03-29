import { Prisma, PrismaClient } from "@/generated/client";
import { AttachmentEntity } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { fromComment, fromTicket } from "../dto";

type GetAttachmentSubjectArgs = {
  entityId: string;
  entity: AttachmentEntity;
  options?: {
    tx?: PrismaClient | Prisma.TransactionClient;
  };
};

export async function getAttachmentSubject({
  entityId,
  entity,
  options = {},
}: GetAttachmentSubjectArgs) {
  const { tx } = options;
  const db = tx ?? prisma;
  switch (entity) {
    case AttachmentEntity.TICKET:
      const ticket = await db.ticket
        .findUnique({
          where: { id: entityId },
          select: {
            id: true,
            organizationId: true,
            userId: true,
          },
        })
        .then((t) => (t ? { ...t, entity: AttachmentEntity.TICKET } : null));

      return fromTicket(ticket);

    case AttachmentEntity.COMMENT:
      const comment = await db.ticketComment
        .findUnique({
          where: { id: entityId },
          include: {
            ticket: {
              select: {
                id: true,
                organizationId: true,
              },
            },
          },
        })
        .then((c) => (c ? { ...c, entity: AttachmentEntity.COMMENT } : null));

      return fromComment(comment);

    default:
      return null;
  }
}
