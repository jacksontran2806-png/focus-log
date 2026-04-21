from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app import models, schemas

router = APIRouter()

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return schemas.UserOut(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        plan=current_user.plan,
        timezone=current_user.timezone,
        emailRemindersEnabled=current_user.email_reminders_enabled,
        reminderTime=current_user.reminder_time,
    )

@router.patch("/settings")
def update_settings(
    body: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.emailRemindersEnabled is not None:
        current_user.email_reminders_enabled = body.emailRemindersEnabled
    if body.reminderTime is not None:
        current_user.reminder_time = body.reminderTime
    if body.timezone is not None:
        current_user.timezone = body.timezone
    db.commit()
    return {
        "emailRemindersEnabled": current_user.email_reminders_enabled,
        "reminderTime": current_user.reminder_time,
        "timezone": current_user.timezone,
    }
