"""
FastAPI ANALYTICS SERVICE — one piece of the 5-person capstone.

Architecture (shared-database pattern):

    Next.js ──HTTP──► Spring Boot ──JDBC──► PostgreSQL ◄──SQLAlchemy── This service
                       (auth, CRUD:                          (reads Energy_Readings/
                        appliances, devices,                  Appliances, writes
                        readings, meters)                      Recommendations/Reports)

This service does NOT serve the frontend directly, and does NOT own any
CRUD routes (Save Reading, Add Device, etc. — those live in Spring Boot).
Its only job is to run analytics against the shared Postgres database and
write results back into Recommendations and Reports. Spring Boot then just
SELECTs from those tables like any other table — it doesn't know or care
that Python produced the data.

Run:
    uvicorn main:app --reload --port 8000

Two ways this gets triggered:
  1. Manually / on a schedule — a cron job, Windows Task Scheduler, or
     Celery beat hits POST /api/analytics/run periodically (e.g. nightly).
  2. On-demand — the Spring Boot service calls POST /api/analytics/run
     itself (e.g. right after a new reading is saved), if the team wants
     near-real-time recommendations instead of waiting for the schedule.

Either way, Spring Boot only ever makes ONE type of call to this service:
"run the analysis for this user." It never asks this service to return
data directly to the frontend.
"""
from datetime import date, timedelta
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db, init_db
import analytics

app = FastAPI(title="Energy Consumption Pattern Analyzer — Analytics Service")

# Only Spring Boot (and local tooling) should ever call this service —
# not the browser directly. Restrict CORS accordingly once you know
# Spring Boot's host; wide open for now during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# ---------------------------- Schemas --------------------------------------

class RunAnalysisIn(BaseModel):
    user_id: int
    high_usage_threshold_kwh: float = Field(default=5.0, gt=0)


class RunAnalysisOut(BaseModel):
    user_id: int
    recommendations_created: int
    daily_summary: dict


class GenerateReportIn(BaseModel):
    user_id: int
    start_date: date
    end_date: date
    report_type: str = "custom"


class ReportOut(BaseModel):
    report_id: int
    report_type: str
    start_date: date
    end_date: date
    total_consumption_kwh: float
    estimated_total_cost: float


# ---------------------------- Routes ----------------------------------------

@app.post("/api/analytics/run", response_model=RunAnalysisOut)
def run_analysis(payload: RunAnalysisIn, db: Session = Depends(get_db)):
    """
    The main entry point Spring Boot (or a scheduler) calls. Runs the
    high-usage detector, writes any new Recommendation rows, and returns
    a quick summary — Spring Boot doesn't need the summary for anything,
    it's just useful for logging/confirmation that the job ran.
    """
    try:
        created = analytics.generate_recommendations(
            db, payload.user_id, payload.high_usage_threshold_kwh
        )
        summary = analytics.daily_summary(db, payload.user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    return RunAnalysisOut(
        user_id=payload.user_id,
        recommendations_created=len(created),
        daily_summary=summary,
    )


@app.post("/api/analytics/reports/generate", response_model=ReportOut)
def generate_report(payload: GenerateReportIn, db: Session = Depends(get_db)):
    """
    Aggregates readings between two dates into one Report row. Spring
    Boot calls this at the end of a billing period (e.g. a monthly cron),
    then its own /reports endpoint just reads rows back out for the
    frontend — no aggregation logic needs to live in Java at all.
    """
    if payload.end_date < payload.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    report = analytics.generate_report(
        db, payload.user_id, payload.start_date, payload.end_date, payload.report_type
    )
    return ReportOut(
        report_id=report.report_id,
        report_type=report.report_type,
        start_date=report.start_date,
        end_date=report.end_date,
        total_consumption_kwh=report.total_consumption_kwh,
        estimated_total_cost=report.estimated_total_cost,
    )


@app.post("/api/analytics/reports/generate-monthly", response_model=ReportOut)
def generate_monthly_report(user_id: int, db: Session = Depends(get_db)):
    """
    Convenience wrapper: generates a report for the last 30 days without
    Spring Boot needing to compute the date range itself.
    """
    end = date.today()
    start = end - timedelta(days=30)
    report = analytics.generate_report(db, user_id, start, end, report_type="monthly")
    return ReportOut(
        report_id=report.report_id,
        report_type=report.report_type,
        start_date=report.start_date,
        end_date=report.end_date,
        total_consumption_kwh=report.total_consumption_kwh,
        estimated_total_cost=report.estimated_total_cost,
    )


@app.get("/api/analytics/summary")
def get_summary(user_id: int, db: Session = Depends(get_db)):
    """
    Optional read-only endpoint — useful for your own testing/demo without
    needing Spring Boot running. Not required for the production flow,
    since Spring Boot reads Reports/Recommendations directly from Postgres.
    """
    return analytics.daily_summary(db, user_id)


@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics", "date": str(date.today())}