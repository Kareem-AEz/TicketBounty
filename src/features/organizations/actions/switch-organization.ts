"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import prisma from "@/lib/prisma";
import { organizationsPath } from "@/paths";

export const switchOrganization = async (organizationId: string) => {
  const { user } = await getAuth();
  if (!user) return toErrorActionState(new Error("Unauthorized"));

  try {
    // Use transaction callback to ensure atomic operations and prevent race conditions
    await prisma.$transaction(async (tx) => {
      // Verify membership exists INSIDE transaction (acquires row lock)
      const membership = await tx.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
        select: { userId: true },
      });

      if (!membership) {
        throw new Error("Organization not found");
      }

      // Deactivate all currently active memberships for this user
      await tx.membership.updateMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Activate the target organization
      await tx.membership.update({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
        data: {
          isActive: true,
        },
      });
    });

    revalidatePath(organizationsPath());

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization switched",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
