import Script from "next/script";
import { generateBreadcrumbStructuredData } from "@/lib/structured-data";

interface BreadcrumbStructuredDataProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbStructuredData({
  items,
}: BreadcrumbStructuredDataProps) {
  const structuredData = generateBreadcrumbStructuredData(items);

  return (
    <Script
      id={`breadcrumb-structured-data-${items.length}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
