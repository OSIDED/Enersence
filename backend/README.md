# Energy Consumption Pattern Analyzer — Spring Boot Backend

This is the CRUD/API service the Next.js frontend actually talks to. It
owns everything button-related (Save Reading, dropdown data, viewing
recommendations/reports) and reads/writes the **same PostgreSQL database**
your Python analytics service uses.

## How the three services fit together

```
Next.js (port 3000)
    │  fetch("http://localhost:8081/api/...")
    ▼
Spring Boot (port 8081)  ──JDBC──►  PostgreSQL (energy_analyzer)
    │                                      ▲
    │  WebClient POST                      │  SQLAlchemy
    ▼  (only after Save Reading)           │
Python Analytics (port 8000)  ─────────────┘
```

- **Frontend → Spring Boot**: every button on the Next.js pages calls a
  Spring Boot endpoint (port 8081), not Python directly.
- **Spring Boot → PostgreSQL**: all CRUD (appliances, readings) reads and
  writes straight to Postgres via JPA/Hibernate.
- **Spring Boot → Python**: only ONE thing calls Python — after a reading
  is saved, `AnalyticsClientService` fires a request to
  `POST /api/analytics/run` on your Python service, asking it to refresh
  Recommendations. Everything else (Reports table, Recommendations list)
  is just a normal Spring Boot `GET` against Postgres — Spring Boot has no
  idea Python wrote those rows.

## Endpoints this service exposes to the frontend

| Method | Path | Powers |
|---|---|---|
| GET | `/api/appliances?user_id=1` | "Select Appliance" dropdown |
| POST | `/api/calculate` | Live preview panel (no DB write) |
| POST | `/api/readings` | "Save Reading" button — also triggers Python analysis |
| GET | `/api/readings/today?user_id=1` | "Today's Logged Appliances" table |
| GET | `/api/recommendations?user_id=1` | Insights page cards |
| DELETE | `/api/recommendations/{id}` | "Apply" / "Learn More" buttons |
| GET | `/api/reports?user_id=1` | "Historical Monthly Bills" table |
| POST | `/api/reports/generate?user_id=1` | "Export All" — triggers Python to compute a fresh report |

## Setup

### 1. Install Java 17+ and Maven
Check with:
```bash
java -version
mvn -version
```
If missing: download Java 17 (Temurin/Adoptium build is a good default) and Maven from their official sites, add both to PATH (same idea as the Python installer checkbox).

### 2. Configure the database connection
Edit `src/main/resources/application.properties` — update the password to match your actual Postgres password:
```properties
spring.datasource.password=Volticon2026
```

### 3. Build and run
```bash
mvn spring-boot:run
```
Should start on **port 8081** (deliberately different from Python's 8000, so both can run at once).

### 4. Point your Next.js frontend at Spring Boot instead of Python

In `lib/api.ts`, change the base URL:
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
```
And in `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

## Running all three services together (for your demo/defense)

```bash
# Terminal 1 — Python analytics service
cd Volticon
source venv/Scripts/activate
uvicorn main:app --reload --port 8000

# Terminal 2 — Spring Boot
cd energy-backend
mvn spring-boot:run

# Terminal 3 — Next.js frontend
cd lumina-dashboard
npm run dev
```

## Notes on `ddl-auto=validate`

The config deliberately uses `spring.jpa.hibernate.ddl-auto=validate`, not
`update` or `create`. This means Spring Boot will **check** that its
entity classes match the existing tables (created by Python's
`init_db()`) and fail loudly if they don't — it will never silently alter
your schema. Run the Python service at least once first so the tables
exist before starting Spring Boot.
