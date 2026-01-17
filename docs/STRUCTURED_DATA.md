# Structured Data Implementation

This project implements JSON-LD structured data following [Mike Bifulco's guide](https://mikebifulco.com/posts/structured-data-json-ld-for-next-js-sites) for better SEO.

## What's Included

### Global Structured Data (in `layout.tsx`)

- **Organization**: Company/app information
- **Website**: Site-wide search functionality
- **SoftwareApplication**: App-specific metadata

### Page-Specific Components

- **BreadcrumbStructuredData**: For navigation breadcrumbs
- **TicketStructuredData**: For individual ticket pages

## Usage Examples

### Adding Breadcrumbs to a Page

```tsx
import { BreadcrumbStructuredData } from "@/components/structured-data/breadcrumb-structured-data";

export default function MyPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "/" },
          { name: "Tickets", url: "/tickets" },
          { name: "My Ticket", url: "/tickets/123" },
        ]}
      />
      {/* Your page content */}
    </>
  );
}
```

### Adding Ticket-Specific Structured Data

```tsx
import { TicketStructuredData } from "@/components/structured-data/ticket-structured-data";

export default function TicketPage({ ticket }) {
  return (
    <>
      <TicketStructuredData
        title={ticket.title}
        description={ticket.description}
        url={`/tickets/${ticket.id}`}
        status={ticket.status}
        bounty={ticket.bounty}
        deadline={ticket.deadline}
        createdDate={ticket.createdAt}
      />
      {/* Your page content */}
    </>
  );
}
```

## Testing Your Structured Data

1. **Schema.org Validator**: https://validator.schema.org/
2. **Google Rich Results Test**: https://search.google.com/test/rich-results
3. **View Source**: Check that JSON-LD appears in your HTML

## Benefits

- **Rich Snippets**: Better search result appearance
- **Enhanced SEO**: Search engines understand your content better
- **Type Safety**: Uses `schema-dts` for TypeScript support
- **Server-Side**: Generated at build time for optimal SEO

## Files Structure

```
src/
├── lib/
│   └── structured-data.ts          # Core structured data generators
├── components/
│   └── structured-data/
│       ├── breadcrumb-structured-data.tsx
│       └── ticket-structured-data.tsx
└── app/
    └── layout.tsx                 # Global structured data
```

## Next Steps

- Add structured data to individual ticket detail pages
- Consider adding Article structured data for blog posts
- Monitor Google Search Console for structured data performance
- Add more specific schemas as needed (FAQ, HowTo, etc.)
