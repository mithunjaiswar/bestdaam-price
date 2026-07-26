"use client";

import Link from "next/link";
import { formatINR, getLowestPrice } from "../../lib/helpers";
import { getDealBadge } from "../../lib/deals";
import { trackEvent } from "../../lib/tracking";

export default function DealGrid({ products, limit }) {
  const visible = typeof limit === "number" ? products.slice(0, limit) : products;

  return (
    <div className="grid deal-grid">
      {visible.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="card deal-card"
          onClick={() =>
            trackEvent("select_product", {
              productId: product.id,
              productName: product.name,
              category: product.category,
              value: getLowestPrice(product),
            })
          }
        >
          <span className="deal-badge">{getDealBadge(product)}</span>
          <div className="card-media">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="card-image"
                loading="lazy"
              />
            ) : (
              <div className="emoji">{product.emoji}</div>
            )}
          </div>
          <span className="card-category">{product.category}</span>
          <h3>{product.name}</h3>
          <div className="from">Current best price</div>
          <div className="price">{formatINR(getLowestPrice(product))}</div>
          <div className="stores">
            {product.prices.length > 1
              ? `Compare across ${product.prices.length} stores`
              : "1 verified price"}
          </div>
          <div className="card-cta">
            View deal <span aria-hidden="true">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
