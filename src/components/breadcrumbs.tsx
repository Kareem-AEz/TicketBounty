import { LucideSlash } from "lucide-react";
import React, { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export type Breadcrumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({
  breadcrumbs = [],
  className,
}: {
  breadcrumbs: Breadcrumb[];
  className?: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className={className}>
        {breadcrumbs.map((breadcrumb, index) => {
          let item = (
            <BreadcrumbPage aria-current="page">
              {breadcrumb.label}
            </BreadcrumbPage>
          );

          if (breadcrumb.href) {
            item = (
              <BreadcrumbLink href={breadcrumb.href}>
                {breadcrumb.label}
              </BreadcrumbLink>
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
    </Breadcrumb>
  );
}
