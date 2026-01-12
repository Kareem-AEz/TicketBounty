import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import CreateOrganizationForm from "@/features/organizations/components/create-organization-form";
import { homePath } from "@/paths";

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Onboarding",
  },
];
export default function OnboardingPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading
        title="Onboarding"
        description="Create your first organization"
      />
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <CardCompact
          title="Create your first organization"
          description="Create your first organization to get started"
          content={<CreateOrganizationForm />}
          className="animate-fade-from-bottom w-full"
        />
      </div>
    </div>
  );
}
