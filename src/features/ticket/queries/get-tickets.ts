import { prisma } from "@/lib/prisma";
import { TICKET_PAGE_SIZE } from "../constants";
import { TicketParsedSearchParams } from "../utils/search-params";

export const getTickets = async (
  userId?: string,
  searchParams?: TicketParsedSearchParams,
) => {
  const where = {
    userId,
    ...(searchParams?.query && {
      OR: [
        {
          title: {
            contains: searchParams.query,
            mode: "insensitive" as const,
          },
        },
        {
          content: {
            contains: searchParams.query,
            mode: "insensitive" as const,
          },
        },
        {
          user: {
            username: {
              contains: searchParams.query,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
  };

  const isValidSize =
    searchParams && TICKET_PAGE_SIZE.includes(searchParams.size);

  if (!isValidSize) {
    return {
      data: [],
      metadata: { total: 0, hasNextPage: false },
    };
  }

  const take = searchParams && Number(searchParams.size);
  const skip = searchParams && searchParams.page * (take ?? 0);

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      skip,
      take,
      where,
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
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets,

    metadata: { total, hasNextPage: total > (skip ?? 0) + (take ?? 0) },
  };
};
