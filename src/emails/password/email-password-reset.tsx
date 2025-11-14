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

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        Reset your TicketBounty password - Secure access to your tickets
      </Preview>
      <Tailwind>
        <Body
          className="py-[40px] font-sans"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          <Container
            className="mx-auto max-w-[600px] bg-white p-[48px]"
            style={{ border: "1px solid #e5e7eb" }}
          >
            {/* Logo Header */}
            <Section className="mb-[48px] text-center">
              <Img
                src="https://di867tnz6fwga.cloudfront.net/brand-kits/47a0c187-5197-4b08-834c-72207788f259/primary/7ad77690-0943-457e-a602-08cd51e8cafa.x-icon"
                alt="TicketBounty"
                width="56"
                className="mx-auto mb-[24px]"
              />
              <Heading
                className="m-0 mb-[12px] text-[32px] leading-[38px] font-bold"
                style={{ color: "#020304" }}
              >
                Password Reset Request
              </Heading>
              <Text className="m-0 text-[18px] font-medium text-gray-600">
                Secure your TicketBounty account access
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[40px]">
              <Heading
                className="mb-[20px] text-[20px] leading-[28px] font-semibold"
                style={{ color: "#020304" }}
              >
                Hello {toName},
              </Heading>

              <Text className="mb-[20px] text-[16px] leading-[26px] font-normal text-gray-700">
                We received a request to reset the password for your
                TicketBounty account. To maintain the security of your ticket
                management system, please click the button below to create a new
                password.
              </Text>

              <Text className="mb-[32px] text-[16px] leading-[26px] font-normal text-gray-700">
                This secure reset link will expire in{" "}
                <strong>{EXPIRY_TIME_MINUTES} minutes</strong> to protect your
                account. If you did not request this password reset, please
                disregard this email and your current password will remain
                active.
              </Text>

              {/* Reset Button */}
              <Section className="mb-[32px] text-center">
                <Button
                  href={url}
                  className="inline-block rounded-md px-[40px] py-[16px] text-[16px] font-semibold text-white"
                  style={{
                    backgroundColor: "#059669",
                    textDecoration: "none",
                    border: "none",
                  }}
                >
                  Reset Your Password
                </Button>
              </Section>

              {/* Alternative Link Section */}
              <Section
                className="mb-[32px] p-[20px]"
                style={{
                  backgroundColor: "#f9fafb",
                }}
              >
                <Heading
                  className="m-0 mb-[8px] text-[15px] font-semibold"
                  style={{ color: "#020304" }}
                >
                  Alternative Access
                </Heading>
                <Text className="m-0 mb-[12px] text-[14px] text-gray-600">
                  Copy and paste this secure link into your browser:
                </Text>
                <Text
                  className="m-0 p-[10px] text-[12px]"
                  style={{
                    backgroundColor: "#ffffff",
                    wordWrap: "break-word",
                  }}
                >
                  <Link
                    href={url}
                    style={{ color: "#3B2C17", textDecoration: "underline" }}
                  >
                    {url}
                  </Link>
                </Text>
              </Section>

              {/* Security Notice */}
              <Section
                className="mb-[24px] pl-[20px]"
                style={{ borderLeft: "4px solid #3B2C17" }}
              >
                <Heading
                  className="m-0 mb-[8px] text-[16px] font-semibold"
                  style={{ color: "#020304" }}
                >
                  Security Notice
                </Heading>
                <Text className="m-0 text-[14px] leading-[22px] text-gray-700">
                  This password reset link expires in{" "}
                  <strong>{EXPIRY_TIME_MINUTES} minutes</strong>. After
                  successful reset, you&apos;ll have full access to your
                  TicketBounty dashboard and all ticket management features.
                </Text>
              </Section>

              <Text className="m-0 text-[14px] leading-[22px] text-gray-600">
                Need assistance? Visit our platform at{" "}
                <Link
                  href={getBaseUrl()}
                  style={{ color: "#3B2C17", textDecoration: "underline" }}
                  className="font-medium"
                >
                  ticket-bounty-pi.vercel.app
                </Link>{" "}
                or contact our support team.
              </Text>
            </Section>

            {/* Footer */}
            <Section
              style={{ borderTop: "1px solid #e5e7eb" }}
              className="mt-[40px] pt-[32px]"
            >
              <Text className="m-0 mb-[12px] text-center text-[13px] leading-[20px] text-gray-500">
                This password reset was requested for your TicketBounty account.
              </Text>
              <Text className="m-0 mb-[8px] text-center text-[13px] font-medium text-gray-500">
                © {currentYear} The Road to Next. All rights reserved.
              </Text>
              <Text className="m-0 text-center text-[12px] text-gray-400">
                Built with ❤️ by Kareem Ahmed
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
