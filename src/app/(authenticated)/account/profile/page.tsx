import { Metadata } from "next";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import AccountProfileForm from "@/features/accounts/components/account-profile-form";
import AccountTabs from "@/features/accounts/components/account-tabs";
import { homePath } from "@/paths";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile",
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Profile",
  },
];
export default async function AccountProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading title="Profile" description="Manage your profile"></Heading>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <AccountTabs />

      <div className="flex flex-1 items-center justify-center">
        <CardCompact
          title="Profile"
          description="Manage your profile"
          className="animate-fade-from-top w-full max-w-sm"
          content={<AccountProfileForm />}
        />
      </div>
    </div>
  );
}
