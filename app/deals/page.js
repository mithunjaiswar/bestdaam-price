import Link from "next/link";
import { fetchProducts } from "../../lib/products";
import { BUDGET_PAGES, getFeaturedDeals } from "../../lib/deals";
import DealGrid from "../components/DealGrid";

export const metadata = {
  title: "Today's Affordable Deals | BestDaam",
  description:
    "Compare today's affordable product picks across trusted Indian online stores.",
  alternates: { canonical: "/deals" },
};

export const revalidate = 600;

export default async function DealsPage() {
  const products = await fetchProducts();
  const deals = getFeaturedDeals(products, 30);

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
      <DealGrid products={deals} />
    </>
  );
}
