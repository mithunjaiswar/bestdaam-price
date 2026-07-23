### 2026-07-23 — Codex — Wired Earphones category added
- Kya badla: Wired Earphones ki 96-product category catalog me add ki aur sabhi naye Flipkart links par EK Affiliaters/EarnKaro affiliateUrl lagaya.
- Kyun: BestDaam par wired earphones ko earbuds/headphones se alag category me dikhane aur outbound Flipkart clicks ko affiliate tracking ke through route karne ke liye.
- Kaunsi files: data/products.json, PROJECT-LOG.md. Local scraper me categories.json, single-category runners, category filter aur exporter preservation logic update hua.
- Dhyan rakhna: Catalog me ab 1092 products, 96 Wired Earphones aur 1092/1092 Flipkart affiliate links hain. Generated backup scraper ke output/backups folder me rakha hai; repo me commit nahi karna.

### 2026-07-22 — ChatGPT — EarnKaro affiliate links enabled
- Kya badla: 996 Flipkart product URLs ko EK Affiliaters/EarnKaro API se affiliate short links me convert karke products.json me affiliateUrl field add kiya.
- Kyun: BestDaam ke Flipkart outbound clicks ko EarnKaro affiliate tracking ke through route karne ke liye.
- Kaunsi files: data/products.json, lib/helpers.js, PROJECT-LOG.md. Local script used: apply_ekaro_api_links.py.
- Dhyan rakhna: API token local environment variable me use hua; token repo me commit nahi kiya gaya. AffiliateUrl missing ho to normal URL fallback rahega.

### 2026-07-22 — ChatGPT — EarnKaro affiliate links enabled
- Kya badla: 996 Flipkart product URLs ko EK Affiliaters/EarnKaro API se affiliate short links me convert karke products.json me affiliateUrl field add kiya.
- Kyun: BestDaam ke Flipkart outbound clicks ko EarnKaro affiliate tracking ke through route karne ke liye.
- Kaunsi files: data/products.json, lib/helpers.js, PROJECT-LOG.md. Local script used: apply_ekaro_api_links.py.
- Dhyan rakhna: API token local environment variable me use hua; token repo me commit nahi kiya gaya. AffiliateUrl missing ho to normal URL fallback rahega.
### 2026-07-22 — ChatGPT — 996-product catalog with images
- Kya badla: Local scraper output se 996 product catalog generate kiya, 10 categories ke saath. Product cards aur product detail pages par real Flipkart product images show karne ka UI add kiya.
- Kyun: BestDaam live site ko demo/sample products se real product catalog experience tak le jaane ke liye.
- Kaunsi files: data/products.json, app/components/HomeClient.js, app/product/[id]/page.js, app/globals.css, local exporter used: export_catalog_to_bestdaam.py.
- Dhyan rakhna: Images Flipkart product image URLs se aa rahe hain. Amazon scraped images live par use nahi kiye. Amazon direct scraping code live repo me push nahi kiya gaya.
# 📒 BestDaam.in — PROJECT LOG (sab AI ke liye)

> **YE FILE KYUN HAI:** Is project par 3 AI kaam karte hain — **Claude**, **Gemini**,
> aur **ChatGPT** — aur owner **Mithun Jaiswar** (non-technical, Hinglish me baat
> karte hain). Ye file project ki **ek hi sacchai (single source of truth)** hai.
>
> ## ⚠️ HAR AI KE LIYE RULES — change karne se PEHLE padho
> 1. **Pehle ye poori file padho** — phir koi change karo.
> 2. **Har change ke baad neeche LOG section me ek nayi entry likho** (format diya
>    hai). Bina log entry ke kuch bhi commit mat karo.
> 3. **Doosre AI ka kaam mat todo** — koi file delete/rewrite karne se pehle log
>    me dekho wo kyun bani thi.
> 4. **Scraping mat karo** — Amazon/Flipkart ka scraping (direct, sheet formula,
>    kisi bhi tarike se) MANA hai. Isse Mithun ka Amazon Associates account ban
>    ho sakta hai. Legal raasta: 3 sales ke baad Amazon PA-API, ya affiliate
>    network ke official feeds (Admitad/Cuelinks).
> 5. **Secrets kabhi is repo me mat likho** — password, OTP, bank/PAN, API secret
>    keys. Sirf public IDs (affiliate tag, Sheet ID) allowed hain.
> 6. **Push sirf branch `claude/india-price-comparison-zb7xou` par hota hai** —
>    yahi branch Vercel par live deploy hoti hai. (Doosra AI apni branch use kare
>    to Mithun se pooch kar merge plan banaye.)
> 7. Mithun **non-technical** hain — unhe simple Hinglish me samjhao, jargon nahi.

