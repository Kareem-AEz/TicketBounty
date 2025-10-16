"use server";

import argon2 from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import {
  ActionState,
  toErrorActionState,
} from "@/components/form/utils/to-action-state";
import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { identifyUser } from "@/lib/umami";
import { ticketsPath } from "@/paths";

const signInSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const signIn = async (_actionState: ActionState, formData: FormData) => {
  try {
    const validatedFields = signInSchema.parse(Object.fromEntries(formData));

    const { email, password } = validatedFields;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user)
      return toErrorActionState(
        new Error("Invalid email or password"),
        formData,
      );

    const passwordHash = await argon2.verify(user.passwordHash, password);

    if (!passwordHash)
      return toErrorActionState(
        new Error("Invalid email or password"),
        formData,
      );

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    // Identify the user
    identifyUser(user.id, {
      username: user.username,
      session_start: new Date().toISOString(),
    });
  } catch (error) {
    return toErrorActionState(error, formData);
  }

  redirect(ticketsPath());
};
