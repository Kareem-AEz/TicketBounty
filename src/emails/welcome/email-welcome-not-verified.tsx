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

/**
 * WELCOME (NOT VERIFIED) EMAIL TEMPLATE
 * An elegant welcome email for users who still need to verify their account.
 * Re-emphasizes the value proposition while providing a clear verification CTA.
 */
const WelcomeNotVerifiedEmail = ({ toName }: { toName: string }) => {
  const currentYear = new Date().getFullYear();
  const verificationUrl = `${getBaseUrl()}/email-verification`;

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
      <Preview>Complete your journey to TicketBounty</Preview>
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
                Almost There
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
                  Welcome to TicketBounty! We&apos;re excited to have you join
                  our digital wilderness. You&apos;re just one step away from
                  unlocking your full dashboard and starting your journey.
                </Text>
              </Section>

              {/* Primary CTA */}
              <Section className="mb-[48px] text-center">
                <Button
                  href={verificationUrl}
                  className="inline-block bg-[#efb100] px-[48px] py-[16px] text-center text-[16px] font-bold text-[#1f1f1f]"
                  style={{ textDecoration: "none", borderRadius: "8px" }}
                >
                  Verify Your Account
                </Button>
              </Section>

              <Hr style={{ borderColor: colors.border }} />

              {/* Features Section */}
              <Section className="mb-[48px]">
                <Text
                  className="m-0 mb-[24px] text-center text-[14px] font-bold tracking-[0.5px] uppercase"
                  style={{ color: colors.foreground }}
                >
                  What You&apos;re Missing
                </Text>

                <Section className="mb-[24px]">
                  <Text
                    className="m-0 mb-[8px] text-[15px] font-bold"
                    style={{ color: colors.foreground }}
                  >
                    Organize with precision
                  </Text>
                  <Text
                    className="m-0 text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    Track tickets, manage workflows, and keep everything in
                    focus.
                  </Text>
                </Section>

                <Section className="mb-[24px]">
                  <Text
                    className="m-0 mb-[8px] text-[15px] font-bold"
                    style={{ color: colors.foreground }}
                  >
                    Collaborate effortlessly
                  </Text>
                  <Text
                    className="m-0 text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    Comment, share updates, and keep your team synchronized.
                  </Text>
                </Section>

                <Section>
                  <Text
                    className="m-0 mb-[8px] text-[15px] font-bold"
                    style={{ color: colors.foreground }}
                  >
                    Move faster than ever
                  </Text>
                  <Text
                    className="m-0 text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    Built for speed and simplicity. No clutter, just clarity.
                  </Text>
                </Section>
              </Section>

              <Hr style={{ borderColor: colors.border }} />
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] p-[48px] py-[32px] text-center">
              <Text
                className="m-0 mb-[16px] text-[13px] leading-[20px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                If you haven&apos;t received your verification code yet, you can
                request a new one on the verification page.
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

WelcomeNotVerifiedEmail.PreviewProps = {
  toName: "Explorer",
};

export default WelcomeNotVerifiedEmail;
