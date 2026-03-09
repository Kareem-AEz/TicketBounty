import { Suspense } from "react";
import Spinner from "@/components/spinner";
import OrganizationMembersList from "@/features/memberships/components/membership-list";

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
      <OrganizationMembersList organizationId={organizationId} />
    </Suspense>
  );
}
