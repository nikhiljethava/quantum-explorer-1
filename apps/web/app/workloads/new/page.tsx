export default function NewWorkloadPage() {
  return (
    <div className="content-stack">
      <section className="panel">
        <p className="eyebrow">Workload intake wizard</p>
        <h1>Capture the workload before you qualify it</h1>
        <div className="wizard-grid">
          <article className="list-card">
            <p className="project-domain">Step 1</p>
            <h2>Business framing</h2>
            <p>Collect objective, current baseline, bottleneck, and success metric.</p>
          </article>
          <article className="list-card">
            <p className="project-domain">Step 2</p>
            <h2>Technical shape</h2>
            <p>Identify the problem family, representation, and validation needs.</p>
          </article>
          <article className="list-card">
            <p className="project-domain">Step 3</p>
            <h2>Prototype posture</h2>
            <p>Set time horizon and constraints so the assessment stays honest.</p>
          </article>
        </div>
        <div className="callout-box">
          This shell page is ready for wiring to `POST /api/workloads`. The
          backend already defines the request contract, seeded examples, and
          deterministic completeness checks.
        </div>
      </section>
    </div>
  );
}
