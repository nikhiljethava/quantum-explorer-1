import { getProjects } from "../../lib/api";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="content-stack">
      <section className="panel">
        <p className="eyebrow">Project list</p>
        <h1>Local demo projects</h1>
        <div className="list-stack">
          {projects.map((project) => (
            <article className="list-card" key={project.id}>
              <div>
                <p className="project-domain">{project.domain}</p>
                <h2>{project.name}</h2>
              </div>
              <p>{project.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
