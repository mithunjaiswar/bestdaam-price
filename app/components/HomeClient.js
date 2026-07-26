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
  const initialCategory = searchParams.get("category") || "All";
  const initialStore = searchParams.get("store") || "All";
  const initialSort = searchParams.get("sort") || "default";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [store, setStore] = useState(initialStore);
  const [sortOrder, setSortOrder] = useState(initialSort);
  const [requestState, setRequestState] = useState("idle");
  const restoredScroll = useRef(false);

  const categories = ["All", ...getCategories(products)];
  const stores = [
    "All",
    ...Array.from(
      new Set(
        products.flatMap((product) =>
          (product.prices || []).map((entry) => entry.store).filter(Boolean)
        )
      )
    ).sort((a, b) => a.localeCompare(b)),
  ];
  const selectedCategory = categories.includes(category) ? category : "All";
  const selectedStore = stores.includes(store) ? store : "All";
  const hasQuery = query.trim().length > 0;

  const searchedResults = searchProducts(products, query);
  const filteredResults = searchedResults.filter((p) => {
    const matchesCategory =
      hasQuery ||
      selectedCategory === "All" ||
      p.category === selectedCategory;
    const matchesStore =
      selectedStore === "All" ||
      (p.prices || []).some((entry) => entry.store === selectedStore);
    return matchesCategory && matchesStore;
  });
  const selectedSort = [
    "default",
    "price-low-high",
    "price-high-low",
  ].includes(sortOrder)
    ? sortOrder
    : "default";
  const results = [...filteredResults];
  const priceForSelectedStore = (product) => {
    if (selectedStore === "All") {
      return getLowestPrice(product);
    }

    const storePrices = (product.prices || [])
      .filter((entry) => entry.store === selectedStore)
      .map((entry) => entry.price)
      .filter((price) => typeof price === "number" && price > 0);

    return storePrices.length ? Math.min(...storePrices) : getLowestPrice(product);
  };

  if (selectedSort === "price-low-high") {
    results.sort((a, b) => priceForSelectedStore(a) - priceForSelectedStore(b));
  } else if (selectedSort === "price-high-low") {
    results.sort((a, b) => priceForSelectedStore(b) - priceForSelectedStore(a));
  }
  const missingProduct = hasQuery && searchedResults.length === 0;
  const emptyStoreResults = !missingProduct && results.length === 0;
  const searchLabel = getSearchLabel(query);
  const amazonSearchUrl = getAmazonSearchUrl({ name: searchLabel });
  const requestEndpoint = PRODUCT_REQUEST_URL;

  useEffect(() => {
    const params = new URLSearchParams();
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      params.set("q", normalizedQuery);
    }

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    if (selectedStore !== "All") {
      params.set("store", selectedStore);
    }

    if (selectedSort !== "default") {
      params.set("sort", selectedSort);
    }

    const nextUrl = params.toString() ? `/?${params.toString()}` : "/";
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [query, router, selectedCategory, selectedSort, selectedStore]);

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
        <div className="hero-eyebrow">
          <span className="status-dot" />
          Prices refreshed daily
        </div>
        <h1>
          Find the best price.
          <span> Before you buy.</span>
        </h1>
        <p>
          Search once, compare trusted stores, and shop with confidence.
          BestDaam makes every deal easier to understand.
        </p>

        <div className="search-shell">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            className="search-box"
            placeholder="Search by product name or paste a product link"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setRequestState("idle");
            }}
            autoFocus
          />
          <span className="search-hint">Search</span>
        </div>

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
          <div>
            <span className="results-kicker">Explore our catalog</span>
            <p>{results.length.toLocaleString("en-IN")} products found</p>
          </div>
          <div className="filter-controls">
            <label className="sort-control">
              <span>Store</span>
              <select
                value={selectedStore}
                onChange={(event) => setStore(event.target.value)}
                aria-label="Filter products by store"
              >
                {stores.map((storeName) => (
                  <option key={storeName} value={storeName}>
                    {storeName === "All" ? "All stores" : storeName}
                  </option>
                ))}
              </select>
            </label>
            <label className="sort-control">
              <span>Sort by</span>
              <select
                value={selectedSort}
                onChange={(event) => setSortOrder(event.target.value)}
                aria-label="Sort products"
              >
                <option value="default">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {missingProduct ? (
        <div className="no-results missing-product">
          <span className="empty-icon">⌕</span>
          <h2>We could not find this product yet</h2>
          <p>
            Search for it on Amazon now, or send us a one-click request. We
            will try to include a verified listing in an upcoming catalog update.
          </p>
          <div className="missing-product-actions">
            <a
              href={amazonSearchUrl}
              className="buy-btn amazon-search-btn"
              target="_blank"
              rel="nofollow sponsored noopener"
            >
              Search on Amazon
            </a>
            <button
              type="button"
              className="request-product-btn"
              onClick={requestProduct}
              disabled={!requestEndpoint || requestState === "sending" || requestState === "sent"}
            >
              {requestState === "sending"
                ? "Saving request…"
                : requestState === "sent"
                  ? "Request saved ✓"
                  : "Request this product"}
            </button>
          </div>
          {requestState === "sent" ? (
            <p className="request-status success">
              Request received. Once verified, the product may appear in a
              future catalog update.
            </p>
          ) : null}
          {requestState === "error" ? (
            <p className="request-status error">
              We could not save the request. Please try again shortly.
            </p>
          ) : null}
          {!requestEndpoint ? (
            <p className="request-status error">
              Product requests are temporarily unavailable. Please use Amazon
              search for now.
            </p>
          ) : null}
        </div>
      ) : emptyStoreResults ? (
        <div className="no-results">
          <span className="empty-icon">⌕</span>
          <h2>No products available for these filters</h2>
          <p>Try selecting another store or category.</p>
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

              <span className="card-category">{p.category}</span>
              <h3>{p.name}</h3>

              <div className="from">Best available price</div>

              <div className="price">
                {formatINR(priceForSelectedStore(p))}
                {selectedStore === "All" && p.prices.length > 1 ? " onwards" : ""}
              </div>

              <div className="stores">
                {selectedStore !== "All"
                  ? `Available on ${selectedStore}`
                  : p.prices.length > 1
                  ? `Compare across ${p.prices.length} stores`
                  : "1 verified price"}
              </div>
              <div className="card-cta">
                Compare prices <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
