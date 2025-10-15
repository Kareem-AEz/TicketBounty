import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import SignInForm from "@/features/auth/components/sign-in-form";
import { getCanonicalUrl } from "@/lib/seo";
import { homePath, passwordForgotPath, signUpPath } from "@/paths";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account to get started",
  keywords: [
    "sign in",
    "account",
    "management",
    "the road to next",
    "road to next",
  ],
  openGraph: {
    title: "Sign In - The Road to Next",
    description: "Sign in to your account to get started",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Sign In - The Road to Next",
      },
    ],
    url: "https://ticket-bounty-pi.vercel.app/sign-in",
    siteName: "The Road to Next",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - The Road to Next",
    description: "Sign in to your account to get started",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Sign In - The Road to Next",
      },
    ],
  },
  alternates: {
    canonical: getCanonicalUrl("/sign-in"),
  },
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Sign In",
  },
];

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Separator className="mb-8" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Sign In"
          description="Sign in to your account to get started"
          className="animate-fade-from-top w-full max-w-md"
          content={<SignInForm />}
          footer={
            <>
              <Link
                href={signUpPath()}
                className="text-muted-foreground text-sm"
              >
                Don&apos;t have an account? Sign Up
              </Link>

              <Link
                href={passwordForgotPath()}
                className="text-muted-foreground text-sm"
              >
                Forgot your password?
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
