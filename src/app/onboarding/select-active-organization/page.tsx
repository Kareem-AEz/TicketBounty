import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Heading from "@/components/heading";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import OrganizationsList from "@/features/organizations/components/organizations-list";
import { getOrganizationsByUserId } from "@/features/organizations/queries/get-organizations-by-user-id";
import { onboardingPath, organizationsPath } from "@/paths";

export default async function SelectActiveOrganizationPage() {
  const organizations = await getOrganizationsByUserId();
  const hasActiveOrganization = organizations.some(
    (organization) => organization.membershipByUser?.isActive,
  );
  if (hasActiveOrganization) {
    redirect(organizationsPath());
  }
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title="Select Active Organization"
        description="Select the active organization you want to use"
        action={
          <Button asChild>
            <Link href={onboardingPath()}>
              <PlusIcon className="h-4 w-4" />
              Create Organization
            </Link>
          </Button>
        }
      />

      <Suspense
        fallback={
          <div className="flex min-h-screen w-full flex-1 items-center justify-center">
            <Spinner />
          </div>
        }
      >
        <OrganizationsList />
      </Suspense>
    </div>
  );
}
