import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import AnalyticsTracker from "@/components/analytics-tracker";
import Footer from "@/components/footer";
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

const pixellari = localFont({
  src: "../../public/Pixellari.ttf",
  variable: "--font-pixellari",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | The Road to Next",
    default: "The Road to Next - Ticket Management System",
  },
  description:
    "A modern ticket management system built with Next.js, featuring authentication, real-time updates, and intuitive user interface.",
  keywords: [
    "ticket management",
    "Next.js",
    "React",
    "TypeScript",
    "Prisma",
    "authentication",
    "web application",
    "ticket system",
    "project management",
  ],
  authors: [{ name: "Kareem Ahmed" }],
  creator: "Kareem Ahmed",
  publisher: "The Road to Next",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ticket-bounty-pi.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      en: "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ticket-bounty-pi.vercel.app",
    siteName: "The Road to Next",
    title: "The Road to Next - Ticket Management System",
    description:
      "A modern ticket management system built with Next.js, featuring authentication, real-time updates, and intuitive user interface.",
    images: [
      {
        url: "/og-image 1x.png",
        width: 1200,
        height: 630,
        alt: "The Road to Next - Ticket Management System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Road to Next - Ticket Management System",
    description:
      "A modern ticket management system built with Next.js, featuring authentication, real-time updates, and intuitive user interface.",
    images: ["/og-image 1x.png"],
    creator: "@kareemahmed",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with your actual verification code
  },
  category: "technology",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixellari.variable} overflow-x-hidden antialiased`}
      >
        <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />

        <ThemeProvider>
          <ReactQueryProvider>
            <ReactQueryDevtools />
            <AnalyticsTracker />

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
