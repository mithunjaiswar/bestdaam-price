#!/usr/bin/env python3
"""Sync recent EarnKaro-converted Telegram deals into PriceVichar.

The public channel is used as a durable bridge: EarnKaro handles conversion,
while this script imports only recent posts and stores their artwork locally.
"""

from __future__ import annotations

import html
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "earnkaro-offers.json"
IMAGE_DIR = ROOT / "public" / "earnkaro-live"
CHANNEL = "Bestdaam_india"
CHANNEL_URL = f"https://t.me/s/{CHANNEL}"
MAX_OFFERS = 18
MAX_AGE = timedelta(hours=48)
ALLOWED_AFFILIATE_HOSTS = {
    "fkrt.cc": "Flipkart",
    "fktr.in": "Flipkart",
    "myntr.it": "Myntra",
    "ajiio.in": "AJIO",
    "bitli.in": "Partner offer",
}


class TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"br", "p", "div"}:
            self.parts.append("\n")

    def text(self) -> str:
        value = html.unescape("".join(self.parts)).replace("\xa0", " ")
        lines = [re.sub(r"\s+", " ", line).strip() for line in value.splitlines()]
        return "\n".join(line for line in lines if line)


def fetch(url: str, *, timeout: int = 25) -> tuple[bytes, str]:
    request = Request(
        url,
        headers={
            "User-Agent": "PriceVichar-OfferSync/1.0 (+https://pricevichar.com)",
            "Accept": "text/html,image/avif,image/webp,image/jpeg,image/png,*/*",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read(8_000_000), response.headers.get_content_type()


def extract_text(fragment: str) -> str:
    parser = TextExtractor()
    parser.feed(fragment)
    return parser.text()


def first_match(pattern: str, value: str, flags: int = 0) -> str:
    match = re.search(pattern, value, flags)
    return html.unescape(match.group(1)) if match else ""


def merchant_for(url: str, text: str) -> str:
    host = urlparse(url).hostname or ""
    merchant = ALLOWED_AFFILIATE_HOSTS.get(host.lower(), "Partner offer")
    lower = text.lower()
    if merchant == "Partner offer":
        for needle, label in (
            ("sbi", "SBI Cards"),
            ("amazon", "Amazon"),
            ("flipkart", "Flipkart"),
            ("myntra", "Myntra"),
            ("ajio", "AJIO"),
            ("shopsy", "Shopsy"),
        ):
            if needle in lower:
                return label
    return merchant


def discount_label(text: str) -> str:
    patterns = (
        r"\b(up\s*to\s*\d{1,3}%\s*off)\b",
        r"\b(flat\s*\d{1,3}%\s*off)\b",
        r"\b(\d{1,3}%\s*off)\b",
        r"\b(starts?\s*(?:at|@)\s*₹?[\d,]+)\b",
        r"(?:@|at)\s*(₹[\d,]+)",
    )
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return re.sub(r"\s+", " ", match.group(1)).strip().title()
    return "Limited-time"


def safe_title(text: str) -> str:
    first_line = text.split("\n", 1)[0]
    return re.sub(r"\s+", " ", first_line).strip(" :-")[:140] or "Limited-time deal"


def safe_description(text: str, title: str) -> str:
    without_urls = re.sub(r"https?://\S+", "", text)
    remainder = without_urls[len(title) :].strip(" \n:-")
    remainder = re.sub(r"\s+", " ", remainder)
    if not remainder:
        return "Limited-period offer. Check the retailer for final price and availability."
    return remainder[:220]


def write_fallback_svg(path: Path, merchant: str, title: str) -> None:
    merchant_safe = html.escape(merchant[:35])
    title_safe = html.escape(title[:62])
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071b33"/><stop offset="1" stop-color="#087f5b"/></linearGradient></defs>
<rect width="640" height="240" rx="24" fill="url(#g)"/><circle cx="555" cy="40" r="100" fill="#35d39a" opacity=".16"/>
<text x="42" y="70" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="#7ff0c5">{merchant_safe}</text>
<text x="42" y="125" font-family="Arial,sans-serif" font-size="31" font-weight="800" fill="white">{title_safe}</text>
<rect x="42" y="164" width="190" height="42" rx="21" fill="#35d39a"/><text x="137" y="192" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" font-weight="700" fill="#062a20">LIMITED-TIME DEAL</text>
</svg>'''
    path.write_text(svg, encoding="utf-8")


def save_image(message_id: str, image_url: str, merchant: str, title: str) -> str:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    existing_images = [
        candidate
        for suffix in (".jpg", ".png", ".svg")
        if (candidate := IMAGE_DIR / f"telegram-{message_id}{suffix}").exists()
    ]
    if image_url:
        try:
            payload, content_type = fetch(image_url)
            suffix = ".png" if content_type == "image/png" else ".jpg"
            path = IMAGE_DIR / f"telegram-{message_id}{suffix}"
            path.write_bytes(payload)
            return f"/earnkaro-live/{path.name}"
        except Exception as error:  # noqa: BLE001 - network fallback is intentional
            print(f"Image download failed for {message_id}: {error}", file=sys.stderr)

    if existing_images:
        return f"/earnkaro-live/{existing_images[0].name}"

    path = IMAGE_DIR / f"telegram-{message_id}.svg"
    write_fallback_svg(path, merchant, title)
    return f"/earnkaro-live/{path.name}"


def parse_messages(page: str, now: datetime) -> list[dict[str, str]]:
    blocks = re.split(r'<div class="tgme_widget_message_wrap[^>]*>', page)[1:]
    offers: list[dict[str, str]] = []
    seen_titles: set[str] = set()
    cutoff = now - MAX_AGE

    for block in reversed(blocks):
        post = first_match(r'data-post="Bestdaam_india/(\d+)"', block)
        published_raw = first_match(r'<time datetime="([^"]+)"', block)
        text_html = first_match(
            r'<div class="tgme_widget_message_text[^>]*>(.*?)</div>', block, re.S
        )
        if not post or not published_raw or not text_html:
            continue

        published = datetime.fromisoformat(published_raw.replace("Z", "+00:00"))
        if published < cutoff:
            continue

        text = extract_text(text_html)
        links = re.findall(r'href="(https://[^"]+)"', text_html)
        affiliate_url = next(
            (
                html.unescape(link)
                for link in links
                if (urlparse(html.unescape(link)).hostname or "").lower()
                in ALLOWED_AFFILIATE_HOSTS
            ),
            "",
        )
        if not affiliate_url:
            continue

        image_url = first_match(
            r'tgme_widget_message_photo_wrap[^>]*style="[^"]*background-image:url\(\'([^\']+)',
            block,
        )
        if not image_url:
            image_url = first_match(
                r'tgme_widget_message_link_preview[^>]*>.*?background-image:url\(\'([^\']+)',
                block,
                re.S,
            )

        title = safe_title(text)
        title_key = re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        merchant = merchant_for(affiliate_url, text)
        image = save_image(post, image_url, merchant, title)
        published_india = published.astimezone(timezone(timedelta(hours=5, minutes=30)))
        expires = published_india + MAX_AGE
        offers.append(
            {
                "id": f"earnkaro-telegram-{post}",
                "merchant": merchant,
                "title": title,
                "description": safe_description(text, title),
                "discountLabel": discount_label(text),
                "image": image,
                "merchantUrl": affiliate_url,
                "affiliateUrl": affiliate_url,
                "checkedAt": now.astimezone(timezone(timedelta(hours=5, minutes=30))).date().isoformat(),
                "expiresAt": expires.date().isoformat(),
                "sourceUrl": f"https://t.me/{CHANNEL}/{post}",
                "publishedAt": published.isoformat(),
            }
        )
        if len(offers) >= MAX_OFFERS:
            break

    return offers


def main() -> None:
    now = datetime.now(timezone.utc)
    payload, _ = fetch(CHANNEL_URL)
    offers = parse_messages(payload.decode("utf-8", errors="replace"), now)
    if not offers:
        # An empty 48-hour window is a normal state, not a sync failure. Keep the
        # last known-good catalog and let the rest of the deployment continue.
        print("No recent affiliate offers found; existing catalog was preserved.")
        return

    keep = {Path(offer["image"]).name for offer in offers}
    if IMAGE_DIR.exists():
        for path in IMAGE_DIR.glob("telegram-*"):
            if path.name not in keep:
                path.unlink()

    OUTPUT.write_text(json.dumps(offers, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(offers)} recent EarnKaro offers from @{CHANNEL}.")


if __name__ == "__main__":
    main()
