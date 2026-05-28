# Canvass — Door-to-Door Sales CRM

A production-ready sales canvassing web app built with React + TypeScript + Vite.

## Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — dark premium design system
- **react-leaflet** + **Leaflet.js** — interactive maps with CartoDB Dark Matter tiles
- **Nominatim** (OpenStreetMap) — free geocoding, no API key required
- **localStorage** — all data persisted in the browser

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

**Demo login:** `admin@canvass.app` / `admin123`

## Deploy to Vercel

```bash
npm run build    # builds to /dist
```

Then push to GitHub and import the repo into Vercel — zero config needed. The `vercel.json` handles SPA routing automatically.

Or use the Vercel CLI:
```bash
npx vercel --prod
```

## Features

| Feature | Description |
|---|---|
| **Interactive Map** | Full-screen Leaflet map with dark CartoDB tiles |
| **Pin Dropping** | Click anywhere on the map to add a new lead |
| **Reverse Geocoding** | Address auto-fills when you drop a pin |
| **Search** | Nominatim autocomplete — search any neighborhood or address |
| **5 Lead Statuses** | Interested, Not Home, Follow Up, Not Interested, Do Not Knock |
| **Color-Coded Pins** | Teardrop pins color-coded by status |
| **Filter Bar** | Filter pins by status with live map updates |
| **Area Summary** | Real-time count of pins in the current map view |
| **Lead List** | Sortable table with click-to-jump-to-map |
| **Dashboard** | Stats by status, rep leaderboard, weekly activity |
| **Settings** | Team list, CSV export, data reset |
| **Mobile Nav** | Bottom bar on mobile, sidebar on desktop |
| **Demo Data** | 20 realistic leads across Burlington, ON pre-loaded |

## Project Structure

```
src/
  types/          — TypeScript interfaces + status config
  utils/          — localStorage, geocoding, CSV export
  data/           — 20 demo leads in Burlington, ON
  contexts/       — AppContext (global state + CRUD)
  components/
    auth/         — LoginScreen
    layout/       — Layout, Sidebar, BottomNav, Header
    map/          — MapView, PinForm, SearchBar, FilterBar, AreaSummary
    leads/        — LeadList (sortable table)
    dashboard/    — Dashboard (stats)
    settings/     — Settings (export, team, reset)
```

## Team

Pre-configured team members: Sarah Chen, Mike Rodriguez, Lisa Thompson, David Park, Tom Wilson, Emma Davis
