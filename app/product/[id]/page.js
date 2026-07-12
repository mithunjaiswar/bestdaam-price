import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductById,
  getLowestPrice,
  getHighestPrice,
  formatINR,
} from "../../../lib/products";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const product = getProductById(params.id);
  if (!product) return {};
  return {
    title: `${product.name} — Price Comparison | BestDaam`,
    description: `${product.name} ka sabse sasta daam dekho — ${formatINR(
      getLowestPrice(product)
    )} se shuru.`,
  };
}

export default function ProductPage({ params }) {
  const product = getProductById(params.id);
  if (!product) notFound();

  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);
  const savings = highest - lowest;
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);

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
                  <a href={entry.url} className="buy-btn">
                    Store par dekho
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
