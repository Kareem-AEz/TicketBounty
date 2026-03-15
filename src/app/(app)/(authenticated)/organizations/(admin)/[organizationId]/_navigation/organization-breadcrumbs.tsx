"use client";

import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs";
import {
  organizationInvitationsPath,
  organizationMembershipsPath,
  organizationsPath,
} from "@/paths";

type OrganizationBreadcrumbsProps = {
  organizationId: string;
  organizationName: string;
};

const OrganizationBreadcrumbs = ({
  organizationId,
  organizationName,
}: OrganizationBreadcrumbsProps) => {
  const pathname = usePathname();

  const lastSegment = pathname.split("/").at(-1);
  const titleMap = {
    memberships: "Memberships",
    invitations: "Invitations",
  } as const;
  const title = titleMap[lastSegment as keyof typeof titleMap];
  const label = (
    <span>
      <span className="text-primary font-mono text-xs tracking-widest">
        [{organizationName}]
      </span>{" "}
      {title}
    </span>
  );

  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Home", href: organizationsPath() },
          { label: "Organizations", href: organizationsPath() },
          {
            label,
            dropdown: [
              {
                label: "Memberships",
                href: organizationMembershipsPath(organizationId),
              },
              {
                label: "Invitations",
                href: organizationInvitationsPath(organizationId),
              },
            ],
          },
        ]}
      />
    </>
  );
};

export default OrganizationBreadcrumbs;
