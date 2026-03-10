import { Suspense } from "react";
import Spinner from "@/components/spinner";
import InvitationList from "@/features/invitation/components/invitation-list";
import { getInvitationsByOrganization } from "@/features/invitation/queries/get-invitations-by-organization";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const invitations = await getInvitationsByOrganization(organizationId);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <InvitationList
        invitations={invitations}
        organizationId={organizationId}
      />
    </Suspense>
  );
}
