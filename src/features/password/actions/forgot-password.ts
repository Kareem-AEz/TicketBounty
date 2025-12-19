"use server";

import z from "zod";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";

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
    const userFound = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true, email: true },
    });

    if (!userFound) {
      return toSuccessActionState({
        status: "SUCCESS",
        message:
          "If an account with this email exists, you will receive a password reset email.",
      });
    }

    const { id } = userFound;

    await inngest.send({
      name: "app/password.password-reset-function",
      data: {
        userId: id,
      },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message:
        "If an account with this email exists, you will receive a password reset email.",
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
};
