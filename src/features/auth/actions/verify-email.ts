"use server";

import { cookies } from "next/headers";
import { z } from "zod/v4";
import {
  ActionState,
  toErrorActionState,
  toSuccessActionState,
} from "@/components/form/utils/to-action-state";
import { lucia } from "@/lib/lucia";
import PostHogClient from "@/lib/posthog";
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

    const session = await lucia.createSession(auth.user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    const posthog = PostHogClient();
    posthog.capture({
      distinctId: auth.user.id,
      event: "user_email_verified",
      properties: {
        email: auth.user.email,
      },
    });
    await posthog.shutdown();

    return toSuccessActionState({
      status: "SUCCESS",
      message: "Email verified successfully",
      payload: formData,
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }
};
