import { cache } from "react";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import prisma from "@/lib/prisma";
import { getTicketPermission } from "./get-ticket-permission";
import { getTickets } from "./get-tickets";

type TicketWithPermissions = Awaited<
  ReturnType<typeof getTickets>
>["data"][number];

export const getTicket = cache(
  async (id: string): Promise<TicketWithPermissions | null> => {
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

    if (!ticket) {
      return null;
    }

    const permissions = await getTicketPermission({
      organizationId: ticket.organizationId ?? "",
      userId: ticket.userId ?? "",
    });

    return {
      ...ticket,
      permissions: {
        canDeleteTickets:
          (isOwner(user.id, ticket.userId ?? undefined) &&
            permissions.canDeleteTickets) ??
          false,
      },
    };
  },
);
