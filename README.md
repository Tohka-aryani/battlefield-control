# Battlefield Control

An OSINT-style world monitor dashboard: live news (GDELT), map with conflict/cluster visualization, scrolling ticker, livestreams (YouTube news & cams), and social feeds (Twitter via Nitter, Telegram). No API keys required for core features.

---

## Stack

- **Vite** + **React 18**
- **Leaflet** / **react-leaflet** for the map
- CSS with custom properties (no UI framework)

---

## Quick start

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # production build → dist/
npm run preview  # serve dist/ locally
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Setup in detail

### 1. Livestreams (TV / Monitor icon)

**What it does:** A floating, draggable/resizable window with a dropdown of live TV and camera feeds. Streams are embedded via YouTube; selecting a channel loads its current livestream in an iframe.

**Config file:** `src/data/livestreamsConfig.js`

**Structure:** Three categories, each with a list of streams:

- **NEWS CHANNELS** — Major broadcasters (CNN, BBC, Al Jazeera, etc.)
- **YOUTUBE NEWS** — YouTube-based news channels (Sky News, WION, Euronews, etc.)
- **LIVE CAMS** — ISS, city cams, Starbase, Ukraine multi-cam, etc.

**Adding or editing a stream:**

1. Open `src/data/livestreamsConfig.js`.
2. Each stream has:
   - `id` — unique string (e.g. `'cnn'`, `'sky-news'`)
   - `name` — label shown in the dropdown (e.g. `'Sky News'`)
   - `flag` — emoji for display (e.g. `'🇬🇧'`, `'🌐'`)
   - `embedUrl` — YouTube embed URL used in the iframe. Use the format:
     - `https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID`
     - To get `CHANNEL_ID`: open the channel’s YouTube page → About → copy the channel ID from the URL or “Share channel”.
   - `watchUrl` — optional; link opened when user clicks “Open in new tab” (e.g. channel’s live page or website).

3. Add a new object to the right category’s `streams` array, or create a new category with `id`, `label`, and `streams`.

**Example — add a new news channel:**

```js
{ id: 'my-news', name: 'My News', flag: '🇺🇸', embedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCxxxxxxxxxx', watchUrl: 'https://www.youtube.com/@MyNews/live' },
```

No API keys or env vars are required; everything is client-side and uses public YouTube embeds.

---

### 2. SOCMED (Social media window)

**What it does:** A floating, draggable/resizable panel with two tabs:

- **Twitter** — Combined feed of tweets from a fixed list of accounts, fetched via Nitter (RSS). English only in the footer ticker; full list in the SOCMED window.
- **Telegram** — Combined feed from configured Telegram channels (posts with text and optional images).

**Config — Twitter (Nitter):**  
File: `src/components/SocmedWindow.jsx` (top of file).

- **`TWITTER_ACCOUNTS`** — Array of `{ username, label }`.
  - `username`: Twitter/X handle without `@` (e.g. `'Marchforward'`, `'realDonaldTrump'`).
  - `label`: Display name in the UI (e.g. `'March Forward'`, `'Donald Trump'`).
- Tweets are fetched from public Nitter instances (e.g. `nitter.net`, `nitter.poast.org`) via their RSS endpoints. No Twitter API key is used.

**Adding a Twitter account:** Append to `TWITTER_ACCOUNTS` in `SocmedWindow.jsx`:

```js
{ username: 'HandleWithoutAt', label: 'Display Name' },
```

**Config — Telegram:**  
File: `src/api/telegramFeedData.js`.

- **`TELEGRAM_CHANNELS`** — Array of `{ username, label }`.
  - `username`: Public channel username (the part after `t.me/s/`, e.g. `jacksonhinkle`, `Irfan_Newboys`).
  - `label`: Display name in the UI.

**Adding a Telegram channel:** Append to `TELEGRAM_CHANNELS` in `telegramFeedData.js`:

```js
{ username: 'channel_username', label: 'Channel Display Name' },
```

**How Telegram is fetched:**  
No Telegram API or bot token is used. The app:

1. **Primary:** Fetches the public preview page `https://t.me/s/<username>` via CORS proxies and parses the HTML for message text, time, and images.
2. **Fallback:** Tries RSS-Bridge / RSSHub-style endpoints that expose Telegram channels as RSS.

Only **public** channels work. If a channel is private, it will not appear in the feed.

---

### 3. News (GDELT — map, The Wall, footer ticker)

**What it does:**

