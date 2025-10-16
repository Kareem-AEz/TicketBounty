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
    url,
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
        url: `https://${config.domainName}/icon.png`,
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
    url: `https://${config.domainName}`,
    logo: `https://${config.domainName}/icon.png`,
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
    url: `https://${config.domainName}`,
    description: config.appDescription,
    publisher: {
      "@type": "Organization",
      name: config.appName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `https://${config.domainName}/tickets?search={search_term_string}`,
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
      item: `https://${config.domainName}${item.url}`,
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
    url: `https://${config.domainName}`,
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
