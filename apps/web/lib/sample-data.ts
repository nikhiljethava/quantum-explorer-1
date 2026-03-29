export type Citation = {
  sourceId: string;
  title: string;
  excerpt: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string;
  domain: string;
};

export type WorkflowLaneNode = {
  label: string;
  kind: string;
  notes: string;
};

export type DemoWorkload = {
  id: string;
  projectId: string;
  title: string;
  domain: string;
  problemFamily: string;
  representation: string;
  businessObjective: string;
  assessment: {
    disposition: string;
    confidenceBand: string;
    summary: string;
    rationale: string[];
    assumptions: string[];
    changeDrivers: string[];
  };
  architecture: {
    summary: string;
    classicalLane: WorkflowLaneNode[];
    quantumLane: WorkflowLaneNode[];
    verificationLane: WorkflowLaneNode[];
  };
  explanations: {
    exec: string;
    architect: string;
    scientist: string;
  };
  citations: Citation[];
  prototypeJob: {
    id: string;
    status: string;
    executionMode: string;
  };
  artifacts: Array<{
    id: string;
    kind: string;
    label: string;
  }>;
};

export const demoProjects: ProjectSummary[] = [
  {
    id: "project-demo-portfolio",
    name: "Hybrid Quantum Demo Portfolio",
    description: "Seeded local-first chemistry and optimization examples.",
    domain: "portfolio"
  }
];

export const demoWorkloads: DemoWorkload[] = [
  {
    id: "battery-electrolyte-screening",
    projectId: "project-demo-portfolio",
    title: "Battery electrolyte screening",
    domain: "materials",
    problemFamily: "chemistry_materials",
    representation: "molecule",
    businessObjective: "Screen promising electrolyte candidates faster.",
    assessment: {
      disposition: "hybrid_prototype_now",
      confidenceBand: "medium",
      summary: "A narrow chemistry prototype is justified now, while the broader pipeline stays classical.",
      rationale: [
        "The candidate subproblem is structured and maps naturally to molecule-oriented tooling.",
        "The recommended path remains simulation-first with explicit caveats."
      ],
      assumptions: [
        "Prototype scope stays limited to reduced-scale examples.",
        "The result is not proof of production quantum advantage."
      ],
      changeDrivers: [
        "A stronger classical baseline would push this toward classical-only.",
        "Greater tolerance for longer-term research could strengthen the later-stage case."
      ]
    },
    architecture: {
      summary: "Normalize intake and candidate ranking classically, isolate the reduced chemistry subproblem, then verify against the baseline.",
      classicalLane: [
        {
          label: "Normalize workload inputs",
          kind: "processing",
          notes: "Persist product state and prepare deterministic scoring."
        },
        {
          label: "Rank candidates with classical filters",
          kind: "analysis",
          notes: "Keep high-throughput screening in the classical lane."
        }
      ],
      quantumLane: [
        {
          label: "Reduced electronic-structure analysis",
          kind: "simulation",
          notes: "Run through capability-checked OpenFermion and qsim-adjacent adapters."
        }
      ],
      verificationLane: [
        {
          label: "Compare against baseline",
          kind: "validation",
          notes: "Use local corpus citations and caveat the scale."
        }
      ]
    },
    explanations: {
      exec: "This is a good fit for a narrow hybrid prototype, not a claim that the end-to-end pipeline should become quantum.",
      architect: "Keep product state in FastAPI and PostgreSQL, queue prototype generation in the worker, and isolate the chemistry lane behind adapters.",
      scientist: "The proposed experiment focuses on reduced electronic-structure analysis with reproducible simulator-backed artifacts."
    },
    citations: [
      {
        sourceId: "battery-materials",
        title: "Battery Materials Screening",
        excerpt: "Battery materials and electrolyte screening often combine classical curation with narrower chemistry subproblems."
      },
      {
        sourceId: "chemistry-lane",
        title: "Chemistry and Molecule Simulation",
        excerpt: "Chemistry workloads map most naturally to hybrid decomposition when a reduced active-space representation is available."
      }
    ],
    prototypeJob: {
      id: "job-demo-chemistry",
      status: "queued",
      executionMode: "queued"
    },
    artifacts: [
      {
        id: "artifact-summary",
        kind: "markdown_summary",
        label: "Prototype summary"
      },
      {
        id: "artifact-result",
        kind: "json_result",
        label: "JSON result"
      },
      {
        id: "artifact-workflow",
        kind: "workflow_view",
        label: "Workflow view"
      }
    ]
  },
  {
    id: "portfolio-routing-optimization",
    projectId: "project-demo-portfolio",
    title: "Portfolio and routing optimization",
    domain: "optimization",
    problemFamily: "portfolio_optimization",
    representation: "graph",
    businessObjective: "Explore a hybrid optimization story for constrained routing and portfolio allocation.",
    assessment: {
      disposition: "education_only",
      confidenceBand: "medium",
      summary: "This is best framed conservatively as an educational or prototype workflow because classical competition remains strong.",
      rationale: [
        "The problem has useful structure, but the business case stays conservative.",
        "Prototype value is more about learnings and artifacts than near-term performance claims."
      ],
      assumptions: [
        "The team accepts a toy optimization demo path.",
        "Production claims remain out of scope."
      ],
      changeDrivers: [
        "If the classical bottleneck becomes much sharper, the prototype case strengthens.",
        "If production confidence is required now, the recommendation becomes classical-only."
      ]
    },
    architecture: {
      summary: "Keep scenario generation and validation classical while using a narrow optimization demo lane for structured exploration.",
      classicalLane: [
        {
          label: "Ingest constraints and scenarios",
          kind: "processing",
          notes: "Keep enterprise logic and integrations classical."
        }
      ],
      quantumLane: [
        {
          label: "Structured optimization subproblem",
          kind: "simulation",
          notes: "Use Cirq-style toy flows with explicit caveats."
        }
      ],
      verificationLane: [
        {
          label: "Baseline comparison",
          kind: "validation",
          notes: "Compare against strong classical solvers before making any claim."
        }
      ]
    },
    explanations: {
      exec: "Treat this as a conservative learning exercise rather than a promised performance win.",
      architect: "The same system boundaries apply, but the optimization lane should stay tightly scoped.",
      scientist: "A graph-structured demo can be useful for artifact generation and controlled comparison."
    },
    citations: [
      {
        sourceId: "optimization-lane",
        title: "Optimization and Routing",
        excerpt: "Routing and portfolio workloads can produce useful educational prototypes, but strong classical solvers remain competitive."
      }
    ],
    prototypeJob: {
      id: "job-demo-optimization",
      status: "queued",
      executionMode: "queued"
    },
    artifacts: [
      {
        id: "artifact-opt-summary",
        kind: "markdown_summary",
        label: "Optimization summary"
      }
    ]
  }
];
