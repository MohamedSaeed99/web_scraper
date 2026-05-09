# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack web scraper with a FastAPI backend and React/TypeScript frontend. The backend fetches and parses HTML from user-supplied URLs; the frontend provides a form to submit URLs and display results.

## Development Commands

### Backend

```powershell
cd backend
.\env\Scripts\activate          # activate virtual environment
pip install -r requirements.txt # install dependencies
python main.py                  # run dev server on http://localhost:8000
```

### Frontend

```powershell
cd frontend
npm install    # install dependencies
npm run dev    # start Vite dev server on http://localhost:5173
npm run build  # type-check and build
npm run lint   # run ESLint
```

## Architecture

**Backend** (`backend/`)
- `main.py` — FastAPI app entry point; registers `scraperouter`, configures CORS to allow `localhost:5173`
- `routers/scraperouter.py` — all scraping logic; prefix `/scrape`; uses `requests` + `BeautifulSoup` for HTML fetching/parsing, `validators` for URL validation
- `env/` — local Python virtual environment (not committed)

**Frontend** (`frontend/src/`)
- `main.tsx` — React root; wraps the app in `QueryClientProvider` (TanStack Query)
- `App.tsx` — top-level component; wires `useScrape` mutation to `URLInputForm`
- `components/URLInputForm.tsx` — controlled form component; accepts a callback prop
- `api/Scrape/useScrape.tsx` — TanStack Query `useMutation` hook; POSTs to `http://localhost:8000/scrape?url=<url>`

**Data flow:** `URLInputForm` → `App` callback → `useScrape` mutation → FastAPI `/scrape` POST → `requests.get` + BeautifulSoup → raw HTML response.

## Key Notes

- The frontend calls the backend via query parameter (`?url=`), but the backend route signature uses a FastAPI query param (`url: str`) on a `POST` — keep these in sync.
- Tailwind CSS is used for all styling; no CSS modules or styled-components.
- The `schedule` package is imported in `main.py` but not yet used — it's intended for future scheduled scraping jobs.
