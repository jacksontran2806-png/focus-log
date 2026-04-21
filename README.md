# Focus Log

A full-stack web app for students to track focused vs distracted study time.

## Stack

- **Frontend**: React + Vite + React Router v6 + Tailwind CSS
- **State**: React Context + useReducer
- **Storage**: localStorage (Phase 1, fully working) → PostgreSQL via SQLAlchemy (Phase 2)
- **Backend**: Python + FastAPI + Uvicorn
- **Database**: PostgreSQL + SQLAlchemy ORM + Alembic migrations
- **Auth**: JWT via python-jose (access token in memory, refresh token in httpOnly cookie)
- **Email**: smtplib (built-in Python, Gmail app password via env vars)
- **Scheduler**: APScheduler (daily reminder cron)

## Setup

### 1. Install frontend dependencies

```bash
cd client && npm install
```

### 2. Install backend dependencies

```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env with your DATABASE_URL, JWT secrets, and SMTP credentials
```

### 4. Run database migrations

```bash
cd server
alembic upgrade head
```

### 5. Run

```bash
# Terminal 1 — backend (from server/)
python main.py

# Terminal 2 — frontend (from client/)
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:3001  
Auto-generated API docs: http://localhost:3001/docs

## Features

- **Timer** — countdown with 25/50 min presets, custom duration, pause/resume, sessionStorage persistence
- **Post-session form** — 10-star rating (hover preview), distraction chip selector, contextual tips, reflections
- **Dashboard** — total/today/week time, avg rating, efficiency score, streak, bar chart, trend line, donut chart, session table
- **Auth** — JWT with refresh tokens, guest mode (localStorage only)
- **Email reminders** — daily APScheduler job, timezone-aware, configurable per user
- **Subscription gating** — Free vs Pro (simulated, no payment)

## Database schema

SQLAlchemy models: `server/app/models.py`  
Alembic migrations: `server/alembic/versions/`

To generate a new migration after changing models:
```bash
cd server && alembic revision --autogenerate -m "describe change"
```
