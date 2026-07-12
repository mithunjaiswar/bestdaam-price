"use client";

import { useState } from "react";
import Link from "next/link";
import {
  getAllProducts,
  getCategories,
  getLowestPrice,
  formatINR,
} from "../lib/products";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Sab");

  const categories = ["Sab", ...getCategories()];

  const results = getAllProducts().filter((p) => {
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
          placeholder="Product search karo... jaise iPhone, mixer, earbuds"
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

      {results.length === 0 ? (
        <p className="no-results">
          Kuch nahi mila 😕 — koi aur naam try karo (jaise “laptop” ya
          “watch”).
        </p>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} className="card">
              <div className="emoji">{p.emoji}</div>
              <h3>{p.name}</h3>
              <div className="from">Sabse sasta daam</div>
              <div className="price">{formatINR(getLowestPrice(p))} se</div>
              <div className="stores">{p.prices.length} stores par compare</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
