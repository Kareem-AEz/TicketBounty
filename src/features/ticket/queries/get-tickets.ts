import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ParsedSearchParams } from "@/lib/search-params";

const buildOrderBy = (
  sort?: string,
): Prisma.TicketOrderByWithRelationInput[] => {
  if (sort === "bounty") {
    return [{ bounty: "desc" }];
  }

  // Default sorting
  return [{ createdAt: "desc" }, { id: "desc" }];
};

const buildSearchFilter = (query: string): Prisma.TicketWhereInput => ({
  OR: [
    {
      title: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      content: {
        contains: query,
        mode: "insensitive",
      },
    },
    {
      user: {
        username: {
          contains: query,
          mode: "insensitive",
        },
      },
    },
  ],
});

const buildWhereClause = (
  userId?: string,
  searchParams?: ParsedSearchParams,
): Prisma.TicketWhereInput => {
  const where: Prisma.TicketWhereInput = {};

  if (userId) {
    where.userId = userId;
  }

  if (typeof searchParams?.query === "string") {
    Object.assign(where, buildSearchFilter(searchParams.query));
  }

  return where;
};

export const getTickets = async (
  userId?: string,
  searchParams?: ParsedSearchParams,
) => {
  return await prisma.ticket.findMany({
    orderBy: buildOrderBy(searchParams?.sort as string),
    where: buildWhereClause(userId, searchParams),
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};
