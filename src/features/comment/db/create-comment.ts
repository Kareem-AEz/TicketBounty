// -- OPTION: 01 --
// USING include to get the attachments is a workaround to avoid the issue of the attachments not being included in the comment
// sometimes this isn't the best solution, as we shouldn't be manipulating the prisma client to get the attachments
// type CreateCommentArgs<T> = {
//   content: string;
//   ticketId: string;
//   userId: string;
//   id: string;
//   options?: {
//     tx?: Prisma.TransactionClient | PrismaClient;
//   };
// } & T;

import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

// export const createComment = async <
//   T extends Omit<Prisma.TicketCommentUpsertArgs, "where" | "update" | "create">,
// >({
//   content,
//   ticketId,
//   userId,
//   id,
//   options,
//   ...prismaArgs
// }: CreateCommentArgs<T>): Promise<Prisma.TicketCommentGetPayload<T>> => {
//   const db = options?.tx ?? prisma;

//   const upsertedComment = await db.ticketComment.upsert({
//     where: { id },
//     update: { content },
//     create: {
//       id,
//       content,
//       ticketId,
//       userId,
//     },
//     ...prismaArgs,
//   });

//   return upsertedComment as Prisma.TicketCommentGetPayload<T>;
// };

// -- OPTION: 02 --
//  Using generics for conditionally including the attachments (PREDEFINED)
const USER_INCLUDE = {
  user: {
    select: {
      id: true,
      username: true,
    },
  },
} satisfies Prisma.TicketCommentInclude;
type UserIncludeType = typeof USER_INCLUDE;

const TICKET_INCLUDE = {
  ticket: true,
} satisfies Prisma.TicketCommentInclude;
type TicketIncludeType = typeof TICKET_INCLUDE;

// prettier-ignore
type CalculatedInclude<T extends IncludeOptions> =
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
((T["user"] extends true ? UserIncludeType : {}) &
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
(T["ticket"] extends true ? TicketIncludeType : {}));

type IncludeOptions = { user?: boolean; ticket?: boolean };

// prettier-ignore
type ReturnType<T extends IncludeOptions> = Prisma.TicketCommentGetPayload<{include: CalculatedInclude<T>}>;

type CreateCommentArgs<T extends IncludeOptions> = {
  content: string;
  ticketId: string;
  userId: string;
  id: string;
  include?: T;
  options?: { tx?: Prisma.TransactionClient | PrismaClient };
};

export const createComment = async <T extends IncludeOptions>({
  content,
  ticketId,
  userId,
  id,
  options,
  include,
}: CreateCommentArgs<T>): Promise<ReturnType<T>> => {
  const db = options?.tx ?? prisma;

  const includeUser = include?.user ? USER_INCLUDE : {};
  const includeTicket = include?.ticket ? TICKET_INCLUDE : {};

  const upsertedComment = await db.ticketComment.upsert({
    where: { id },
    update: { content },
    create: { id, content, ticketId, userId },
    include: { ...includeUser, ...includeTicket },
  });

  return upsertedComment as ReturnType<T>;
};
