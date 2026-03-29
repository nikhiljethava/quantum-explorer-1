"""Chat routes."""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.models import ChatThread, Workload
from app.schemas import ChatExchangeRead, ChatMessageCreate, ChatTurnRead
from app.services.chat import add_chat_exchange


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/{thread_id}/message", response_model=ChatExchangeRead)
def send_chat_message(
    thread_id: str,
    payload: ChatMessageCreate,
    request: Request,
    db: Session = Depends(get_session),
):
    """Append a user turn and return a deterministic assistant reply."""

    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found.")

    workload = db.query(Workload).filter(Workload.id == thread.workload_id).first()
    if not workload:
        raise HTTPException(status_code=404, detail="Workload not found for thread.")

    user_turn, assistant_turn = add_chat_exchange(
        db=db,
        settings=request.app.state.settings,
        thread=thread,
        workload=workload,
        user_message=payload.content,
        mode=payload.mode,
    )
    return ChatExchangeRead(
        thread_id=thread.id,
        user_turn=ChatTurnRead.model_validate(user_turn),
        assistant_turn=ChatTurnRead.model_validate(assistant_turn),
    )
