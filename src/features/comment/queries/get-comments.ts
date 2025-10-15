"use server";

import { prisma } from "@/lib/prisma";

export const getComments = async (
  ticketId: string,
  cursor?: { id: string; createdAt: number },
) => {
  const take = 3;

  const commentsPromise = prisma.ticketComment.findMany({
    where: {
      ticketId,
    },
    cursor: cursor
      ? { id: cursor.id, createdAt: new Date(cursor.createdAt) }
      : undefined,
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
    orderBy: [{ id: "desc" }, { createdAt: "desc" }],
    skip: cursor ? 1 : 0,
    take: take + 1,
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

  const hasNextPage = comments.length > take;
  const data = hasNextPage ? comments.slice(0, -1) : comments;
  const lastComment = data.at(-1);
  const cursorValue = lastComment
    ? { id: lastComment.id, createdAt: lastComment.createdAt.valueOf() }
    : undefined;

  return {
    data,
    metadata: {
      total,
      hasNextPage,
      cursor: cursorValue,
    },
  };
};
