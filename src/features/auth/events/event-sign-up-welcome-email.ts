import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { sendEmailSignUpWelcome } from "../emails/send-email-sign-up-welcome";

export type SignUpWelcomeEmailFunctionData = {
  data: {
    userId: string;
  };
};

export const eventSignUpWelcomeEmail = inngest.createFunction(
  {
    id: "sign-up-welcome-email-function",
  },
  { event: "app/auth.sign-up-welcome-email-function" },
  async ({ event, step }) => {
    // delay for 15 minutes
    await step.sleep("delay-15-minutes", "15 minutes");

    await step.run("send-welcome-email", async () => {
      const { userId } = event.data;
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      const { username, email: userEmail } = user;

      const result = await sendEmailSignUpWelcome(username, userEmail);
    
      return { event, body: result };
    });
  },
);
