import prisma from "@/lib/prisma";

type GetTicketPermissionProps = {
  organizationId: string;
  userId: string;
};

export const getTicketPermission = async ({
  organizationId,
  userId,
}: GetTicketPermissionProps) => {
  if (!organizationId || !userId) {
    return {
      canDeleteTickets: false,
    };
  }

  const membership = await prisma.membership.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  if (!membership) {
    return {
      canDeleteTickets: false,
    };
  }

  return {
    canDeleteTickets: membership.canDeleteTickets,
  };
};
