import React, { Suspense } from "react";
import Heading from "@/components/heading";
import Spinner from "@/components/spinner";
import { getOrganization } from "@/features/organizations/queries/get-organization";
import OrganizationBreadcrumbs from "./_navigation/organization-breadcrumbs";

export default async function OrganizationLayout({
  children,
  params,
}: {
  params: Promise<{ organizationId: string }>;
  children: React.ReactNode;
}) {
  const { organizationId } = await params;
  const organization = await getOrganization(organizationId);

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title={organization?.name ?? "Organization"}
        description={`Manage ${organization?.name} organization`}
        tabs={
          <OrganizationBreadcrumbs
            organizationId={organizationId}
            organizationName={organization?.name ?? ""}
          />
        }
      />
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </div>
  );
}
