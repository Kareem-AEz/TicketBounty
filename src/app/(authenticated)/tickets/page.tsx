import { SearchParams } from "nuqs/server";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Heading from "@/components/heading";
import Placeholder from "@/components/placeholder";
import RedirectToast from "@/components/redirect-toast";
import Spinner from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import TicketUpsertForm from "@/features/ticket/components/ticket-upsert-form";
import TicketsList from "@/features/ticket/components/tickets-list";
import { ticketSearchParamsCache } from "@/features/ticket/utils/search-params";
import { copy } from "@/lib/copy";
import { getSEOTags } from "@/lib/seo-tags";

export const metadata = getSEOTags({
  title: "My Tickets",
  description: "All your tickets in one place",
  keywords: [
    "tickets",
    "ticket management",
    "ticket system",
    "ticket tracking",
    "road to next",
    "the road to next",
  ],
  openGraph: {
    title: "My Tickets - The Road to Next",
    description: "All your tickets in one place",
    images: ["/og-image 1x.jpg"],
  },
  canonicalUrlRelative: "/tickets",
});

type TicketsPagePropsType = {
  searchParams: Promise<SearchParams>;
};

async function page({ searchParams }: TicketsPagePropsType) {
  const user = await getAuthOrRedirect();

  return (
    <>
      <div className="flex flex-1 flex-col gap-y-8">
        <Heading
          title="My Tickets"
          description="All your tickets in one place"
        />

        <div className="flex w-full max-w-lg flex-1 flex-col items-center gap-y-10 self-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{"Create a new ticket"}</CardTitle>
              <CardDescription>
                {"Add a new ticket to your list"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <TicketUpsertForm />
            </CardContent>
          </Card>

          <ErrorBoundary fallback={<Placeholder label={copy.errors.general} />}>
            <Suspense fallback={<Spinner />}>
              <TicketsList
                user={user}
                searchParams={ticketSearchParamsCache.parse(await searchParams)}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <RedirectToast />
    </>
  );
}

export default page;
