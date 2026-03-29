"""Job and artifact routes."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.models import Artifact, Job
from app.schemas import ArtifactRead, JobRead


router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: str, db: Session = Depends(get_session)):
    """Return a single job."""

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


@router.get("/{job_id}/artifacts", response_model=List[ArtifactRead])
def list_artifacts(job_id: str, db: Session = Depends(get_session)):
    """List artifacts produced by a job."""

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return db.query(Artifact).filter(Artifact.job_id == job_id).order_by(Artifact.created_at.asc()).all()
