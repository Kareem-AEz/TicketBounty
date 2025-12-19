import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { sendEmailVerification } from "../emails/verification-email.email";
import { generateEmailVerificationCode } from "../utils/generate-email-verification-code";

export type EmailConfirmationEventData = {
  data: {
    userId: string;
  };
};

export const eventEmailConfirmation = inngest.createFunction(
  {
    id: "send-email-verification-code",
  },
  { event: "app/auth.send-email-verification-code-function" },
  async ({ event, step }) => {
    const { userId } = event.data;
    const user = await step.run("get-user", async () => {
      return await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    });

    const { email, username } = user;

    const code = await step.run("generate-code", async () => {
      return await generateEmailVerificationCode(userId, email);
    });

    const result = await step.run("send-email-verification-code", async () => {
      return await sendEmailVerification(username, email, code);
    });

    return { event, data: result };
  },
);
