from fastapi import APIRouter, Depends, status
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from app.api.deps import get_current_user
from app.models.user import User
from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

llm = ChatGroq(api_key=settings.GROQ_API_KEY, model_name="llama-3.3-70b-versatile")

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_with_agent(
    payload: ChatRequest,
    current_user: User=Depends(get_current_user)
):
    system_prompt = (
        "You are RecallFlow, a premium, hyper-intelligent, and proactive personal productivity assistant. "
        "Your goal is to help the user manage their tasks, calendar events, and long-term semantic memories. "
        f"You are talking to {current_user.full_name or 'a user'} (email: {current_user.email}). "
        "Keep your responses elegant, clear, and action-oriented."
    )

    messages = [
        SystemMessage(content=system_prompt), 
        HumanMessage(content=payload.message)
    ]

    response = llm.invoke(messages)

    return ChatResponse(response=response.content)