import type { Metadata } from "next";
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
import { copy } from "@/lib/copy";

export const metadata: Metadata = {
  title: "My Tickets",
};

async function page() {
  const user = await getAuthOrRedirect();

  return (
    <>
      <div className="flex flex-1 flex-col gap-y-8">
        <Heading
          title="My Tickets"
          description="All your tickets in one place"
        />

        <div className="flex w-full max-w-md flex-1 flex-col items-center gap-y-10 self-center">
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
              <TicketsList user={user} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <RedirectToast />
    </>
  );
}

export default page;
