import { cache } from "react";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import prisma from "@/lib/prisma";
import { canDeleteTicket } from "../utils/can-delete-ticket";

export const getTicket = cache(async (id: string) => {
  const user = await getAuthOrRedirect();
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    ...ticket,
    permissions: {
      canDeleteTickets:
        isOwner(user.id, ticket?.userId ?? undefined) &&
        canDeleteTicket({
          organizationId: ticket?.organizationId ?? "",
          userId: ticket?.userId ?? "",
        }),
    },
  };
});
