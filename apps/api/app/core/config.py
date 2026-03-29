"""Application settings."""

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    """Environment-backed settings for API and worker processes."""

    app_name: str = "Hybrid Quantum Workload Navigator API"
    app_env: str = os.getenv("APP_ENV", "local")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/navigator.local.db")
    artifacts_root_value: str = os.getenv("ARTIFACTS_ROOT", "")
    corpus_root_value: str = os.getenv("CORPUS_ROOT", "")
    adk_enabled: bool = os.getenv("ADK_ENABLED", "false").lower() == "true"
    qsim_enabled: str = os.getenv("QSIM_ENABLED", "auto")

    @property
    def repo_root(self) -> Path:
        return Path(__file__).resolve().parents[4]

    @property
    def artifacts_root(self) -> Path:
        if self.artifacts_root_value:
            return Path(self.artifacts_root_value)
        return self.repo_root / "data" / "artifacts"

    @property
    def corpus_root(self) -> Path:
        if self.corpus_root_value:
            return Path(self.corpus_root_value)
        return self.repo_root / "docs" / "corpus"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()
