from datetime import datetime, timedelta, timezone
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
from app.database import SessionLocal
from app import models
from app.services.email_service import send_reminder_email

sent_log: set[str] = set()

def _sent_key(user_id: str) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return f"{user_id}:{today}"

def _get_yesterday_stats(db, user_id: str) -> dict:
    now = datetime.now(timezone.utc)
    yesterday_start = (now - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    yesterday_end = yesterday_start.replace(hour=23, minute=59, second=59)

    sessions = (
        db.query(models.Session)
        .filter(
            models.Session.user_id == user_id,
            models.Session.start_time >= yesterday_start,
            models.Session.start_time <= yesterday_end,
        )
        .all()
    )
    total_minutes = round(sum(s.duration_seconds for s in sessions) / 60)
    avg_rating = (
        round(sum(s.focus_rating for s in sessions) / len(sessions), 1)
        if sessions else None
    )
    return {"total_sessions": len(sessions), "total_minutes": total_minutes, "avg_rating": avg_rating}

def check_and_send_reminders():
    now_utc = datetime.now(timezone.utc)
    db = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.email_reminders_enabled == True).all()
        for user in users:
            key = _sent_key(user.id)
            if key in sent_log:
                continue
            try:
                tz = pytz.timezone(user.timezone or "UTC")
            except Exception:
                tz = pytz.utc
            user_now = now_utc.astimezone(tz)
            user_hhmm = user_now.strftime("%H:%M")
            if user_hhmm == user.reminder_time:
                sent_log.add(key)
                try:
                    stats = _get_yesterday_stats(db, user.id)
                    send_reminder_email(name=user.name, email=user.email, stats=stats)
                    print(f"Reminder sent to {user.email}")
                except Exception as e:
                    print(f"Failed to send reminder to {user.email}: {e}")
                    sent_log.discard(key)
    finally:
        db.close()

def start_reminder_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_and_send_reminders, "cron", minute="*")
    scheduler.start()
    print("Reminder scheduler started")
    return scheduler
