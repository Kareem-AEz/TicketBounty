"use server";

import argon2 from "@node-rs/argon2";
import { z } from "zod/v4";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import prisma from "@/lib/prisma";

const updatePasswordSchema = z
  .object({
    id: z.string(),
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export const updatePassword = async (
  _actionState: ActionState | undefined,
  formData: FormData,
) => {
  try {
    const { id, password, currentPassword } = updatePasswordSchema.parse(
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

    if (!user) return toErrorActionState("User not found", formData);

    const passwordHash = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!passwordHash)
      return toErrorActionState("Invalid current password", formData);

    const newPasswordHash = await argon2.hash(password);

    await prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Password updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return toErrorActionState(error, formData);
    }

    return toErrorActionState("Failed to update password", formData);
  }
};
