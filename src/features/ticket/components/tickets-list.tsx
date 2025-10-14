import { User } from "lucia";
import * as motion from "motion/react-client";
import React from "react";
import Placeholder from "@/components/placeholder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { copy } from "@/lib/copy";
import { getTickets } from "../queries/get-tickets";
import { TicketParsedSearchParams } from "../utils/search-params";
import TicketItem from "./ticket-item";
import TicketPagination from "./ticket-pagination";
import TicketQueryInput from "./ticket-query-input";
import TicketSortSelect from "./ticket-sort-select";

async function TicketsList({
  user,
  isAllTickets,
  searchParams,
}: {
  user?: User;
  isAllTickets?: boolean;
  searchParams?: TicketParsedSearchParams;
}) {
  const { data: tickets, metadata } = await getTickets(
    isAllTickets ? undefined : user?.id,
    searchParams,
  );

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center gap-y-8 overflow-y-clip p-1 pb-24">
      <div className="flex w-full max-w-lg gap-x-4">
        <TicketQueryInput />
        <TicketSortSelect
          options={[
            { sortKey: "createdAt", sortOrder: "desc", label: "Newest" },
            { sortKey: "createdAt", sortOrder: "asc", label: "Oldest" },
            { sortKey: "bounty", sortOrder: "desc", label: "Bounty" },
            { sortKey: "title", sortOrder: "asc", label: "Title" },
          ]}
        />
      </div>

      <ScrollArea className="h-screen w-full max-w-xl p-1">
        <div className="flex flex-1 flex-col items-center gap-y-4 pb-24">
          {tickets.length ? (
            tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layout="position"
                transition={{ type: "spring", duration: 0.513, bounce: 0.05 }}
              >
                <TicketItem ticket={ticket} user={user} />
              </motion.div>
            ))
          ) : (
            <motion.div
              layout="position"
              className="flex h-screen flex-1 flex-col items-center justify-center"
            >
              <Placeholder label={copy.errors.general} />
            </motion.div>
          )}
        </div>
      </ScrollArea>

      <div className="flex w-full max-w-lg flex-1 flex-col items-center">
        <TicketPagination paginationMetadata={metadata} />
      </div>
    </div>
  );
}

export default TicketsList;
