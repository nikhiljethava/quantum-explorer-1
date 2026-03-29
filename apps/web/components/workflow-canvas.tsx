import { type WorkflowLaneNode } from "../lib/sample-data";

type WorkflowCanvasProps = {
  classicalLane: WorkflowLaneNode[];
  quantumLane: WorkflowLaneNode[];
  verificationLane: WorkflowLaneNode[];
};

function Lane({
  title,
  tone,
  items
}: {
  title: string;
  tone: string;
  items: WorkflowLaneNode[];
}) {
  return (
    <section className={`lane lane-${tone}`}>
      <div className="lane-header">
        <span className="lane-dot" />
        <h3>{title}</h3>
      </div>
      <div className="lane-items">
        {items.map((item) => (
          <article className="lane-card" key={`${title}-${item.label}`}>
            <p className="lane-kind">{item.kind}</p>
            <h4>{item.label}</h4>
            <p>{item.notes}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WorkflowCanvas({
  classicalLane,
  quantumLane,
  verificationLane
}: WorkflowCanvasProps) {
  return (
    <div className="workflow-grid">
      <Lane title="Classical lane" tone="classical" items={classicalLane} />
      <Lane title="Quantum candidate lane" tone="quantum" items={quantumLane} />
      <Lane title="Verification lane" tone="verification" items={verificationLane} />
    </div>
  );
}
