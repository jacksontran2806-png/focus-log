from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from fastapi import HTTPException
from app.config import DATABASE_URL

class Base(DeclarativeBase):
    pass

try:
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    _db_available = True
except Exception as e:
    print(f"[DB] Not connected: {e}")
    engine = None
    SessionLocal = None
    _db_available = False

def get_db():
    if not _db_available or SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database not configured. Use guest mode.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
