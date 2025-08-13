import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Heading from "@/components/heading";
import Placeholder from "@/components/placeholder";
import Spinner from "@/components/spinner";
import TicketsList from "@/features/ticket/components/tickets-list";
import { copy } from "@/lib/copy";

function page() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading title="Tickets" description="All your tickets in one place" />

      <ErrorBoundary fallback={<Placeholder label={copy.errors.general} />}>
        <Suspense fallback={<Spinner />}>
          <TicketsList />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default page;
