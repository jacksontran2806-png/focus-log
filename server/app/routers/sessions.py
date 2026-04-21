from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app import models, schemas

router = APIRouter()

@router.get("/", response_model=list[schemas.SessionOut])
def list_sessions(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = (
        db.query(models.Session)
        .filter(models.Session.user_id == current_user.id)
        .order_by(models.Session.start_time.desc())
        .all()
    )
    return [_to_out(s) for s in sessions]

@router.post("/", response_model=schemas.SessionOut, status_code=201)
def create_session(
    body: schemas.SessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = models.Session(
        user_id=current_user.id,
        label=body.label,
        start_time=body.startTime,
        end_time=body.endTime,
        duration_seconds=body.durationSeconds,
        focus_rating=body.focusRating,
        distraction_type=body.distractionType,
        distraction_note=body.distractionNote,
        what_went_well=body.whatWentWell,
        what_to_do_better=body.whatToDoBetter,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return _to_out(session)

@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(session)
    db.commit()
    return {"ok": True}

def _to_out(s: models.Session) -> dict:
    return schemas.SessionOut(
        id=s.id, userId=s.user_id, label=s.label,
        startTime=s.start_time, endTime=s.end_time,
        durationSeconds=s.duration_seconds, focusRating=s.focus_rating,
        distractionType=s.distraction_type, distractionNote=s.distraction_note,
        whatWentWell=s.what_went_well, whatToDoBetter=s.what_to_do_better,
        createdAt=s.created_at,
    )
