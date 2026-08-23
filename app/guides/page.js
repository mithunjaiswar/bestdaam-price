import Link from "next/link";
import { BUYING_GUIDES } from "../../lib/guides";

export const metadata = {
  title: "Shopping & Buying Guides India | PriceVichar",
  description:
    "Practical Indian shopping guides with current catalog prices, comparison tips and retailer checks.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <>
      <section className="landing-hero guide-hero">
        <span className="landing-eyebrow">Practical buying help</span>
        <h1>PriceVichar shopping guides</h1>
        <p>
          Start with your budget, compare the important specifications and verify
          the final retailer price before buying.
        </p>
      </section>
      <section className="guide-hub-grid" aria-label="Buying guides">
        {Object.entries(BUYING_GUIDES).map(([slug, guide]) => (
          <Link href={`/guides/${slug}`} className="guide-hub-card" key={slug}>
            <span>{guide.category}</span>
            <h2>{guide.shortTitle}</h2>
            <p>{guide.description}</p>
            <strong>Read guide →</strong>
          </Link>
        ))}
      </section>
    </>
  );
}
