"use client";

import { useState } from "react";
import { formatINR } from "../../lib/helpers";
import { trackEvent } from "../../lib/tracking";

function buildShareUrl(productId, source) {
  const url = new URL(`/product/${productId}`, "https://bestdaam.in");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "deal_share");
  return url.toString();
}

function shareText(product, price) {
  return `🔥 Affordable Deal\n\n${product.name}\nCurrent price: ${formatINR(
    price
  )}\n\nCompare prices on BestDaam.\nPrices may change. Affiliate link.`;
}

export default function ShareButtons({ product, price }) {
  const [copied, setCopied] = useState(false);

  function recordShare(channel) {
    trackEvent("share", {
      productId: product.id,
      productName: product.name,
      category: product.category,
      value: price,
      store: channel,
    });
  }

  async function copyLink() {
    const url = buildShareUrl(product.id, "copy_link");
    await navigator.clipboard.writeText(url);
    setCopied(true);
    recordShare("copy_link");
    window.setTimeout(() => setCopied(false), 1800);
  }

  const whatsappUrl =
    "https://wa.me/?text=" +
    encodeURIComponent(
      `${shareText(product, price)}\n\n${buildShareUrl(
        product.id,
        "whatsapp"
      )}`
    );
  const telegramUrl =
    "https://t.me/share/url?url=" +
    encodeURIComponent(buildShareUrl(product.id, "telegram")) +
    "&text=" +
    encodeURIComponent(shareText(product, price));

  return (
    <section className="share-panel" aria-label="Share this deal">
      <div>
        <span className="share-eyebrow">Share this deal</span>
        <p>Help someone compare before they buy.</p>
      </div>
      <div className="share-actions">
        <a
          href={whatsappUrl}
          className="share-btn whatsapp"
          target="_blank"
          rel="noopener"
          onClick={() => recordShare("whatsapp")}
        >
          WhatsApp
        </a>
        <a
          href={telegramUrl}
          className="share-btn telegram"
          target="_blank"
          rel="noopener"
          onClick={() => recordShare("telegram")}
        >
          Telegram
        </a>
        <button type="button" className="share-btn copy" onClick={copyLink}>
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </section>
  );
}
