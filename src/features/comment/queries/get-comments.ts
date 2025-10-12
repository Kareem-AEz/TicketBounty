import { prisma } from "@/lib/prisma";

export const getComments = async (ticketId: string) => {
  const comments = await prisma.ticketComment.findMany({
    where: {
      ticketId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
      ticketId: true,
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return comments;
};
