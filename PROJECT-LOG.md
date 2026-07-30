### 2026-07-27 — Daily automation — Catalog price refresh
- Kya badla: Daily validated catalog refresh complete hua; 1200 products export hue.
- Kyun: BestDaam par current Flipkart prices aur real price-history snapshots maintain karne ke liye.
- Kaunsi files: data/products.json, PROJECT-LOG.md.
- Dhyan rakhna: Affiliate coverage 1200/1200; Amazon verified prices official API ke bina refresh nahi hue.

### 2026-07-26 — Codex — Deals, social sharing and growth tracking
- What changed: Added automatic Today’s Deals, Under ₹500/₹1,000/₹5,000 and indexable category pages; WhatsApp, Telegram and copy-link sharing; UTM source preservation; search, page-view, product-select, share and outbound store-click tracking hooks; quick searches; and expanded sitemap coverage.
- Why: Make daily deal promotion easy, measure which channels and products create store traffic, capture customer demand, and build organic search landing pages.
- Files changed: app/deals, app/category, app/components, app/layout.js, app/sitemap.js, app/globals.css, lib/deals.js, lib/slugs.js, lib/tracking.js, .env.example, PROJECT-LOG.md. The local Google Apps Script ProductRequests.gs was extended with a Site Analytics sheet.
- Notes: Deals are derived automatically from the refreshed catalog. Google Apps Script must be updated to the latest deployment before live analytics rows begin recording.

### 2026-07-26 — Codex — Affordable-first shopping
- What changed: Homepage now starts with Price Low to High ordering and includes quick Under ₹500, Under ₹1,000 and Under ₹5,000 buttons plus a complete budget dropdown.
- Why: The catalog already has hundreds of affordable items, but expensive camera and electronics listings appeared first. Budget discovery is now immediate for conversion-focused promotion.
- Files changed: app/components/HomeClient.js, app/globals.css, PROJECT-LOG.md.
- Notes: Budget, store, category and sorting selections persist in the URL and back navigation.

### 2026-07-26 — Codex — Store filter
- What changed: Added an All stores / Amazon / Flipkart store filter to the homepage. Available stores are discovered automatically from the catalog, selected-store pricing is used for cards and sorting, and the selection is preserved in the URL and back navigation.
- Why: Let shoppers browse only the products and prices available from their preferred retailer.
- Files changed: app/components/HomeClient.js, app/globals.css, PROJECT-LOG.md.
- Notes: Croma and other retailers will appear automatically when verified entries for them are added to products.json.

### 2026-07-26 — Codex — Premium English redesign
- What changed: Rebuilt the BestDaam interface with a premium navy, cobalt and emerald design system; converted all customer-facing Hinglish copy to clear English; upgraded the header, hero search, category filters, sort controls, product cards, comparison table, price history, empty states, footer and mobile layout.
- Why: Give the site a more trustworthy, modern price-comparison experience while keeping it easy to scan and use.
- Files changed: app/layout.js, app/page.js, app/globals.css, app/components/HomeClient.js, app/components/BackToSearchLink.js, app/components/PriceHistoryChart.js, app/product/[id]/page.js, PROJECT-LOG.md.
- Notes: Existing catalog data, search state, sorting, price history, product requests, affiliate routing and SEO product pages remain unchanged.

### 2026-07-26 — Daily automation — Catalog price refresh
- Kya badla: Daily validated catalog refresh complete hua; 1200 products export hue.
- Kyun: BestDaam par current Flipkart prices aur real price-history snapshots maintain karne ke liye.
- Kaunsi files: data/products.json, PROJECT-LOG.md.
- Dhyan rakhna: Affiliate coverage 1200/1200; Amazon verified prices official API ke bina refresh nahi hue.

### 2026-07-25 — Codex — Product price sorting
- Kya badla: Homepage par Default, Price Low to High aur Price High to Low sorting add hui; visible product count bhi dikhaya.
- Kyun: Customer ko budget ya premium price order me products browse karne dene ke liye.
- Kaunsi files: app/components/HomeClient.js, app/globals.css, PROJECT-LOG.md.
- Dhyan rakhna: Selected sort URL me save hota hai, isliye product page se Back karne par sorting preserve rehti hai.

