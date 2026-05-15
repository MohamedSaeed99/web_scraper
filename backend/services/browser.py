from playwright.async_api import async_playwright, Browser, Playwright
from playwright_stealth import Stealth

_pw: Playwright | None = None
_browser: Browser | None = None
_stealth = Stealth()

_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) "
    "Gecko/20100101 Firefox/125.0"
)

_BOT_SIGNALS = {"px-captcha", "perimeterx", "access denied", "cf-challenge", "just a moment"}


async def start_browser():
    global _pw, _browser
    _pw = await async_playwright().start()
    _browser = await _pw.firefox.launch(headless=True)


async def stop_browser():
    if _browser:
        await _browser.close()
    if _pw:
        await _pw.stop()


async def fetch_rendered_html(url: str) -> str:
    context = await _browser.new_context(
        user_agent=_UA,
        viewport={"width": 1366, "height": 768},
        extra_http_headers={
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    try:
        page = await context.new_page()
        await _stealth.apply_stealth_async(page)
        # "load" waits for the load event; retail sites fire continuous XHR so
        # "networkidle" never triggers within 30s.  3s settle lets React finish.
        await page.goto(url, wait_until="load", timeout=60000)
        await page.wait_for_timeout(3000)
        html = await page.content()

        lower = html.lower()
        if any(signal in lower for signal in _BOT_SIGNALS):
            raise RuntimeError(
                "Bot protection detected — this site actively blocks automated access "
                "to product data. A residential proxy service would be required."
            )

        return html
    finally:
        await context.close()
