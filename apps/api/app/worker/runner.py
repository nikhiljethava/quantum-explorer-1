"""Background worker for queued job execution."""

from typing import Dict, List

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models import Artifact, Job, Workload
from app.quantum.adapters import CirqAdapter, OpenFermionAdapter, QsimAdapter, QualtranAdapter
from app.storage.filesystem import LocalArtifactStorage


class WorkerService:
    """Poll queued jobs and materialize artifacts."""

    def __init__(self, session_factory, settings: Settings) -> None:
        self.session_factory = session_factory
        self.settings = settings
        self.storage = LocalArtifactStorage(settings.artifacts_root)
        self.adapters = {
            "cirq": CirqAdapter(),
            "openfermion": OpenFermionAdapter(),
            "qualtran": QualtranAdapter(),
            "qsim": QsimAdapter(),
        }

    def run_once(self) -> int:
        """Process all currently queued jobs once."""

        processed = 0
        session = self.session_factory()
        try:
            jobs = (
                session.query(Job)
                .filter(Job.status == "queued")
                .order_by(Job.created_at.asc())
                .all()
            )
            for job in jobs:
                self.execute_job(session, job)
                processed += 1
        finally:
            session.close()
        return processed

    def execute_job(self, session: Session, job: Job) -> None:
        workload = session.query(Workload).filter(Workload.id == job.workload_id).one()

        job.status = "running"
        job.progress = 10
        session.commit()

        try:
            if job.job_type == "prototype_generate":
                artifacts, result_summary = self._run_prototype_job(workload, job)
            elif job.job_type == "resource_estimate":
                artifacts, result_summary = self._run_resource_estimate_job(workload, job)
            elif job.job_type == "artifact_bundle_build":
                artifacts, result_summary = self._run_artifact_bundle_job(workload, job)
            else:
                raise ValueError("Unsupported job type: " + job.job_type)

            for artifact_payload in artifacts:
                session.add(
                    Artifact(
                        job_id=job.id,
                        workload_id=workload.id,
                        kind=artifact_payload["kind"],
                        storage_path=artifact_payload["storage_path"],
                        download_url=artifact_payload["download_url"],
                        metadata_json=artifact_payload.get("metadata_json", {}),
                    )
                )

            job.status = "succeeded"
            job.progress = 100
            job.result_summary = result_summary
            job.error_message = None
            session.commit()
        except Exception as exc:
            job.status = "failed"
            job.progress = 100
            job.error_message = str(exc)
            session.commit()

    def _run_prototype_job(self, workload: Workload, job: Job):
        chemistry_like = workload.sample_lane == "chemistry" or "chem" in workload.problem_family
        primary_adapter = self.adapters["openfermion"] if chemistry_like else self.adapters["cirq"]
        qsim_result = self.adapters["qsim"].run_demo(workload.title)
        primary_result = primary_adapter.run_demo(workload.title)
        qualtran_result = self.adapters["qualtran"].run_demo(workload.title)

        summary_md = "\n".join(
            [
                "# Prototype Summary",
                "",
                "Workload: " + workload.title,
                "Primary path: " + primary_result["adapter_name"],
                "Execution mode: " + primary_result["execution_mode"],
                "qsim execution mode: " + qsim_result["execution_mode"],
                "",
                "This artifact is a scaffolded local demo and not proof of production quantum advantage.",
            ]
        )
        workflow_text = "\n".join(
            [
                "classical: intake -> baseline analysis -> candidate selection",
                "quantum_candidate: " + primary_result["adapter_name"] + " demo path",
                "verification: compare against classical baseline and cite corpus references",
            ]
        )
        result_payload = {
            "workload_id": workload.id,
            "workload_title": workload.title,
            "primary_adapter": primary_result,
            "qsim": qsim_result,
            "qualtran": qualtran_result,
        }

        artifacts = [
            self._augment_metadata(
                self.storage.write_text(
                    workload.id,
                    job.id,
                    "prototype-summary.md",
                    summary_md,
                    "markdown_summary",
                ),
                primary_result,
            ),
            self._augment_metadata(
                self.storage.write_json(
                    workload.id,
                    job.id,
                    "prototype-result.json",
                    result_payload,
                    "json_result",
                ),
                primary_result,
            ),
            self._augment_metadata(
                self.storage.write_text(
                    workload.id,
                    job.id,
                    "workflow-view.txt",
                    workflow_text,
                    "workflow_view",
                ),
                primary_result,
            ),
        ]

        result_summary = {
            "adapter": primary_result["adapter_name"],
            "execution_mode": primary_result["execution_mode"],
            "qsim_execution_mode": qsim_result["execution_mode"],
        }
        return artifacts, result_summary

    def _run_resource_estimate_job(self, workload: Workload, job: Job):
        payload = {
            "estimate_level": "directional",
            "readiness": "later" if "chem" in workload.problem_family else "prototype_now",
            "notes": "This is a planning-oriented estimate only.",
        }
        artifacts = [
            self._augment_metadata(
                self.storage.write_json(
                    workload.id,
                    job.id,
                    "resource-estimate.json",
                    payload,
                    "resource_estimate",
                ),
                payload,
            )
        ]
        return artifacts, payload

    def _run_artifact_bundle_job(self, workload: Workload, job: Job):
        payload = {
            "bundle_status": "prepared",
            "notes": "Bundle builder scaffold created a manifest only.",
            "workload_title": workload.title,
        }
        artifacts = [
            self._augment_metadata(
                self.storage.write_json(
                    workload.id,
                    job.id,
                    "artifact-bundle-manifest.json",
                    payload,
                    "artifact_bundle",
                ),
                payload,
            )
        ]
        return artifacts, payload

    def _augment_metadata(self, artifact: Dict[str, str], metadata: Dict[str, object]) -> Dict[str, object]:
        enriched = dict(artifact)
        enriched["metadata_json"] = metadata
        return enriched
