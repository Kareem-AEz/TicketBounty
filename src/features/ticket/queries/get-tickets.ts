import { prisma } from "@/lib/prisma";
import { SearchParams } from "@/lib/search-params";

export const getTickets = async (
  userId?: string,
  searchParams?: SearchParams,
) => {
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
      OR: [
        {
          title: {
            contains: searchParams?.query,
            mode: "insensitive",
          },
          content: {
            contains: searchParams?.query,
            mode: "insensitive",
          },
        },
        {
          user: {
            username: {
              contains: searchParams?.query,
              mode: "insensitive",
            },
          },
        },
      ],
    },
  });
};
