# Lumina Energy Dashboard (Next.js)

Matches the "Energy Overview" screen: stat cards, Connected Meters, 7-day
usage bar chart, Active Alerts, and Efficiency Tips — built with Next.js
(App Router) + Tailwind CSS + Recharts, wired to your FastAPI backend
(the `energy_analyzer` project from earlier).

## Files
- `app/page.tsx` — the dashboard screen itself
- `app/layout.tsx`, `app/globals.css` — app shell + Tailwind setup
- `components/Sidebar.tsx` — left nav
- `components/StatCard.tsx` — the 3 top metric cards
- `components/MeterCard.tsx` — Connected Meters cards
- `components/UsageChart.tsx` — the 7-day bar chart (Recharts)
- `lib/api.ts` — fetch functions that call your FastAPI backend

## 1. Install Node.js (if you don't have it)

Download the LTS version from https://nodejs.org and install it (same
"Add to PATH" idea as Python — the installer does this automatically on
Windows).

Verify:
```bash
node --version
npm --version
```

## 2. Install dependencies

From inside this project folder:
```bash
npm install
```

## 3. Point it at your FastAPI backend

Copy the env example:
```bash
cp .env.local.example .env.local
```

It defaults to:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
That's correct as long as your FastAPI server (from the `energy_analyzer`
project) is running on port 8000, same as before.

## 4. Run both servers side by side

**Terminal 1 — backend (your existing FastAPI project):**
```bash
cd path/to/Volticon
source venv/Scripts/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — this frontend:**
```bash
cd path/to/lumina-dashboard
npm run dev
```

Open http://localhost:3000 — you should see the dashboard.

## How the linking works

`lib/api.ts` calls your FastAPI `/api/summary/today?user_id=1` endpoint on
page load to pull the real total kWh and estimated cost from Postgres (via
the `analytics.daily_summary()` function you already have). If the backend
isn't running yet, the page still renders using placeholder numbers
(452 kWh / $84.50) so you're never blocked — once the API responds, real
numbers take over automatically.

The **Connected Meters** and **Active Alerts / Efficiency Tips** sections
are currently static placeholders, since your database schema doesn't yet
have tables for physical meters or generated alerts — those aren't in the
ERD you shared. If you want those to be real and dynamic too, the natural
next step is:
- A `meters` table (linked to `user_id`) for Connected Meters
- Feeding **Efficiency Tips** from your existing `Recommendations` table
  (you already have `analytics.detect_high_usage_appliances()` as a
  starting point for generating these)

Want me to wire the Efficiency Tips panel to your real `Recommendations`
table next? That one's a straightforward connection since the backend
already supports it.
