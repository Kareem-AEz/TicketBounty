import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { getCanonicalUrl } from "@/lib/seo";
import { homePath, signInPath } from "@/paths";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign up to create an account to get started",
  keywords: [
    "sign up",
    "account",
    "management",
    "the road to next",
    "road to next",
  ],
  openGraph: {
    title: "Sign Up - The Road to Next",
    description: "Sign up to create an account to get started",
    images: [
      {
        url: "/og-image 1x.png",
        width: 1200,
        height: 630,
        alt: "Sign Up - The Road to Next",
      },
    ],
    url: "https://ticket-bounty-pi.vercel.app/sign-up",
    siteName: "The Road to Next",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - The Road to Next",
    description: "Sign up to create an account to get started",
    images: [
      {
        url: "/og-image 1x.png",
        width: 1200,
        height: 630,
        alt: "Sign Up - The Road to Next",
      },
    ],
    creator: "@KareemAhmedEz",
  },
  alternates: {
    canonical: getCanonicalUrl("/sign-up"),
  },
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Sign Up",
  },
];

export default function page() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Separator className="mb-8" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Sign Up"
          description="Create an account to get started"
          className="animate-fade-from-top w-full max-w-md"
          content={<SignUpForm />}
          footer={
            <span className="text-sm">
              Have an account?{" "}
              <Link href={signInPath()} className="border-b border-b-current">
                Sign In
              </Link>
            </span>
          }
        />
      </div>
    </div>
  );
}
