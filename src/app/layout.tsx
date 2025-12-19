import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar/components/sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getSEOTags } from "@/lib/seo-tags";
import {
  generateOrganizationStructuredData,
  generateSoftwareApplicationStructuredData,
  generateWebsiteStructuredData,
} from "@/lib/structured-data";
import PostHogAuthWrapper from "./_providers/posthog-auth-wrapper";
import PostHogPageViewTracker from "./_providers/posthog-pageview-tracker";
import { PostHogProvider } from "./_providers/posthog-provider";
import ReactQueryProvider from "./_providers/react-query/react-query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const pixellari = localFont({
  src: "../../public/Pixellari.ttf",
  variable: "--font-pixellari",
  display: "swap",
});

export const metadata = getSEOTags({
  title: {
    template: "%s | The Road to Next",
    default: "The Road to Next - Ticket Management System",
  },
  canonicalUrlRelative: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data
  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebsiteStructuredData();
  const softwareData = generateSoftwareApplicationStructuredData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixellari.variable} overflow-x-hidden antialiased`}
      >
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareData),
          }}
        />

        <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />

        <PostHogProvider>
          <Suspense fallback={null}>
            <PostHogPageViewTracker />
          </Suspense>
          <PostHogAuthWrapper>
            <ThemeProvider>
              <ReactQueryProvider>
                <ReactQueryDevtools />

                <Header />

                <div className="flex">
                  <Sidebar />

                  <div className="flex flex-1 flex-col">
                    <main
                      id="main"
                      className="bg-secondary/20 flex min-h-screen flex-1 flex-col overflow-y-clip px-8 py-24 pl-[7rem]"
                    >
                      <NuqsAdapter>{children}</NuqsAdapter>
                    </main>
                    <Footer />
                  </div>
                </div>
                <Toaster />
              </ReactQueryProvider>
            </ThemeProvider>
          </PostHogAuthWrapper>
        </PostHogProvider>
      </body>
    </html>
  );
}
