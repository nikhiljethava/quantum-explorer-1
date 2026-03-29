from pathlib import Path

import pytest

from app.core.config import Settings
from app.db.base import Base, build_engine, build_session_factory
from app.models import Job, Project, Workload
from app.worker.main import claim_job, process_job

@pytest.fixture
def session_factory():
    engine = build_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    return build_session_factory(engine)

def create_workload(session):
    project = Project(name="Worker Test Project", description="worker", domain="mixed")
    session.add(project)
    session.flush()

    workload = Workload(
        project_id=project.id,
        title="Worker Test Workload",
        domain="materials",
        problem_family="chemistry_materials",
        representation="molecule",
        business_objective="Test worker paths.",
        current_baseline="Classical baseline.",
        current_bottleneck="Calculations are slow.",
        validation_needs="Prototype-friendly.",
        time_horizon="prototype_now",
        success_metric="Generate artifacts.",
        constraint_profile={"accuracy": "high"},
        completeness_score=1.0,
        missing_fields=[],
        status="ready",
    )
    session.add(workload)
    session.commit()
    session.refresh(workload)
    return workload


def test_worker_claim_job(session_factory):
    session = session_factory()
    workload = create_workload(session)
    job = Job(workload_id=workload.id, job_type="prototype_generate", status="queued")
    session.add(job)
    session.commit()

    claimed = claim_job(session)
    assert claimed.id == job.id
    assert claimed.status == "running"

    # Try reclaiming, should yield None
    second = claim_job(session)
    assert second is None
    session.close()


def test_worker_process_unknown_job(session_factory, tmp_path: Path):
    session = session_factory()
    workload = create_workload(session)
    job = Job(workload_id=workload.id, job_type="unknown_routine", status="queued")
    session.add(job)
    session.commit()

    claimed = claim_job(session)
    process_job(
        session,
        claimed,
        settings=Settings(
            database_url="sqlite:///:memory:",
            artifacts_root_value=str(tmp_path / "artifacts"),
            corpus_root_value=str(Path(__file__).resolve().parents[3] / "docs" / "corpus"),
        ),
    )

    updated = session.query(Job).filter(Job.id == job.id).first()
    assert updated.status == "failed"
    assert "Unsupported job type" in updated.error_message
    session.close()
