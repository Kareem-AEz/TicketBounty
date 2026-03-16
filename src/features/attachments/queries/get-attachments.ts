import prisma from "@/lib/prisma";

export async function getAttachments(ticketId: string) {
  const attachments = await prisma.attachment.findMany({
    where: {
      ticketId,
    },
  });
  return attachments;
}
