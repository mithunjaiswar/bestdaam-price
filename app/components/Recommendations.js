"use client";

import Link from "next/link";
import picks from "../../data/recommendations.json";
import { trackEvent } from "../../lib/tracking";
import styles from "./Recommendations.module.css";

export default function Recommendations({ compact = false, productId }) {
  const detailed = Boolean(productId);
  const products = detailed ? picks.filter((pick) => pick.id === productId) : compact ? picks.slice(0, 3) : picks;
  return (
    <section id="recommendations" className={styles.section} aria-labelledby="recommendations-title">
      {detailed ? <Link className={styles.back} href="/recommendations">← All recommendations</Link> : null}
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>{detailed ? products[0]?.category : "Our product recommendations"}</p>
          {compact ? <h2 id="recommendations-title">Recommended by PriceVichar</h2> : <h1 id="recommendations-title">{detailed ? products[0]?.name : "Recommended by PriceVichar"}</h1>}
          {!detailed && <p>Explore our picks, check the details and shop directly on Amazon.</p>}
        </div>
        {compact && <Link className="text-link" href="/recommendations">All recommendations →</Link>}
      </div>
      <div className={styles.products}>
        {products.map((pick) => (
          <article id={pick.id} className={`${styles.card} ${detailed ? styles.detail : ""}`} key={pick.id}>
            <div className={styles.media}>
              <Link href={`/recommendations/${pick.id}`} aria-label={`View details for ${pick.name}`}>
                <img src={pick.image} alt={`${pick.brand} stainless steel non-piercing hoop earrings`} width="600" height="600" referrerPolicy="no-referrer" />
              </Link>
            </div>
            <div className={styles.copy}>
              <span className={styles.badge}>{pick.category}</span>
              <p className={styles.brand}>{pick.brand}</p>
              <h2>{detailed ? pick.fullName || pick.name : <Link href={`/recommendations/${pick.id}`}>{pick.name}</Link>}</h2>
              <p>{pick.description}</p>
              {detailed && <ul className={styles.features}>{pick.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>}
              <div className={styles.actions}>
                {!detailed && <Link className="secondary-btn" href={`/recommendations/${pick.id}`}>View product details →</Link>}
                <a className={`buy-btn ${styles.buy}`} href={pick.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" onClick={() => trackEvent("outbound_store_click", {productId: pick.id, productName: pick.name, category: pick.category, store: "Amazon", query: "recommendations"})}>
                  Check price & buy on Amazon ↗
                </a>
              </div>
              <p className={styles.note}>Check the current price, selected variant, delivery and returns on Amazon before ordering.</p>
              <div className={styles.social} aria-label="PriceVichar social videos">
                <span>Watch our videos:</span>
                <a href={pick.youtubeUrl} target="_blank" rel="noopener noreferrer">YouTube ↗</a>
                <a href={pick.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
              </div>
            </div>
            {detailed && <div className={styles.specs}>
              <h2>Product details</h2>
              <dl>{Object.entries(pick.specifications).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              <p className={styles.note}>Details are based on the seller&apos;s listing. Confirm the exact size, finish and pack contents on Amazon.</p>
            </div>}
          </article>
        ))}
      </div>
      <p className={styles.disclosure}>As an Amazon Associate, we earn from qualifying purchases. <Link href="/disclosure">Affiliate disclosure</Link></p>
    </section>
  );
}
