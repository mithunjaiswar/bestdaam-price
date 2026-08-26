import Link from "next/link";
import { fetchProducts } from "../../lib/products";
import { getCurrentEarnKaroOffers } from "../../lib/earnkaro-offers";
import { getTrendingProducts } from "../../lib/trending";
import { BUYING_GUIDES } from "../../lib/guides";
import TrendingGrid from "../components/TrendingGrid";
import LatestOfferRail from "../components/LatestOfferRail";

export const revalidate = 600;

export const metadata = {
  title: "Start Here — Deals, Comparisons & Buying Guides | PriceVichar",
  description:
    "Explore trending products, fresh deals and practical buying guides from PriceVichar before you shop.",
  alternates: { canonical: "/start" },
};

export default async function StartPage() {
  const products = await fetchProducts();
  const trending = getTrendingProducts(products, "week", 6);
  const offers = getCurrentEarnKaroOffers().slice(0, 8);

  return (
    <>
      <section className="social-start-hero">
        <p className="landing-eyebrow">Seen PriceVichar on Instagram or YouTube?</p>
        <h1>Think before you buy.</h1>
        <p>
          Compare available prices, check whether a deal looks good and explore
          practical buying guides before visiting the retailer.
        </p>
        <div className="social-start-actions">
          <Link href="/?focus=search" className="buy-btn">Search a product</Link>
          <Link href="/deals" className="secondary-btn">See today&apos;s deals</Link>
          <a
            href="https://t.me/Bestdaam_india"
            target="_blank"
            rel="noopener"
            className="secondary-btn"
          >
            Join Telegram alerts
          </a>
        </div>
        <div className="social-proof-strip" aria-label="PriceVichar shopping checks">
          <span>✓ Price freshness shown</span>
          <span>✓ Price-history signals</span>
          <span>✓ Final price verified at retailer</span>
        </div>
      </section>

      <LatestOfferRail offers={offers} />

      <section className="social-start-section" aria-labelledby="social-trending-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Popular this week</p>
            <h2 id="social-trending-title" className="section-title">Trending comparisons</h2>
          </div>
          <Link href="/trending" className="text-link">See all trending products →</Link>
        </div>
        <TrendingGrid products={trending} />
      </section>

      <section className="social-start-section" aria-labelledby="social-guides-title">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Shop by budget</p>
            <h2 id="social-guides-title" className="section-title">Quick buying guides</h2>
          </div>
          <Link href="/guides" className="text-link">All guides →</Link>
        </div>
        <div className="guide-hub-grid">
          {Object.entries(BUYING_GUIDES).map(([slug, guide]) => (
            <Link href={`/guides/${slug}`} className="guide-hub-card" key={slug}>
              <span>{guide.category}</span>
              <h3>{guide.shortTitle}</h3>
              <p>{guide.description}</p>
              <strong>Compare options →</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="social-follow-card">
        <div>
          <p className="eyebrow">Follow the journey</p>
          <h2>Daily shopping ideas, with the comparison on PriceVichar.</h2>
        </div>
        <div className="social-start-actions">
          <a href="https://www.instagram.com/pricevichar/" target="_blank" rel="noopener" className="secondary-btn">
            Instagram
          </a>
          <a href="https://www.youtube.com/@pricevichar" target="_blank" rel="noopener" className="secondary-btn">
            YouTube Shorts
          </a>
        </div>
      </section>
    </>
  );
}
