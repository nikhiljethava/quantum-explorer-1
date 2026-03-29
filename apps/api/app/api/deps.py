"""FastAPI dependencies."""

from typing import Generator

from fastapi import Request
from sqlalchemy.orm import Session


def get_session(request: Request) -> Generator[Session, None, None]:
    """Yield a request-scoped database session."""

    session_factory = request.app.state.session_factory
    session = session_factory()
    try:
        yield session
    finally:
        session.close()


def get_request_id(request: Request) -> str:
    """Expose the request correlation ID."""

    return getattr(request.state, "request_id", "")
