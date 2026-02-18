import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import SignInForm from "@/features/auth/components/sign-in-form";
import { getCanonicalUrl } from "@/lib/structured-data";
import { homePath, passwordForgotPath, signUpPath } from "@/paths";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account to get started",
  keywords: [
    "sign in",
    "account",
    "management",
    "Ticket Bounty",
    "The Road to Next",
  ],
  openGraph: {
    title: "Sign In - Ticket Bounty",
    description: "Sign in to your account to get started",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Sign In - Ticket Bounty",
      },
    ],
    url: "https://ticket-bounty-pi.vercel.app/sign-in",
    siteName: "Ticket Bounty",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - Ticket Bounty",
    description: "Sign in to your account to get started",
    images: [
      {
        url: "/og-image 1x.jpg",
        width: 1200,
        height: 630,
        alt: "Sign In - Ticket Bounty",
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
