"use client";

import { LucideBuilding2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrentActiveOrganization } from "../hooks/use-current-active-organization";

export default function CurrentOrganizationLabel() {
  const currentActiveOrganization = useCurrentActiveOrganization();
  if (!currentActiveOrganization) return null;

  return (
    <Badge
      variant="outline"
      className="bg-secondary/80 fixed right-10 bottom-10 z-50 flex h-8 items-center gap-2 px-4 font-mono text-pretty"
    >
      <LucideBuilding2 className="size-4! -translate-y-px" />
      <span className="max-w-32 truncate">
        {currentActiveOrganization.name}
      </span>
    </Badge>
  );
}
