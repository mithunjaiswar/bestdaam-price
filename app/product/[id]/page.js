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
    title: `${product.name} — Price Comparison | BestDaam`,
    description: `Compare the best available price for ${product.name} — ${formatINR(
      getLowestPrice(product)
    )}${priceSuffix}.`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
    image: product.image || undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowest,
      highPrice: highest,
      offerCount: product.prices.length,
    },
  };

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
              Last price update: {product.lastUpdated}
            </p>
          )}
        </div>
      </div>

      {savings > 0 && (
        <p className="savings-note">
          <span>Best deal</span>
          Save up to {formatINR(savings)} by choosing the right store.
        </p>
      )}

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
      <PriceHistoryChart points={history} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
