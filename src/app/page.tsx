import type { Metadata } from "next";
import { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Heading from "@/components/heading";
import Placeholder from "@/components/placeholder";
import SearchInput from "@/components/search-input";
import SelectInput from "@/components/select-input";
import Spinner from "@/components/spinner";
import { getAuth } from "@/features/auth/queries/get-auth";
import TicketsList from "@/features/ticket/components/tickets-list";
import { copy } from "@/lib/copy";
import { searchParamsCache } from "@/lib/search-params";

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
          <SearchInput />
          <SelectInput />
        </div>

        <ErrorBoundary fallback={<Placeholder label={copy.errors.general} />}>
          <Suspense fallback={<Spinner />}>
            <TicketsList
              user={user ?? undefined}
              isAllTickets
              searchParams={searchParamsCache.parse(await searchParams)}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default HomePage;
