"""Filesystem-backed artifact storage."""

import json
from pathlib import Path
from typing import Dict


class LocalArtifactStorage:
    """Store artifacts on the local filesystem behind a simple abstraction."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def write_text(
        self,
        workload_id: str,
        job_id: str,
        filename: str,
        contents: str,
        kind: str,
    ) -> Dict[str, str]:
        target_dir = self.root / workload_id / job_id
        target_dir.mkdir(parents=True, exist_ok=True)
        path = target_dir / filename
        path.write_text(contents, encoding="utf-8")
        return {
            "kind": kind,
            "storage_path": str(path),
            "download_url": "/api/jobs/{job_id}/artifacts".format(job_id=job_id),
        }

    def write_json(
        self,
        workload_id: str,
        job_id: str,
        filename: str,
        payload: Dict[str, object],
        kind: str,
    ) -> Dict[str, str]:
        target_dir = self.root / workload_id / job_id
        target_dir.mkdir(parents=True, exist_ok=True)
        path = target_dir / filename
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return {
            "kind": kind,
            "storage_path": str(path),
            "download_url": "/api/jobs/{job_id}/artifacts".format(job_id=job_id),
        }