---

## 🗂️ PROJECT SNAPSHOT (21 July 2026)

| Cheez | Detail |
|---|---|
| Live site | https://bestdaam.in (Vercel, har git push par auto-deploy) |
| Kya hai | India price comparison — Amazon/Flipkart/Croma/Reliance ke daam compare |
| Tech | Next.js 14 (App Router), JavaScript, plain CSS — **no TypeScript, no Tailwind** |
| Repo | github.com/mithunjaiswar/bestdaam-price |
| Live branch | `claude/india-price-comparison-zb7xou` |
| Products | 45 (Google Sheet se aate hain, ~10 min me site par) |
| Product Sheet | Sheet ID `1NQZgDW12nG1Gu2BCxEKndAZMDxl5cW6KEerBC4aJ5n8`, tab "Products", Mithun ke personal Gmail me, "Anyone with link: Viewer" |
| Amazon Associates | ID: `bestdaam0a-21` — tax info pending; **target: 180 din me 3 sales** (account pakka + PA-API unlock) |
| EarnKaro | 6 products par Flipkart profit links (fktr.in) |
| Admitad | Site verified (meta tag `f9807017ed`) — abhi saare program requests REJECTED (naya site, traffic kam; baad me dobara try) |
| Cuelinks | Signup ho gaya, approval PENDING |
| Domain | GoDaddy se, .IN KYC done, DNS: A @ → 76.76.21.21, CNAME www → cname.vercel-dns.com |
| Final goal | Stage 7 — apna "BestDaam Store" comparison me sabse saste daam ke saath (ROADMAP.md dekho) |

### Important files — kya kahan hai
- `lib/products.js` — Google Sheet se products fetch (CSV export, 10 min cache, fail hone par `data/products.json` fallback). **Server-only.**
- `lib/helpers.js` — display helpers (formatINR, getLowestPrice, getStoreUrl...). Client-safe. Amazon tag yahin hai.
- `data/products.json` — 45 products ka backup snapshot (sheet ka mirror).
- `app/page.js` + `app/components/HomeClient.js` — homepage (search + category filter).
- `app/product/[id]/page.js` — comparison page (SABSE SASTA badge, price history graph, JSON-LD schema).
- `app/components/PriceHistoryChart.js` — SVG graph (abhi demo data — deterministic random walk).
- `app/about|disclosure|privacy/page.js` — legal pages (Amazon approval ke liye zaroori — **mat hatao**).
- `app/sitemap.js`, `app/robots.js` — SEO.
- `ROADMAP.md` — 7-stage plan. `ARCHITECTURE.md` — technical plan.

### Sheet ka column format (badla to site toot jayegi)
`id, name, category, emoji, amazon_price, amazon_url, flipkart_price, flipkart_url, croma_price, croma_url, reliance_price, reliance_url`
- `name` + kam se kam ek price zaroori; `id` khali ho to name se auto-ban jata hai.
- `url` khali/`#` ho to: Amazon ke liye tagged search-link banta hai, baaki stores ke liye "Jald aayega" dikhta hai.

---

## 📝 LOG — nayi entry SABSE UPAR likho

### Entry format (copy karke bharo):
```
### YYYY-MM-DD — [AI ka naam] — chhota title
- Kya badla: ...
- Kyun: ...
- Kaunsi files: ...
- Dhyan rakhna: (agli AI ke liye koi warning/note, warna "kuch nahi")
```

---

