from datetime import datetime
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain.agents import create_agent

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

@router.post("/", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_agent(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Instantiate tools bound to the active user session
    tools = get_user_tools(db, current_user)

    # 2. Construct dynamic system prompt
    current_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    system_prompt = (
        "You are RecallFlow, a premium, hyper-intelligent, and proactive personal productivity assistant. "
        "Your goal is to help the user manage their tasks, calendar events, and memories. "
        "You have access to tools to create, view, update, and delete tasks and calendar events. "
        "Always use these tools when asked to execute task or schedule actions. "
        "If a tool call fails, inform the user about the issue clearly. "
        "Keep your final responses elegant, clear, and user-centric.\n"
        f"Today's date and time is: {current_time_str}."
    )

    # 3. Create the agent graph using the pre-installed langchain package
    agent = create_agent(
        model=llm,
        tools=tools,
        system_prompt=system_prompt
    )

    # 4. Invoke the agent graph asynchronously
    response = await agent.ainvoke({
        "messages": [HumanMessage(content=payload.message)]
    })

    # 5. Extract the final AI response message
    final_message = response["messages"][-1]
    return ChatResponse(response=final_message.content)
