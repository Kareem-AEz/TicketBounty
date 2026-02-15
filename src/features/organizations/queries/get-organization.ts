import prisma from "@/lib/prisma";

export const getOrganization = async (organizationId: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  return organization;
};
