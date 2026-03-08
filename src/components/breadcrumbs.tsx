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
  label: string;
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
                {/* Removed aria-current="page" here because a dropdown trigger isn't a page */}
                <DropdownMenuTrigger className="flex items-center gap-2 select-none">
                  {breadcrumb.label}
                  <LucideChevronDown className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {breadcrumb.dropdown.map((dropdownItem) => (
                    <DropdownMenuItem key={dropdownItem.label} asChild>
                      <BreadcrumbLink
                        href={dropdownItem.href}
                        className="cursor-pointer"
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
            <Fragment key={breadcrumb.label}>
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
