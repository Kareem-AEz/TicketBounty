import type { Metadata } from "next";
import Script from "next/script";
import config from "@/config";

/**
 * Generate SEO tags for pages
 * Based on ShipFast's SEO implementation
 */
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
}: Metadata & {
  canonicalUrlRelative?: string;
  extraTags?: Record<string, unknown>;
} = {}): Metadata => {
  return {
    title: title || config.appName,
    description: description || config.appDescription,
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`,
    ),
    openGraph: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: openGraph?.siteName || config.appName,
      locale: openGraph?.locale || "en_US",
      type: "website",
      ...openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      creator: config.twitterHandle,
      ...openGraph,
    },
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),
    ...extraTags,
  };
};

/**
 * Render structured data schema for rich results
 */
export const renderSchemaTags = () => {
  return (
    <Script
      id="structured-data-software-application"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "http://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: config.appDescription,
          image: `https://${config.domainName}/icon.png`,
          url: `https://${config.domainName}/`,
          author: {
            "@type": "Person",
            name: config.author.name,
          },
          applicationCategory: "BusinessApplication",
        }),
      }}
    />
  );
};
