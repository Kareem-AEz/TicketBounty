"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import prisma from "@/lib/prisma";
import { organizationsPath } from "@/paths";
import { getOrganizationsByUserId } from "../queries/get-organizations-by-user-id";

export const switchOrganization = async (organizationId: string) => {
  const { user } = await getAuth();
  if (!user) return toErrorActionState(new Error("Unauthorized"));

  try {
    const userOrganizations = await getOrganizationsByUserId();
    const userOrganization = userOrganizations.find(
      (organization) => organization.id === organizationId,
    );
    if (!userOrganization)
      return toErrorActionState(new Error("Organization not found"));

    await prisma.$transaction([
      prisma.membership.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isActive: false,
        },
      }),

      prisma.membership.update({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
        data: {
          isActive: true,
        },
      }),
    ]);

    revalidatePath(organizationsPath());

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization switched",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
