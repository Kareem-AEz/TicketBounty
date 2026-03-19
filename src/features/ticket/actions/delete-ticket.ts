"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { bulkDeleteAttachmentsEvent } from "@/features/attachments/events/bulk-delete-attachments.event";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { homePath, ticketsPath } from "@/paths";
import { getTicketPermission } from "../queries/get-ticket-permission";

type DeleteTicketProps = {
  id: string;
  isDetail?: boolean;
};

export async function deleteTicket({
  id,
  isDetail = false,
}: DeleteTicketProps) {
  const user = await getAuthOrRedirect();

  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id,
      },
    });

    if (!isOwner(user.id, ticket?.userId ?? undefined) || !ticket) {
      return toErrorActionState(
        new Error("You are not the owner of this ticket"),
      );
    }

    const permissions = await getTicketPermission({
      organizationId: ticket?.organizationId ?? "",
      userId: ticket?.userId ?? "",
    });

    if (!permissions.canDeleteTickets) {
      return toErrorActionState(
        new Error("You are not allowed to delete this ticket"),
      );
    }

    // -- THE PARALLEL UPDATE + QUERY (PROMISE.ALL) --
    // Here, we update the ticket's deletedAt and fetch all of its attachments at the same time.
    // This is safe: the update and the fetch don't depend on each other's result.
    // We use Promise.all to run both queries concurrently for faster completion.
    const [_updatedTicket, attachments] = await Promise.all([
      prisma.ticket.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
      prisma.attachment.findMany({
        where: {
          ticketId: id,
        },
      }),
    ]);

    await inngest.send(
      bulkDeleteAttachmentsEvent.create({
        ticketId: id,
        previousDeletedAt: ticket?.deletedAt,
        attachments: attachments.map((attachment) => ({
          attachmentId: attachment.id,
          organizationId: attachment.storageOrganizationId,
          ticketId: attachment.storageTicketId,
          attachmentName: attachment.name,
        })),
      }),
    );
  } catch (error) {
    return toErrorActionState(error);
  }

  revalidatePath(ticketsPath());
  revalidatePath(homePath());
  // if (isDetail) redirect(ticketsPath());
  return toSuccessActionState({
    status: "SUCCESS",
    message: "Ticket deleted",
    ticketId: id,
  });
}
