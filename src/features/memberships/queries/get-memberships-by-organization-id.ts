import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const getMembershipsByOrganizationId = async (
  organizationId: string,
  tx: PrismaClient | Prisma.TransactionClient = prisma,
) => {
  const memberships = await tx.membership.findMany({
    where: {
      organizationId,
    },
  });
  return memberships;
};
