"use client";

import { createContext, useContext, useState } from "react";

type DeletingUserOrganizationContextType = {
  deletingUserOrganizationId: string | null;
  setDeletingUserOrganizationId: (id: string | null) => void;
};

const DeletingUserOrganizationContext =
  createContext<DeletingUserOrganizationContextType | null>(null);

export function DeletingUserOrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deletingUserOrganizationId, setDeletingUserOrganizationId] = useState<
    string | null
  >(null);

  return (
    <DeletingUserOrganizationContext.Provider
      value={{ deletingUserOrganizationId, setDeletingUserOrganizationId }}
    >
      {children}
    </DeletingUserOrganizationContext.Provider>
  );
}

export function useDeletingUserOrganization() {
  const context = useContext(DeletingUserOrganizationContext);
  if (!context) {
    throw new Error(
      "useDeletingUserOrganization must be used within DeletingUserOrganizationProvider",
    );
  }
  return context;
}
