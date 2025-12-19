import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { sendEmailPasswordReset } from "../emails/send-email-password-reset";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";

export type PasswordResetEventData = {
  data: {
    userId: string;
  };
};

export const eventPasswordReset = inngest.createFunction(
  {
    id: "password-reset",
  },
  { event: "app/password.password-reset-function" },
  async ({ event, step }) => {
    const { userId } = event.data;

    const user = await step.run("get-user", async () => {
      return await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
    });

    const { id, username, email: userEmail } = user;

    const passwordResetLink = await step.run(
      "generate-password-reset-link",
      async () => await generatePasswordResetLink(id),
    );

    const result = await step.run("send-email-password-reset", async () => {
      return await sendEmailPasswordReset(
        username,
        userEmail,
        passwordResetLink,
      );
    });

    return { event, data: result };
  },
);
