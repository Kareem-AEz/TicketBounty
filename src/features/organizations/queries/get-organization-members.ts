import prisma from "@/lib/prisma";

export const getOrganizationMembers = async (organizationId: string) => {
  const members = await prisma.membership.findMany({
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
  });
  return members;
};
