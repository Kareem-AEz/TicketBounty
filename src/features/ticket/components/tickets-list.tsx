import { User } from "lucia";
import { AnimatePresence } from "motion/react";
import React from "react";
import { SearchParams } from "@/lib/search-params";
import { getTickets } from "../queries/get-tickets";
import TicketItem from "./ticket-item";

async function TicketsList({
  user,
  isAllTickets,
  searchParams,
}: {
  user?: User;
  isAllTickets?: boolean;
  searchParams: Promise<SearchParams>;
}) {
  const searchParamsObj = await searchParams;

  const tickets = await getTickets(
    isAllTickets ? undefined : user?.id,
    searchParamsObj,
  );

  return (
    <div className="flex w-full flex-1 flex-col items-center space-y-4 overflow-y-clip mask-b-from-[calc(100%-6rem)] p-1 pb-24">
      <AnimatePresence mode="popLayout">
        {tickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} user={user} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TicketsList;
