import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import CreateOrganizationForm from "@/features/organizations/components/create-organization-form";
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
  {
    label: "Create Organization",
  },
];

export default function CreateOrganizationPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title="Create Organization"
        description="Create a new organization"
      />
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <CardCompact
          title="Create Organization"
          description="Create a new organization"
          content={<CreateOrganizationForm redirectTo={organizationsPath()} />}
          className="animate-fade-from-bottom w-full"
        />
      </div>
    </div>
  );
}
