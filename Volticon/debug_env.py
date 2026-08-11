"""
Diagnostic script — run this to see exactly what database.py is reading
from your .env file. Helps catch typos, wrong paths, or stray quotes.

Run:
    python debug_env.py
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("DB_DIALECT:", repr(os.getenv("DB_DIALECT")))
print("DB_USER:", repr(os.getenv("DB_USER")))
print("DB_PASSWORD:", repr(os.getenv("DB_PASSWORD")))
print("DB_HOST:", repr(os.getenv("DB_HOST")))
print("DB_PORT:", repr(os.getenv("DB_PORT")))
print("DB_NAME:", repr(os.getenv("DB_NAME")))

print("\n.env file found at:", os.path.abspath(".env"))
print(".env exists:", os.path.exists(".env"))