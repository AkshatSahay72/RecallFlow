from datetime import datetime 
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from langchain_core.tools import tool

from app.models.tasks import Task
from app.models.events import Event
from app.models.user import User

def get_user_tools(db: Session, current_user: User) -> List:
    """
    Generates a list of langchain tools pre-bound with the active database 
    session and the current user context. The LLM will only see inputs it 
    should control.
    """

    @tool
    async def create_task(title: str, description: Optional[str] = None, due_date: Optional[str] = None) -> str:
        """
        Creates a new tasks. 
        - due_date must be in ISO format (e.g., 'YYYY-MM-DDTHH:MM:SS')
        if provided.
        """
        parsed_due = None
        if due_date:
            try:
                parsed_due = datetime.fromisoformat(due_date)
            except ValueError:
                return "Error: due_date must be in ISO format (YYYY-MM-DDTT:MM:SS)."
        
        task = Task(
            title=title,
            description=description,
            due_date=parsed_due,
            owner_id=current_user.id
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return f"Successfully created task '{task.title}' (ID: {task.id})."

    @tool
    async def list_tasks() -> str:
        """
        Retrieves all tasks registered for the user.
        """
        statement = select(Task).where(Task.owner_id == current_user.id)
        tasks = db.execute(statement).scalars().all()
        if not tasks:
            return "No tasks found"

        results = []    
        
        for t in tasks:
            status = "Completed" if t.is_completed else "Pending"
            due = f" (Due: {t.due_date})" if t.due_date else ""
            results.append(f"- [{status}] ID: {t.id} - '{t.title}': {t.description or 'No desc'}{due}")
        return "\n".join(results)
    
    @tool
    async def update_task(
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        is_completed: Optional[bool] = None, 
        due_date: Optional[str] = None
    ) -> str:
        """
        Updates tasks parameters by ID. Pass only the arguments you want to change.
        - due_date must be in ISO format (YYYY-MM-DDTHH:MM:SS) if provided. 
        """

        statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
        task = db.execute(statement).scalar_one_or_none()
        if not task:
            return f"Error: Task with ID {task_id} not found."
        
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if is_completed is not None:
            task.is_completed = is_completed
        if due_date is not None:
            try:
                task.due_date = datetime.fromisoformat(due_date) if due_date else None
            except ValueError:
                return "Error: due_date must be in ISO format."
        
        db.add(task)
        db.commit()
        return f"Successfully updated task ID {task_id}."

    @tool
    async def delete_task(task_id: int) -> str:
        """
        Deletes a task by ID.
        """
        statement = select(Task).where(Task.id == task_id, Task.owner_id == current_user.id)
        task = db.execute(statement).scalar_one_or_none()
        if not task:
            return f"Error: Task with ID {task_id} not found."
        db.delete(task)
        db.commit()
        return f"Successfully deleted task ID {task_id}"
    
    @tool
    async def create_event(
        title: str, start_time: str, end_time: str, description: Optional[str]=None,
        location: Optional[str] = None
    ) -> str:
        """
        Creates a new event on the user's calendar.

        - start_time and end_time must be in ISO 8601 format (e.g., 'YYYY-MM-DDTHH:MM:SS')
        """

        try:
            start = datetime.fromisoformat(start_time)
            end = datetime.fromisoformat(end_time)
        except ValueError:
            return "Error: Start and end times must be in ISO format (YYYY-MM-DDTHH:MM:SS)."

        if start >= end:
            return "Error: start_time must be earlier than end_time."

        event = Event(
            title=title,
            description=description,
            start_time=start,
            end_time=end,
            location=location,
            owner_id=current_user.id
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return f"Successfully scheduled event '{event.title}' (ID: {event.id}, Start:{event.start_time})."

    @tool
    async def list_events() -> str:
        """
        Retrieves all calendar events for the user.
        """

        statement = select(Event).where(Event.owner_id == current_user.id).order_by(Event.start_time.asc())
        events = db.execute(statement).scalars().all()
        if not events:
            return "No events scheduled."
        
        results = []
        for e in events: 
            loc = f" @ {e.location}" if e.location else ""
            desc = f"({e.description})" if e.description else ""
            results.append(f"- ID: {e.id} - '{e.title}'{desc}: {e.start_time} to {e.end_time}{loc}")
        return "\n".join(results)
    
    @tool
    async def update_event(
        event_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,  # Added this parameter
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        location: Optional[str] = None
    ) -> str:
        """
        Update event details by ID. Pass only parameters you want to modify.
        - start_time and end_time must be in ISO format.
        """
        statement = select(Event).where(Event.id == event_id, Event.owner_id == current_user.id)
        event = db.execute(statement).scalar_one_or_none()
        if not event:
            return f"Error: Event with ID {event_id} not found."
        
        if title is not None:
            event.title = title
        if description is not None:
            event.description = description
        if location is not None:
            event.location = location
        try:
            if start_time is not None:
                event.start_time = datetime.fromisoformat(start_time)
            if end_time is not None:
                event.end_time = datetime.fromisoformat(end_time)
        except ValueError:
            return "Error: start_time and end_time must be in ISO format."
        
        if event.start_time >= event.end_time:
            return "Error: start_time must be earlier than end_time."
        
        db.add(event)
        db.commit()
        return f"Successfully updated event ID {event_id}."
        
    @tool
    async def delete_event(event_id: int) -> str:
        """
        Deletes a calendar event by ID.
        """
        statement = select(Event).where(Event.id == event_id, Event.owner_id == current_user.id)
        event = db.execute(statement).scalar_one_or_none()
        if not event:
            return f"Error: Event with ID {event_id} not found."

        db.delete(event)
        db.commit()
        return f"Successfully deleted event ID {event_id}."

    return [create_task, list_tasks, update_task, delete_task, 
            create_event, list_events, update_event, delete_event]

            
