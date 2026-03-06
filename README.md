# God's Eye — WORLD MONITOR

A React-based OSINT-style world monitor dashboard (map, live ticker, UTC clock, coordinate readout).

## Stack

- **Vite** + **React 18**
- **Leaflet** / **react-leaflet** for the map
- CSS with custom properties (no UI framework)

## Commands

```bash
npm install   # once
npm run dev   # dev server at http://localhost:5173
npm run build # production build in dist/
npm run preview # serve dist/ locally
```

## Deploy

After `npm run build`, deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

## Project layout

- `src/App.jsx` — layout, view state (map / wall)
- `src/components/` — Header, SidebarLeft, SidebarRight, WorldMap, Footer
- `src/context/MapContext.jsx` — map instance and coordinate state for zoom/coords
- `src/data/markers.js` — marker positions and styling helpers
