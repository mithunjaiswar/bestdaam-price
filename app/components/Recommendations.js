"use client";

import Link from "next/link";
import picks from "../../data/recommendations.json";
import { trackEvent } from "../../lib/tracking";
import styles from "./Recommendations.module.css";

export default function Recommendations({ compact = false }) {
  return (
    <section id="recommendations" className={styles.section} aria-labelledby="recommendations-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Seen it on Instagram or YouTube?</p>
          {compact ? <h2 id="recommendations-title">Recommended by PriceVichar</h2> : <h1 id="recommendations-title">Shop our video picks</h1>}
          <p>Found your favourite? Go straight to the product on Amazon.</p>
        </div>
        {compact && <Link className="text-link" href="/recommendations">All recommendations →</Link>}
      </div>
      {picks.map((pick) => (
        <article id={pick.id} className={styles.card} key={pick.id}>
          <div className={styles.media}>
            {compact ? (
              <Link href={`/recommendations#${pick.id}`} aria-label={`Watch the video for ${pick.name}`}>
                <img src={pick.poster} alt="Preview of our AI presenter featuring clip-on hoop earrings" width="540" height="960" />
                <span className={styles.play}>▶ Watch the reel</span>
              </Link>
            ) : (
              <video controls playsInline preload="none" poster={pick.poster} width="540" height="960" aria-label={`PriceVichar video featuring ${pick.name}`}>
                <source src={pick.video} type="video/mp4" />
                Your browser does not support video. You can still shop using the Amazon button.
              </video>
            )}
          </div>
          <div className={styles.copy}>
            <span className={styles.badge}>Featured in our latest reel</span>
            <p className={styles.brand}>{pick.brand}</p>
            <h2>{pick.name}</h2>
            <p>{pick.description}</p>
            <a className={`buy-btn ${styles.buy}`} href={pick.affiliateUrl} target="_blank" rel="sponsored nofollow noopener" onClick={() => trackEvent("outbound_store_click", {productId: pick.id, productName: pick.name, category: pick.category, store: "Amazon", query: "recommendations"})}>
              Check price & buy on Amazon ↗
            </a>
            <p className={styles.note}>Opens the exact product. Price and availability are confirmed on Amazon.</p>
            <p className={styles.note}>AI-generated presenter; video is illustrative. Refer to Amazon for the actual product details.</p>
          </div>
        </article>
      ))}
      <p className={styles.disclosure}>As an Amazon Associate, we earn from qualifying purchases. <Link href="/disclosure">Affiliate disclosure</Link></p>
    </section>
  );
}
