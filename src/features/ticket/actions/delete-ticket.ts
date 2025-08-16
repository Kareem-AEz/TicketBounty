"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

type DeleteTicketProps = {
  id: string;
  main?: boolean;
};

export async function deleteTicket({ id, main = false }: DeleteTicketProps) {
  await prisma.ticket.delete({
    where: {
      id,
    },
  });

  revalidatePath(ticketsPath());
  if (!main) redirect(ticketsPath());
}
