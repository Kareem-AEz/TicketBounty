import { LucideCircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Breadcrumbs, { Breadcrumb } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import EmailVerificationForm from "@/features/auth/components/email-verification-form";
import { getAuth } from "@/features/auth/queries/get-auth";
import prisma from "@/lib/prisma";
import { homePath, signInPath, ticketsPath } from "@/paths";

export const metadata: Metadata = {
  title: "Verify Email",
};

const breadcrumbs: Breadcrumb[] = [
  {
    label: "Home",
    href: homePath(),
  },
  {
    label: "Verify Email",
  },
];

export default async function EmailVerificationPage() {
  const auth = await getAuth();
  if (!auth.user) redirect(signInPath());

  const isEmailVerified = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { emailVerified: true },
  });

  if (isEmailVerified?.emailVerified)
    return (
      <div className="flex flex-1 flex-col gap-y-8">
        <div className="flex flex-col gap-y-8">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
          <Separator className="mb-4" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideCircleCheck className="size-5 text-green-500" />
                Email Verified
              </CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now access
                all features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Thank you for verifying your email. You are now ready to use the
                platform and manage your tickets.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={ticketsPath()}>Go to tickets</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );

  return (
    <div className="flex flex-1 flex-col gap-y-8">
      <div className="flex flex-col gap-y-8">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <Separator className="mb-4" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <EmailVerificationForm />
      </div>
    </div>
  );
}
