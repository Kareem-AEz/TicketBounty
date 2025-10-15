import React from "react";
import AuthGuard from "@/components/auth-guard";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth guard with React Query
  return <AuthGuard>{children}</AuthGuard>;
}
