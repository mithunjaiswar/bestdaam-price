"use client";

import Link from "next/link";
import { trackEvent } from "../../lib/tracking";

export default function LatestOfferRail({ offers = [] }) {
  if (!offers.length) return null;

  return (
    <section className="latest-offer-section" aria-labelledby="latest-offer-title">
      <div className="section-heading-row latest-offer-heading">
        <div>
          <span className="results-kicker">Auto-updated offers</span>
          <h2 id="latest-offer-title">Fresh deals right now</h2>
          <p className="section-subtitle">
            Converted partner links from our deal channel. Always verify the final price.
          </p>
        </div>
        <Link href="/deals#limited-time-offers" className="text-link">
          See all live offers →
        </Link>
      </div>

      <div className="latest-offer-rail">
        {offers.map((offer) => (
          <a
            key={offer.id}
            href={offer.destinationUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="latest-offer-card"
            onClick={() =>
              trackEvent("outbound_store_click", {
                store: offer.merchant,
                source: "homepage_live_offer",
                offerId: offer.id,
              })
            }
          >
            <img src={offer.image} alt="" loading="lazy" />
            <div className="latest-offer-copy">
              <div className="latest-offer-meta">
                <span>{offer.merchant}</span>
                <strong>{offer.discountLabel}</strong>
              </div>
              <h3>{offer.title}</h3>
              <span className="latest-offer-cta">Check offer ↗</span>
            </div>
          </a>
        ))}
      </div>

      <div className="offer-trust-row" aria-label="Offer information">
        <span>↻ Refreshed every 30 minutes</span>
        <span>✓ Affiliate links converted</span>
        <span>₹ Final price confirmed on retailer</span>
        <a href="https://web.telegram.org/k/#@pricevichar" target="_blank" rel="noopener">
          Get instant alerts on Telegram →
        </a>
      </div>
    </section>
  );
}
