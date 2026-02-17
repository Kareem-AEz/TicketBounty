import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
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
import { homePath } from "@/paths";

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Organization Tickets",
  },
];

type OrganizationTicketsPagePropsType = {
  searchParams: Promise<SearchParams>;
};

export default async function OrganizationTicketsPage({
  searchParams,
}: OrganizationTicketsPagePropsType) {
  const user = await getAuthOrRedirect();

  return (
    <>
      <div className="flex flex-1 flex-col gap-y-8">
        <Heading
          title="Organization Tickets"
          description="All your organization's tickets in one place"
        />

        <Breadcrumbs breadcrumbs={breadcrumbs} />

        <div className="flex w-full max-w-lg flex-1 flex-col items-center gap-y-10 self-center">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{"Create a new ticket"}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-x-2 text-sm">
                  <span>Add a new ticket to your organization:</span>
                  <span className="text-primary font-mono text-xs font-medium tracking-wider">
                    [{user.activeOrganization?.name}]
                  </span>
                </div>
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
                showOrganizationTickets
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
