import { notFound } from "next/navigation";
import { fetchProducts, getLocalProducts } from "../../../lib/products";
import {
  getLowestPrice,
  getHighestPrice,
  getPriceHistory,
  getStoreUrl,
  getAmazonSearchUrl,
  formatINR,
} from "../../../lib/helpers";
import PriceHistoryChart from "../../components/PriceHistoryChart";
import BackToSearchLink from "../../components/BackToSearchLink";
import ShareButtons from "../../components/ShareButtons";
import StoreDealLink from "../../components/StoreDealLink";
import SaveProductButton from "../../components/SaveProductButton";
import DealGrid from "../../components/DealGrid";
import { getPriceInsights, getFreshness } from "../../../lib/price-insights";
import { getSimilarProducts } from "../../../lib/recommendations";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  parseRatingCount,
  safeJsonLd,
} from "../../../lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getLocalProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const products = await fetchProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) return {};

  const priceSuffix = product.prices.length > 1 ? " onwards" : "";

  return {
    title: `${product.name} — Price Comparison | PriceVichar`,
    description: `Compare the best available price for ${product.name} — ${formatINR(
      getLowestPrice(product)
    )}${priceSuffix}.`,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} — Price Comparison | PriceVichar`,
      description: `Compare current prices for ${product.name} from ${formatINR(
        getLowestPrice(product)
      )}.`,
      url: `/product/${product.id}`,
      type: "website",
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }) {
  const products = await fetchProducts();
  const product = products.find((p) => p.id === params.id);

  if (!product) notFound();

  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);
  const savings = highest - lowest;
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);
  const hasAmazonPrice = sortedPrices.some((entry) =>
    String(entry.store || "").toLowerCase().includes("amazon")
  );
  const history = getPriceHistory(product);
  const insights = getPriceInsights(history, lowest);
  const freshness = getFreshness(product.lastUpdated);
  const similarProducts = getSimilarProducts(products, product);
  const ratingValue = Number(product.rating);
  const ratingCount = parseRatingCount(product.ratings_reviews);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
    image: product.image || undefined,
    url: absoluteUrl(`/product/${product.id}`),
    aggregateRating:
      ratingValue > 0 && ratingCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue,
            ratingCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowest,
      highPrice: highest,
      offerCount: product.prices.length,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/product/${product.id}`),
    },
  };
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    {
      name: product.category,
      path: `/category/${String(product.category)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`,
    },
    { name: product.name, path: `/product/${product.id}` },
  ]);

  return (
    <>
      <BackToSearchLink />

      <div className="product-head product-head-with-image">
        <div className="product-detail-media">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-detail-image"
              loading="eager"
            />
          ) : (
            <div className="emoji">{product.emoji}</div>
          )}
        </div>

        <div>
          <p className="product-category-label">{product.category}</p>
          <h1>{product.name}</h1>
          {product.lastUpdated && (
            <p className="last-updated">
              Last price check: {product.lastUpdated} · {freshness.label}
              {freshness.daysOld !== null ? ` (${freshness.daysOld} days ago)` : ""}
            </p>
          )}
          <p className={`freshness-note ${freshness.tone}`}>
            Store prices can change after our last check. Always confirm the final
            price and availability on the retailer website.
          </p>
        </div>
      </div>

      {savings > 0 && (
        <p className="savings-note">
          <span>Best deal</span>
          Save up to {formatINR(savings)} by choosing the right store.
        </p>
      )}

      <div className="product-save-row">
        <SaveProductButton product={product} />
        <p>Save this product and return later to check its latest price.</p>
      </div>

      <ShareButtons product={product} price={lowest} />

      <table className="price-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Price</th>
            <th>Difference</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedPrices.map((entry) => {
            const isBest = entry.price === lowest;
            const href = getStoreUrl(product, entry);

            return (
              <tr key={entry.store} className={isBest ? "best-row" : ""}>
                <td>
                  {entry.store}
                  {isBest && <span className="best-badge">BEST PRICE</span>}
                </td>
                <td className="amount">{formatINR(entry.price)}</td>
                <td>{isBest ? "—" : `+${formatINR(entry.price - lowest)}`}</td>
                <td>
                  {href ? (
                    <StoreDealLink
                      href={href}
                      product={product}
                      store={entry.store}
                      price={entry.price}
                    >
                      View deal
                    </StoreDealLink>
                  ) : (
                    <span className="buy-btn coming-soon">Coming soon</span>
                  )}
                </td>
              </tr>
            );
          })}
          {!hasAmazonPrice && (
            <tr className="amazon-search-row">
              <td>Amazon</td>
              <td className="amazon-search-price">Check current price</td>
              <td>—</td>
              <td>
                <StoreDealLink
                  href={getAmazonSearchUrl(product)}
                  className="buy-btn amazon-search-btn"
                  product={product}
                  store="Amazon search"
                  price={0}
                >
                  Search Amazon
                </StoreDealLink>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!hasAmazonPrice && (
        <p className="amazon-search-note">
          A verified Amazon price is not available for this listing yet. The
          button opens an Amazon search; please confirm the final price there.
        </p>
      )}

      <h2 className="section-title">Price history</h2>
      {insights && (
        <section className="price-insights" aria-label="Price insights">
          <div className={`price-verdict ${insights.tone}`}>
            <span>Current signal</span>
            <strong>{insights.verdict}</strong>
            <p>{insights.explanation}</p>
          </div>
          <div>
            <span>Recorded average</span>
            <strong>{formatINR(insights.average)}</strong>
          </div>
          <div>
            <span>Recorded range</span>
            <strong>
              {formatINR(insights.low)}–{formatINR(insights.high)}
            </strong>
          </div>
          <div>
            <span>Evidence</span>
            <strong>{insights.observations} checks</strong>
          </div>
        </section>
      )}
      <PriceHistoryChart points={history} />

      {similarProducts.length > 0 && (
        <section className="similar-products-section">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Explore alternatives</p>
              <h2 className="section-title">Similar products</h2>
            </div>
            <p>Matched by category, product words and price range.</p>
          </div>
          <DealGrid products={similarProducts} />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
    </>
  );
}
