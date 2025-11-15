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

const WelcomeEmail = ({ toName }: { toName: string }) => {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${getBaseUrl()}/tickets`;

  // Color palette from design system (converted to hex for email client support)
  const colors = {
    primary: "#efb100", // oklch(0.795 0.184 86.047)
    primaryForeground: "#1f1f1f", // oklch(0.421 0.095 57.708) - darker text on primary
    foreground: "#232324", // oklch(0.141 0.005 285.823) - dark text
    mutedForeground: "#8B8B8B", // oklch(0.552 0.016 285.938) - medium gray
    border: "#EBEBEB", // oklch(0.92 0.004 286.32) - light gray
    mutedForegroundLight: "#B1B1B1", // oklch(0.705 0.015 286.067) - medium-light gray
    muted: "#F5F5F5", // oklch(0.967 0.001 286.375) - very light gray
  };

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to TicketBounty</Preview>
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
                Welcome to TicketBounty
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
                Your account is ready. Start managing your tickets with clarity
                and ease.
              </Text>
            </Section>

            {/* Primary CTA - Apple Style */}
            <Section className="mb-[48px] text-center">
              <Button
                href={dashboardUrl}
                className="inline-block rounded-lg px-[48px] py-[14px] text-[16px] font-semibold"
                style={{
                  backgroundColor: colors.primary,
                  color: colors.primaryForeground,
                  textDecoration: "none",
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Open Dashboard
              </Button>
            </Section>

            {/* Spacer */}
            <Section className="mb-[56px]">
              <div
                style={{
                  height: "1px",
                  backgroundColor: colors.border,
                }}
              />
            </Section>

            {/* Features Grid - Minimal & Elegant */}
            <Section className="mb-[48px]">
              <Heading
                className="m-0 mb-[28px] text-center text-[14px] font-semibold"
                style={{
                  color: colors.foreground,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                What You Can Do
              </Heading>

              {/* Feature 1 */}
              <Section className="mb-[24px]">
                <Text
                  className="m-0 mb-[8px] text-[15px] font-semibold"
                  style={{ color: colors.foreground }}
                >
                  Organize with precision
                </Text>
                <Text
                  className="m-0 text-[14px] leading-[22px]"
                  style={{ color: colors.mutedForeground }}
                >
                  Track tickets, manage workflows, and keep everything in focus.
                </Text>
              </Section>

              {/* Feature 2 */}
              <Section className="mb-[24px]">
                <Text
                  className="m-0 mb-[8px] text-[15px] font-semibold"
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

              {/* Feature 3 */}
              <Section>
                <Text
                  className="m-0 mb-[8px] text-[15px] font-semibold"
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

            {/* Spacer */}
            <Section className="mb-[48px]">
              <div
                style={{
                  height: "1px",
                  backgroundColor: colors.border,
                }}
              />
            </Section>

            {/* Get Started Section - Minimal */}
            <Section className="mb-[56px] text-center">
              <Text
                className="m-0 mb-[20px] text-[14px] leading-[22px]"
                style={{ color: colors.mutedForeground }}
              >
                Start by completing your profile, then create your first ticket.
              </Text>
              <Link
                href={dashboardUrl}
                style={{
                  color: colors.primary,
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Get started →
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

WelcomeEmail.PreviewProps = {
  toName: "John Doe",
};

export default WelcomeEmail;
