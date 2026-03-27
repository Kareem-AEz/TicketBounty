import { Prisma, PrismaClient } from "@/generated/client";
import { AttachmentEntity } from "@/generated/enums";
import prisma from "@/lib/prisma";

type GetAttachmentSubjectArgs = {
  entityId: string;
  entity: AttachmentEntity;
  options?: {
    tx?: PrismaClient | Prisma.TransactionClient;
  };
};

export function getAttachmentSubject({
  entityId,
  entity,
  options = {},
}: GetAttachmentSubjectArgs) {
  const { tx } = options;
  const db = tx ?? prisma;
  switch (entity) {
    case AttachmentEntity.TICKET:
      return db.ticket
        .findUnique({
          where: { id: entityId },
          select: {
            id: true,
            organizationId: true,
            userId: true,
          },
        })
        .then((t) => (t ? { ...t, entity: AttachmentEntity.TICKET } : null));
    case AttachmentEntity.COMMENT:
      return db.ticketComment
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
    default:
      return null;
  }
}
