import { cache } from "react";
import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const getMembership = cache(
  async (
    organizationId: string,
    userId: string,
    params: { tx: PrismaClient | Prisma.TransactionClient } = { tx: prisma },
  ) => {
    const membership = await params.tx.membership.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });
    return membership;
  },
);
