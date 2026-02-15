import { cache } from "react";
import { getAuth } from "@/features/auth/queries/get-auth";
import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const getMyActiveMembership = cache(
  async (
    params: { tx: PrismaClient | Prisma.TransactionClient } = { tx: prisma },
  ) => {
    const { user } = await getAuth();
    if (!user) return null;

    const membership = await params.tx.membership.findFirst({
      where: { userId: user.id, isActive: true },
    });
    return membership;
  },
);
