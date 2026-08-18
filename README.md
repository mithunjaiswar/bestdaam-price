# PriceVichar — India Price Comparison

PriceVichar Indian shoppers ko products search karne, verified store prices compare
karne aur affiliate links se store par jaane deta hai.

**Brand promise:** Search. Compare. Think. Buy better.

## Current status — 18 August 2026

- Live website: [pricevichar.com](https://pricevichar.com)
- Next.js 15 website deployed on Vercel
- 1,393 products across 15 categories
- Flipkart price, image, price history and affiliate link on every catalog product
- 31 products currently have an exact Amazon comparison
- Search, category/store/budget filters, saved products, deals, trending, sharing and SEO pages are live
- Customer product requests and catalog workflows run through GitHub Actions
- Daily catalog job runs at 01:00 UTC (06:30 IST); store failures are isolated so one unavailable category does not cancel every update

The catalog is no longer demo data. Multi-store coverage is still limited, so a
single-store product is clearly shown as one verified price. Amazon prices must
come from the official API after account eligibility; other stores should use
approved affiliate feeds or APIs, not direct scraping.

See [ROADMAP.md](./ROADMAP.md) for priorities and [ARCHITECTURE.md](./ARCHITECTURE.md)
for the system design.

## Run locally

Install Node.js LTS, then run:

```bash
npm ci
npm test
npm run dev
```

Open <http://localhost:3000>. Use `npm run build` before publishing.

## Repositories

- `bestdaam-price`: website, catalog snapshot and GitHub workflows
- `bestdaam-scraper`: legacy catalog automation and feed-processing utilities

Never commit passwords, tokens, PAN/bank details or other secrets.

## Cuelinks integration

PriceVichar can convert supported non-Amazon merchant URLs at click time through
Cuelinks API v3. Configure `CUELINKS_API_KEY` and optionally
`CUELINKS_CHANNEL_ID` as server-only Vercel environment variables. The key needs
the `write:links` scope. If conversion is unavailable, unapproved, or fails, the
shopper is safely redirected to the original merchant URL.

Amazon links continue to use the direct Amazon Associates tag and are never
routed through Cuelinks. Campaign approval is still required before Cuelinks
reports a converted link as affiliated.
