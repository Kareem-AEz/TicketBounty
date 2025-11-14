"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { setCookie } from "@/actions/cookies";
import {
  ActionState,
  toErrorActionState,
} from "@/components/form/utils/to-action-state";
import { hashToken } from "@/lib/generate-random-token";
import { hashPassword } from "@/lib/hash-and-verify";
import { prisma } from "@/lib/prisma";
import { signInPath } from "@/paths";

const resetPasswordSchema = z
  .object({
    password: z.string().min(1, { message: "Password is required" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Confirm password is required" }),
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

export const resetPassword = async (
  tokenId: string,
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const validatedFields = resetPasswordSchema.parse(
      Object.fromEntries(formData),
    );

    const { password } = validatedFields;

    const tokenHash = hashToken(tokenId);

    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !passwordResetToken ||
      Date.now() > passwordResetToken.expiresAt.getTime()
    ) {
      return toErrorActionState(
        new Error("Password reset link is invalid or expired"),
        formData,
      );
    }

    await prisma.passwordResetToken.delete({
      where: { tokenHash },
    });

    await prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: { passwordHash: await hashPassword(password) },
    });

    await setCookie("toast", "Password reset successfully");
  } catch (error) {
    return toErrorActionState(error, formData);
  }
  redirect(signInPath());
};
