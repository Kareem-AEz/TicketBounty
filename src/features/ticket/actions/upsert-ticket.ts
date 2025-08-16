"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

export const upsertTicket = async (formData: FormData) => {
  const id = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content");

  await prisma.ticket.upsert({
    where: {
      id: id as string,
    },
    update: {
      title: title as string,
      content: content as string,
    },
    create: {
      title: title as string,
      content: content as string,
    },
  });

  revalidatePath(ticketsPath());
};
