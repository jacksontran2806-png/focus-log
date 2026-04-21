from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from typing import Optional
from app.config import (
    JWT_SECRET, JWT_REFRESH_SECRET, JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
)
from app.database import get_db
from app import models, schemas

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def make_access_token(user: models.User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": user.id, "email": user.email, "name": user.name, "exp": exp},
        JWT_SECRET, algorithm=JWT_ALGORITHM,
    )

def make_refresh_token(user: models.User) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": user.id, "exp": exp}, JWT_REFRESH_SECRET, algorithm=JWT_ALGORITHM)

def set_refresh_cookie(response: Response, token: str):
    response.set_cookie(
        key="refreshToken",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth",
    )

@router.post("/register")
def register(body: schemas.RegisterRequest, response: Response, db: Session = Depends(get_db)):
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if db.query(models.User).filter(models.User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(
        email=body.email,
        password_hash=pwd_context.hash(body.password),
        name=body.name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = make_access_token(user)
    set_refresh_cookie(response, make_refresh_token(user))
    return {"accessToken": access_token, "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan}}

@router.post("/login")
def login(body: schemas.LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == body.email).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = make_access_token(user)
    set_refresh_cookie(response, make_refresh_token(user))
    return {"accessToken": access_token, "user": {"id": user.id, "name": user.name, "email": user.email, "plan": user.plan}}

@router.post("/refresh")
def refresh(response: Response, refreshToken: Optional[str] = Cookie(default=None), db: Session = Depends(get_db)):
    if not refreshToken:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(refreshToken, JWT_REFRESH_SECRET, algorithms=[JWT_ALGORITHM])
        user = db.query(models.User).filter(models.User.id == payload["sub"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalid")

    return {"accessToken": make_access_token(user)}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refreshToken", path="/api/auth")
    return {"ok": True}
