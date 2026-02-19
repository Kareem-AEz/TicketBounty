"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import { Membership } from "@/generated/client";
import { MembershipRole } from "@/generated/enums";
import prisma from "@/lib/prisma";
import { organizationPath } from "@/paths";
import { getMembership } from "../queries/get-membership";

export const updateMembership = async (
  organizationId: string,
  memberId: string,
  data: Partial<Membership>,
) => {
  try {
    const { user } = await getAuth();
    if (!user) return toErrorActionState(new Error("Unauthorized"));
    const userId = user.id;

    await prisma.$transaction(async (tx) => {
      const isRoleChange =
        !!data?.membershipRole && data.membershipRole !== MembershipRole.ADMIN;

      const [userMembership, otherAdminCount] = await Promise.all([
        getMembership(organizationId, userId, { tx }),
        isRoleChange
          ? tx.membership.count({
              where: {
                organizationId,
                membershipRole: MembershipRole.ADMIN,
                userId: { not: memberId },
              },
            })
          : Promise.resolve(null),
      ]);

      if (!userMembership)
        throw new Error("You are not a member of this organization");
      if (
        data?.membershipRole &&
        userMembership.membershipRole !== MembershipRole.ADMIN
      )
        throw new Error("You are not an admin of this organization");

      if (isRoleChange && otherAdminCount === 0)
        throw new Error("You cannot update the role of the last admin");

      await tx.membership.update({
        where: {
          userId_organizationId: { userId: memberId, organizationId },
        },
        data: {
          ...(data ?? {}),
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
