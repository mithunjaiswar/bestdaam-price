"use client";

import { trackEvent } from "../../lib/tracking";

export default function AmazonCampaignLink({ href, query, category, children }) {
  return (
    <a
      href={href}
      className="buy-btn amazon-campaign-button"
      target="_blank"
      rel="nofollow sponsored noopener"
      onClick={() =>
        trackEvent("amazon_campaign_click", {
          productName: query,
          category,
          store: "Amazon",
          query,
        })
      }
    >
      {children}
    </a>
  );
}
