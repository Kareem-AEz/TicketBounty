"use server";

import { z } from "zod/v4";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuth } from "@/features/auth/queries/get-auth";
import prisma from "@/lib/prisma";

const createOrganizationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export const createOrganization = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const validatedFields = createOrganizationSchema.parse(
      Object.fromEntries(formData),
    );

    const { name } = validatedFields;
    const { user } = await getAuth();
    if (!user) return toErrorActionState(new Error("Unauthorized"), formData);

    await prisma.organization.create({
      data: {
        name,
        memberships: {
          create: {
            userId: user.id,
            isActive: false,
            membershipRole: "ADMIN",
          },
        },
      },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Organization created",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
};
