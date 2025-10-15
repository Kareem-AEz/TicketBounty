/**
 * Utility functions for generating canonical URLs and SEO metadata
 */

const BASE_URL = 'https://ticket-bounty-pi.vercel.app'

/**
 * Generate canonical URL for a given path
 * @param path - The path to generate canonical URL for
 * @returns Canonical URL string
 */
export function getCanonicalUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${cleanPath}`
}

/**
 * Generate Open Graph URL for a given path
 * @param path - The path to generate OG URL for
 * @returns Open Graph URL string
 */
export function getOpenGraphUrl(path: string = '/'): string {
  return getCanonicalUrl(path)
}

/**
 * Generate structured data for breadcrumbs
 * @param items - Array of breadcrumb items
 * @returns Structured data object
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: getCanonicalUrl(item.url),
    })),
  }
}

/**
 * Generate structured data for organization
 * @returns Organization structured data
 */
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Road to Next',
    url: BASE_URL,
    logo: `${BASE_URL}/og-image 1x.png`,
    description: 'A modern ticket management system built with Next.js',
    founder: {
      '@type': 'Person',
      name: 'Kareem Ahmed',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/kareemahmed',
      // 'https://linkedin.com/in/kareemahmed',
    ],
  }
}

/**
 * Generate structured data for website
 * @returns Website structured data
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Road to Next',
    url: BASE_URL,
    description: 'A modern ticket management system built with Next.js',
    publisher: {
      '@type': 'Organization',
      name: 'The Road to Next',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/tickets?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
