"""Worker process entrypoint and test-friendly helpers."""

import argparse
import time

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.base import Base, build_engine, build_session_factory
from app.models import Job, entities  # noqa: F401
from app.worker.runner import WorkerService


def claim_job(session: Session) -> Job:
    """Claim the next queued job if one exists."""

    job = (
        session.query(Job)
        .filter(Job.status.in_(["queued", "pending"]))
        .order_by(Job.created_at.asc())
        .first()
    )
    if job is None:
        return None

    job.status = "running"
    job.progress = max(job.progress or 0, 10)
    session.commit()
    session.refresh(job)
    return job


def process_job(session: Session, job: Job, settings: Settings = None) -> None:
    """Run a claimed job through the real worker service."""

    resolved_settings = settings or get_settings()
    worker = WorkerService(session_factory=lambda: session, settings=resolved_settings)
    worker.execute_job(session, job)


def cli() -> None:
    """Run the local worker loop."""

    parser = argparse.ArgumentParser(description="Hybrid Quantum Workload Navigator worker")
    parser.add_argument("--once", action="store_true", help="Process queued jobs once and exit.")
    parser.add_argument("--poll-interval", type=int, default=5, help="Polling interval in seconds.")
    args = parser.parse_args()

    settings = get_settings()
    engine = build_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)
    session_factory = build_session_factory(engine)
    worker = WorkerService(session_factory=session_factory, settings=settings)

    if args.once:
        worker.run_once()
        return

    while True:
        worker.run_once()
        time.sleep(args.poll_interval)


if __name__ == "__main__":
    cli()
