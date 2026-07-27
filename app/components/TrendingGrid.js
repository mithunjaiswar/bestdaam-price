"use client";

import Link from "next/link";
import { formatINR, getLowestPrice } from "../../lib/helpers";
import { trackEvent } from "../../lib/tracking";

export default function TrendingGrid({ products, limit }) {
  const visible = typeof limit === "number" ? products.slice(0, limit) : products;

  return (
    <div className="grid trending-grid">
      {visible.map((product, index) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className="card trending-card"
          onClick={() =>
            trackEvent("select_product", {
              productId: product.id,
              productName: product.name,
              category: product.category,
              source: `trending_${product.trend?.period || "week"}`,
              value: getLowestPrice(product),
            })
          }
        >
          <div className="trend-rank">#{index + 1}</div>
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
          <div className="trend-signal">
            {product.rating ? `★ ${product.rating}` : "Popular now"}
            <span>Trend score {Math.round(product.trend?.score || 0)}</span>
          </div>
          <div className="from">Current best price</div>
          <div className="price">{formatINR(getLowestPrice(product))}</div>
          <div className="card-cta">
            Compare prices <span aria-hidden="true">→</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
