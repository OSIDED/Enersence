# Energy Consumption Pattern Analyzer — Python Analytics Backend

This backend matches the schema diagram (Users, Appliances, Energy_Readings,
Recommendations, Reports, Dependent) and powers the Next.js
**Daily Consumption Calculator** page.

## Files
- `models.py` — SQLAlchemy ORM models, one per table in the ERD.
- `database.py` — engine/session setup, reads DB creds from `.env`.
- `analytics.py` — the kWh/cost math + pandas helpers (source of truth for calculations).
- `main.py` — FastAPI app exposing the REST endpoints the frontend calls.

## Setup
```bash
cp .env.example .env        # fill in your real DB credentials
pip install -r requirements.txt --break-system-packages
uvicorn main:app --reload --port 8000
```

`init_db()` runs on startup and creates any missing tables against your
existing Postgres/MySQL database — it won't touch tables that already exist
with data.

## Wiring into the Next.js frontend

In your form component, replace the placeholder state logic with real calls:

```js
// 1. Fetch appliances for the dropdown
useEffect(() => {
  fetch(`http://localhost:8000/api/appliances?user_id=${userId}`)
    .then(res => res.json())
    .then(setAppliances)
    .finally(() => setLoading(false));
}, [userId]);

// 2. Live preview — call on every change to hours/appliance
useEffect(() => {
  if (!selectedAppliance || !hours) return;
  fetch("http://localhost:8000/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      power_rating_watts: selectedAppliance.power_rating_watts,
      hours_used: parseFloat(hours),
    }),
  })
    .then(res => res.json())
    .then(setPreview);
}, [selectedAppliance, hours]);

// 3. Save Reading button
const handleSave = async () => {
  const res = await fetch("http://localhost:8000/api/readings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      appliance_id: selectedAppliance.appliance_id,
      hours_used: parseFloat(hours),
    }),
  });
  if (res.ok) {
    setSuccessMessage("Reading saved successfully");
    refreshTodayReadings();
  } else {
    setErrorMessage("Please select an appliance and enter valid hours");
  }
};

// 4. Today's Logged Appliances table
useEffect(() => {
  fetch(`http://localhost:8000/api/readings/today?user_id=${userId}`)
    .then(res => res.json())
    .then(setTodayReadings);
}, [userId]);
```

## Calculation logic (kept identical on both sides so numbers never drift)
```
energy_kwh = (power_rating_watts / 1000) * hours_used
estimated_cost = energy_kwh * RATE_PER_KWH   # default 1.50 GHS/kWh, override via .env
```

## Notes
- `Appliance.label` on the backend produces the exact dropdown string the
  design calls for: `"Refrigerator — Kitchen — 150W"`.
- `analytics.detect_high_usage_appliances()` is a starting point for feeding
  the `Recommendations` table — flags appliances whose average daily kWh
  exceeds a threshold, similar in spirit to your capstone's z-score/KMeans
  anomaly pipeline, just simplified for this screen.
- Swap `DB_DIALECT=mysql` in `.env` if you're hosting on InfinityFree/MySQL
  instead of Postgres — `database.py` picks the right driver automatically.
