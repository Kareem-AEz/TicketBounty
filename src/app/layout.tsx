import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import AnalyticsTracker from "@/components/analytics-tracker";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar/components/sidebar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
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

export const metadata: Metadata = {
  title: {
    template: "%s | The Road to Next",
    default: "The Road to Next",
  },
  description: "My Road to Next application...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} overflow-x-hidden antialiased`}
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />

        <ThemeProvider>
          <ReactQueryProvider>
            <ReactQueryDevtools />
            <AnalyticsTracker />

            <Header />
            <div className="flex">
              <Sidebar />

              <main
                id="main"
                className="bg-secondary/20 flex min-h-screen flex-1 flex-col overflow-y-clip px-8 py-24 pl-[7rem]"
              >
                <NuqsAdapter>{children}</NuqsAdapter>
              </main>
            </div>
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
        <Script
          src="/spaghetti/u"
          data-website-id="62c38894-1534-4cd7-81a4-1764a97ad356"
          strategy="afterInteractive"
          data-do-not-track="true"
        />
      </body>
    </html>
  );
}
