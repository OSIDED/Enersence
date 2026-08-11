"""
Analytics module: the calculation logic that mirrors what the Next.js
"Daily Consumption Calculator" does client-side for its live preview
panel, plus pandas-based aggregation helpers for reports/recommendations.

kWh formula:   energy_kwh = (power_rating_watts / 1000) * hours_used
Cost formula:  cost = energy_kwh * RATE_PER_KWH

RATE_PER_KWH defaults to Ghana's residential ECG-style flat estimate but
is override-able via env var for accuracy against current tariffs.
"""
import os
from datetime import date, datetime
from typing import Optional

import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func

from models import Appliance, EnergyReading, Recommendation, Report

RATE_PER_KWH = float(os.getenv("RATE_PER_KWH_GHS", "1.50"))  # GHS per kWh


def calculate_consumption(power_rating_watts: float, hours_used: float,
                           rate_per_kwh: float = RATE_PER_KWH) -> dict:
    """
    Pure calculation function — no DB access. This is the single source of
    truth the FastAPI route and the frontend's expected response shape both
    rely on, so the live preview panel and the saved record never drift.
    """
    if power_rating_watts is None or hours_used is None:
        raise ValueError("power_rating_watts and hours_used are required")
    if hours_used < 0 or hours_used > 24:
        raise ValueError("hours_used must be between 0 and 24")
    if power_rating_watts <= 0:
        raise ValueError("power_rating_watts must be positive")

    energy_kwh = round((power_rating_watts / 1000.0) * hours_used, 4)
    estimated_cost = round(energy_kwh * rate_per_kwh, 2)

    return {
        "energy_used_kwh": energy_kwh,
        "estimated_cost": estimated_cost,
        "rate_per_kwh": rate_per_kwh,
    }


def save_reading(db: Session, user_id: int, appliance_id: int,
                  hours_used: float, reading_date: Optional[date] = None) -> EnergyReading:
    """
    Validates the appliance belongs to the user, computes kWh/cost, and
    persists an Energy_Readings row. Raises ValueError on bad input so the
    API layer can translate it into the frontend's red error banner.
    """
    appliance = (
        db.query(Appliance)
        .filter(Appliance.appliance_id == appliance_id, Appliance.user_id == user_id)
        .first()
    )
    if appliance is None:
        raise ValueError("Please select an appliance and enter valid hours")

    result = calculate_consumption(appliance.power_rating_watts, hours_used)

    reading = EnergyReading(
        appliance_id=appliance_id,
        reading_date=reading_date or date.today(),
        reading_time=datetime.now().time(),
        duration_hours=hours_used,
        energy_used_kwh=result["energy_used_kwh"],
        estimated_cost=result["estimated_cost"],
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get_today_readings(db: Session, user_id: int, day: Optional[date] = None) -> pd.DataFrame:
    """
    Returns "Today's Logged Appliances" as a DataFrame with columns:
    appliance_name, hours_used, energy_used_kwh, estimated_cost — the exact
    shape the frontend's table row needs.
    """
    day = day or date.today()
    rows = (
        db.query(
            Appliance.appliance_name.label("appliance_name"),
            EnergyReading.duration_hours.label("hours_used"),
            EnergyReading.energy_used_kwh.label("energy_used_kwh"),
            EnergyReading.estimated_cost.label("estimated_cost"),
            EnergyReading.reading_id.label("reading_id"),
        )
        .join(Appliance, Appliance.appliance_id == EnergyReading.appliance_id)
        .filter(Appliance.user_id == user_id, EnergyReading.reading_date == day)
        .order_by(EnergyReading.reading_time.desc())
        .all()
    )
    return pd.DataFrame([r._asdict() for r in rows])


def daily_summary(db: Session, user_id: int, day: Optional[date] = None) -> dict:
    """Total kWh / cost for the day — handy for a dashboard header stat."""
    df = get_today_readings(db, user_id, day)
    if df.empty:
        return {"total_kwh": 0.0, "total_cost": 0.0, "readings_count": 0}
    return {
        "total_kwh": round(df["energy_used_kwh"].sum(), 4),
        "total_cost": round(df["estimated_cost"].sum(), 2),
        "readings_count": len(df),
    }


def detect_high_usage_appliances(db: Session, user_id: int, threshold_kwh: float = 5.0) -> pd.DataFrame:
    """
    Simple anomaly-style flag reused from the capstone's analytics pipeline
    idea: appliances whose average daily kWh exceeds a threshold, useful
    for feeding the Recommendations table.
    """
    rows = (
        db.query(
            Appliance.appliance_id,
            Appliance.appliance_name,
            func.avg(EnergyReading.energy_used_kwh).label("avg_kwh"),
        )
        .join(EnergyReading, EnergyReading.appliance_id == Appliance.appliance_id)
        .filter(Appliance.user_id == user_id)
        .group_by(Appliance.appliance_id, Appliance.appliance_name)
        .all()
    )
    df = pd.DataFrame([r._asdict() for r in rows])
    if df.empty:
        return df
    return df[df["avg_kwh"] > threshold_kwh].reset_index(drop=True)


def generate_recommendations(db: Session, user_id: int, threshold_kwh: float = 5.0) -> list[Recommendation]:
    """
    Runs the high-usage detection and writes a Recommendation row per
    flagged appliance. This is the function Spring Boot indirectly relies
    on: it never runs this logic itself, it just SELECTs from the
    Recommendations table afterward and serves it to the frontend as-is.

    Called by the /api/analytics/run trigger endpoint, or on a schedule
    (cron / Celery beat / Windows Task Scheduler) independent of the
    Spring Boot service.
    """
    flagged = detect_high_usage_appliances(db, user_id, threshold_kwh)
    created: list[Recommendation] = []

    for _, row in flagged.iterrows():
        # Avoid spamming duplicate recommendations for the same appliance —
        # only create one if it doesn't already have an open one.
        existing = (
            db.query(Recommendation)
            .filter(
                Recommendation.user_id == user_id,
                Recommendation.recommendation_type == "high_usage",
                Recommendation.message.like(f"%{row['appliance_name']}%"),
            )
            .first()
        )
        if existing:
            continue

        rec = Recommendation(
            user_id=user_id,
            recommendation_type="high_usage",
            message=(
                f"{row['appliance_name']} is averaging "
                f"{row['avg_kwh']:.2f} kWh per use, above your "
                f"{threshold_kwh} kWh threshold. Consider reducing usage "
                f"hours or checking for inefficiency."
            ),
        )
        db.add(rec)
        created.append(rec)

    db.commit()
    for rec in created:
        db.refresh(rec)
    return created


def generate_report(db: Session, user_id: int, start_date: date, end_date: date,
                     report_type: str = "custom") -> Report:
    """
    Aggregates Energy_Readings between two dates into a single Report row.
    Spring Boot's Reports endpoint just reads rows from this table — all
    the aggregation math happens here, once, not on every page load.
    """
    rows = (
        db.query(EnergyReading)
        .join(Appliance, Appliance.appliance_id == EnergyReading.appliance_id)
        .filter(
            Appliance.user_id == user_id,
            EnergyReading.reading_date >= start_date,
            EnergyReading.reading_date <= end_date,
        )
        .all()
    )

    total_kwh = sum(r.energy_used_kwh for r in rows)
    total_cost = sum(r.estimated_cost for r in rows)

    report = Report(
        user_id=user_id,
        report_type=report_type,
        start_date=start_date,
        end_date=end_date,
        total_consumption_kwh=round(total_kwh, 4),
        estimated_total_cost=round(total_cost, 2),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report