"""
Database connection setup. Reads config from environment variables so the
same code works against your Postgres (or MySQL) instance without edits.

Expected env vars (put these in a .env file, see .env.example):
    DB_DIALECT   postgresql | mysql   (default: postgresql)
    DB_USER
    DB_PASSWORD
    DB_HOST
    DB_PORT
    DB_NAME
"""
import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from models import Base

load_dotenv()

DIALECT = os.getenv("DB_DIALECT", "postgresql")
DRIVER = "psycopg2" if DIALECT == "postgresql" else "pymysql"
USER = os.getenv("DB_USER", "postgres")
# URL-encode the password so special characters (@, #, %, /, etc.) don't
# get misread as part of the connection string's structure.
PASSWORD = quote_plus(os.getenv("DB_PASSWORD", "postgres"))
HOST = os.getenv("DB_HOST", "localhost")
PORT = os.getenv("DB_PORT", "5432")
NAME = os.getenv("DB_NAME", "energy_analyzer")

DATABASE_URL = f"{DIALECT}+{DRIVER}://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables if they don't already exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency: yields a session and closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()