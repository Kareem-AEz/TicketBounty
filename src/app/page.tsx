import type { Metadata } from "next";
import { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Heading from "@/components/heading";
import Placeholder from "@/components/placeholder";
import Spinner from "@/components/spinner";
import { getAuth } from "@/features/auth/queries/get-auth";
import TicketPagination from "@/features/ticket/components/ticket-pagination";
import TicketQueryInput from "@/features/ticket/components/ticket-query-input";
import TicketSortSelect from "@/features/ticket/components/ticket-sort-select";
import TicketsList from "@/features/ticket/components/tickets-list";
import { ticketSearchParamsCache } from "@/features/ticket/utils/search-params";
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "All Tickets",
};

type HomePagePropsType = {
  searchParams: Promise<SearchParams>;
};

async function HomePage({ searchParams }: HomePagePropsType) {
  const { user } = await getAuth();

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title="All Tickets"
        description="Your one stop shop for all your ticket needs"
      />

      <div className="flex flex-1 flex-col items-center gap-y-8">
        <div className="flex w-full max-w-md gap-x-4">
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

        <ErrorBoundary fallback={<Placeholder label={copy.errors.general} />}>
          <Suspense
            fallback={
              <div className="flex min-h-screen w-full flex-1 items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <TicketsList
              user={user ?? undefined}
              isAllTickets
              searchParams={ticketSearchParamsCache.parse(await searchParams)}
            />
          </Suspense>
        </ErrorBoundary>

        <div className="flex w-full max-w-md flex-1 flex-col items-center">
          <TicketPagination />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
