import {
  Body,
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
import { AdminDigestReadyEventData } from "@/features/admin/events/event-prepare-digest";
import { getBaseUrl } from "@/lib/url";

const getColors = () => ({
  primary: "#efb100", // oklch(0.795 0.184 86.047)
  primaryForeground: "#1f1f1f", // oklch(0.421 0.095 57.708) - darker text on primary
  foreground: "#232324", // oklch(0.141 0.005 285.823) - dark text
  mutedForeground: "#8B8B8B", // oklch(0.552 0.016 285.938) - medium gray
  border: "#EBEBEB", // oklch(0.92 0.004 286.32) - light gray
  mutedForegroundLight: "#B1B1B1", // oklch(0.705 0.015 286.067) - medium-light gray
  muted: "#F5F5F5", // oklch(0.967 0.001 286.375) - very light gray
  statsBackground: "#FAFAFA", // subtle background for stats
});

type ColorScheme = ReturnType<typeof getColors>;

const StatCard = ({
  label,
  total,
  change,
  colors,
}: {
  label: string;
  total: number;
  change: number;
  colors: ColorScheme;
}) => (
  <Section
    className="mb-[16px] p-[20px]"
    style={{ backgroundColor: colors.statsBackground, borderRadius: "8px" }}
  >
    <Text
      className="m-0 mb-[8px] text-[13px] font-semibold"
      style={{
        color: colors.mutedForeground,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </Text>
    <Text
      className="m-0 mb-[4px] text-[32px] font-light"
      style={{ color: colors.foreground, lineHeight: "1" }}
    >
      {total.toLocaleString()}
    </Text>
    <Text className="m-0 text-[13px]" style={{ color: colors.mutedForeground }}>
      {change > 0 ? "+" : ""}
      {change} since yesterday
    </Text>
  </Section>
);

const AdminDigestEmail = ({
  totalTickets,
  totalUsers,
  totalComments,
}: AdminDigestReadyEventData["data"]) => {
  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${getBaseUrl()}/tickets`;
  const colors = getColors();

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>TicketBounty Daily Admin Digest</Preview>
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
                Daily Digest
              </Heading>
            </Section>

            {/* Intro Paragraph - Clean */}
            <Section className="mb-[48px] text-center">
              <Text
                className="m-0 text-[16px] leading-[26px] font-normal"
                style={{ color: colors.mutedForeground }}
              >
                Here&apos;s what&apos;s happening on TicketBounty today.
              </Text>
            </Section>

            {/* Stats Section */}
            <Section className="mb-[48px]">
              <StatCard
                label="Total Tickets"
                total={totalTickets.total}
                change={totalTickets.totalSince}
                colors={colors}
              />
              <StatCard
                label="Total Users"
                total={totalUsers.total}
                change={totalUsers.totalSince}
                colors={colors}
              />
              <StatCard
                label="Total Comments"
                total={totalComments.total}
                change={totalComments.totalSince}
                colors={colors}
              />
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

            {/* CTA - View Dashboard */}
            <Section className="mb-[48px] text-center">
              <Link
                href={dashboardUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: colors.primary,
                  color: colors.primaryForeground,
                  textDecoration: "none",
                  borderRadius: "8px",
                  padding: "14px 48px",
                  fontSize: "16px",
                  fontWeight: "600",
                  border: "none",
                }}
              >
                View Dashboard
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

AdminDigestEmail.PreviewProps = {
  totalTickets: { total: 156, totalSince: 12 },
  totalUsers: { total: 48, totalSince: 3 },
  totalComments: { total: 342, totalSince: 28 },
};

export default AdminDigestEmail;
