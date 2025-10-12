import { prisma } from "@/lib/prisma";
import { TicketParsedSearchParams } from "../utils/search-params";

export const getTickets = async (
  userId?: string,
  searchParams?: TicketParsedSearchParams,
) => {
  return await prisma.ticket.findMany({
    orderBy: searchParams
      ? { [searchParams.sortKey]: searchParams.sortOrder }
      : { createdAt: "desc" },

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
      ...(searchParams?.query && {
        OR: [
          {
            title: {
              contains: searchParams.query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: searchParams.query,
              mode: "insensitive",
            },
          },
          {
            user: {
              username: {
                contains: searchParams.query,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
    },
  });
};
