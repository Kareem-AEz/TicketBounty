import type { MetadataRoute } from "next";
import config from "@/config";

// This is a basic sitemap. For a production app, you might want to:
// 1. Fetch tickets from your database dynamically
// 2. Use generateSitemaps() for pagination if you have many tickets
// 3. Add lastModified dates based on actual ticket update times

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = `https://${config.domainName}`;
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tickets`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/account/profile`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/account/password`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // TODO: Add dynamic ticket pages if needed
  // const tickets = await getTickets() // Your database query
  // const ticketPages = tickets.map(ticket => ({
  //   url: `${baseUrl}/tickets/${ticket.id}`,
  //   lastModified: ticket.updatedAt,
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.5,
  // }))

  return staticPages;
}

// Uncomment this if you need multiple sitemaps for large datasets
// export async function generateSitemaps() {
//   const totalTickets = await getTotalTicketCount()
//   const sitemapsPerFile = 1000 // Adjust based on your needs
//   const totalSitemaps = Math.ceil(totalTickets / sitemapsPerFile)
//
//   return Array.from({ length: totalSitemaps }, (_, i) => ({ id: i }))
// }
