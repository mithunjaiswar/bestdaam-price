# PriceVichar Marketing Handoff

Use this as the current source of truth for new social posts, captions, videos and channel updates.

## Brand

- Name: **PriceVichar**
- Website: **https://pricevichar.com**
- Slogan: **Search. Compare. Think. Buy better.**
- Supporting line: **Everything you need to make a smarter choice—right here on PriceVichar.**
- CTA: **PriceVichar par latest price check karo.**
- Do not use `BestDaam`, `bestdaam.in` or the old yellow/cyan visual system in new content.

## Product claims

- Verify the live PriceVichar product page and the retailer page before publishing a price.
- Say **prices checked daily**; do not promise that every price changes or refreshes successfully every day.
- Use multi-store comparison language only when the same product has at least two verified store listings.
- Mention that prices and availability can change and the final price must be confirmed on the retailer website.

## Social profile

- Profile icon: white `P` with emerald check on a deep navy rounded square.
- Primary colors: `#07183F`, `#1769E8`, `#14B86A`, `#FFFFFF`.
- Recommended bio: `Search. Compare. Think. Buy better. Latest price checks: pricevichar.com`

## Daily refresh

The GitHub Actions catalog workflow runs at 01:00 UTC (06:30 IST). It preserves the last verified catalog, validates the generated data and website build, and publishes only validated changes. Temporary failures are handled per category so one unavailable page does not cancel all remaining categories.