### 2026-07-25 — Codex — Product back-navigation state
- Kya badla: Homepage search, selected category aur scroll position navigation ke across preserve kiye. Product page ka “Wapas search par” button ab saved results par lautata hai.
- Kyun: Product dekhne ke baad Back karne par homepage filters reset hone aur scroll top par jane ka issue fix karne ke liye.
- Kaunsi files: app/components/HomeClient.js, app/components/BackToSearchLink.js, app/product/[id]/page.js, app/page.js, PROJECT-LOG.md.
- Dhyan rakhna: Search/category URL query parameters me save hote hain; scroll position current browser tab ke session storage me rehti hai.

### 2026-07-25 — Codex — Men's Clothing category
- Kya badla: Men's Clothing category ke 100 Flipkart products aur affiliate links catalog me add kiye. Name-only product requests me chhoti spelling mistakes ko safely recognize karne ke liye fuzzy token matching add hui.
- Kyun: Shirts/clothing ki genuine customer demand cover karne aur typo wali requests ko better evaluate karne ke liye.
- Kaunsi files: data/products.json, PROJECT-LOG.md. Local scraper me categories.json, export_catalog_to_bestdaam.py aur process_product_requests.py update hue.
- Dhyan rakhna: Customer search se category automatically create nahi hoti. Unclear request `Needs Review` rahegi; sirf reliable product matches publish honge.

### 2026-07-25 — Daily automation — Catalog price refresh
- Kya badla: Daily validated catalog refresh complete hua; 1100 products export hue.
- Kyun: BestDaam par current Flipkart prices aur real price-history snapshots maintain karne ke liye.
- Kaunsi files: data/products.json, PROJECT-LOG.md.
- Dhyan rakhna: Affiliate coverage 1100/1100; Amazon verified prices official API ke bina refresh nahi hue.

### 2026-07-24 — Codex — One-click product request queue
- Kya badla: Missing search result par email hata kar one-click “Is product ko add karein” flow add kiya. Request Google Sheet-backed Apps Script queue me save hogi; daily local updater pending requests ko safely process karke successful publish ke baad Added mark karega.
- Kyun: Customer ko email/form fill karaye bina din bhar missing-product requests collect karne aur subah ke catalog update me automatically pick karne ke liye.
- Kaunsi files: app/components/HomeClient.js, app/globals.css, .env.example, .gitignore, PROJECT-LOG.md. Local scraper me google_apps_script/ProductRequests.gs, process_product_requests.py aur daily_update.py update hue.
- Dhyan rakhna: Live build me `NEXT_PUBLIC_PRODUCT_REQUEST_URL` configure hona zaroori hai. Google Sheet deployment token sirf local scraper environment me rahega; repo me secret commit nahi karna. Automatic addition sirf high-confidence Flipkart match par hoti hai; unclear requests Pending/Needs Review rahengi.

### 2026-07-24 — Codex — Real price history and smart product search
- Kya badla: Demo price graph ko real database snapshots se replace kiya; product page par last-updated date aur real-history empty/one-point states add hue. Homepage search fuzzy name matching aur Flipkart PID/Amazon ASIN URL lookup support karti hai. Missing product par tagged Amazon search aur pre-filled request email milta hai.
- Kyun: Daily current-price tracking ko genuine banana aur customer ko name/link se product jaldi dhoondhne dena.
- Kaunsi files: data/products.json, lib/helpers.js, lib/search.js, app/components/HomeClient.js, app/components/PriceHistoryChart.js, app/product/[id]/page.js, app/layout.js, app/globals.css, PROJECT-LOG.md. Local scraper me database/db.py, export_catalog_to_bestdaam.py, daily_update.py aur apply_ekaro_api_links.py update hue.
- Dhyan rakhna: Daily automation sirf Flipkart ko refresh karti hai; Amazon verified prices official Creators API ke bina refresh nahi honge. Missing-product request abhi email-based hai; persistent automatic queue ke liye external database/webhook chahiye.

### 2026-07-24 — Codex — Single-price cards se suffix removed
- Kya badla: Homepage par single verified price wale product se “se” suffix hata diya. Multiple verified stores hone par lowest price ke saath “se” ab bhi dikhega.
- Kyun: Ek hi verified price ko starting price batana misleading tha.
- Kaunsi files: app/components/HomeClient.js, PROJECT-LOG.md.
- Dhyan rakhna: “se” ka use sirf multiple verified price entries par karna.

