import Link from "next/link";
import React from "react";
import { CardCompact } from "@/components/card-compact";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { signInPath } from "@/paths";

export default function page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <CardCompact
        title="Sign Up"
        description="Create an account to get started"
        className="animate-fade-from-top w-full max-w-md"
        content={<SignUpForm />}
        footer={
          <Link
            href={signInPath()}
            className="text-muted-foreground text-sm underline"
          >
            Have an account? Sign In
          </Link>
        }
      />
    </div>
  );
}
