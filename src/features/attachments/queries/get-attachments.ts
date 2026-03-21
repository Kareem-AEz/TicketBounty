import { AttachmentEntity } from "@/generated/enums";
import prisma from "@/lib/prisma";

export async function getAttachments(
  entityId: string,
  entity: AttachmentEntity,
) {
  switch (entity) {
    case "TICKET":
      return await prisma.attachment.findMany({
        where: {
          ticketId: entityId,
          entity,
        },
      });
    case "COMMENT":
      return await prisma.attachment.findMany({
        where: {
          commentId: entityId,
          entity,
        },
      });
    default:
      return [];
  }
}