### 2026-07-24 — Codex — Single-store card wording clarified
- Kya badla: Homepage cards par single verified store hone par “1 store par compare” ki jagah “1 verified price • Amazon par bhi dekhein” dikhaya. Actual multi-store matches par existing comparison count rahega.
- Kyun: Amazon search fallback available hone ke bawajood single store ko comparison bolna confusing tha.
- Kaunsi files: app/components/HomeClient.js, PROJECT-LOG.md.
- Dhyan rakhna: Amazon search fallback verified Amazon price nahi hai; use store-count me include mat karna.

### 2026-07-23 — Codex — Amazon affiliate search fallback
- Kya badla: Exact Amazon price match na hone wale products par “Amazon par search karein” CTA add hua. Link product name ke Amazon search URL me Associates tag `bestdaam0a-21` automatically lagata hai; verified match hone par existing Amazon price row hi dikhti hai.
- Kyun: Har catalog product se Amazon commission opportunity dene ke liye, bina scraped/outdated Amazon price ko verified comparison bataye.
- Kaunsi files: lib/helpers.js, app/product/[id]/page.js, app/globals.css, PROJECT-LOG.md.
- Dhyan rakhna: Search fallback ko price comparison na samjhein; UI intentionally “Price Amazon par dekhein” aur disclaimer show karti hai. Affiliate link par `nofollow sponsored noopener` preserve karna.

### 2026-07-23 — Codex — Amazon matcher quality hardening
- Kya badla: Existing local Amazon dataset ko Flipkart catalog se model-aware matching ke through compare kiya. Brand position, product model tokens, laptop family aur product-line checks add hue; har Amazon listing ab sirf ek exact comparison me use hoti hai.
- Kyun: Store count badhane ke chakkar me alag models (jaise Samsung M36/F70e ya HP Victus/Omen) ko galat compare hone se rokna.
- Kaunsi files: data/products.json, PROJECT-LOG.md. Local scraper me matcher/normalize.py, matcher/matcher.py, compare.py, export_catalog_to_bestdaam.py aur test_matcher.py update hue.
- Dhyan rakhna: 953 existing Amazon rows me se 15 unique exact-model comparisons live catalog ke liye qualify hue. Amazon catalog/price expansion direct scraping se nahi; official Creators API SearchItems/GetItems se karna hai after account eligibility.

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
### 2026-07-27 — Codex — Trending This Week ranking
- What changed: Added a Trending page with weekly/monthly views, category filters, ranking cards, and a homepage Trending This Week section.
- Why: Help shoppers discover products gaining interest without presenting an unsupported units-sold claim.
- Files: app/trending/page.js, app/components/TrendingGrid.js, app/components/HomeClient.js, lib/trending.js, app/layout.js, app/sitemap.js, app/globals.css.
- Notes: Ranking uses a 70-point Flipkart signal model and up to 30 points from available BestDaam activity. It automatically recalculates whenever the daily products catalog refreshes.
### 2026-07-27 — Codex — Google search discovery improvements
- What changed: Added canonical URLs, richer product/rating/offer structured data, breadcrumbs, category ItemList schema, stronger page metadata and sitemap freshness hints.
- Why: Help Google understand BestDaam's product, category and trending pages and improve eligibility for richer search appearances.
- Files: lib/seo.js, app/layout.js, app/page.js, app/product/[id]/page.js, app/category/[slug]/page.js, app/trending/page.js, app/sitemap.js.
- Notes: Search ranking is never guaranteed. Google must recrawl the pages, and useful content, genuine user engagement and reputable links remain important.
### 2026-07-27 — Codex — Cloud-ready daily catalog automation
- What changed: Added a scheduled GitHub workflow for headless catalog refresh, build validation and safe publication. Prepared a separate scraper repository with Supabase sync and history restoration.
- Why: Allow BestDaam prices to refresh without keeping the Mac awake, while retaining current valid data if a cloud refresh fails.
- Files: .github/workflows/daily-catalog.yml and the bestdaam-scraper automation repository.
- Notes: Supabase storage activates after its URL/service key are added as GitHub Secrets. Flipkart may occasionally challenge cloud IPs; failed runs do not publish partial data.

