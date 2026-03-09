import { LucideChevronDown, LucideSlash } from "lucide-react";
import React, { Fragment } from "react";
import {
  Breadcrumb as BreadcrumbWrapper,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export type Breadcrumb = {
  label: React.ReactNode | string;
  href?: string;
  dropdown?: {
    label: string;
    href: string;
  }[];
};

const EMPTY_BREADCRUMBS: Breadcrumb[] = [];

export default function Breadcrumbs({
  breadcrumbs = EMPTY_BREADCRUMBS,
  className,
}: {
  breadcrumbs: Breadcrumb[];
  className?: string;
}) {
  return (
    <BreadcrumbWrapper className="select-none">
      <BreadcrumbList className={className}>
        {breadcrumbs.map((breadcrumb, index) => {
          let item;

          // 1. Dropdown State
          if (breadcrumb.dropdown) {
            item = (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus-visible:border-ring focus-visible:ring-ring/50 flex items-center gap-2 outline-none select-none focus-visible:ring-[3px] focus-visible:outline-none">
                  {typeof breadcrumb.label === "string" ? (
                    <span className="text-primary font-mono text-sm tracking-wider uppercase">
                      {breadcrumb.label}
                    </span>
                  ) : (
                    breadcrumb.label
                  )}
                  <LucideChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-full">
                  {breadcrumb.dropdown.map((dropdownItem) => (
                    <DropdownMenuItem
                      key={dropdownItem.href.toString()}
                      asChild
                    >
                      <BreadcrumbLink
                        href={dropdownItem.href}
                        className="text-muted-foreground cursor-pointer"
                      >
                        {dropdownItem.label}
                      </BreadcrumbLink>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          // 2. Link State
          else if (breadcrumb.href) {
            item = (
              <BreadcrumbLink href={breadcrumb.href}>
                {breadcrumb.label}
              </BreadcrumbLink>
            );
          }
          // 3. Active Page State (Fallback)
          else {
            item = (
              <BreadcrumbPage aria-current="page">
                {breadcrumb.label}
              </BreadcrumbPage>
            );
          }

          return (
            <Fragment
              key={
                typeof breadcrumb.label === "string"
                  ? breadcrumb.label
                  : `breadcrumb-${index}`
              }
            >
              <BreadcrumbItem>{item}</BreadcrumbItem>
              {index < breadcrumbs.length - 1 && (
                <BreadcrumbSeparator>
                  <LucideSlash />
                </BreadcrumbSeparator>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbWrapper>
  );
}
