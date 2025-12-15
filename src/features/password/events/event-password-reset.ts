import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { sendEmailPasswordReset } from "../emails/send-email-password-reset";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";

export type PasswordResetRequestedEventData = {
  data: {
    userId: string;
  };
};

export const eventPasswordResetRequested = inngest.createFunction(
  {
    id: "password-reset-requested",
  },
  { event: "app/password.reset-requested" },
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
