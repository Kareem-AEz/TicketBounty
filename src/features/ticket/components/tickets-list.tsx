import React from "react";
import { getTickets } from "../queries/get-tickets";
import TicketItem from "./ticket-item";

async function TicketsList() {
  const tickets = await getTickets();

  return (
    <div className="animate-fade-from-top flex flex-1 flex-col items-center gap-y-4">
      {tickets.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

export default TicketsList;
