import asyncio
import os
import sys
from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from database import Base, engine
from routers.scraperouter import scraperouter
from services.browser import start_browser, stop_browser
from services.scheduler import start_scheduler, stop_scheduler

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE tracked_items ADD COLUMN notify_email TEXT"))
            conn.commit()
        except Exception:
            pass  # column already exists
    await start_browser()
    start_scheduler()
    yield
    stop_scheduler()
    await stop_browser()


app = FastAPI(lifespan=lifespan)
app.include_router(scraperouter)

_cors_raw = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost,http://localhost:5173")
origins = [o.strip() for o in _cors_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthcheck")
async def root():
    return {"message": "We are live!"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
