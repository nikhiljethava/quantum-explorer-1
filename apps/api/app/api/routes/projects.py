"""Project routes."""

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_session
from app.models import Project
from app.schemas import ProjectCreate, ProjectRead


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[ProjectRead])
def list_projects(db: Session = Depends(get_session)):
    """List projects."""

    return db.query(Project).order_by(Project.created_at.asc()).all()


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: Session = Depends(get_session)):
    """Create a project."""

    project = Project(
        name=payload.name,
        description=payload.description,
        domain=payload.domain,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project
