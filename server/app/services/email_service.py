import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, APP_URL

MOTIVATIONAL = [
    "Every minute of focus compounds into mastery.",
    "Deep work is the superpower of the 21st century.",
    "The session you almost skipped is the one that builds the habit.",
    "Focus is the art of saying no to a thousand distractions.",
    "Consistency beats intensity every time.",
]

def send_reminder_email(name: str, email: str, stats: dict, app_url: str = APP_URL):
    total_sessions = stats.get("total_sessions", 0)
    total_minutes = stats.get("total_minutes", 0)
    avg_rating = stats.get("avg_rating")
    link = app_url or APP_URL

    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #4f46e5;">Time to focus, {name} 🎯</h2>
      <p style="color: #6b7280; font-size: 15px;">{random.choice(MOTIVATIONAL)}</p>
      <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px; font-size: 14px; color: #374151;">Yesterday's stats</h3>
        <p style="margin: 4px 0; color: #111827;">Sessions: <strong>{total_sessions}</strong></p>
        <p style="margin: 4px 0; color: #111827;">Total focus time: <strong>{total_minutes} min</strong></p>
        <p style="margin: 4px 0; color: #111827;">Avg focus rating: <strong>{avg_rating or "—"}</strong></p>
      </div>
      <a href="{link}/timer"
         style="display: inline-block; background: #4f46e5; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
        Start a session →
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        You're receiving this because you have daily reminders enabled.
        <a href="{link}/settings" style="color: #6b7280;">Manage settings</a>
      </p>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Time to focus, {name} 🎯"
    msg["From"] = SMTP_USER
    msg["To"] = email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, email, msg.as_string())
