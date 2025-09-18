"use server";

import argon2 from "@node-rs/argon2";
import z from "zod";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { prisma } from "@/lib/prisma";

const updateUsernameSchema = z.object({
  id: z.string(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must be less than 20 characters" }),
  confirmPassword: z.string().min(1, { message: "Password is required" }),
});

export const updateUsername = async (
  _actionState: ActionState | undefined,
  formData: FormData,
) => {
  try {
    const { id, username, confirmPassword } = updateUsernameSchema.parse(
      Object.fromEntries(formData),
    );

    const authUser = await getAuthOrRedirect();

    if (authUser.id !== id) {
      return toErrorActionState(
        "You are not the owner of this account",
        formData,
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return toErrorActionState("User not found", formData);
    }

    const passwordHash = await argon2.verify(
      user.passwordHash,
      confirmPassword,
    );

    if (!passwordHash) {
      return toErrorActionState("Invalid password", formData);
    }

    await prisma.user.update({
      where: { id },
      data: { username },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Username updated successfully",
      payload: formData,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return toErrorActionState(error, formData);
    }

    return toErrorActionState("Failed to update username", formData);
  }
};
