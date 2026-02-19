import { Prisma, PrismaClient } from "@/generated/client";
import prisma from "@/lib/prisma";

export const getMembershipsByOrganization = async (
  organizationId: string,
  params: { tx: PrismaClient | Prisma.TransactionClient } = { tx: prisma },
) => {
  const memberships = await params.tx.membership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          username: true,
          email: true,
          emailVerified: true,
        },
      },
    },
    orderBy: [{ joinedAt: "desc" }, { userId: "asc" }],
  });
  return memberships;
};
