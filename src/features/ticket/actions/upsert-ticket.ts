"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { setCookie } from "@/actions/cookies";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import { toCent } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";

const upsertTicketSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(15, { message: "Title must be at least 15 characters" })
    .max(200, { message: "Title must be less than 200 characters" }),
  content: z
    .string()
    .min(100, { message: "Content must be at least 100 characters" })
    .max(2000, { message: "Content must be less than 2000 characters" })
    .refine(
      (val) => {
        const words = val.split(/\s+/);
        return words.every((word) => word.length <= 50);
      },
      {
        message:
          "Content contains words that are too long (max 50 characters per word)",
      },
    ),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Deadline must be in YYYY-MM-DD format",
  }),
  bounty: z.coerce.number().min(500, { message: "Bounty must be at least $5" }),
});

export const upsertTicket = async (
  id: string | undefined,
  _actionState: ActionState | undefined,
  formData: FormData,
) => {
  try {
    const user = await getAuthOrRedirect();

    if (!id) return toErrorActionState("You are not the owner of this ticket");

    const fetchedTicket = await prisma.ticket.findUnique({
      where: {
        id,
      },
    });

    if (!isOwner(user.id, fetchedTicket?.userId)) {
      return toErrorActionState("You are not the owner of this ticket");
    }

    const convertedBounty = toCent(Number(formData.get("bounty")));

    const validatedFields = upsertTicketSchema.parse({
      id,
      title: formData.get("title"),
      content: formData.get("content"),
      deadline: formData.get("deadline"),
      bounty: convertedBounty,
    });

    const dbData = {
      ...validatedFields,
      userId: user.id,
    };

    const ticket = await prisma.ticket.upsert({
      where: {
        id: validatedFields.id || "",
      },
      update: dbData,
      create: dbData,
    });

    revalidatePath(ticketsPath());

    const message = id ? "Ticket updated" : "Ticket created";

    if (id) await setCookie("toast", "Ticket updated");

    return toSuccessActionState({
      status: "SUCCESS",
      message,
      ticketId: ticket.id,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError)
      console.log(error.code);
    return toErrorActionState(error, formData);
  }
};
