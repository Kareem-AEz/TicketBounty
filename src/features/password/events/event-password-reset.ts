import { eventType } from "inngest";
import { z } from "zod/v4";
import { inngest } from "@/lib/inngest";
import prisma from "@/lib/prisma";
import { sendEmailPasswordReset } from "../emails/send-email-password-reset";
import { generatePasswordResetLink } from "../utils/generate-password-reset-link";

export const passwordResetEvent = eventType(
  "app/password.password-reset-function",
  {
    schema: z.object({ userId: z.string() }),
  },
);

export const eventPasswordReset = inngest.createFunction(
  {
    id: "password-reset",
    triggers: [{ event: passwordResetEvent.name }],
  },
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
