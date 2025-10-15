import { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Heading from "@/components/heading";
import Placeholder from "@/components/placeholder";
import Spinner from "@/components/spinner";
import { getAuth } from "@/features/auth/queries/get-auth";
import TicketsList from "@/features/ticket/components/tickets-list";
import { ticketSearchParamsCache } from "@/features/ticket/utils/search-params";
import { copy } from "@/lib/copy";
import { generateWebsiteStructuredData } from "@/lib/seo";
import { getSEOTags } from "@/lib/seo-tags";

export const metadata = getSEOTags({
  title: "All Tickets",
  description:
    "Manage and track all your tickets in one place. View, create, and organize tickets with our intuitive ticket management system.",
  openGraph: {
    title: "All Tickets - The Road to Next",
    images: ["/og-image 1x.jpg"],
  },
  canonicalUrlRelative: "/",
});

type HomePagePropsType = {
  searchParams: Promise<SearchParams>;
};

async function HomePage({ searchParams }: HomePagePropsType) {
  const { user } = await getAuth();
  const structuredData = generateWebsiteStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex flex-1 flex-col gap-y-8">
        <Heading
          title="All Tickets"
          description="Your one stop shop for all your ticket needs"
        />

        <div className="flex flex-1 flex-col items-center gap-y-8">
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
        </div>
      </div>
    </>
  );
}

export default HomePage;
