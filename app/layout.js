import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import VisitTracker from "./components/VisitTracker";
import SavedProductsNav from "./components/SavedProductsNav";
import { absoluteUrl, safeJsonLd } from "../lib/seo";

export const metadata = {
  metadataBase: new URL("https://bestdaam.in"),
  other: {
    "verify-admitad": "f9807017ed",
  },
  title: "BestDaam — Compare Prices. Buy Smarter.",
  description:
    "Compare product prices across leading Indian online stores and find the best deal before you buy.",
  openGraph: {
    title: "BestDaam — Compare Prices. Buy Smarter.",
    description:
      "Compare prices across leading Indian stores and choose the best deal.",
    url: "https://bestdaam.in",
    siteName: "BestDaam",
    locale: "en_IN",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "BestDaam — Compare Prices. Buy Smarter.",
    description:
      "Compare prices across leading Indian stores and choose the best deal.",
  },
};

export default function RootLayout({ children }) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#website`,
        url: absoluteUrl("/"),
        name: "BestDaam",
        alternateName: "Best Daam",
        inLanguage: "en-IN",
      },
      {
        "@type": "Organization",
        "@id": `${absoluteUrl("/")}#organization`,
        name: "BestDaam",
        url: absoluteUrl("/"),
      },
    ],
  };

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <div className="brand-lockup">
              <Link href="/" className="logo" aria-label="BestDaam home">
                Best<span>Daam</span>
              </Link>
              <span className="brand-dot">IN</span>
            </div>
            <nav className="header-nav" aria-label="Main navigation">
              <SavedProductsNav />
              <Link href="/trending">Trending</Link>
              <Link href="/deals">Today&apos;s deals</Link>
              <Link href="/about">How it works</Link>
              <Link href="/disclosure">Affiliate disclosure</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(websiteJsonLd) }}
        />
        <footer className="site-footer">
          <div className="container">
            <nav className="footer-links">
              <Link href="/about">About</Link>
              <Link href="/disclosure">Affiliate Disclosure</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </nav>
            <p>
              Prices and availability can change. Always confirm the final
              price on the retailer&apos;s website before purchasing.
            </p>
            <p>© {new Date().getFullYear()} BestDaam. Made for smarter shopping in India.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
