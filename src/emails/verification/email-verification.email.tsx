import {
  Body,
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
 * EMAIL VERIFICATION TEMPLATE
 * An elegant verification email with a high-contrast code box.
 * Designed for clarity and security.
 */
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
      <Preview>Verify your TicketBounty account</Preview>
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
                Verify Your Journey
              </Heading>

              {/* Intro Narrative */}
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
                  We&apos;re brewing something magical for you. Enter this code
                  to unlock your TicketBounty dashboard and start weaving your
                  projects into reality.
                </Text>
              </Section>

              {/* Verification Code Box */}
              <Section className="mb-[40px] text-center">
                <div
                  className="border border-solid px-[16px] py-[32px]"
                  style={{
                    backgroundColor: colors.muted,
                    borderColor: colors.border,
                    borderRadius: "12px",
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
                  className="m-0 mb-[16px] text-[14px] font-bold tracking-[0.5px] uppercase"
                  style={{ color: colors.foreground }}
                >
                  Next Steps
                </Text>
                <Section>
                  <Text
                    className="m-0 mb-[8px] text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    • Return to your verification page
                  </Text>
                  <Text
                    className="m-0 mb-[8px] text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    • Enter the 8-character code shown above
                  </Text>
                  <Text
                    className="m-0 text-[14px] leading-[22px]"
                    style={{ color: colors.mutedForeground }}
                  >
                    • Click &quot;Verify Email&quot; to begin
                  </Text>
                </Section>
              </Section>

              <Hr style={{ borderColor: colors.border }} />
            </Section>

            {/* Footer */}
            <Section className="bg-[#fcfcfc] p-[48px] py-[32px] text-center">
              <Text
                className="m-0 mb-[16px] text-[12px] leading-[18px]"
                style={{ color: colors.mutedForegroundLight }}
              >
                If you didn&apos;t request this, you can safely disregard this
                email. The digital wilderness can be mysterious sometimes.
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

EmailVerification.PreviewProps = {
  userName: "Adventurer",
  verificationCode: "BOUNTYXX",
};

export default EmailVerification;
