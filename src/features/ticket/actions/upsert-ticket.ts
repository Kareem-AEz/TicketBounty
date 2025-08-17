"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

const upsertTicketSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(15, { message: "Title must be at least 0.015K characters" })
    .max(200, { message: "Title must be less than 0.2K characters" }),
  content: z
    .string()
    .min(100, { message: "Content must be at least 0.1K characters" })
    .max(2000, { message: "Content must be less than 2K characters" })
    .refine(
      (val) => {
        const words = val.split(/\s+/);
        return words.every((word) => word.length <= 50);
      },
      {
        message:
          "Content contains words that are too long (max 0.05K characters per word)",
      },
    ),
});

export const upsertTicket = async (
  id: string | undefined,
  _actionState: ActionState | undefined,
  formData: FormData,
) => {
  try {
    const validatedFields = upsertTicketSchema.parse({
      id,
      title: formData.get("title"),
      content: formData.get("content"),
    });

    const ticket = await prisma.ticket.upsert({
      where: {
        id: validatedFields.id || "",
      },
      update: validatedFields,
      create: validatedFields,
    });

    revalidatePath(ticketsPath());

    const message = id ? "Ticket updated" : "Ticket created";

    return toSuccessActionState({
      status: "SUCCESS",
      message,
      ticketId: ticket.id,
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
};
