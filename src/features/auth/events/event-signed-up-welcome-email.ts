import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { sendEmailSignUpWelcome } from "../emails/send-email-sign-up-welcome";

export type SignedUpWelcomeEmailEventData = {
  data: {
    userId: string;
  };
};

export const eventSignedUpWelcomeEmail = inngest.createFunction(
  {
    id: "user-signed-up-welcome-email",
  },
  { event: "app/auth.signed-up-welcome-email-function" },
  async ({ event, step }) => {
    // delay for 15 minutes
    await step.sleep("delay-15-minutes", "15 minutes");

    const { userId } = event.data;

    const user = await step.run(
      "get-user",
      async () =>
        await prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    );

    const { username, email: userEmail, emailVerified } = user;

    const result = await step.run("send-welcome-email", async () => {
      return await sendEmailSignUpWelcome(username, userEmail, emailVerified);
    });

    return { event, data: result };
  },
);
