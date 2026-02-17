"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import {
  getRedirectUrl,
  isRedirectError,
  useAuthQuery,
} from "@/features/auth/queries/use-auth-query";
import { signInPath } from "@/paths";
import Spinner from "./spinner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // Hooks
  const router = useRouter();
  const { isFetching, error, data } = useAuthQuery();

  // Handle redirect errors by navigating client-side
  useEffect(() => {
    if (error && isRedirectError(error)) {
      const redirectUrl = getRedirectUrl(error);
      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        // Fallback to sign-in if we can't extract the URL
        router.replace(signInPath());
      }
    }
  }, [error, router]);

  // Loading state
  if (isFetching) {
    return <Spinner />;
  }

  // Non-redirect errors
  if (error && !isRedirectError(error)) {
    return (
      <div className="flex flex-1 items-center justify-center text-center">
        <p className="text-lg font-semibold text-red-500">
          Error: {error.message}
        </p>
      </div>
    );
  }

  // Redirect error - show spinner while redirecting
  if (error && isRedirectError(error)) {
    return <Spinner />;
  }

  // Authenticated - render children
  if (data) {
    return <>{children}</>;
  }

  // Fallback - no data and no error
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-lg font-semibold text-red-500">Something went wrong</p>
    </div>
  );
}
