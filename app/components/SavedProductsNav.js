"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getSavedProductIds,
  SAVED_PRODUCTS_EVENT,
} from "../../lib/saved-products";

export default function SavedProductsNav() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(getSavedProductIds().length);

    refresh();
    window.addEventListener(SAVED_PRODUCTS_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SAVED_PRODUCTS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <Link href="/saved" className="saved-nav-link">
      <span aria-hidden="true">♡</span>
      Saved
      {count > 0 && <strong>{count}</strong>}
    </Link>
  );
}

