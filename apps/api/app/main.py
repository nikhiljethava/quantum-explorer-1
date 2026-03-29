"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI

from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.projects import router as projects_router
from app.api.routes.workloads import router as workloads_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging
from app.core.request_context import RequestContextMiddleware
from app.db.base import Base, build_engine, build_session_factory
from app.models import entities  # noqa: F401
from app.services.seed import ensure_seed_data


def initialize_database(session_factory, engine) -> None:
    """Create tables and seed local demo data."""

    Base.metadata.create_all(bind=engine)
    session = session_factory()
    try:
        ensure_seed_data(session)
    finally:
        session.close()


def create_app(settings: Settings = None) -> FastAPI:
    """Create the FastAPI application."""

    resolved_settings = settings or get_settings()
    configure_logging(resolved_settings.log_level)

    engine = build_engine(resolved_settings.database_url)
    session_factory = build_session_factory(engine)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        initialize_database(session_factory=session_factory, engine=engine)
        yield

    app = FastAPI(
        title=resolved_settings.app_name,
        version="0.1.0",
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    app.add_middleware(RequestContextMiddleware)

    app.state.settings = resolved_settings
    app.state.engine = engine
    app.state.session_factory = session_factory

    api_router = APIRouter(prefix="/api")
    api_router.include_router(health_router)
    api_router.include_router(projects_router)
    api_router.include_router(workloads_router)
    api_router.include_router(jobs_router)
    api_router.include_router(chat_router)
    app.include_router(api_router)
    app.include_router(health_router)

    @app.get("/")
    def read_root():
        """Return a simple root response for local smoke checks."""

        return {"message": "Welcome to the Hybrid Quantum Workload Navigator API"}

    return app


app = create_app()
