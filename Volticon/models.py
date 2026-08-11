"""
SQLAlchemy ORM models mirroring the ENERGY CONSUMPTION PATTERN ANALYZER
relational schema (Users, Appliances, Energy_Readings, Recommendations,
Reports, Dependent).
"""
from datetime import datetime, date, time
from sqlalchemy import (
    Column, Integer, String, Float, Date, Time, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    created_at = Column(DateTime, default=datetime.utcnow)

    appliances = relationship("Appliance", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    dependents = relationship("Dependent", back_populates="user", cascade="all, delete-orphan")


class Appliance(Base):
    __tablename__ = "appliances"

    appliance_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    meter_id = Column(Integer, ForeignKey("meters.meter_id"), nullable=True)
    appliance_name = Column(String(150), nullable=False)
    category = Column(String(80))
    power_rating_watts = Column(Float, nullable=False)
    location = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="appliances")
    readings = relationship("EnergyReading", back_populates="appliance", cascade="all, delete-orphan")

    @property
    def label(self) -> str:
        """Matches the frontend dropdown label: 'Refrigerator — Kitchen — 150W'"""
        return f"{self.appliance_name} — {self.location or 'N/A'} — {int(self.power_rating_watts)}W"


class EnergyReading(Base):
    __tablename__ = "energy_readings"

    reading_id = Column(Integer, primary_key=True, autoincrement=True)
    appliance_id = Column(Integer, ForeignKey("appliances.appliance_id"), nullable=False)
    reading_date = Column(Date, default=date.today, nullable=False)
    reading_time = Column(Time, default=lambda: datetime.now().time())
    duration_hours = Column(Float, nullable=False)
    energy_used_kwh = Column(Float, nullable=False)
    estimated_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    appliance = relationship("Appliance", back_populates="readings")


class Recommendation(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    recommendation_type = Column(String(80))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class Report(Base):
    __tablename__ = "reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    report_type = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date)
    total_consumption_kwh = Column(Float)
    estimated_total_cost = Column(Float)
    generated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")


class Dependent(Base):
    __tablename__ = "dependent"

    dependent_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    dependent_name = Column(String(150))
    sex = Column(String(10))
    bdate = Column(Date)
    relationship_ = Column("relationship", String(50))

    user = relationship("User", back_populates="dependents")


class Meter(Base):
    __tablename__ = "meters"

    meter_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    meter_name = Column(String(150), nullable=False)
    serial_number = Column(String(100))
    meter_type = Column(String(50))  # e.g. "utility", "solar", "ev_charger"
    status = Column(String(20), default="ONLINE")  # ONLINE | SYNCING | OFFLINE
    last_reading_kwh = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
