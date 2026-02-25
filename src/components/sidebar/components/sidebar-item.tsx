"use client";

import { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { SidebarItem } from "../types";

type SideBarItemProps = {
  isOpen: boolean;
  item: SidebarItem;
  isMobile: boolean;
};

export default function SideBarItem({
  isOpen,
  item,
  isMobile,
}: SideBarItemProps) {
  const pathName = usePathname();
  const isActive = item.basePath
    ? pathName.startsWith(item.basePath)
    : pathName === item.href;

  return (
    <>
      {item.separator && <Separator className="my-2" />}
      <Link
        href={item.href as Route}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group relative flex h-12 justify-center",
          isActive &&
            "bg-primary/10 hover:bg-primary/15 text-primary font-bold",
        )}
        aria-label={item.label}
      >
        {isActive && (
          <span className="bg-primary absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full" />
        )}
        <div className="flex h-5 w-5 items-center justify-center">
          {item.icon}
        </div>
        {isOpen && !isMobile && <span className="text-sm">{item.label}</span>}
      </Link>
    </>
  );
}
