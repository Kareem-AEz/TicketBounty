import { Metadata } from "next";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import Heading from "@/components/heading";
import AccountPasswordForm from "@/features/accounts/components/account-password-form";
import AccountTabs from "@/features/accounts/components/account-tabs";
import { getCanonicalUrl } from "@/lib/structured-data";
import { homePath } from "@/paths";

export const metadata: Metadata = {
  title: "Password",
  description: "Manage your password",
  keywords: [
    "password",
    "account",
    "management",
    "Ticket Bounty",
    "Ticket Bounty",
  ],
  openGraph: {
    title: "Password - Ticket Bounty",
    description: "Manage your password",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Password - Ticket Bounty",
      },
    ],
    url: "https://ticket-bounty-pi.vercel.app/account/password",
    siteName: "Ticket Bounty",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Password - Ticket Bounty",
    description: "Manage your password",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Password - Ticket Bounty",
      },
    ],
    creator: "@KareemAhmedEz",
  },
  alternates: {
    canonical: getCanonicalUrl("/account/password"),
  },
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
