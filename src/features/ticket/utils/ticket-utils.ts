import { format, isEqual } from "date-fns";
import { Ticket } from "@/generated/client";

export const parseDate = (ticket: Ticket) => {
  const createdAt = new Date(ticket.createdAt);
  const updatedAt = new Date(ticket.updatedAt);

  const isNew = isEqual(createdAt, updatedAt);

  const date = isNew
    ? format(createdAt, "MMM d, yyyy hh:mm a")
    : format(updatedAt, "MMM d, yyyy hh:mm a") + " - Edited";

  return date;
};
