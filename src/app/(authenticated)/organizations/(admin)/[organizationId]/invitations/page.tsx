import { Suspense } from "react";
import Spinner from "@/components/spinner";
import InvitationList from "@/features/invitation/components/invitation-list";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full flex-1 items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <InvitationList organizationId={organizationId} />
    </Suspense>
  );
}
