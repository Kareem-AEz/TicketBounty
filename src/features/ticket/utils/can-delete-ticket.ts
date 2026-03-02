import prisma from "@/lib/prisma";

type CanDeleteTicketProps = {
  organizationId: string;
  userId: string;
};

export const canDeleteTicket = async ({
  organizationId,
  userId,
}: CanDeleteTicketProps) => {
  const membership = await prisma.membership.findFirst({
    where: {
      organizationId,
      userId,
    },
  });

  return membership?.canDeleteTickets ?? false;
};
