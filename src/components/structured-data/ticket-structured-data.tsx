import Script from "next/script";
import { generateTicketStructuredData } from "@/lib/structured-data";

interface TicketStructuredDataProps {
  title: string;
  description: string;
  url: string;
  status: string;
  bounty?: number;
  deadline?: string;
  createdDate: string;
}

export function TicketStructuredData({
  title,
  description,
  url,
  status,
  bounty,
  deadline,
  createdDate,
}: TicketStructuredDataProps) {
  const structuredData = generateTicketStructuredData({
    title,
    description,
    url,
    status,
    bounty,
    deadline,
    createdDate,
  });

  return (
    <Script
      id={`ticket-structured-data-${url}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
