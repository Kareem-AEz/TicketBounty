"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { organizationPath } from "@/paths";
import { getMembership } from "../queries/get-membership";
import { getMembershipsByOrganization } from "../queries/get-memberships-by-organization";

export const updateMemberRole = async (
  organizationId: string,
  memberId: string,
  role: MembershipRole,
) => {
  try {
    const { user } = await getAuth();
    if (!user) return toErrorActionState(new Error("Unauthorized"));
    const userId = user.id;

    await prisma.$transaction(async (tx) => {
      const userMembership = await getMembership(organizationId, userId, {
        tx,
      });
      if (!userMembership)
        throw new Error("You are not a member of this organization");
      if (userMembership.membershipRole !== MembershipRole.ADMIN)
        throw new Error("You are not an admin of this organization");

      // Check if the member is the last admin
      const memberships = await getMembershipsByOrganization(organizationId, {
        tx,
      });
      const lastAdmins = (memberships ?? []).filter(
        (membership) => membership.membershipRole === MembershipRole.ADMIN,
      );
      const isUpdatingLastAdmin =
        lastAdmins.length === 1 && lastAdmins[0].userId === memberId;

      if (isUpdatingLastAdmin)
        throw new Error("You cannot update the role of the last admin");

      await tx.membership.update({
        where: {
          userId_organizationId: { userId: memberId, organizationId },
        },
        data: {
          membershipRole: role,
        },
      });
    });
  } catch (error) {
    return toErrorActionState(error);
  }

  revalidatePath(organizationPath(organizationId));

  return toSuccessActionState({
    status: "SUCCESS",
    message: "Membership role updated",
  });
};
