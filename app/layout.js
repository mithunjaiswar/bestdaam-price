import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "BestDaam — Sabse Sasta Daam, Ek Jagah",
  description:
    "India ke top online stores (Amazon, Flipkart, Croma, Reliance Digital) par products ke prices compare karo aur sabse saste daam par kharido.",
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
            <p>
              ⚠️ Abhi ye demo version hai — prices sample hain, asli nahi.
              (Phase 1)
            </p>
            <p>© {new Date().getFullYear()} BestDaam.in</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
