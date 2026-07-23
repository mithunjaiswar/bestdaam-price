"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getCategories,
  getLowestPrice,
  formatINR,
} from "../../lib/helpers";

export default function HomeClient({ products }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Sab");

  const categories = ["Sab", ...getCategories(products)];

  const looksLikeUrl =
    query.trim().startsWith("http") ||
    query.includes("www.") ||
    query.includes(".com") ||
    query.includes(".in/");

  const results = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Sab" || p.category === category;

    return matchesQuery && matchesCategory;
  });

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

      {looksLikeUrl ? (
        <p className="no-results">
          Link se search abhi kaam nahi karta 🙏 — product ka{" "}
          <strong>naam</strong> likho. Jo product yahan na mile, hume{" "}
          <a href="mailto:contact@bestdaam.in">email</a> kar do — hum jod denge!
        </p>
      ) : results.length === 0 ? (
        <p className="no-results">
          Kuch nahi mila 😕 — koi aur naam try karo. Jo product yahan nahi hai,
          hume <a href="mailto:contact@bestdaam.in">email</a> kar do — hum jod
          denge!
        </p>
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
