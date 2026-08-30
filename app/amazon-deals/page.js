import Link from "next/link";
import AmazonCampaignLink from "../components/AmazonCampaignLink";
import { getAmazonSearchUrl } from "../../lib/helpers";
import { absoluteUrl, buildBreadcrumbJsonLd, safeJsonLd } from "../../lib/seo";

export const metadata = {
  title: "Useful Amazon Shopping Picks | PriceVichar",
  description:
    "Explore useful Amazon India shopping searches for electronics, home, study, travel and everyday needs. Confirm the final price on Amazon.",
  alternates: { canonical: "/amazon-deals" },
  openGraph: {
    title: "Useful Amazon Shopping Picks | PriceVichar",
    description:
      "Start with a useful category, compare your options and confirm the final price on Amazon India.",
    url: "/amazon-deals",
  },
};

const SHOPPING_PICKS = [
  {
    title: "Mobile accessories under ₹500",
    query: "useful mobile accessories under 500",
    category: "Mobile accessories",
    description: "Cables, stands, holders and small everyday phone accessories.",
  },
  {
    title: "Earbuds under ₹2,000",
    query: "best earbuds under 2000",
    category: "Earbuds",
    description: "Compare popular budget earbuds for calls, music and travel.",
  },
  {
    title: "Home essentials under ₹500",
    query: "useful home essentials under 500",
    category: "Home essentials",
    description: "Affordable organizers, cleaning tools and practical home products.",
  },
  {
    title: "Kitchen tools under ₹1,000",
    query: "useful kitchen tools under 1000",
    category: "Kitchen",
    description: "Time-saving preparation, storage and everyday kitchen tools.",
  },
  {
    title: "Study essentials",
    query: "study essentials for students",
    category: "Study",
    description: "Desk, stationery and focus-friendly products for students.",
  },
  {
    title: "Work-from-home accessories",
    query: "work from home desk accessories",
    category: "Office",
    description: "Useful desk additions for a cleaner and more comfortable setup.",
  },
  {
    title: "Travel essentials",
    query: "useful travel essentials",
    category: "Travel",
    description: "Organizers, chargers and small items that make travel easier.",
  },
  {
    title: "Personal-care devices",
    query: "personal care devices under 2000",
    category: "Personal care",
    description: "Everyday grooming and personal-care electronics to compare.",
  },
];

export default function AmazonDealsPage() {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Amazon shopping picks", path: "/amazon-deals" },
  ]);
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Useful Amazon shopping searches",
    numberOfItems: SHOPPING_PICKS.length,
    itemListElement: SHOPPING_PICKS.map((pick, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: pick.title,
      url: absoluteUrl("/amazon-deals"),
    })),
  };

  return (
    <>
      <section className="landing-hero amazon-campaign-hero">
        <span className="landing-eyebrow">PriceVichar shopping shortcuts</span>
        <h1>Useful Amazon shopping picks</h1>
        <p>
          Choose what you need, explore matching Amazon India results and check
          ratings, delivery and the final price before ordering.
        </p>
        <div className="amazon-campaign-trust">
          <span>✓ Need-based searches</span>
          <span>✓ No fake live-price claims</span>
          <span>✓ Final decision stays with you</span>
        </div>
      </section>

      <p className="amazon-campaign-disclosure">
        <strong>Affiliate disclosure:</strong> As an Amazon Associate, PriceVichar
        earns from qualifying purchases. Prices and availability are shown by
        Amazon and can change at any time.
      </p>

      <section className="amazon-campaign-grid" aria-label="Amazon shopping categories">
        {SHOPPING_PICKS.map((pick) => (
          <article className="amazon-campaign-card" key={pick.title}>
            <span>{pick.category}</span>
            <h2>{pick.title}</h2>
            <p>{pick.description}</p>
            <AmazonCampaignLink
              href={getAmazonSearchUrl({ name: pick.query })}
              query={pick.query}
              category={pick.category}
            >
              Check options on Amazon ↗
            </AmazonCampaignLink>
          </article>
        ))}
      </section>

      <section className="amazon-campaign-guide">
        <div>
          <span className="landing-eyebrow">Buy with context</span>
          <h2>Compare before you order</h2>
          <p>
            Use PriceVichar&apos;s buying guides and price pages to shortlist a model,
            then confirm the exact variant, seller, warranty and final checkout
            price on Amazon.
          </p>
        </div>
        <Link href="/guides" className="text-link">Open buying guides →</Link>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
    </>
  );
}
