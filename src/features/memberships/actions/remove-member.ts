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
    // Check if the caller is the current user (leaving scenario)
    const isCallerCurrentUser = await isCurrentUser(memberId);

    await prisma.$transaction(async (tx) => {
      // 1. AUTHENTICATION & AUTHORIZATION
      // Check if the caller is an admin
      const isCallerAdmin = await isUserAdmin({
        organizationId,
        tx,
      });

      // A user can only be removed by an admin, or if they are removing themselves (leaving)
      if (!isCallerAdmin && !isCallerCurrentUser) {
        throw new Error("Only admins can remove members");
      }

      // 2. FETCH MEMBERSHIPS & VALIDATE TARGET
      const memberships = await getMembershipsByOrganization(organizationId, {
        tx,
      });

      // Ensure the member actually exists in this organization
      const targetMembership = memberships.find((m) => m.userId === memberId);
      if (!targetMembership) {
        throw new Error("Member not found in organization");
      }

      // 3. ORGANIZATION CONSTRAINTS
      // Check if the member is the last member
      const isLastMember = memberships.length === 1;
      if (isLastMember) {
        throw new Error(
          isCallerCurrentUser
            ? "You cannot leave the organization as the last member"
            : "You cannot delete the last member of the organization",
        );
      }

      // Check if the member is the last admin
      if (targetMembership.membershipRole === MembershipRole.ADMIN) {
        const adminCount = memberships.filter(
          (m) => m.membershipRole === MembershipRole.ADMIN,
        ).length;

        const isLastAdmin = adminCount === 1;
        if (isLastAdmin) {
          throw new Error(
            isCallerCurrentUser
              ? "You cannot leave the organization as the last admin"
              : "You cannot delete the last admin of the organization",
          );
        }
      }

      // 4. EXECUTE REMOVAL
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
