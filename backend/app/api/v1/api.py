from fastapi import APIRouter
from app.api.v1.endpoints import health, users , login , task, event

api_router = APIRouter()
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(login.router, tags=["Login"])
api_router.include_router(task.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(event.router, prefix="/events", tags=["Events"])