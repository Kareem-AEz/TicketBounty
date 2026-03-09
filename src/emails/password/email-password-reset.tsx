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

const EXPIRY_TIME_MINUTES = 10;

/**
 * PASSWORD RESET EMAIL TEMPLATE
 * An elegant template for account restoration.
 * Features a highlighted security notice and a clear restoration CTA.
 */
const PasswordResetEmail = ({
  toName,
  url,
}: {
  toName: string;
  url: string;
}) => {
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
      <Preview>Reset your TicketBounty password</Preview>
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
                Restore Your Access
              </Heading>

              {/* Intro Narrative */}
              <Section className="mb-[32px] text-center">
                <Text
                  className="m-0 text-[16px] leading-[26px]"
                  style={{ color: colors.mutedForeground }}
                >
                  Hi {toName},
                </Text>
                <Text
                  className="m-0 mt-[16px] text-[16px] leading-[26px]"
                  style={{ color: colors.mutedForeground }}
                >
                  The digital bridges to your account have been temporarily
                  paused. Click below to weaving your way back into the
                  TicketBounty universe.
                </Text>
              </Section>

              {/* Security Notice */}
              <Section
                className="mb-[40px] p-[24px]"
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

              {/* Primary CTA */}
              <Section className="mb-[48px] text-center">
                <Button
                  href={url}
                  className="inline-block bg-[#efb100] px-[48px] py-[16px] text-center text-[16px] font-bold text-[#1f1f1f]"
                  style={{ textDecoration: "none", borderRadius: "8px" }}
                >
                  Reset Password
                </Button>
                <Text
                  className="m-0 mt-[16px] text-[13px] leading-[20px]"
                  style={{ color: colors.mutedForegroundLight }}
                >
                  Or copy and paste this link into your browser:
                  <br />
                  <Link
                    href={url}
                    style={{
                      color: colors.primary,
                      textDecoration: "underline",
                      wordBreak: "break-all",
                    }}
                  >
                    {url}
                  </Link>
                </Text>
              </Section>

              <Hr style={{ borderColor: colors.border }} className="mb-[32px]" />

              {/* Footer */}
              <Section className="bg-[#fcfcfc] p-[48px] py-[32px] text-center">
                <Text
                  className="m-0 mb-[16px] text-[13px] leading-[20px]"
                  style={{ color: colors.mutedForegroundLight }}
                >
                  Need help? Visit our website or contact support. The digital
                  wilderness is better explored together.
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
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  toName: "Explorer",
  url: "http://localhost:3000/password-reset/1234567890",
};

export default PasswordResetEmail;
