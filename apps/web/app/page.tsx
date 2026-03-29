import Link from "next/link";

import { getProjects } from "../lib/api";
import { demoWorkloads } from "../lib/sample-data";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <div className="content-stack">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Custom product UI, not ADK Web</p>
          <h1>Assess candidate workloads, map the hybrid split, then queue prototypes safely.</h1>
          <p className="hero-copy">
            The product flow stays local-first: intake, deterministic assessment,
            corpus-backed guidance, background jobs, and downloadable artifacts.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-link" href="/workloads/new">
            Start a workload
          </Link>
          <a className="secondary-link" href="http://localhost:8000/docs">
            Open API docs
          </a>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Projects</p>
            <h2>Recent project portfolio</h2>
          </div>
          <Link href="/projects">View all</Link>
        </div>
        <div className="card-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <p className="project-domain">{project.domain}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sample flows</p>
            <h2>Curated chemistry and optimization lanes</h2>
          </div>
        </div>
        <div className="card-grid">
          {demoWorkloads.map((workload) => (
            <article className="project-card" key={workload.id}>
              <p className="project-domain">{workload.domain}</p>
              <h3>{workload.title}</h3>
              <p>{workload.assessment.summary}</p>
              <Link className="inline-link" href={`/workloads/${workload.id}`}>
                Open workload
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
