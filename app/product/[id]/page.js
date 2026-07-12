import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProducts, getLocalProducts } from "../../../lib/products";
import {
  getLowestPrice,
  getHighestPrice,
  getPriceHistory,
  getStoreUrl,
  formatINR,
} from "../../../lib/helpers";
import PriceHistoryChart from "../../components/PriceHistoryChart";

export const revalidate = 600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getLocalProducts().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const products = await fetchProducts();
  const product = products.find((p) => p.id === params.id);
  if (!product) return {};
  return {
    title: `${product.name} — Price Comparison | BestDaam`,
    description: `${product.name} ka sabse sasta daam dekho — ${formatINR(
      getLowestPrice(product)
    )} se shuru.`,
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
  const history = getPriceHistory(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
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
      <Link href="/" className="back-link">
        ← Wapas search par
      </Link>

      <div className="product-head">
        <div className="emoji">{product.emoji}</div>
        <h1>{product.name}</h1>
      </div>

      {savings > 0 && (
        <p className="savings-note">
          💡 Sahi store chunkar {formatINR(savings)} tak bachat kar sakte ho!
        </p>
      )}

      <table className="price-table">
        <thead>
          <tr>
            <th>Store</th>
            <th>Price</th>
            <th>Farak</th>
            <th></th>
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
                  {isBest && <span className="best-badge">SABSE SASTA</span>}
                </td>
                <td className="amount">{formatINR(entry.price)}</td>
                <td>
                  {isBest ? "—" : `+${formatINR(entry.price - lowest)}`}
                </td>
                <td>
                  {href ? (
                    <a
                      href={href}
                      className="buy-btn"
                      target="_blank"
                      rel="nofollow sponsored noopener"
                    >
                      Store par dekho
                    </a>
                  ) : (
                    <span className="buy-btn coming-soon">Jald aayega</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h2 className="section-title">Pichle 30 din ka daam 📉</h2>
      <PriceHistoryChart points={history} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
