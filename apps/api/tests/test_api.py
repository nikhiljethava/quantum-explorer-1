from fastapi.testclient import TestClient

from app.main import app
from app.models import ChatThread


def test_read_main():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "Welcome to the Hybrid Quantum Workload Navigator API"}


def test_health_check():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_projects_creation_route_exists():
    with TestClient(app) as client:
        response = client.post(
            "/api/projects",
            json={
                "name": "Smoke Test Project",
                "description": "Quick route verification",
                "domain": "mixed",
            },
        )
        assert response.status_code == 201
        assert response.json()["name"] == "Smoke Test Project"


def test_chat_message_route_exists():
    with TestClient(app) as client:
        session = app.state.session_factory()
        try:
            thread = session.query(ChatThread).order_by(ChatThread.created_at.asc()).first()
        finally:
            session.close()

        assert thread is not None

        response = client.post(
            f"/api/chat/{thread.id}/message",
            json={"content": "Hello", "mode": "architect"},
        )
        assert response.status_code == 200
        assert response.json()["assistant_turn"]["role"] == "assistant"
