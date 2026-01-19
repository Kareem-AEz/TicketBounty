"use server";

import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import prisma from "@/lib/prisma";
import { getMembershipsByOrganizationId } from "../queries/get-memberships-by-organization-id";

export async function deleteOrganizationMember(
  organizationId: string,
  memberId: string,
  isCurrentUser: boolean,
) {
  try {
    await getAuthOrRedirect();

    await prisma.$transaction(async (tx) => {
      const memberships = await getMembershipsByOrganizationId(
        organizationId,
        tx,
      );

      const isLastMember = (memberships ?? []).length === 1;
      if (isLastMember)
        throw new Error(
          isCurrentUser
            ? "You cannot leave the organization as the last member"
            : "You cannot delete the last member of the organization",
        );

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
      message: isCurrentUser ? "You left the organization" : "Member deleted",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
}
