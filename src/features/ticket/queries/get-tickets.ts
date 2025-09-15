import { prisma } from "@/lib/prisma";

export const getTickets = async (userId?: string) => {
  return await prisma.ticket.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc", // Secondary sort for stable ordering
      },
    ],
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    where: {
      userId,
    },
  });
};
