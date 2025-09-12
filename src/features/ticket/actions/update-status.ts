"use server";

import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

export const updateStatus = async (id: string, status: TicketStatus) => {
  try {
    await prisma.ticket.update({
      where: { id },
      data: { status },
    });
    revalidatePath(ticketsPath());
    return { status: "SUCCESS", message: "Status updated" };
  } catch {
    return { status: "ERROR", message: "Failed to update status" };
  }
};
