import Link from "next/link";
import { fetchProducts } from "../../lib/products";
import { BUDGET_PAGES, getFeaturedDeals } from "../../lib/deals";
import { fetchCuelinksOffers } from "../../lib/cuelinks-offers";
import { getCurrentEarnKaroOffers } from "../../lib/earnkaro-offers";
import CuelinksOfferGrid from "../components/CuelinksOfferGrid";
import EarnKaroOfferGrid from "../components/EarnKaroOfferGrid";
import DealGrid from "../components/DealGrid";

export const metadata = {
  title: "Today's Affordable Deals | PriceVichar",
  description:
    "Compare today's affordable product picks across trusted Indian online stores.",
  alternates: { canonical: "/deals" },
};

export const revalidate = 600;

export default async function DealsPage() {
  const [products, liveOffers] = await Promise.all([
    fetchProducts(),
    fetchCuelinksOffers(),
  ]);
  const deals = getFeaturedDeals(products, 30);
  const earnKaroOffers = getCurrentEarnKaroOffers();

  return (
    <>
      <section className="landing-hero">
        <span className="landing-eyebrow">Updated with the catalog</span>
        <h1>Today&apos;s affordable picks</h1>
        <p>
          Useful products under ₹5,000, selected from recently verified
          listings. Prices can change at the retailer.
        </p>
        <div className="landing-links">
          {Object.entries(BUDGET_PAGES).map(([slug, budget]) => (
            <Link key={slug} href={`/deals/${slug}`} className="budget-chip">
              {budget.label}
            </Link>
          ))}
        </div>
      </section>
      <div id="limited-time-offers" className="partner-offers-anchor">
        <EarnKaroOfferGrid offers={earnKaroOffers} />
        <CuelinksOfferGrid offers={liveOffers} />
      </div>
      <section className="catalog-deals" aria-labelledby="catalog-deals-title">
        <div className="section-heading">
          <div>
            <span className="landing-eyebrow">Verified catalog prices</span>
            <h2 id="catalog-deals-title">Affordable product picks</h2>
          </div>
        </div>
      <DealGrid products={deals} />
      </section>
    </>
  );
}
