from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.events import Event
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router=APIRouter()

@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    db_event = Event(**event_in.model_dump(), owner_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/", response_model=List[EventResponse])
def read_events(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Event).where(Event.owner_id == current_user.id)
    events = db.execute(statement).scalars().all()
    return events


@router.get("/{event_id}", response_model=EventResponse)
def read_event(
    event_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Event).where(Event.id == event_id, Event.owner_id == current_user.id)
    db_event = db.execute(statement).scalar_one_or_none()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found or access denied"
        )
    return db_event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int, 
    event_in: EventUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Event).where(Event.id == event_id, Event.owner_id == current_user.id)
    db_event = db.execute(statement).scalar_one_or_none()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found or access denied"
        )
    update_data = event_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_event, field, value)
        
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    statement = select(Event).where(Event.id == event_id, Event.owner_id == current_user.id)
    db_event = db.execute(statement).scalar_one_or_none()
    if not db_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found or access denied"
        )
    db.delete(db_event)
    db.commit()
    return None