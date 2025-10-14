import React from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Add auth guard with React Query
  return <>{children}</>;
}
