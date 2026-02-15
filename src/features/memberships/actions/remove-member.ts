"use server";

import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { getMembershipsByOrganization } from "../queries/get-memberships-by-organization";
import { isCurrentUser } from "../utils/is-current-user";
import { isUserAdmin } from "../utils/is-user-admin";

export async function removeMember(organizationId: string, memberId: string) {
  try {
    // Check if the caller is the current user
    const isCallerCurrentUser = await isCurrentUser(memberId);

    await prisma.$transaction(async (tx) => {
      // Check if the caller is an admin
      const isCallerAdmin = await isUserAdmin({
        organizationId,
        tx,
      });
      if (!isCallerAdmin && !isCallerCurrentUser)
        throw new Error("Only admins can remove members");

      // Check if the member is the last member
      const memberships = await getMembershipsByOrganization(organizationId, {
        tx,
      });
      const isLastMember = (memberships ?? []).length === 1;
      if (isLastMember)
        throw new Error(
          isCallerCurrentUser
            ? "You cannot leave the organization as the last member"
            : "You cannot delete the last member of the organization",
        );

      // Check if the member is the last admin
      const lastAdmins = memberships.filter(
        (membership) => membership.membershipRole === MembershipRole.ADMIN,
      );
      const isLastAdmin = lastAdmins.length === 1;
      if (isLastAdmin)
        throw new Error(
          isCallerCurrentUser
            ? "You cannot leave the organization as the last admin"
            : "You cannot delete the last admin of the organization",
        );

      // Delete the member
      await tx.membership.delete({
        where: {
          userId_organizationId: {
            userId: memberId,
            organizationId,
          },
        },
      });
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: isCallerCurrentUser
        ? "You left the organization"
        : "Member deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
}
