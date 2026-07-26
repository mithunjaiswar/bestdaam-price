"use client";

import { trackEvent } from "../../lib/tracking";

export default function StoreDealLink({
  href,
  product,
  store,
  price,
  className = "buy-btn",
  children,
}) {
  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="nofollow sponsored noopener"
      onClick={() =>
        trackEvent("store_click", {
          productId: product.id,
          productName: product.name,
          category: product.category,
          store,
          value: price,
        })
      }
    >
      {children}
    </a>
  );
}
