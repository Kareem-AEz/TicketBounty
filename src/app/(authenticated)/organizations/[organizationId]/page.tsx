import { Suspense } from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import Heading from "@/components/heading";
import Spinner from "@/components/spinner";
import OrganizationMembersList from "@/features/organizations/components/organization-members-list";
import { getOrganizationById } from "@/features/organizations/queries/get-organization-by-id";
import { homePath, organizationsPath } from "@/paths";
const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Organizations",
    href: organizationsPath(),
  },
];
export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const organization = await getOrganizationById(organizationId);

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title={organization?.name ?? "Organization"}
        description="Manage memberships of your organization"
      />
      <Breadcrumbs
        breadcrumbs={[
          ...breadcrumbs,
          { label: organization?.name ?? "Organization" },
        ]}
      />

      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <OrganizationMembersList organizationId={organizationId} />
      </Suspense>
    </div>
  );
}
