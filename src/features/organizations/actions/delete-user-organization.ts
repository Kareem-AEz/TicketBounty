"use server";

import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import prisma from "@/lib/prisma";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";

export async function deleteUserOrganization(organizationId: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const user = await getAuthOrRedirect();
    if (!user) throw new Error("Unauthorized");

    const organizations = await getOrganizationsByUserId();
    const exists = organizations.some(
      (organization) => organization.id === organizationId,
    );
    if (!exists) throw new Error("Organization not found");

    await prisma.$transaction(async (tx) => {
      const memberships = await tx.membership.findMany({
        where: {
          userId: user.id,
        },
      });

      const isActiveMembership = memberships.find(
        (membership) =>
          membership.organizationId === organizationId && membership.isActive,
      );

      if (isActiveMembership)
        throw new Error("You cannot delete your active organization");

      await tx.membership.delete({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
}
