import { Metadata } from "next";
import React from "react";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import AccountPasswordForm from "@/features/accounts/components/account-password-form";
import AccountTabs from "@/features/accounts/components/account-tabs";

export const metadata: Metadata = {
  title: "Password",
  description: "Manage your password",
};

export default async function AccountPasswordPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading title="Password" description="Manage your password" />
      <AccountTabs />

      <div className="flex flex-1 items-center justify-center">
        <CardCompact
          title="Password"
          description="Manage your password"
          className="animate-fade-from-top w-full max-w-sm"
          content={<AccountPasswordForm />}
        />
      </div>
    </div>
  );
}
