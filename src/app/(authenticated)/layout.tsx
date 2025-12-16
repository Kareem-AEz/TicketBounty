import React from "react";
import AuthGuard from "@/components/auth-guard";
import EmailVerificationAlert from "@/features/auth/components/email-verification-alert";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth guard with React Query
  return (
    <AuthGuard>
      <EmailVerificationAlert className="mx-auto mb-4 w-full max-w-2xl" />
      {children}
    </AuthGuard>
  );
}
