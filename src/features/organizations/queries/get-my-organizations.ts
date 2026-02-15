"use server";

import { getAuth } from "@/features/auth/queries/get-auth";
import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const getMyOrganizations = async (
  { tx = prisma }: { tx: PrismaClient | Prisma.TransactionClient } = {
    tx: prisma,
  },
) => {
  const { user } = await getAuth();
  const userId = user?.id;
  if (!userId) return [];

  const organizations = await tx.organization.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: {
        where: { userId },
      },
      _count: {
        select: {
          memberships: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Example: Calculate average bounty across all tickets
  // const avgBounty = await prisma.ticket.aggregate({
  //   _avg: {
  //     bounty: true, // Only works on numeric fields (Int, Float, Decimal)
  //   },
  // });
  // console.log(avgBounty._avg.bounty); // e.g., 150.5

  // Example: Average with filtering
  // const avgBountyForUser = await prisma.ticket.aggregate({
  //   where: {
  //     userId: userId,
  //   },
  //   _avg: {
  //     bounty: true,
  //   },
  // });

  // Example: Multiple aggregations at once
  // const stats = await prisma.ticket.aggregate({
  //   _avg: { bounty: true },
  //   _min: { bounty: true },
  //   _max: { bounty: true },
  //   _sum: { bounty: true },
  //   _count: true,
  // });
  return organizations.map(({ memberships, ...organization }) => ({
    ...organization,
    membershipByUser: memberships[0],
  }));
};
