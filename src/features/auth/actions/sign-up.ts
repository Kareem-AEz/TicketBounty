"use server";

import argon2 from "@node-rs/argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import {
  ActionState,
  toErrorActionState,
} from "@/components/form/utils/to-action-state";
import { Prisma } from "@/generated/client";
import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { identifyUser } from "@/lib/umami";
import { ticketsPath } from "@/paths";

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(20, { message: "Username must be less than 20 characters" })
      .refine((val) => !val.includes(" "), {
        message: "Username cannot contain spaces",
      }),
    email: z.email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine((val) => !val.includes(" "), {
        message: "Password cannot contain spaces",
      }),
    passwordConfirmation: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .superRefine(({ password, passwordConfirmation }, ctx) => {
    if (password !== passwordConfirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["passwordConfirmation"],
      });
    }
  });

export const signUp = async (_actionState: ActionState, formData: FormData) => {
  try {
    const validatedFields = signUpSchema.parse(Object.fromEntries(formData));

    const { username, email, password } = validatedFields;

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });

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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return toErrorActionState(
          new Error("Username or email already exists"),
          formData,
        );
      }
    }
    return toErrorActionState(error, formData);
  }

  redirect(ticketsPath());
};
