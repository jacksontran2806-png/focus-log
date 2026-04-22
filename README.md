# Focus Log

> **Status: In Development** — core timer and dashboard work in guest mode (localStorage). Account auth, database sync, and email features are not yet functional.

A full-stack web app for students to track focused vs distracted study time.

## Stack

- **Frontend**: React + Vite + React Router v6 + Tailwind CSS
- **State**: React Context + useReducer
- **Storage**: localStorage (guest mode, working) → PostgreSQL via SQLAlchemy (in development)
- **Backend**: Python + FastAPI + Uvicorn
- **Database**: PostgreSQL + SQLAlchemy ORM + Alembic migrations (in development — no DB required to run)
- **Auth**: JWT via python-jose (in development — requires database)
- **Email**: smtplib via Gmail app password (in development — requires SMTP config)
- **Scheduler**: APScheduler daily reminder cron (in development)

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

### Working
- **Timer** — countdown with 25/50 min presets, custom duration, pause/resume, sessionStorage persistence
- **Post-session form** — 10-star rating (hover preview), distraction chip selector, contextual tips, reflections
- **Dashboard** — total/today/week time, avg rating, efficiency score, streak, bar chart, trend line, donut chart, session table
- **Guest mode** — all data saved to localStorage, no account needed
- **Settings** — dark mode, font size (localStorage)

### In Development
- **Account auth** — JWT login/register with refresh tokens (requires PostgreSQL)
- **Session sync** — persist sessions to backend database (requires PostgreSQL)
- **Email reminders** — daily APScheduler job, timezone-aware, configurable per user (requires SMTP + database)
- **Subscription / Pro plan** — upgrade flow UI exists but payment is not implemented

## Database schema

SQLAlchemy models: `server/app/models.py`  
Alembic migrations: `server/alembic/versions/`

To generate a new migration after changing models:
```bash
cd server && alembic revision --autogenerate -m "describe change"
```
