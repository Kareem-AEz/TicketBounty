import { User } from "lucia";
import * as motion from "motion/react-client";
import React from "react";
import Placeholder from "@/components/placeholder";
import { copy } from "@/lib/copy";
import { ParsedSearchParams } from "@/lib/search-params";
import { getTickets } from "../queries/get-tickets";
import TicketItem from "./ticket-item";

async function TicketsList({
  user,
  isAllTickets,
  searchParams,
}: {
  user?: User;
  isAllTickets?: boolean;
  searchParams?: ParsedSearchParams;
}) {
  const tickets = await getTickets(
    isAllTickets ? undefined : user?.id,
    searchParams,
  );

  return (
    <div className="relative flex w-full flex-1 flex-col items-center gap-y-4 overflow-y-clip mask-b-from-[calc(100%-6rem)] p-1 pb-24">
      {tickets.length ? (
        tickets.map((ticket) => (
          <TicketItem key={ticket.id} ticket={ticket} user={user} />
        ))
      ) : (
        <motion.div
          layout="position"
          className="flex flex-1 flex-col items-center justify-center"
        >
          <Placeholder label={copy.errors.general} />
        </motion.div>
      )}
    </div>
  );
}

export default TicketsList;
