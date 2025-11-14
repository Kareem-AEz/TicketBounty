import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendEmailPasswordReset } from "../emails/send-email-password-reset";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";

export type PasswordResetFunctionData = {
  data: {
    userId: string;
  };
};

export const eventPasswordReset = inngest.createFunction(
  {
    id: "password-reset-function",
  },
  { event: "app/password.password-reset-function" },
  async ({ event }) => {
    const { userId } = event.data;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const { id, username, email: userEmail } = user;

    const passwordResetLink = await generatePasswordResetLink(id);

    const result = await sendEmailPasswordReset(
      username,
      userEmail,
      passwordResetLink,
    );

    return { event, body: result };
  },
);