- **Map:** Clusters of articles by location (city/country extracted from headlines or source country). Click a cluster to see articles; filter by severity and category in the legend.
- **The Wall:** Grid of recent articles (up to 800).
- **Footer ticker:** Scrolling strip of the latest **English** articles; hover a title to see the first paragraph and “Open” link.

**Config:**  
File: `src/api/gdeltData.js`.

- **`DOC_QUERIES`** — Array of `{ q, n, span }`:
  - `q`: GDELT DOC API query string (e.g. conflict-related keywords).
  - `n`: Max articles per query.
  - `span`: Time window (`'12h'`, `'24h'`).
- **`TELEGRAM_CHANNELS`** is in `telegramFeedData.js` (see SOCMED above); GDELT does not use Telegram.

No API key is required for GDELT DOC API. Requests are made from the browser; if needed, a CORS proxy (e.g. `api.allorigins.win`) is used and is already wired in.

**Optional — translation:**  
Non-English article titles can be translated to English via an unofficial Google Translate endpoint (see `translateText` / `translateTitles` in `gdeltData.js`). This is best-effort and may be rate-limited; the app still works if translation fails.

---

### 4. Map filters and legend

**Location:** Map legend is next to the map (categories and severity).

- **Categories:** Conflict, Political, Humanitarian, Economic, Disaster. Click a category to show only clusters of that type; “All” clears the filter.
- **Severity:** S1–S5 or “ALL”. Click to filter clusters by maximum severity.

Clusters are built from GDELT articles; city/region names are matched from headlines using `src/data/cityCoords.js`. You can add or adjust entries there to improve placement.

---

### 5. Environment and CORS

- **Environment:** The app is designed to run with no `.env` requirements for livestreams, SOCMED, or GDELT. If you add optional features (e.g. a custom API), use a `.env` file and prefix vars with `VITE_` so Vite exposes them.
- **CORS:** Some external APIs (GDELT, Nitter, Telegram preview, translation) are called from the browser. The code uses public CORS proxies (e.g. `api.allorigins.win`, `api.codetabs.com`) where necessary. For production you may replace these with your own proxy if you hit limits or blocking.

---

## Project layout (main pieces)

| Path | Purpose |
|------|--------|
| `src/App.jsx` | Layout, view state (map / wall) |
| `src/components/Header.jsx` | Title “Battlefield Control”, tabs, clock |
| `src/components/SidebarLeft.jsx` | Icons that open Stocks, TV, Predictions, **SOCMED**, DEFCON |
| `src/components/WorldMap.jsx` | Map, GDELT clusters, filters |
| `src/components/LivestreamsWindow.jsx` | Livestreams dropdown + YouTube iframe player |
| `src/components/TvFloatingWindow.jsx` | Wrapper: draggable/resizable livestreams window |
| `src/components/SocmedWindow.jsx` | SOCMED panel: Twitter + Telegram tabs, account list |
| `src/components/TheWall.jsx` | Article grid (GDELT) |
| `src/components/Footer.jsx` | Scrolling ticker (English GDELT), hover preview |
| `src/data/livestreamsConfig.js` | **Livestreams:** categories and stream list (embed URLs, names, flags) |
| `src/api/gdeltData.js` | **News:** GDELT DOC fetch, translation, first-paragraph fetch for ticker |
| `src/api/socmedFeedData.js` | **Twitter:** Nitter RSS fetch for usernames passed from SocmedWindow |
| `src/api/telegramFeedData.js` | **Telegram:** channel list, t.me/s scrape + RSS fallback |
| `src/context/WallMapContext.jsx` | Map + wall state (clusters, filters, selected item) |
| `src/data/cityCoords.js` | City/region names and coordinates for map clustering |
| `src/data/wallMapConfig.js` | Categories, severity labels, colors for map/wall |

---

## Summary

- **Name:** Battlefield Control (browser title and header).
- **Livestreams:** Configure in `src/data/livestreamsConfig.js` (categories + streams with `embedUrl` / `watchUrl`). No keys needed.
- **SOCMED — Twitter:** Edit `TWITTER_ACCOUNTS` in `src/components/SocmedWindow.jsx` (Nitter RSS, no API key).
- **SOCMED — Telegram:** Edit `TELEGRAM_CHANNELS` in `src/api/telegramFeedData.js` (public channels only; t.me/s scrape + RSS fallback, no API key).
- **News (GDELT):** Tune `DOC_QUERIES` in `src/api/gdeltData.js` if needed; no API key. Footer ticker is English-only; translation is optional.
- **Map:** Filters in the legend; locations from GDELT + `cityCoords.js`. No extra setup for basic use.
