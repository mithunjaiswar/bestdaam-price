"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getCategories,
  getLowestPrice,
  getAmazonSearchUrl,
  formatINR,
} from "../../lib/helpers";
import {
  getSearchLabel,
  searchProducts,
} from "../../lib/search";

export default function HomeClient({ products }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Sab");

  const categories = ["Sab", ...getCategories(products)];
  const hasQuery = query.trim().length > 0;

  const results = searchProducts(products, query).filter((p) => {
    const matchesCategory =
      hasQuery || category === "Sab" || p.category === category;
    return matchesCategory;
  });
  const missingProduct = hasQuery && results.length === 0;
  const searchLabel = getSearchLabel(query);
  const amazonSearchUrl = getAmazonSearchUrl({ name: searchLabel });
  const requestEmail = `mailto:contact@bestdaam.in?subject=${encodeURIComponent(
    "BestDaam product request"
  )}&body=${encodeURIComponent(
    `Please add this product to BestDaam:\n\n${query.trim()}`
  )}`;

  return (
    <>
      <section className="hero">
        <h1>Ek product, saare stores ke daam 💰</h1>
        <p>
          Amazon, Flipkart, Croma aur Reliance Digital ke prices compare karo —
          sabse sasta chuno.
        </p>

        <input
          type="search"
          className="search-box"
          placeholder="Product search karo... jaise iPhone, laptop, earbuds"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="category-row">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {missingProduct ? (
        <div className="no-results missing-product">
          <h2>Ye product abhi BestDaam catalog me nahi mila</h2>
          <p>
            Amazon par abhi search kar sakte ho, ya hume request bhejo. Hum
            verified price milne par product catalog me add karenge.
          </p>
          <div className="missing-product-actions">
            <a
              href={amazonSearchUrl}
              className="buy-btn amazon-search-btn"
              target="_blank"
              rel="nofollow sponsored noopener"
            >
              Amazon par search karein
            </a>
            <a href={requestEmail} className="request-product-btn">
              Product add karne ki request bhejein
            </a>
          </div>
        </div>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="card">
              <div className="card-media">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="card-image"
                    loading="lazy"
                  />
                ) : (
                  <div className="emoji">{p.emoji}</div>
                )}
              </div>

              <h3>{p.name}</h3>

              <div className="from">Sabse sasta daam</div>

              <div className="price">
                {formatINR(getLowestPrice(p))}
                {p.prices.length > 1 ? " se" : ""}
              </div>

              <div className="stores">
                {p.prices.length > 1
                  ? `${p.prices.length} stores par compare`
                  : "1 verified price • Amazon par bhi dekhein"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