### 2026-07-28 — Codex — Saved products watchlist
- What changed: Added Save & Track controls on catalog cards and product pages, a live Saved count in the header, and a dedicated `/saved` watchlist where shoppers can revisit or remove products.
- Why: Let shoppers keep products they are considering and return later to compare the latest available prices.
- Files: app/components/HomeClient.js, app/components/SaveProductButton.js, app/components/SavedProductsClient.js, app/components/SavedProductsNav.js, app/saved/page.js, app/layout.js, app/globals.css, lib/saved-products.js.
- Notes: Saved products currently use browser local storage, so the list remains on the same browser/device. Account sync and automatic price-drop alerts can be added later.

### 2026-07-28 — Codex — Stationery category with 200 products
- What changed: Added a Stationery category containing 200 valid Flipkart products and generated an EarnKaro affiliate link for every new product.
- Why: Expand BestDaam into affordable everyday products that are easier to promote and purchase.
- Files: data/products.json. Scraper configuration and exporter were updated locally to keep the Stationery target at 200 products.
- Notes: The catalog now contains 1,394 products. Existing affiliate links were preserved and all 200 Stationery products received new affiliate links with zero conversion failures.

### 2026-07-29 — Codex — Catalog-wide duplicate removal
- What changed: Removed repeated product cards across every category, including Stationery and Men's Clothing. The scraper now rejects repeated normalized product names, and the exporter keeps one current listing per displayed product name.
- Why: Flipkart can repeat the same item with different tracking URLs across pages, which previously made identical products appear multiple times on BestDaam.
- Files: data/products.json. Scraper paginator, exporter and affiliate conversion workflow were updated in the scraper repository.
- Notes: The refreshed catalog contains 1,347 unique products with zero repeated display-name rows. Stationery remains at 200 unique products and Men's Clothing at 100 unique products. All newly selected Flipkart listings received affiliate links with zero conversion failures.

### 2026-07-29 — Codex — Requested product comparisons
- What changed: Added JBL C200SI, genuine Apple AirPods models, and exact 0.5 mm 4B mechanical-pencil lead products under Requested Products. Exact Amazon comparisons were added where the same model was available, and all 11 new Flipkart listings received EarnKaro affiliate links.
- Why: Fulfil direct customer product requests while avoiding fake AirPods, mismatched generations, AppleCare bundles and unrelated lead sizes/grades.
- Files: data/products.json. The scraper matcher was updated to understand AirPods generations and exact 0.5 mm 4B lead identity.
- Notes: Five exact two-store comparisons are available: JBL C200SI, AirPods 4, AirPods Pro 3, Brustro 4B leads and Pentel 4B leads. Other genuine AirPods remain Flipkart-only until the exact Amazon model is available.

### 2026-07-29 — Codex — Fast customer-request publishing
- What changed: Added a cloud workflow that Google Apps Script can trigger immediately when a customer submits a product request. It can also be started with the Run workflow button and has a six-hour safety fallback. Valid requests are scraped, exported, affiliate-converted, build-tested and published automatically.
- Why: Urgent customer requests should not wait for the next morning's full catalog refresh.
- Files: .github/workflows/instant-product-requests.yml and .github/workflows/daily-catalog.yml. The scraper repository now includes the request processor and queue-status publisher.
- Notes: The Mac does not need to stay awake. GitHub Secrets for the request API and EarnKaro must remain configured, and Apps Script needs a GitHub workflow token once. Low-confidence matches are marked Needs Review instead of publishing the wrong item.

### 2026-07-30 — Codex — Full catalog restored after request update
- What changed: Restored the complete BestDaam catalog and merged the latest requested products after the fast request workflow accidentally replaced the catalog with only two items.
- Why: Customer-request publishing must add products without removing the existing catalog.
- Files: data/products.json. The scraper catalog hydration logic was fixed separately so future request runs restore existing products before exporting.
- Notes: The validated catalog contains 1,359 unique product IDs.

### 2026-07-30 — Codex — Samsung Galaxy Buds comparisons
- What changed: Added a dedicated Samsung Buds category with seven genuine Galaxy Buds models, current Flipkart prices, exact Amazon comparisons where available, and EarnKaro links for every Flipkart listing.
- Why: Give shoppers a reliable model-by-model Samsung earbuds comparison without mixing cases, compatible products, colors or unrelated third-party earbuds.
- Files: data/products.json. Scraper categories, filtering, canonical naming and strict Samsung Buds matching were updated separately.
- Notes: Six models have exact Flipkart/Amazon comparisons. Galaxy Buds Live remains Flipkart-only because a reliable current Amazon match was not available.
