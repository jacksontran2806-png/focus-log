from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import APP_URL, PORT
from app.routers import auth, sessions, users, email
from app.services.reminder_scheduler import start_reminder_scheduler
from app.database import Base, engine

app = FastAPI(title="Focus Log API")

if engine is not None:
    Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[APP_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(email.router, prefix="/api/email", tags=["email"])

@app.get("/api/health")
def health():
    return {"ok": True}

start_reminder_scheduler()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
