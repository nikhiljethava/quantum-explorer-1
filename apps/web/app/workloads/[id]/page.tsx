import { ExplanationTabs } from "../../../components/explanation-tabs";
import { PrototypePanel } from "../../../components/prototype-panel";
import { WorkflowCanvas } from "../../../components/workflow-canvas";
import { getWorkloadDetails } from "../../../lib/api";

export default async function WorkloadDetailPage({
  params
}: {
  params: { id: string };
}) {
  const workload = await getWorkloadDetails(params.id);

  return (
    <div className="content-stack">
      <section className="panel panel-split">
        <div>
          <p className="eyebrow">{workload.domain}</p>
          <h1>{workload.title}</h1>
          <p className="hero-copy">{workload.businessObjective}</p>
        </div>
        <div className="assessment-pill">
          <strong>{workload.assessment.disposition}</strong>
          <span>{workload.assessment.confidenceBand} confidence</span>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Assessment result</p>
        <h2>{workload.assessment.summary}</h2>
        <div className="three-column-list">
          <article className="list-card">
            <h3>Rationale</h3>
            <ul>
              {workload.assessment.rationale.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="list-card">
            <h3>Assumptions</h3>
            <ul>
              {workload.assessment.assumptions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="list-card">
            <h3>What would change this</h3>
            <ul>
              {workload.assessment.changeDrivers.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Hybrid workflow view</p>
        <h2>{workload.architecture.summary}</h2>
        <WorkflowCanvas
          classicalLane={workload.architecture.classicalLane}
          quantumLane={workload.architecture.quantumLane}
          verificationLane={workload.architecture.verificationLane}
        />
      </section>

      <section className="panel">
        <p className="eyebrow">Explanation modes</p>
        <h2>Translate the same recommendation for different audiences</h2>
        <ExplanationTabs explanations={workload.explanations} />
      </section>

      <PrototypePanel
        workloadId={workload.id}
        job={workload.prototypeJob}
        artifacts={workload.artifacts}
      />

      <section className="panel">
        <p className="eyebrow">Source references</p>
        <h2>Local corpus citations</h2>
        <div className="list-stack">
          {workload.citations.map((citation) => (
            <article className="list-card" key={citation.sourceId}>
              <h3>{citation.title}</h3>
              <p>{citation.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
