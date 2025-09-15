import { User } from "lucia";
import React from "react";
import { getTickets } from "../queries/get-tickets";
import TicketItem from "./ticket-item";

async function TicketsList({
  user,
  isAllTickets,
  id,
}: {
  user?: User;
  isAllTickets?: boolean;
  id?: string;
}) {
  const tickets = await getTickets(isAllTickets ? undefined : user?.id);

  return (
    <div className="animate-fade-from-top flex w-full flex-1 flex-col items-center gap-y-4 overflow-y-clip mask-b-from-[calc(100%-6rem)] p-1 pt-6 pb-24">
      {tickets.map((ticket) => (
        <TicketItem key={`${ticket.id}-${id}`} ticket={ticket} user={user} />
      ))}
    </div>
  );
}

export default TicketsList;
