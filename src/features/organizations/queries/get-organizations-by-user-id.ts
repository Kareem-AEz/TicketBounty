import { getAuth } from "@/features/auth/queries/get-auth";
import prisma from "@/lib/prisma";

export const getOrganizationsByUserId = async () => {
  const { user } = await getAuth();
  const userId = user?.id;
  if (!userId) return [];

  const organizations = await prisma.organization.findMany({
    where: {
      memberships: {
        some: { userId },
      },
    },
    include: {
      memberships: {
        where: { userId },
      },
    },
  });
  return organizations.map(({ memberships, ...organization }) => ({
    ...organization,
    membershipByUser: memberships[0],
  }));
};
