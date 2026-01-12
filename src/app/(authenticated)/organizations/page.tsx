import { Suspense } from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import Heading from "@/components/heading";
import Spinner from "@/components/spinner";
import OrganizationsList from "@/features/organizations/components/organizations-list";
import { homePath } from "@/paths";
const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Organizations",
  },
];
export default function OrganizationsPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title="Organizations"
        description="Manage your organizations"
      ></Heading>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

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
