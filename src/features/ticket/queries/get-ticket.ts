import { prisma } from "@/lib/prisma";

export const getTicket = async (id: string) => {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });


  return ticket;
};
