"""Job creation helpers."""

from typing import Dict

from sqlalchemy.orm import Session

from app.models import Job, Workload


def queue_job(
    db: Session,
    workload: Workload,
    job_type: str,
    request_payload: Dict[str, object],
    correlation_id: str,
) -> Job:
    """Persist a queued job."""

    job = Job(
        workload_id=workload.id,
        job_type=job_type,
        status="queued",
        progress=0,
        request_payload=request_payload,
        correlation_id=correlation_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
