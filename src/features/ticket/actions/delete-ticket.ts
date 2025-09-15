"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { homePath, ticketsPath } from "@/paths";

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

    if (!isOwner(user.id, ticket?.userId) || !ticket) {
      return toErrorActionState("You are not the owner of this ticket");
    }

    await prisma.ticket.delete({
      where: {
        id,
      },
    });
  } catch (error) {
    return toErrorActionState(error);
  }

  revalidatePath(ticketsPath());
  revalidatePath(homePath());
  if (isDetail) redirect(ticketsPath());
  return toSuccessActionState({
    status: "SUCCESS",
    message: "Ticket deleted",
    ticketId: id,
  });
}
