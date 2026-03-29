"""Simple chat helper built on top of persisted workload context."""

from typing import List

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models import ChatThread, ChatTurn, Workload
from app.services.explanations import select_explanation
from app.services.workflow import citations_from_workflow, run_shared_workflow


def ensure_chat_thread(db: Session, workload: Workload) -> ChatThread:
    """Create a default chat thread for a workload if it does not exist."""

    thread = (
        db.query(ChatThread)
        .filter(ChatThread.workload_id == workload.id)
        .order_by(ChatThread.created_at.asc())
        .first()
    )
    if thread:
        return thread

    thread = ChatThread(workload_id=workload.id, title=workload.title + " thread")
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread


def add_chat_exchange(
    db: Session,
    settings: Settings,
    thread: ChatThread,
    workload: Workload,
    user_message: str,
    mode: str,
) -> List[ChatTurn]:
    """Persist a user turn and a deterministic assistant response."""

    workflow_result = run_shared_workflow(settings, workload)
    citations = citations_from_workflow(workflow_result)
    assistant_content = (
        select_explanation(mode, workflow_result)
        + " User prompt: "
        + user_message.strip()
    )

    user_turn = ChatTurn(thread_id=thread.id, role="user", content=user_message, citations=[])
    assistant_turn = ChatTurn(
        thread_id=thread.id,
        role="assistant",
        content=assistant_content,
        citations=citations,
    )
    db.add(user_turn)
    db.add(assistant_turn)
    db.commit()
    db.refresh(user_turn)
    db.refresh(assistant_turn)
    return [user_turn, assistant_turn]
