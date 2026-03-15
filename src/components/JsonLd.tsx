import type { Startup } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://saasstars.com";

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SaaS Stars",
    url: SITE_URL,
    description:
      "The free directory for SaaS startups to get discovered by customers, investors, and partners.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function StartupJsonLd({ startup }: { startup: Startup }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: startup.companyName,
    url: startup.website,
    applicationCategory: "BusinessApplication",
    description: startup.shortDescription || `${startup.companyName} — ${startup.category} SaaS`,
    offers: startup.freeTrialUrl
      ? {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free Trial Available",
          url: startup.freeTrialUrl,
        }
      : undefined,
    author: {
      "@type": "Organization",
      name: startup.companyName,
      url: startup.website,
      foundingDate: String(startup.yearFounded),
      address: {
        "@type": "PostalAddress",
        addressLocality: startup.hqLocation,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
