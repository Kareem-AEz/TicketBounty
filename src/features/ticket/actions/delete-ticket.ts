"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
  console.log(isDetail);
  await prisma.ticket.delete({
    where: {
      id,
    },
  });

  revalidatePath(ticketsPath());
  if (isDetail) redirect(ticketsPath());
}
