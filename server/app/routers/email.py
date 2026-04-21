from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app import models
from app.services.email_service import send_reminder_email

router = APIRouter()

@router.post("/test")
def test_email(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        send_reminder_email(
            name=current_user.name,
            email=current_user.email,
            stats={"total_sessions": 0, "total_minutes": 0, "avg_rating": None},
        )
        return {"ok": True, "message": "Test email sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
