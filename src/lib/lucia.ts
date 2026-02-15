import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import prisma from "@/lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  getUserAttributes: (attributes) => ({
    username: attributes.username,
    email: attributes.email,
  }),

  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Required for proper cookie handling in production
    },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  email: string;
}
