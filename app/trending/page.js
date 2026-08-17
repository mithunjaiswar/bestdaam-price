import Link from "next/link";
import TrendingGrid from "../components/TrendingGrid";
import { fetchProducts } from "../../lib/products";
import { getCategories } from "../../lib/helpers";
import { rankTrendingProducts } from "../../lib/trending";
import { slugify } from "../../lib/slugs";

export const metadata = {
  title: "Trending Products This Week | PriceVichar",
  description:
    "Discover products gaining shopper interest this week and compare their current prices.",
  alternates: { canonical: "/trending" },
};

export default async function TrendingPage({ searchParams }) {
  const products = await fetchProducts();
  const period = searchParams?.period === "month" ? "month" : "week";
  const category = searchParams?.category || "All";
  const categories = getCategories(products);
  const ranked = rankTrendingProducts(products, period);
  const visible =
    category === "All"
      ? ranked.slice(0, 40)
      : ranked.filter((product) => slugify(product.category) === category).slice(0, 40);

  return (
    <>
      <section className="landing-hero compact trending-hero">
        <span className="landing-eyebrow">Shopping pulse</span>
        <h1>{period === "month" ? "Popular This Month" : "Trending This Week"}</h1>
        <p>
          A transparent popularity ranking built from Flipkart signals and
          PriceVichar shopper activity—not a claim of units sold.
        </p>
        <div className="landing-links">
          <Link
            href="/trending"
            className={`budget-chip ${period === "week" ? "active" : ""}`}
          >
            This week
          </Link>
          <Link
            href="/trending?period=month"
            className={`budget-chip ${period === "month" ? "active" : ""}`}
          >
            This month
          </Link>
        </div>
      </section>

      <div className="category-row trending-categories">
        <Link
          href={`/trending${period === "month" ? "?period=month" : ""}`}
          className={`chip ${category === "All" ? "active" : ""}`}
        >
          All
        </Link>
        {categories.map((item) => {
          const key = slugify(item);
          const query = new URLSearchParams();
          query.set("category", key);
          if (period === "month") query.set("period", "month");

          return (
            <Link
              key={item}
              href={`/trending?${query.toString()}`}
              className={`chip ${category === key ? "active" : ""}`}
            >
              {item}
            </Link>
          );
        })}
      </div>

      <div className="trend-method-note">
        <strong>How ranking works:</strong> 70% Flipkart popularity signals
        (listing position, rating, review volume and price movement) + up to
        30% available PriceVichar activity (product views, store clicks, searches
        and shares). Rankings are directional and do not represent units sold.
      </div>

      <TrendingGrid products={visible} />
    </>
  );
}
