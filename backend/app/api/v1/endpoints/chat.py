from datetime import datetime
import re
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain.agents import create_agent
from langgraph.checkpoint.memory import MemorySaver

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.core.config import settings
from app.schemas.chat import ChatRequest, ChatResponse
from app.agent.tools import get_user_tools

router = APIRouter()

llm = ChatGroq(
    groq_api_key=settings.GROQ_API_KEY, 
    model_name=settings.LLM_MODEL, 
    temperature=0.1
)

# Instantiate the in-memory checkpointer for session state persistence
memory_checkpointer = MemorySaver()

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_agent(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tools = get_user_tools(db, current_user)

    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    system_prompt = (
        "You are RecallFlow, a premium, hyper-intelligent, and proactive personal productivity assistant. "
        "Your goal is to help the user manage their tasks, calendar events, and memories. "
        "You have access to tools to create, view, update, and delete tasks and calendar events. "
        "Always use these tools when asked to execute task or schedule actions. "
        "If a tool call fails, inform the user about the issue clearly. "
        "Keep your final responses elegant, clear, and user-centric.\n"
        "CRITICAL: Do not use markdown syntax (such as double asterisks '**' for bold, single asterisks '*' for italics, markdown titles like '#', or bullet dashes '-') in your responses. Always use clean plain text, with regular spacing and standard text lists (e.g. 1. or 2.) for structure.\n"
        f"Today's date and time is: {current_time_str}."
    )

    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt,
        checkpointer=memory_checkpointer
    )

    config = {"configurable": {"thread_id": f"user_{current_user.id}_chat"}}
    response = await agent.ainvoke(
        {"messages": [HumanMessage(content=payload.message)]},
        config=config
    )

    final_message = response["messages"][-1]
    cleaned_content = re.sub(r"<think>.*?</think>", "", final_message.content, flags=re.DOTALL).strip()
    return ChatResponse(response=cleaned_content)
