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

export const updateMembershipRole = async (
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
