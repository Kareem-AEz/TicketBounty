import { Metadata } from "next";
import React from "react";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import AccountProfileForm from "@/features/accounts/components/account-profile-form";
import AccountTabs from "@/features/accounts/components/account-tabs";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile",
};

export default async function AccountProfilePage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading title="Profile" description="Manage your profile" />
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
