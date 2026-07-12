import "./globals.css";
import Link from "next/link";

export const metadata = {
  metadataBase: new URL("https://bestdaam.in"),
  other: {
    "verify-admitad": "f9807017ed",
  },
  title: "BestDaam — Sabse Sasta Daam, Ek Jagah",
  description:
    "India ke top online stores (Amazon, Flipkart, Croma, Reliance Digital) par products ke prices compare karo aur sabse saste daam par kharido.",
  openGraph: {
    title: "BestDaam — Sabse Sasta Daam, Ek Jagah",
    description:
      "Amazon, Flipkart, Croma aur Reliance Digital ke prices ek jagah compare karo.",
    url: "https://bestdaam.in",
    siteName: "BestDaam",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="logo">
              Best<span>Daam</span>.in
            </Link>
            <p className="tagline">Sabse Sasta Daam, Ek Jagah 🇮🇳</p>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <nav className="footer-links">
              <Link href="/about">About</Link>
              <Link href="/disclosure">Affiliate Disclosure</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </nav>
            <p>
              ⚠️ Abhi ye demo version hai — prices sample hain, asli nahi.
            </p>
            <p>© {new Date().getFullYear()} BestDaam.in</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
