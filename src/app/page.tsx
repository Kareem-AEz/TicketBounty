import type { Metadata } from "next";
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
import { generateWebsiteStructuredData, getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "All Tickets",
  description:
    "Manage and track all your tickets in one place. View, create, and organize tickets with our intuitive ticket management system.",
  keywords: [
    "ticket management",
    "ticket tracking",
    "ticket system",
    "project management",
    "task management",
    "issue tracking",
    "support tickets",
    "bug tracking",
    "road to next",
    "the road to next",
  ],
  openGraph: {
    title: "All Tickets - The Road to Next",
    description:
      "Manage and track all your tickets in one place. View, create, and organize tickets with our intuitive ticket management system.",
    images: [
      {
        url: "/og-image 1x.png",
        width: 1200,
        height: 630,
        alt: "All Tickets - The Road to Next Ticket Management System",
      },
    ],
    url: "https://ticket-bounty-pi.vercel.app/",
    siteName: "The Road to Next",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Tickets - The Road to Next",
    description:
      "Manage and track all your tickets in one place. View, create, and organize tickets with our intuitive ticket management system.",
    images: ["/og-image 1x.png"],
    creator: "@kareemahmed",
  },
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
};

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