### 2026-07-21 — Claude — PROJECT-LOG.md banaya
- Kya badla: Ye log file banayi taaki 3 AI (Claude/Gemini/GPT) ek doosre ka kaam
  samajh sakein aur na todein.
- Kyun: Mithun ne bola ki har change ka record ek jagah ho.
- Kaunsi files: `PROJECT-LOG.md` (nayi)
- Dhyan rakhna: Har AI change ke baad yahan entry likhe — ye rule hai.

### 2026-07-13 — Claude — Roadmap me Stage 7 (final goal) joda
- Kya badla: ROADMAP.md me "Apna BestDaam Store" stage joda — comparison me apna
  store sabse saste daam ke saath. Roadmap ka web page + PDF bhi banaya.
- Kaunsi files: `ROADMAP.md`
- Dhyan rakhna: Ye Mithun ka FINAL GOAL hai — roadmap se kabhi mat hatana.

### 2026-07-13 — Claude — Catalog naye public Google Sheet se joda
- Kya badla: SHEET_ID update karke Mithun ke personal Gmail wali sheet lagayi
  (work account sheet public share nahi ho sakti thi — company policy).
- Kaunsi files: `lib/products.js`
- Dhyan rakhna: Sheet "Anyone with link: Viewer" honi chahiye — private hui to
  site chupchap `data/products.json` fallback par chali jayegi (error nahi degi).

### 2026-07-12 — Claude — Google Sheet ko product catalog banaya
- Kya badla: Site ab products Google Sheet ke CSV export se padhti hai (10 min
  cache). Sheet fail ho to `data/products.json` fallback. Quote-aware CSV parser.
- Kyun: Mithun bina code chhue khud products/prices update kar sakein.
- Kaunsi files: `lib/products.js` (nayi), `app/page.js`, `app/product/[id]/page.js`, `app/sitemap.js`
- Dhyan rakhna: `lib/products.js` server-only hai — client component me import
  mat karna. Display helpers `lib/helpers.js` me hain.

### 2026-07-12 — Claude — Admitad verification meta tag
- Kaunsi files: `app/layout.js` (`verify-admitad: f9807017ed`)
- Dhyan rakhna: Ye tag mat hatana — Admitad ownership isi se verify hota hai.

### 2026-07-11 — Claude — EarnKaro Flipkart profit links (6 products)
- Kya badla: 6 products ke Flipkart entries par fktr.in affiliate links lage
  (iPhone 15, Galaxy M35, boAt 141, Prestige mixer, Noise ColorFit, Wildcraft bag).
- Kaunsi files: `data/products.json` (ab sheet me bhi yahi links hain)
- Dhyan rakhna: Naye EarnKaro links Mithun khud banate hain (unka account hai).

### 2026-07-11 — Claude — Amazon Associates wiring + catalog 45 products
- Kya badla: Amazon tag `bestdaam0a-21` laga; jis Amazon entry ka url khali ho
  uske liye tagged search-link auto-banta hai (`getStoreUrl` in `lib/helpers.js`).
  Catalog 12 → 45 products.
- Kaunsi files: `lib/helpers.js`, `data/products.json`, product page
- Dhyan rakhna: Affiliate links par `rel="nofollow sponsored noopener"` zaroori
  hai. Mithun apne khud ke links se kabhi kharidari na karein (Amazon ban karta hai).

### 2026-07-10 — Claude — Site LIVE on bestdaam.in
- Kya badla: Vercel deploy + GoDaddy DNS + .IN registry KYC — site https ke
  saath live. About/Disclosure/Privacy pages, SEO (sitemap, robots, JSON-LD).
- Dhyan rakhna: Legal pages Amazon approval ki shart hain — delete mat karna.

### 2026-07-09 — Claude — Phase 1 website banayi
- Kya badla: Next.js 14 site — homepage (search/filter), product comparison page
  (SABSE SASTA badge), 30-din price history graph (demo data), plain CSS.
- Dhyan rakhna: Price history abhi DEMO hai (asli nahi) — footer me disclaimer
  hai. Asli data PA-API ke baad aayega.
