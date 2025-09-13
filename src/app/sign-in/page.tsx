import Link from "next/link";
import React from "react";
import { CardCompact } from "@/components/card-compact";
import SignInForm from "@/features/auth/components/sign-in-form";
import { passwordForgotPath, signUpPath } from "@/paths";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <CardCompact
        title="Sign In"
        description="Sign in to your account to get started"
        className="animate-fade-from-top w-full max-w-md"
        content={<SignInForm />}
        footer={
          <>
            <Link href={signUpPath()} className="text-muted-foreground text-sm">
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
  );
}
