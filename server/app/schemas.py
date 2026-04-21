from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

# Auth
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    accessToken: str
    user: dict

class AccessTokenResponse(BaseModel):
    accessToken: str

# Sessions
class SessionCreate(BaseModel):
    label: Optional[str] = None
    startTime: datetime
    endTime: datetime
    durationSeconds: int
    focusRating: int
    distractionType: str
    distractionNote: Optional[str] = None
    whatWentWell: Optional[str] = None
    whatToDoBetter: Optional[str] = None

class SessionOut(BaseModel):
    id: str
    userId: str
    label: Optional[str]
    startTime: datetime
    endTime: datetime
    durationSeconds: int
    focusRating: int
    distractionType: str
    distractionNote: Optional[str]
    whatWentWell: Optional[str]
    whatToDoBetter: Optional[str]
    createdAt: datetime

    class Config:
        from_attributes = True

# Users
class UserSettingsUpdate(BaseModel):
    emailRemindersEnabled: Optional[bool] = None
    reminderTime: Optional[str] = None
    timezone: Optional[str] = None

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    timezone: str
    emailRemindersEnabled: bool
    reminderTime: str

    class Config:
        from_attributes = True
