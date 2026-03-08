"use client";

import { useParams, usePathname } from "next/navigation";
import Breadcrumbs from "@/components/breadcrumbs";
import {
  organizationInvitationsPath,
  organizationMembershipsPath,
  organizationsPath,
} from "@/paths";

const OrganizationBreadcrumbs = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const pathname = usePathname();

  const lastSegment = pathname.split("/").at(-1);
  const titleMap = {
    memberships: "Memberships",
    invitations: "Invitations",
  } as const;
  const title = titleMap[lastSegment as keyof typeof titleMap];

  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          { label: "Home", href: organizationsPath() },
          { label: "Organizations", href: organizationsPath() },
          {
            label: title,
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
