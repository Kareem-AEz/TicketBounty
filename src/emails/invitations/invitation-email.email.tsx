import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  pixelBasedPreset,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { getBaseUrl } from "@/lib/url";

interface InvitationEmailProps {
  organizationName: string;
  inviterName: string;
  invitationLink: string;
}

/**
 * THE INVITATION EMAIL
 * A clean, elegant template for inviting users to join an organization.
 * Designed for clarity and high conversion, compatible with all major email clients.
 */
const InvitationEmail = ({
  organizationName,
  inviterName,
  invitationLink,
}: InvitationEmailProps) => {
  const currentYear = new Date().getFullYear();

  // Color palette from design system
  const colors = {
    primary: "#efb100", // TicketBounty Gold
    primaryForeground: "#1f1f1f",
    foreground: "#232324",
    mutedForeground: "#4b5563", // gray-600
    mutedForegroundLight: "#8B8B8B",
    border: "#EBEBEB",
    muted: "#F5F5F5",
  };

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Join {organizationName} on TicketBounty</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body
          className="py-[60px] font-sans"
          style={{ backgroundColor: colors.muted }}
        >
          <Container
            className="mx-auto max-w-[560px] border border-solid border-[#eeeeee]"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Logo Header */}
            <Section className="bg-[#1f1f1f] py-[32px] text-center">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/47a0c187-5197-4b08-834c-72207788f259/primary/7ad77690-0943-457e-a602-08cd51e8cafa.x-icon"
                alt="TicketBounty"
                width="40"
                className="mx-auto"
              />
            </Section>

            <Section className="p-[48px] pt-[40px]">
              {/* Main Heading */}
              <Heading
                className="m-0 mb-[24px] text-center text-[28px] leading-[36px] font-semibold"
                style={{
                  color: colors.foreground,
                  letterSpacing: "-0.5px",
                }}
              >
                You&apos;re Invited
              </Heading>

              {/* Intro Narrative */}
              <Text
                className="m-0 mb-[16px] text-[16px] leading-[26px]"
                style={{ color: colors.mutedForeground }}
              >
                <strong>{inviterName}</strong> has invited you to join{" "}
                <strong>{organizationName}</strong> on TicketBounty.
              </Text>

              <Text
                className="m-0 mb-[32px] text-[16px] leading-[26px]"
                style={{ color: colors.mutedForeground }}
              >
                TicketBounty is where teams turn complex challenges into
                achievable milestones. Collaborate, track progress, and build
                something extraordinary together.
              </Text>

              {/* CTA Section */}
              <Section className="mb-[32px] text-center">
                <Button
                  href={invitationLink}
                  className="inline-block bg-[#efb100] px-[32px] py-[16px] text-center text-[16px] font-bold text-[#1f1f1f]"
                  style={{ textDecoration: "none", borderRadius: "8px" }}
                >
                  Join the Organization
                </Button>
                <Text
                  className="m-0 mt-[16px] text-[13px] leading-[20px]"
                  style={{ color: colors.mutedForegroundLight }}
                >
                  Or copy and paste this link into your browser:
                  <br />
                  <Link
                    href={invitationLink}
                    className="text-[12px]"
                    style={{
                      color: colors.primary,
                      textDecoration: "underline",
                      wordBreak: "break-all",
                    }}
                  >
                    {invitationLink}
                  </Link>
                </Text>
              </Section>

              <Hr
                style={{ borderColor: colors.border }}
                className="mb-[32px]"
              />

              {/* Organization Info / What is TicketBounty? */}
              <Section className="mb-[12px]">
                <Text
                  className="m-0 mb-[8px] text-[14px] font-bold tracking-[0.5px] uppercase"
                  style={{ color: colors.foreground }}
                >
                  What is TicketBounty?
                </Text>
                <Text
                  className="m-0 text-[14px] leading-[22px]"
                  style={{ color: colors.mutedForeground }}
                >
                  TicketBounty is a modern bounty-based project management
                  platform that simplifies task allocation and rewards
                  contributions, making teamwork feel like an adventure.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] p-[48px] py-[32px] text-center">
              <Text
                className="m-0 mb-[16px] text-[12px] leading-[18px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                This invitation was sent by <strong>{inviterName}</strong>. If
                you weren&apos;t expecting this, you can safely ignore this
                email.
              </Text>
              <Text
                className="m-0 text-[11px] leading-[16px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                © {currentYear} TicketBounty · <strong>Kareem Ahmed</strong>
                <br />
                <Link
                  href="https://github.com/Kareem-AEz"
                  style={{
                    color: colors.mutedForegroundLight,
                    textDecoration: "underline",
                  }}
                >
                  GitHub
                </Link>{" "}
                ·{" "}
                <Link
                  href="https://x.com/KareemAhmedEz"
                  style={{
                    color: colors.mutedForegroundLight,
                    textDecoration: "underline",
                  }}
                >
                  X (Twitter)
                </Link>{" "}
                ·{" "}
                <Link
                  href={getBaseUrl()}
                  style={{
                    color: colors.mutedForegroundLight,
                    textDecoration: "underline",
                  }}
                >
                  Website
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// Preview data for React Email dev server
InvitationEmail.PreviewProps = {
  organizationName: "The Dream Team",
  inviterName: "Kareem Ahmed",
  invitationLink: "https://ticketbounty.app/invite/example-token",
} as InvitationEmailProps;

export default InvitationEmail;
