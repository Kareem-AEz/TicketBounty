"use server";

import { prisma } from "@/lib/prisma";

export const getComments = async (ticketId: string, offset?: number) => {
  const take = 3;
  const skip = offset ?? 0;

  const commentsPromise = prisma.ticketComment.findMany({
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
    skip,
    take,
  });
  const totalPromise = prisma.ticketComment.count({
    where: {
      ticketId,
    },
  });

  const [comments, total] = await prisma.$transaction([
    commentsPromise,
    totalPromise,
  ]);

  return {
    data: comments,
    metadata: { total, hasNextPage: total > (skip ?? 0) + (take ?? 0) },
  };
};
