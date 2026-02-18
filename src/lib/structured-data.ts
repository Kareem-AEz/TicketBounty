import type {
  Article,
  BreadcrumbList,
  Organization,
  SoftwareApplication,
  WebSite,
  WithContext,
} from "schema-dts";
import config from "@/config";

/**
 * Generate canonical URL for a given path
 * @param path - The path to generate canonical URL for
 * @returns Canonical URL string
 */
export function getCanonicalUrl(path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `https://${config.domainName}${cleanPath}`;
}

/**
 * Generate Open Graph URL for a given path
 * @param path - The path to generate OG URL for
 * @returns Open Graph URL string
 */
export function getOpenGraphUrl(path: string = "/"): string {
  return getCanonicalUrl(path);
}

/**
 * Generate structured data for articles/blog posts
 */
export function generateArticleStructuredData({
  title,
  description,
  url,
  publishedDate,
  modifiedDate,
  author = config.author.name,
  image,
}: {
  title: string;
  description: string;
  url: string;
  publishedDate: string;
  modifiedDate?: string;
  author?: string;
  image?: string;
}): WithContext<Article> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: getCanonicalUrl(url),
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: config.appName,
      logo: {
        "@type": "ImageObject",
        url: getCanonicalUrl("/icon.png"),
      },
    },
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
  };
}

/**
 * Generate structured data for organization
 */
export function generateOrganizationStructuredData(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: config.appName,
    url: getCanonicalUrl("/"),
    logo: getCanonicalUrl("/icon.png"),
    description: config.appDescription,
    founder: {
      "@type": "Person",
      name: config.author.name,
    },
    sameAs: [
      `https://x.com/${config.twitterHandle.replace("@", "")}`,
      "https://github.com/Kareem-AEz",
    ],
  };
}

/**
 * Generate structured data for website
 */
export function generateWebsiteStructuredData(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: config.appName,
    url: getCanonicalUrl("/"),
    description: config.appDescription,
    publisher: {
      "@type": "Organization",
      name: config.appName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getCanonicalUrl("/tickets")}?search={search_term_string}`,
      },
    },
  };
}

/**
 * Generate structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>,
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  };
}

/**
 * Generate structured data for software application
 */
export function generateSoftwareApplicationStructuredData(): WithContext<SoftwareApplication> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.appName,
    description: config.appDescription,
    url: getCanonicalUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    author: {
      "@type": "Person",
      name: config.author.name,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * Generate structured data for tickets (custom schema)
 */
export function generateTicketStructuredData({
  title,
  description,
  url,
  status,
  bounty,
  deadline,
  createdDate,
}: {
  title: string;
  description: string;
  url: string;
  status: string;
  bounty?: number;
  deadline?: string;
  createdDate: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url,
    dateCreated: createdDate,
    ...(deadline && { dateModified: deadline }),
    author: {
      "@type": "Organization",
      name: config.appName,
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Status",
        value: status,
      },
      ...(bounty
        ? [
            {
              "@type": "PropertyValue",
              name: "Bounty",
              value: `$${bounty}`,
            },
          ]
        : []),
    ],
  };
}
