import asyncio
from datetime import datetime

from database import SessionLocal
from models import TrackedItem
from routers.scraperouter import extract_product_info
from services.browser import fetch_rendered_html
from services.email_service import send_threshold_alert

_task: asyncio.Task | None = None


async def check_prices():
    print(f"[scheduler] Running price check at {datetime.utcnow().isoformat()}")
    db = SessionLocal()
    try:
        items = db.query(TrackedItem).all()
        for item in items:
            try:
                html = await fetch_rendered_html(item.url)
                info = extract_product_info(html, item.url)
                new_price = info.get("price")
                item.last_checked = datetime.utcnow()
                if new_price is not None:
                    item.price = new_price
                    if item.threshold is not None and new_price <= item.threshold:
                        if not item.notified:
                            send_threshold_alert(
                                item_name=item.item_name,
                                price=new_price,
                                threshold=item.threshold,
                                buy_link=item.buy_link or item.url,
                                recipient=item.notify_email,
                            )
                            item.notified = True
                    elif item.threshold is not None and new_price > item.threshold:
                        item.notified = False
            except Exception as e:
                print(f"[scheduler] Error checking {item.url}: {e}")
        db.commit()
    finally:
        db.close()


async def _run():
    while True:
        await asyncio.sleep(3600)
        await check_prices()


def start_scheduler():
    global _task
    _task = asyncio.create_task(_run())


def stop_scheduler():
    if _task:
        _task.cancel()
