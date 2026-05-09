import json
import re
from datetime import datetime

import validators  # type: ignore
from bs4 import BeautifulSoup  # type: ignore
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import TrackedItem
from services.browser import fetch_rendered_html

scraperouter = APIRouter(
    prefix="/scrape",
    tags=["scrape"],
    responses={404: {"description": "Not found"}},
)


class ThresholdRequest(BaseModel):
    threshold: float


class EmailRequest(BaseModel):
    notify_email: str | None = None


def _parse_price(raw: str) -> float | None:
    match = re.search(r"[\d,]+\.?\d*", raw.replace(",", ""))
    if match:
        try:
            return float(match.group().replace(",", ""))
        except ValueError:
            return None
    return None


def extract_product_info(html: str, base_url: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    name = None
    price = None
    buy_link = base_url

    # 1. Schema.org JSON-LD
    for script in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(script.string or "")
            entries = data if isinstance(data, list) else [data]
            for entry in entries:
                if entry.get("@type") in ("Product", "IndividualProduct"):
                    name = name or entry.get("name")
                    offers = entry.get("offers", {})
                    if isinstance(offers, list):
                        offers = offers[0]
                    raw_price = offers.get("price") or offers.get("lowPrice")
                    if raw_price and price is None:
                        price = _parse_price(str(raw_price))
                    buy_link = offers.get("url") or buy_link
        except (json.JSONDecodeError, AttributeError):
            continue

    # 2. Open Graph
    if not name:
        og_title = soup.find("meta", property="og:title")
        if og_title:
            name = og_title.get("content")
    if not price:
        for prop in ("og:price:amount", "product:price:amount"):
            og_price = soup.find("meta", property=prop)
            if og_price:
                price = _parse_price(og_price.get("content", ""))
                break
    og_url = soup.find("meta", property="og:url")
    if og_url and buy_link == base_url:
        buy_link = og_url.get("content", base_url)

    # 3. itemprop attributes
    if not name:
        el = soup.find(itemprop="name")
        if el:
            name = el.get_text(strip=True)
    if not price:
        el = soup.find(itemprop="price")
        if el:
            price = _parse_price(el.get("content") or el.get_text(strip=True))

    # 4. Common CSS fallbacks
    if not name:
        h1 = soup.find("h1")
        if h1:
            name = h1.get_text(strip=True)
    if not price:
        for selector in ("[class*='price']", "[id*='price']", ".price", "#price"):
            el = soup.select_one(selector)
            if el:
                candidate = _parse_price(el.get_text(strip=True))
                if candidate:
                    price = candidate
                    break

    return {"item_name": name, "price": price, "buy_link": buy_link}


@scraperouter.post("/")
async def scrape_url(url: str, email: str | None = None, db: Session = Depends(get_db)):
    if not validators.url(url):
        raise HTTPException(status_code=400, detail="Invalid URL")

    try:
        html = await fetch_rendered_html(url)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to fetch URL: {e}")

    info = extract_product_info(html, url)

    item = TrackedItem(
        url=url,
        item_name=info["item_name"],
        price=info["price"],
        buy_link=info["buy_link"],
        notify_email=email or None,
        last_checked=datetime.utcnow(),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@scraperouter.get("/")
async def get_tracked_items(db: Session = Depends(get_db)):
    return db.query(TrackedItem).all()


@scraperouter.delete("/{item_id}")
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Deleted"}


@scraperouter.patch("/{item_id}/threshold")
async def set_threshold(item_id: int, body: ThresholdRequest, db: Session = Depends(get_db)):
    item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.threshold = body.threshold
    db.commit()
    db.refresh(item)
    return item


@scraperouter.patch("/{item_id}/email")
async def set_email(item_id: int, body: EmailRequest, db: Session = Depends(get_db)):
    item = db.query(TrackedItem).filter(TrackedItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    item.notify_email = body.notify_email or None
    db.commit()
    db.refresh(item)
    return item
