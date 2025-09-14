"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

type DeleteTicketProps = {
  id: string;
  isDetail?: boolean;
};

export async function deleteTicket({
  id,
  isDetail = false,
}: DeleteTicketProps) {
  const user = await getAuthOrRedirect();
  if (!isOwner(user.id, id)) {
    return { success: false, message: "You are not the owner of this ticket" };
  }

  await prisma.ticket.delete({
    where: {
      id,
    },
  });

  revalidatePath(ticketsPath());
  if (isDetail) redirect(ticketsPath());
  return { success: true, message: "Ticket deleted" };
}
