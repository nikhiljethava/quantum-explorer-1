"""End-to-end happy-path scaffold for local execution."""

from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.worker.runner import WorkerService


def test_happy_path(tmp_path: Path) -> None:
    database_path = tmp_path / "navigator.db"
    artifacts_root = tmp_path / "artifacts"
    corpus_root = Path(__file__).resolve().parents[3] / "docs" / "corpus"
    settings = Settings(
        database_url="sqlite:///" + str(database_path),
        artifacts_root_value=str(artifacts_root),
        corpus_root_value=str(corpus_root),
    )

    app = create_app(settings=settings)
    worker = WorkerService(session_factory=app.state.session_factory, settings=settings)

    with TestClient(app) as client:
        project_response = client.post(
            "/api/projects",
            json={
                "name": "Materials Demo",
                "description": "Scaffold test project",
                "domain": "materials",
            },
        )
        assert project_response.status_code == 201
        project_id = project_response.json()["id"]

        workload_response = client.post(
            "/api/workloads",
            json={
                "project_id": project_id,
                "title": "Battery molecule prototype",
                "domain": "materials",
                "problem_family": "chemistry_materials",
                "representation": "molecule",
                "business_objective": "Screen promising materials more efficiently.",
                "current_baseline": "Classical DFT workflow with manual review.",
                "current_bottleneck": "Selected candidate calculations are slow and expensive.",
                "validation_needs": "Scientifically credible prototype outputs.",
                "time_horizon": "prototype_now",
                "success_metric": "Produce an inspectable local prototype.",
                "sample_lane": "chemistry",
                "constraint_profile": {
                    "accuracy": "high",
                    "latency": "medium",
                    "cost": "medium",
                    "explainability": "high",
                },
            },
        )
        assert workload_response.status_code == 201
        workload_id = workload_response.json()["id"]

        assessment_response = client.post(f"/api/workloads/{workload_id}/assess")
        assert assessment_response.status_code == 200
        assert assessment_response.json()["disposition"] in {
            "hybrid_prototype_now",
            "fault_tolerant_candidate_later",
        }

        architecture_response = client.post(f"/api/workloads/{workload_id}/architecture")
        assert architecture_response.status_code == 200

        explain_response = client.post(
            f"/api/workloads/{workload_id}/explain",
            json={"mode": "architect"},
        )
        assert explain_response.status_code == 200
        assert "classical" in explain_response.json()["content"].lower()

        job_response = client.post(
            f"/api/workloads/{workload_id}/prototype",
            json={"job_type": "prototype_generate", "template_key": "auto"},
        )
        assert job_response.status_code == 202
        job_id = job_response.json()["id"]

        processed = worker.run_once()
        assert processed == 1

        job_status_response = client.get(f"/api/jobs/{job_id}")
        assert job_status_response.status_code == 200
        assert job_status_response.json()["status"] == "succeeded"

        artifacts_response = client.get(f"/api/jobs/{job_id}/artifacts")
        assert artifacts_response.status_code == 200
        assert len(artifacts_response.json()) == 3
