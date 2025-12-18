import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { getBaseUrl } from "@/lib/url";

const EXPIRY_TIME_MINUTES = 10;

const PasswordResetEmail = ({
  toName,
  url,
}: {
  toName: string;
  url: string;
}) => {
  const currentYear = new Date().getFullYear();

  // Color palette from design system (matching welcome email)
  const colors = {
    primary: "#efb100", // oklch(0.795 0.184 86.047)
    primaryForeground: "#1f1f1f", // oklch(0.421 0.095 57.708) - darker text on primary
    foreground: "#232324", // oklch(0.141 0.005 285.823) - dark text
    mutedForeground: "#8B8B8B", // oklch(0.552 0.016 285.938) - medium gray
    border: "#EBEBEB", // oklch(0.92 0.004 286.32) - light gray
    mutedForegroundLight: "#B1B1B1", // oklch(0.705 0.015 286.067) - medium-light gray
    muted: "#F5F5F5", // oklch(0.967 0.001 286.375) - very light gray
    warning: "#F3E5AB", // light yellow background for notice
  };

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Reset your TicketBounty password</Preview>
      <Tailwind>
        <Body
          className="py-[60px] font-sans"
          style={{ backgroundColor: colors.muted }}
        >
          <Container
            className="mx-auto max-w-[500px] p-[48px]"
            style={{ backgroundColor: "#ffffff" }}
          >
            {/* Logo Header - Minimal */}
            <Section className="mb-[60px] text-center">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/47a0c187-5197-4b08-834c-72207788f259/primary/7ad77690-0943-457e-a602-08cd51e8cafa.x-icon"
                alt="TicketBounty"
                width="48"
                className="mx-auto"
              />
            </Section>

            {/* Main Heading - Large, Elegant */}
            <Section className="mb-[40px] text-center">
              <Heading
                className="m-0 text-[36px] leading-[44px] font-light"
                style={{
                  color: colors.foreground,
                  letterSpacing: "-0.5px",
                }}
              >
                Restore Your Access
              </Heading>
            </Section>

            {/* Intro Paragraph - Clean */}
            <Section className="mb-[48px] text-center">
              <Text
                className="m-0 text-[16px] leading-[26px] font-normal"
                style={{ color: colors.mutedForeground }}
              >
                Hi {toName},
              </Text>
              <Text
                className="m-0 mt-[16px] text-[16px] leading-[26px] font-normal"
                style={{ color: colors.mutedForeground }}
              >
                The digital bridges to your account have been temporarily
                paused. Click below to weaving your way back into the
                TicketBounty universe.
              </Text>
            </Section>

            {/* Security Notice - Minimal */}
            <Section
              className="mb-[40px] p-[20px]"
              style={{
                backgroundColor: colors.muted,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
              }}
            >
              <Text
                className="m-0 text-[14px] leading-[22px] font-normal"
                style={{ color: colors.foreground }}
              >
                This restoration link will vanish in{" "}
                <strong>{EXPIRY_TIME_MINUTES} minutes</strong>. If you
                didn&apos;t request this, you can safely disregard this message.
                Your account remains securely locked.
              </Text>
            </Section>

            {/* Primary CTA - Apple Style */}
            <Section className="mb-[48px] text-center">
              <Button
                href={url}
                className="inline-block rounded-lg px-[48px] py-[14px] text-[16px] font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.primaryForeground,
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Reset Password
              </Button>
            </Section>

            {/* Spacer */}
            <Section className="mb-[48px]">
              <div
                style={{
                  height: "1px",
                  backgroundColor: colors.border,
                }}
              />
            </Section>

            {/* Alternative Link - Minimal */}
            <Section className="mb-[48px] text-center">
              <Text
                className="m-0 mb-[12px] text-[13px] font-normal"
                style={{ color: colors.mutedForeground }}
              >
                Or copy and paste this link:
              </Text>
              <Link
                href={url}
                style={{
                  color: colors.primary,
                  textDecoration: "none",
                  fontSize: "12px",
                  fontWeight: "400",
                  wordBreak: "break-all",
                }}
              >
                {url}
              </Link>
            </Section>

            {/* Footer - Clean & Minimal */}
            <Section className="text-center">
              <Text
                className="m-0 mb-[16px] text-[13px] leading-[20px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                Need help? Visit{" "}
                <Link
                  href={getBaseUrl()}
                  style={{
                    color: colors.mutedForeground,
                    textDecoration: "none",
                  }}
                >
                  ticket-bounty-pi.vercel.app
                </Link>{" "}
                or contact support.
              </Text>
              <Text
                className="m-0 text-[12px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                © {currentYear} The Road to Next. Built with clarity by Kareem
                Ahmed.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  toName: "John Doe",
  url: "http://localhost:3000/password-reset/1234567890",
};

export default PasswordResetEmail;
