"use server";

import z from "zod";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";

const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});

export const forgotPassword = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const validatedFields = forgotPasswordSchema.parse(
      Object.fromEntries(formData),
    );

    const { email } = validatedFields;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    const userId = user?.id;

    if (!userId) {
      return toSuccessActionState({
        status: "SUCCESS",
        message:
          "If an account with this email exists, you will receive a password reset email.",
      });
    }

    const passwordResetLink = await generatePasswordResetLink(userId);
    console.log("Password reset link:", passwordResetLink);

    // TODO: Send password reset email

    return toSuccessActionState({
      status: "SUCCESS",
      message:
        "If an account with this email exists, you will receive a password reset email.",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
};
