import { inngest } from "@/lib/inngest";
import { sendInvitationEmail } from "../emails/invitation-email.send";

export type SendInvitationLinkEventData = {
  data: {
    invitationLink: string;
    organizationName: string;
    inviterName: string;
    toEmail: string;
  };
};

export const eventSendInvitationLink = inngest.createFunction(
  {
    id: "send-invitation-link",
  },
  { event: "app/invitation.send-link" },
  async ({ event, step }) => {
    const { invitationLink, organizationName, inviterName, toEmail } =
      event.data;

    const result = await step.run("send-invitation-email", async () => {
      return await sendInvitationEmail({
        invitationLink,
        organizationName,
        inviterName,
        toEmail,
      });
    });

    return { event, data: result };
  },
);
