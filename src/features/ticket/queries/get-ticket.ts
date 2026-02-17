import { cache } from "react";
import prisma from "@/lib/prisma";

export const getTicket = cache(async (id: string) => {
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
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return ticket;
});
