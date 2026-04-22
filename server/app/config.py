import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/focuslog")
JWT_SECRET = os.getenv("JWT_SECRET", "change-this")
JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET", "change-this-too")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
APP_URL = os.getenv("APP_URL", "http://localhost:5173")
PORT = int(os.getenv("PORT", "3001"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
