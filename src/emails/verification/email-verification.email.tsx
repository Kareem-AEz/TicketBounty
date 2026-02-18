import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { getBaseUrl } from "@/lib/url";

const EmailVerification = ({
  userName,
  verificationCode,
}: {
  userName: string;
  verificationCode: string;
}) => {
  const currentYear = new Date().getFullYear();

  // Color palette from design system
  const colors = {
    primary: "#efb100", // Gold/Yellow from WelcomeEmail
    primaryForeground: "#1f1f1f",
    foreground: "#232324",
    mutedForeground: "#8B8B8B",
    border: "#EBEBEB",
    mutedForegroundLight: "#B1B1B1",
    muted: "#F5F5F5",
  };

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Verify your TicketBounty account</Preview>
      <Tailwind>
        <Body
          className="py-[60px] font-sans"
          style={{ backgroundColor: colors.muted }}
        >
          <Container
            className="mx-auto max-w-[500px] p-[48px]"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Logo Header */}
            <Section className="mb-[60px] text-center">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/47a0c187-5197-4b08-834c-72207788f259/primary/7ad77690-0943-457e-a602-08cd51e8cafa.x-icon"
                alt="TicketBounty"
                width="48"
                className="mx-auto"
              />
            </Section>

            {/* Main Heading */}
            <Section className="mb-[40px] text-center">
              <Heading
                className="m-0 text-[32px] leading-[40px] font-light"
                style={{
                  color: colors.foreground,
                  letterSpacing: "-0.5px",
                }}
              >
                Verify Your Journey
              </Heading>
            </Section>

            {/* Intro */}
            <Section className="mb-[32px] text-center">
              <Text
                className="m-0 text-[16px] leading-[26px]"
                style={{ color: colors.mutedForeground }}
              >
                Hi {userName},
              </Text>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px]"
                style={{ color: colors.mutedForeground }}
              >
                We&apos;re brewing something magical for you. Enter this code to
                unlock your TicketBounty dashboard and start weaving your
                projects into reality. TEST Test Test
              </Text>
            </Section>

            {/* Verification Code Box */}
            <Section className="mb-[40px] text-center">
              <div
                className="rounded-[12px] border border-solid px-[16px] py-[32px]"
                style={{
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="m-0 text-[36px] font-bold tracking-[10px]"
                  style={{ color: colors.foreground }}
                >
                  {verificationCode}
                </Text>
              </div>
              <Text
                className="m-0 mt-[16px] text-[13px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                This code will vanish in 10 minutes.
              </Text>
            </Section>

            {/* Next Steps */}
            <Section className="mb-[48px]">
              <Text
                className="m-0 mb-[16px] text-[14px] font-semibold tracking-[0.5px] uppercase"
                style={{ color: colors.foreground }}
              >
                Next Steps
              </Text>
              <div className="space-y-[12px]">
                <Text
                  className="m-0 text-[14px] leading-[22px]"
                  style={{ color: colors.mutedForeground }}
                >
                  • Return to your verification page
                </Text>
                <Text
                  className="m-0 text-[14px] leading-[22px]"
                  style={{ color: colors.mutedForeground }}
                >
                  • Enter the 8-digit code shown above
                </Text>
                <Text
                  className="m-0 text-[14px] leading-[22px]"
                  style={{ color: colors.mutedForeground }}
                >
                  • Click &quot;Verify Email&quot; to begin
                </Text>
              </div>
            </Section>

            <Hr style={{ borderColor: colors.border }} className="mb-[48px]" />

            {/* Footer */}
            <Section className="text-center">
              <Text
                className="m-0 mb-[16px] text-[13px] leading-[20px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                If you didn&apos;t request this, you can safely disregard this
                email. The digital wilderness can be mysterious sometimes.
              </Text>
              <Text
                className="m-0 text-[12px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                © {currentYear} Ticket Bounty.
                <br />
                Built with clarity by Kareem Ahmed.
              </Text>
              <Section className="mt-[16px]">
                <Link
                  href={getBaseUrl()}
                  style={{
                    color: colors.mutedForeground,
                    textDecoration: "none",
                    fontSize: "12px",
                  }}
                >
                  ticket-bounty-pi.vercel.app
                </Link>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmailVerification.PreviewProps = {
  userName: "Adventurer",
  verificationCode: "847392",
};

export default EmailVerification;
