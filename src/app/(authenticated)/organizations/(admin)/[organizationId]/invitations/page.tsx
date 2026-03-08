import { Suspense } from "react";
import Heading from "@/components/heading";
import Spinner from "@/components/spinner";
import InvitationList from "@/features/invitation/components/invitation-list";
import { getOrganization } from "@/features/organizations/queries/get-organization";
import OrganizationBreadcrumbs from "../_navigation/organization-breadcrumbs";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title={organization?.name ?? "Organization"}
        description="Manage invitations for your organization"
        tabs={<OrganizationBreadcrumbs />}
      />

      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <InvitationList organizationId={organizationId} />
      </Suspense>
    </div>
  );
}
