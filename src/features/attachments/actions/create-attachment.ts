"use server";

import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isOwner } from "@/features/auth/utils/is-owner";
import prisma from "@/lib/prisma";
import { processAttachments } from "../utils/process-attachments";

export async function createAttachment(
  ticketId: string,
  _actionState: ActionState,
  formData: FormData,
) {
  x;
  const { id: userId } = await getAuthOrRedirect();
  try {
    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },
    });
    if (!ticket) throw new Error("Ticket not found");
    if (!isOwner(userId, ticket.userId ?? undefined))
      throw new Error("You are not the owner of this ticket");
    // -- SANITY CHECK: Ensure All Attachments Are Files, Not Strings --
    // If any entry (`FormData.getAll` can technically return a string if the form is tampered with or misused),
    // we treat this as an invalid scenario. This check ensures server code doesn't get tricked by malicious data.
    const attachments = Array.from(formData.getAll("attachment"));
    if (attachments.some((att) => typeof att === "string")) {
      throw new Error(
        "Invalid attachment payload: expected only File objects.",
      );
    }
    const files = attachments.filter((att) => att instanceof File);
    const { errors } = processAttachments({
      newAttachments: files,
    });
    if (errors.length > 0) throw new Error("Invalid attachments");
    return toSuccessActionState({
      status: "SUCCESS",
      message: "Attachment created",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
}
