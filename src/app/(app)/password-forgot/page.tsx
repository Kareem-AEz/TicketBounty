import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { CardCompact } from "@/components/card-compact";
import { Separator } from "@/components/ui/separator";
import ForgotPasswordForm from "@/features/password/components/forgot-password-formt";
import { homePath, signInPath } from "@/paths";

export const metadata: Metadata = {
  title: "Forgot Password",
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Forgot Password",
  },
];

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Separator className="mb-8" />

      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Forgot Password"
          description="Forgot your password? No problem. Enter your email below and we'll send you a reset link."
          className="animate-fade-from-top w-full max-w-md"
          content={<ForgotPasswordForm />}
          footer={
            <>
              <Link
                href={signInPath()}
                className="text-muted-foreground text-sm"
              >
                Remember your password? Sign In
              </Link>
            </>
          }
        />
      </div>
    </div>
  );
}
