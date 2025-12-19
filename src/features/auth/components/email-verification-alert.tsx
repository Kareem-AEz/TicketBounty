import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/note";
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { emailVerificationPath } from "@/paths";
import { getAuth } from "../queries/get-auth";

export default async function EmailVerificationAlert({
  className,
}: {
  className?: string;
}) {
  const auth = await getAuth();
  if (!auth.user) return null;

  const userId = auth.user.id;

  const isEmailVerified = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  if (isEmailVerified?.emailVerified) return null;

  return (
    <Note
      type="warning"
      fill
      className={cn(className)}
      label={false}
      action={
        <Button asChild size="sm" variant="outline">
          <Link href={emailVerificationPath()}>Verify Email</Link>
        </Button>
      }
    >
      Your email address is not verified. Please verify your email address.
    </Note>
  );
}
