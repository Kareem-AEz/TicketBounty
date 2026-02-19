"use server";

import { revalidatePath } from "next/cache";
import {
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { isUserAdmin } from "@/features/memberships/utils/is-user-admin";
import prisma from "@/lib/prisma";
import { organizationsPath } from "@/paths";
import { updateOrganizationSchema } from "../validations/update-organization.schema";

export const updateOrganization = async (
  organizationId: string,
  formData: FormData,
) => {
  try {
    const isAdmin = await isUserAdmin({ organizationId });
    if (!isAdmin) throw new Error("You are not an admin of this organization");

    const validatedFields = updateOrganizationSchema.parse(
      Object.fromEntries(formData),
    );
    const { name } = validatedFields;
    await prisma.organization.update({
      where: { id: organizationId },
      data: { name },
    });
    revalidatePath(organizationsPath());
    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization edited",
    });
  } catch (error) {
    return toErrorActionState(error);
  }
};
