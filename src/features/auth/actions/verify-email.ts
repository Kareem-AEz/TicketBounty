"use server";

import z from "zod";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import prisma from "@/lib/prisma";
import { getAuth } from "../queries/get-auth";

const verifyEmailSchema = z.object({
  code: z.string().min(8, { message: "Code must be 8 characters" }),
});

export const verifyEmail = async (
  _actionState: ActionState,
  formData: FormData,
) => {
  try {
    const validatedFields = verifyEmailSchema.parse(
      Object.fromEntries(formData),
    );

    const auth = await getAuth();
    if (!auth.user) {
      return toErrorActionState(new Error("Unauthorized"), formData);
    }

    const { email } = auth.user;
    const { code } = validatedFields;

    const emailVerificationToken =
      await prisma.emailVerificationToken.findFirst({
        where: {
          code,
          email,
        },
      });

    if (!emailVerificationToken) {
      return toErrorActionState(new Error("Invalid code"), formData);
    }

    if (emailVerificationToken.expiresAt < new Date()) {
      return toErrorActionState(
        new Error("Verification code has expired, please request a new one"),
        formData,
      );
    }

    await prisma.emailVerificationToken.delete({
      where: { id: emailVerificationToken.id },
    });

    await prisma.user.update({
      where: { id: auth.user.id },
      data: { emailVerified: new Date() },
    });

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Email verified successfully",
      payload: formData,
    });
  } catch (error) {
    console.log("error", JSON.stringify(error, null, 2));
    return toErrorActionState(error, formData);
  }
};
