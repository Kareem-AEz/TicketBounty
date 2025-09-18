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
          isActive && "bg-muted hover:bg-muted font-bold",
        )}
      >
        <div className="flex h-5 w-5 items-center justify-center">
          {item.icon}
        </div>
        {isOpen && !isMobile && <span className="text-sm">{item.label}</span>}
      </Link>
    </>
  );
}
