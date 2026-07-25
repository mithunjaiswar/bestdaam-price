"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

const PRODUCT_REQUEST_URL =
  process.env.NEXT_PUBLIC_PRODUCT_REQUEST_URL ||
  "https://script.google.com/macros/s/AKfycbwAtwt08dqP0Hx2QonKSrJITCR_CxIKY_FUZmjn_qJUabK_1ueIxuG0xwESbwa5TSH0/exec";

export default function HomeClient({ products }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "Sab";
  const initialSort = searchParams.get("sort") || "default";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [requestState, setRequestState] = useState("idle");
  const restoredScroll = useRef(false);

  const categories = ["Sab", ...getCategories(products)];
  const selectedCategory = categories.includes(category) ? category : "Sab";
  const hasQuery = query.trim().length > 0;

  const filteredResults = searchProducts(products, query).filter((p) => {
    const matchesCategory =
      hasQuery ||
      selectedCategory === "Sab" ||
      p.category === selectedCategory;
    return matchesCategory;
  });
  const selectedSort = [
    "default",
    "price-low-high",
    "price-high-low",
  ].includes(sortOrder)
    ? sortOrder
    : "default";
  const results = [...filteredResults];

  if (selectedSort === "price-low-high") {
    results.sort((a, b) => getLowestPrice(a) - getLowestPrice(b));
  } else if (selectedSort === "price-high-low") {
    results.sort((a, b) => getLowestPrice(b) - getLowestPrice(a));
  }
  const missingProduct = hasQuery && results.length === 0;
  const searchLabel = getSearchLabel(query);
  const amazonSearchUrl = getAmazonSearchUrl({ name: searchLabel });
  const requestEndpoint = PRODUCT_REQUEST_URL;

  useEffect(() => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    }

    if (selectedCategory !== "Sab") {
      params.set("category", selectedCategory);
    }

    if (selectedSort !== "default") {
      params.set("sort", selectedSort);
    }

    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [query, router, selectedCategory, selectedSort]);

  useEffect(() => {
    if (restoredScroll.current) {
      return;
    }

    restoredScroll.current = true;
    const savedScroll = Number(
      window.sessionStorage.getItem("bestdaam-home-scroll")
    );

    if (!Number.isFinite(savedScroll) || savedScroll <= 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: savedScroll, behavior: "auto" });
      });
    });
  }, []);

  function rememberHomePosition() {
    window.sessionStorage.setItem(
      "bestdaam-home-scroll",
      String(window.scrollY)
    );
    window.sessionStorage.setItem(
      "bestdaam-home-url",
      `${window.location.pathname}${window.location.search}`
    );
  }

  async function requestProduct() {
    if (!requestEndpoint || requestState === "sending") {
      return;
    }

    setRequestState("sending");

    try {
      const body = new URLSearchParams({
        action: "submit",
        query: query.trim(),
        label: searchLabel,
        source: "bestdaam.in",
        website: "",
      });

      await fetch(requestEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      setRequestState("sent");
    } catch {
      setRequestState("error");
    }
  }

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
          onChange={(e) => {
            setQuery(e.target.value);
            setRequestState("idle");
          }}
          autoFocus
        />

        <div className="category-row">
          {categories.map((c) => (
            <button
              key={c}
              className={`chip ${selectedCategory === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="results-toolbar">
          <p>{results.length} products</p>
          <label className="sort-control">
            <span>Sort by</span>
            <select
              value={selectedSort}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Products sort karein"
            >
              <option value="default">Default</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </label>
        </div>
      </section>

      {missingProduct ? (
        <div className="no-results missing-product">
          <h2>Ye product abhi BestDaam catalog me nahi mila</h2>
          <p>
            Amazon par abhi search kar sakte ho, ya ek click me request save
            karo. Subah ke daily update me hum verified product add karne ki
            koshish karenge.
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
            <button
              type="button"
              className="request-product-btn"
              onClick={requestProduct}
              disabled={!requestEndpoint || requestState === "sending" || requestState === "sent"}
            >
              {requestState === "sending"
                ? "Request save ho rahi hai..."
                : requestState === "sent"
                  ? "Request save ho gayi ✓"
                  : "Is product ko add karein"}
            </button>
          </div>
          {requestState === "sent" ? (
            <p className="request-status success">
              Ho gaya! Request note ho gayi. Verified listing milne par agle
              daily update me product dikhega.
            </p>
          ) : null}
          {requestState === "error" ? (
            <p className="request-status error">
              Request save nahi hui. Thodi der baad dobara try karein.
            </p>
          ) : null}
          {!requestEndpoint ? (
            <p className="request-status error">
              Product-request service setup ho rahi hai. Filhaal Amazon search
              use karein.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="card"
              onClick={rememberHomePosition}
            >
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
