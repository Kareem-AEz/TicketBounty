import { Metadata } from "next";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import AccountPasswordForm from "@/features/accounts/components/account-password-form";
import AccountTabs from "@/features/accounts/components/account-tabs";
import { homePath } from "@/paths";

export const metadata: Metadata = {
  title: "Password",
  description: "Manage your password",
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Password",
  },
];

export default async function AccountPasswordPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Heading title="Password" description="Manage your password" />
      <Breadcrumbs breadcrumbs={breadcrumbs} />

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
