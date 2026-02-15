"use server";

import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { getMyActiveMembership } from "@/features/memberships/queries/get-my-active-membership";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { getMyOrganizations } from "../queries/get-my-organizations";

export async function deleteOrganization(organizationId: string) {
  try {
    const user = await getAuthOrRedirect();
    if (!user) throw new Error("Unauthorized");

    await prisma.$transaction(async (tx) => {
      const organizations = await getMyOrganizations({ tx });
      const exists = organizations.some(
        (organization) => organization.id === organizationId,
      );
      if (!exists) throw new Error("Organization not found");

      const organizationMembership = await tx.membership.findFirst({
        where: {
          organizationId,
          userId: user.id,
        },
      });

      if (organizationMembership?.membershipRole !== MembershipRole.ADMIN)
        throw new Error(
          "You cannot delete the organization as you are not an admin of this organization",
        );

      const activeMembership = await getMyActiveMembership({ tx });

      if (activeMembership?.organizationId === organizationId)
        throw new Error("You cannot delete your active organization");

      await tx.organization.delete({ where: { id: organizationId } });
    });

    // The revalidation is handled by the router.refresh() in the component
    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
}
