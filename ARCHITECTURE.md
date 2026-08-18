# PriceVichar — Current Architecture

## Product goal

PriceVichar ek India-focused shopping comparison platform hai. Customer product
search karta hai, verified prices compare karta hai aur selected store ke
affiliate link par jaata hai. Long-term goal comparison ke andar PriceVichar ka
apna store add karna hai.

## Current system

| Layer | Implementation | Status |
|---|---|---|
| Website | Next.js 15 App Router, React, JavaScript, plain CSS | Live on Vercel |
| Domain | `pricevichar.com` | Live with HTTPS |
| Catalog | `data/products.json` | 1,393 products, 15 categories |
| Store coverage | Flipkart plus exact Amazon matches | Amazon coverage limited |
| History | Catalog price-history snapshots | Available for current products |
| Saved products | Browser local storage | Same-device only |
| Requests | Google Apps Script queue + GitHub workflow | Automated |
| Daily refresh | GitHub Actions at 01:00 UTC / 06:30 IST | Per-category failures isolated |
| Cloud data | Optional Supabase sync | Secrets configured in GitHub |
| Validation | Catalog validator + production build | Required before publication |

## Data flow

1. An approved feed/API or controlled catalog input produces product records.
2. Existing exact Amazon matches and affiliate links are preserved.
3. `scripts/validate-catalog.mjs` rejects malformed or duplicate catalog data.
4. `next build` validates all generated website routes.
5. Only validated `data/products.json` changes are committed by GitHub Actions.
6. Vercel deploys the live branch automatically.

## Catalog contract

Every product requires:

- unique `id`
- `name`, `category` and `categoryKey`
- HTTPS product image
- one or more price entries with store, positive price and HTTPS URL
- optional HTTPS affiliate URL
- optional history entries using `YYYY-MM-DD` dates and positive prices

Single-store availability must not be described as a multi-store comparison.
Amazon search fallback is an affiliate discovery link, not a verified price.

## Safety rules

- Never commit secrets, passwords, tokens, PAN or bank details.
- Do not directly scrape Amazon or Flipkart. Use official APIs or approved
  affiliate-network feeds. The legacy scraper repository should be migrated away
  from storefront automation rather than expanded.
- Preserve `rel="nofollow sponsored noopener"` on affiliate links.
- Keep legal pages and the Admitad verification tag.
- Publish only from `claude/india-price-comparison-zb7xou` until deployment is
  deliberately migrated to a standard `main` branch.

## Main folders

```text
app/                         Pages and React components
data/products.json           Deployable catalog snapshot
lib/                         Search, pricing, SEO, tracking and saved-item logic
scripts/validate-catalog.mjs Catalog safety checks
.github/workflows/           Catalog/request validation and publication
```

## Next architecture target

Move catalog ingestion to official Amazon APIs and approved affiliate feeds,
store normalized products/history in Supabase, and generate the deployable
catalog from that trusted database. This removes cloud-browser fragility and
makes multi-store comparison auditable.
