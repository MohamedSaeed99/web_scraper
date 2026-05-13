"""
Run with: python diagnose_price.py
Dumps every price-relevant signal found in the page so we can see
exactly what the extraction waterfall picks up — and why.
"""
import asyncio
import json
import re
import sys

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

URL = "https://www.hollisterco.com/shop/us/p/arsenal-fc-graphic-mock-neck-jacket-62062819?categoryId=12551&faceout=model&seq=02&pagefm=navigation-grid&prodvm=navigation-grid"

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/124.0.0.0 Safari/537.36"
)


async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent=UA,
            viewport={"width": 1366, "height": 768},
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
        )
        page = await context.new_page()
        await page.goto(URL, wait_until="load", timeout=60000)
        await page.wait_for_timeout(3000)
        html = await page.content()
        await context.close()
        await browser.close()

    soup = BeautifulSoup(html, "html.parser")

    # ── Layer 1: JSON-LD ──────────────────────────────────────────────────────
    print("\n=== JSON-LD blocks ===")
    for i, script in enumerate(soup.find_all("script", type="application/ld+json")):
        try:
            data = json.loads(script.string or "")
            entries = data if isinstance(data, list) else [data]
            for entry in entries:
                if entry.get("@type") in ("Product", "IndividualProduct", "AggregateOffer"):
                    print(f"[block {i}] @type={entry.get('@type')}")
                    print(f"  name   : {entry.get('name')}")
                    offers = entry.get("offers", {})
                    print(f"  offers : {json.dumps(offers, indent=4)}")
        except Exception as e:
            print(f"[block {i}] parse error: {e}")

    # ── Layer 2: Open Graph meta tags ─────────────────────────────────────────
    print("\n=== Open Graph price tags ===")
    for prop in ("og:price:amount", "product:price:amount", "og:price:regular_price",
                 "product:sale_price:amount", "og:price:sale_price"):
        tag = soup.find("meta", property=prop)
        if tag:
            print(f"  {prop} = {tag.get('content')}")

    # ── Layer 3: itemprop ─────────────────────────────────────────────────────
    print("\n=== itemprop price elements ===")
    for el in soup.find_all(itemprop=re.compile("price", re.I)):
        print(f"  itemprop={el.get('itemprop')}  content={el.get('content')}  text={el.get_text(strip=True)[:60]}")

    # ── Layer 4: CSS price classes ────────────────────────────────────────────
    print("\n=== Elements with 'price' in class/id (first 10) ===")
    seen = 0
    for el in soup.find_all(class_=re.compile("price", re.I)):
        text = el.get_text(strip=True)
        if re.search(r"\d", text):
            print(f"  <{el.name} class='{' '.join(el.get('class', []))}'>  text={text[:80]}")
            seen += 1
            if seen >= 10:
                break

    # ── Raw price-looking numbers in JSON-LD ─────────────────────────────────
    print("\n=== All numeric values in JSON-LD that look like prices ===")
    for script in soup.find_all("script", type="application/ld+json"):
        text = script.string or ""
        hits = re.findall(r'"(?:price|salePrice|lowPrice|highPrice|regularPrice)["\s]*:\s*["\']?([\d.]+)', text, re.I)
        if hits:
            print(f"  {hits}")


asyncio.run(main())
