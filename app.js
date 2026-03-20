const STORAGE_KEY = "hybrid-quantum-workload-navigator-sessions";

const exampleScenarios = [
  {
    title: "Battery electrolyte screening",
    tag: "Hybrid now + later",
    data: {
      sessionName: "Battery electrolyte screening - hybrid assessment",
      sessionGoal: "fit_assessment",
      persona: "r_and_d_lead",
      industry: "materials",
      timeHorizon: "prototype_now",
      businessObjective:
        "Evaluate whether a quantum-assisted workflow could help us study a small but high-value electronic-structure subproblem inside our electrolyte screening pipeline.",
      problemFamily: "chemistry_materials",
      representation: "molecule",
      currentBaseline:
        "Classical DFT pipeline plus screening heuristics and lab validation.",
      currentBottleneck:
        "Electronic-structure calculations become expensive for selected candidate subsets.",
      successMetric:
        "Create a credible prototype path and explain which part of the workflow is future-looking.",
      classicalBaselineStrength: "1",
      problemStructure: "2",
      verificationTolerance: "0",
      teamReadiness: "1",
      candidateSubproblem: "yes",
      prototypeScale: "toy",
      validationNeeds:
        "Results must remain scientifically interpretable and easy to communicate.",
    },
  },
  {
    title: "Delivery route optimization",
    tag: "Education only",
    data: {
      sessionName: "Routing workshop - optimization fit review",
      sessionGoal: "fit_assessment",
      persona: "field_architect",
      industry: "logistics",
      timeHorizon: "production_now",
      businessObjective:
        "Decide whether a quantum-inspired or hybrid workflow is worth exploring for constrained route planning across a delivery network.",
      problemFamily: "optimization",
      representation: "graph",
      currentBaseline:
        "Mixed-integer programming plus heuristics already handles most cases acceptably.",
      currentBottleneck:
        "Some route variants are expensive, but the business still needs practical operational reliability right now.",
      successMetric:
        "Leave with an honest recommendation for a customer workshop and a small teaching demo if appropriate.",
      classicalBaselineStrength: "-1",
      problemStructure: "1",
      verificationTolerance: "-1",
      teamReadiness: "0",
      candidateSubproblem: "maybe",
      prototypeScale: "medium",
      validationNeeds:
        "Need to be able to explain why classical optimization remains the production baseline.",
    },
  },
  {
    title: "Fraud detection on enterprise data",
    tag: "Classical only",
    data: {
      sessionName: "Fraud detection - qualification review",
      sessionGoal: "education_briefing",
      persona: "quantum_pm",
      industry: "finance",
      timeHorizon: "production_now",
      businessObjective:
        "Understand whether quantum exploration is relevant to a messy fraud-detection workflow running on tabular and behavioral data.",
      problemFamily: "business_analytics",
      representation: "unstructured",
      currentBaseline:
        "ML ranking, feature engineering, and fraud review loops already drive the current solution.",
      currentBottleneck:
        "Data quality and signal quality are the main bottlenecks rather than a narrow structured algorithmic subproblem.",
      successMetric:
        "Avoid overselling quantum and give the team a responsible explanation for why classical infrastructure remains the right path.",
      classicalBaselineStrength: "-1",
      problemStructure: "-1",
      verificationTolerance: "-1",
      teamReadiness: "0",
      candidateSubproblem: "no",
      prototypeScale: "full",
      validationNeeds:
        "Need production-grade reliability and high confidence in the operational pipeline.",
    },
  },
];

const glossaryTerms = [
  {
    term: "Disposition",
    description:
      "The product's high-level recommendation: classical-only, education-only, hybrid prototype now, or fault-tolerant candidate later.",
  },
  {
    term: "Hybrid split",
    description:
      "The decomposition of a workflow into classical preprocessing, a narrow quantum candidate subroutine, and classical verification or post-processing.",
  },
  {
    term: "Resource estimate",
    description:
      "A planning-oriented view of what a future fault-tolerant version of the workload could require.",
  },
  {
    term: "Template artifact",
    description:
      "A generated notebook or markdown package created from a curated template rather than unconstrained free-form generation.",
  },
];

const templateCatalog = [
  {
    key: "chemistry_openfermion_v1",
    label: "Chemistry notebook",
    family: "chemistry_materials",
    summary:
      "OpenFermion + Cirq style notebook outline for a toy active-space or molecular subproblem.",
  },
  {
    key: "optimization_qaoa_v1",
    label: "Optimization notebook",
    family: "optimization",
    summary:
      "QAOA-style or hybrid optimization teaching artifact with explicit classical baseline comparison.",
  },
  {
    key: "architecture_summary_v1",
    label: "Architecture summary",
    family: "all",
    summary:
      "Customer-ready markdown summary of the classical lane, candidate quantum lane, and trust caveats.",
  },
];

const requiredFields = [
  "businessObjective",
  "currentBaseline",
  "currentBottleneck",
  "problemFamily",
  "representation",
  "timeHorizon",
];

const laneDefinitions = [
  {
    key: "classical",
    label: "Classical backbone",
    description: "Data handling, orchestration, and production integration stay here.",
  },
  {
    key: "quantum",
    label: "Quantum candidate",
    description: "Only a narrow, structured subproblem belongs here if one exists.",
  },
  {
    key: "verification",
    label: "Verification and reporting",
    description: "Validation, comparisons, and customer-facing caveats stay explicit.",
  },
];

let currentMode = "executive";
let currentAssessment = null;
let currentScenario = {};
let selectedTemplateKey = "architecture_summary_v1";

const form = document.getElementById("assessment-form");
const modeToggle = document.getElementById("modeToggle");
const saveSessionButton = document.getElementById("saveSessionButton");
const clearSessionsButton = document.getElementById("clearSessionsButton");
const generatePrototypeButton = document.getElementById("generatePrototypeButton");
const downloadMarkdownButton = document.getElementById("downloadMarkdownButton");
const downloadJsonButton = document.getElementById("downloadJsonButton");

const els = {
  heroDisposition: document.getElementById("heroDisposition"),
  heroDispositionCopy: document.getElementById("heroDispositionCopy"),
  heroMode: document.getElementById("heroMode"),
  sessionTitlePreview: document.getElementById("sessionTitlePreview"),
  sessionSummaryCopy: document.getElementById("sessionSummaryCopy"),
  currentPersona: document.getElementById("currentPersona"),
  currentGoal: document.getElementById("currentGoal"),
  completenessValue: document.getElementById("completenessValue"),
  completenessMirror: document.getElementById("completenessMirror"),
  recommendationBadge: document.getElementById("recommendationBadge"),
  recommendationTitle: document.getElementById("recommendationTitle"),
  recommendationSummary: document.getElementById("recommendationSummary"),
  weightedTotal: document.getElementById("weightedTotal"),
  confidenceBand: document.getElementById("confidenceBand"),
  scoreClassicalBaseline: document.getElementById("scoreClassicalBaseline"),
  scoreProblemStructure: document.getElementById("scoreProblemStructure"),
  scoreRepresentationFit: document.getElementById("scoreRepresentationFit"),
  scoreTimeHorizon: document.getElementById("scoreTimeHorizon"),
  scoreVerification: document.getElementById("scoreVerification"),
  scoreTeamReadiness: document.getElementById("scoreTeamReadiness"),
  reasonList: document.getElementById("reasonList"),
  assumptionList: document.getElementById("assumptionList"),
  changeList: document.getElementById("changeList"),
  nextStep: document.getElementById("nextStep"),
  noviceExplanation: document.getElementById("noviceExplanation"),
  ruleTrace: document.getElementById("ruleTrace"),
  caveatText: document.getElementById("caveatText"),
  modePill: document.getElementById("modePill"),
  laneGrid: document.getElementById("laneGrid"),
  templateGrid: document.getElementById("templateGrid"),
  prototypeTitle: document.getElementById("prototypeTitle"),
  prototypeSummary: document.getElementById("prototypeSummary"),
  prototypePreview: document.getElementById("prototypePreview"),
  prototypeNowTitle: document.getElementById("prototypeNowTitle"),
  prototypeNowCopy: document.getElementById("prototypeNowCopy"),
  futureStateTitle: document.getElementById("futureStateTitle"),
  futureStateCopy: document.getElementById("futureStateCopy"),
  trustNote: document.getElementById("trustNote"),
  exportPreview: document.getElementById("exportPreview"),
  exampleGrid: document.getElementById("exampleGrid"),
  glossaryGrid: document.getElementById("glossaryGrid"),
  sessionList: document.getElementById("sessionList"),
};

function parseIntField(value) {
  return Number.parseInt(value, 10);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleCase(input) {
  return input
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function getFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function computeCompleteness(data) {
  const completed = requiredFields.filter((field) => {
    const value = data[field];
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  const percentage = Math.round((completed / requiredFields.length) * 100);
  return {
    percentage,
    missingFields: requiredFields.filter((field) => !data[field] || !data[field].trim()),
  };
}

function deriveRepresentationFit(data) {
  const mapping = {
    molecule: 2,
    hamiltonian: 2,
    graph: 1,
    tabular: -1,
    unstructured: -2,
  };
  return mapping[data.representation] ?? 0;
}

function deriveTimeHorizonFit(data) {
  const mapping = {
    production_now: -2,
    pilot: 0,
    prototype_now: 1,
    fault_tolerant_later: 2,
  };
  return mapping[data.timeHorizon] ?? 0;
}

function buildAssessment(data) {
  const completeness = computeCompleteness(data);
  const scores = {
    classicalBaselineStrength: parseIntField(data.classicalBaselineStrength),
    problemStructure: parseIntField(data.problemStructure),
    representationFit: deriveRepresentationFit(data),
    timeHorizonFit: deriveTimeHorizonFit(data),
    verificationTolerance: parseIntField(data.verificationTolerance),
    teamReadiness: parseIntField(data.teamReadiness),
  };

  const weightedTotal =
    2 * scores.classicalBaselineStrength +
    2 * scores.problemStructure +
    2 * scores.representationFit +
    scores.timeHorizonFit +
    scores.verificationTolerance +
    scores.teamReadiness;

  const gatingReasons = [];
  let disposition = "";

  const noSubproblem = data.candidateSubproblem === "no";
  const maybeSubproblem = data.candidateSubproblem === "maybe";
  const isUnstructured = data.representation === "unstructured";
  const isBusinessAnalytics = data.problemFamily === "business_analytics";
  const strongClassicalBaseline = scores.classicalBaselineStrength <= -1;
  const incomplete = completeness.missingFields.length > 0;

  if (
    data.currentBottleneck.toLowerCase().includes("data quality") ||
    data.currentBottleneck.toLowerCase().includes("integration") ||
    (isUnstructured && isBusinessAnalytics) ||
    (strongClassicalBaseline && noSubproblem)
  ) {
    disposition = "classical_only";
    gatingReasons.push(
      "The bottleneck appears to be classical workflow quality or integration rather than a narrow structured quantum candidate."
    );
  } else if (
    incomplete ||
    data.sessionGoal === "education_briefing" ||
    scores.representationFit <= 0 ||
    maybeSubproblem
  ) {
    disposition = "education_only";
    gatingReasons.push(
      "The scenario is better suited to concept education or further refinement before a prototype recommendation."
    );
  } else if (
    scores.problemStructure >= 1 &&
    scores.representationFit >= 1 &&
    scores.timeHorizonFit >= 1 &&
    (data.timeHorizon === "fault_tolerant_later" || data.prototypeScale !== "toy") &&
    weightedTotal >= 10
  ) {
    disposition = "fault_tolerant_candidate_later";
    gatingReasons.push(
      "The workload has a credible structured mapping, but the useful version depends on a later fault-tolerant horizon."
    );
  } else if (
    scores.problemStructure >= 1 &&
    scores.representationFit >= 1 &&
    scores.timeHorizonFit >= 0 &&
    data.candidateSubproblem === "yes"
  ) {
    disposition = weightedTotal >= 3 ? "hybrid_prototype_now" : "education_only";
    gatingReasons.push(
      "A narrow, structured subproblem exists, so a simulation-first hybrid prototype is worth exploring."
    );
  } else if (weightedTotal <= -4) {
    disposition = "classical_only";
  } else if (weightedTotal <= 2) {
    disposition = "education_only";
  } else if (weightedTotal <= 9) {
    disposition = "hybrid_prototype_now";
  } else {
    disposition = "fault_tolerant_candidate_later";
  }

  const confidence =
    incomplete ||
    maybeSubproblem ||
    scores.representationFit === 0 ||
    scores.problemStructure === 0
      ? "Low"
      : data.prototypeScale === "toy" || data.timeHorizon === "prototype_now"
        ? "Medium"
        : "High";

  const rationale = [];
  const assumptions = [];
  const changeDrivers = [];

  if (disposition === "classical_only") {
    rationale.push(
      "Most of the workflow value appears to come from stronger classical data handling, heuristics, or ML rather than a quantum subroutine."
    );
    if (isUnstructured || isBusinessAnalytics) {
      rationale.push(
        "The representation is not a natural fit for the kinds of structured mappings quantum algorithms usually need."
      );
    }
    assumptions.push(
      "The primary bottleneck is better solved through classical optimization, data quality, or workflow improvements."
    );
    changeDrivers.push(
      "If the team isolates a narrow, mathematically clean subproblem, the recommendation could move toward education or prototype exploration."
    );
  }

  if (disposition === "education_only") {
    rationale.push(
      "This scenario is useful for teaching the hybrid model and quantum concepts, but it is not yet specific enough for a strong prototype recommendation."
    );
    if (incomplete) {
      rationale.push(
        `The intake is missing key fields: ${completeness.missingFields.join(", ")}.`
      );
    }
    assumptions.push(
      "The team needs a clearer target subproblem, workload representation, or horizon before prototyping."
    );
    changeDrivers.push(
      "A clearer mapping to a molecule, Hamiltonian, or graph-like subproblem would make the recommendation more specific."
    );
  }

  if (disposition === "hybrid_prototype_now") {
    rationale.push(
      "A narrow, structured subproblem can be prototyped now while the rest of the workflow remains classical."
    );
    rationale.push(
      "Simulation-first artifacts are credible here because the team accepts a pilot or prototype horizon."
    );
    assumptions.push(
      "The prototype will stay toy or reduced in scale and will be compared against a classical baseline."
    );
    if (data.problemFamily === "optimization") {
      assumptions.push(
        "The artifact should be framed as a teaching and workshop tool rather than a production migration plan."
      );
    }
    changeDrivers.push(
      "If the classical baseline already meets business needs at the required scale, this should move back toward education-only."
    );
  }

  if (disposition === "fault_tolerant_candidate_later") {
    rationale.push(
      "The structured part of this workload lines up with the domains quantum researchers care about, but useful scale depends on a later hardware horizon."
    );
    rationale.push(
      "A reduced simulation-first prototype can still be valuable now for learning, qualification, and customer conversation support."
    );
    assumptions.push(
      "The most compelling version of the problem requires future resource-estimation style reasoning rather than current-hardware claims."
    );
    assumptions.push(
      "Any prototype generated now should be explicitly labeled exploratory."
    );
    changeDrivers.push(
      "If the team only needs current operational value, the recommendation should move down to hybrid prototype now or classical-only."
    );
  }

  if (gatingReasons.length) {
    rationale.unshift(...gatingReasons);
  }

  const nextStepMap = {
    classical_only:
      "Strengthen the classical baseline, document the real bottleneck, and use the app mainly as an educational conversation tool.",
    education_only:
      "Refine the workload description, isolate the candidate subproblem, and rerun the fit assessment before generating artifacts.",
    hybrid_prototype_now:
      "Generate a reduced notebook or architecture brief, compare it to the classical baseline, and keep the claims simulation-first.",
    fault_tolerant_candidate_later:
      "Generate a brief plus future-state estimate, then separate the prototype-now story from the later fault-tolerant path.",
  };

  const noviceExplanationMap = {
    classical_only:
      "Quantum is not the right default answer just because a problem is important. If the bottleneck is messy data or business workflow complexity, classical systems usually win.",
    education_only:
      "Right now the app can teach the right concepts, but the scenario still needs a clearer target before it becomes a real prototype candidate.",
    hybrid_prototype_now:
      "A hybrid workflow means the classical system still does most of the work. The quantum piece is a small experiment inside a bigger classical pipeline.",
    fault_tolerant_candidate_later:
      "This is a good long-term quantum conversation, not a claim that current hardware can solve the full problem today.",
  };

  const titleMap = {
    classical_only: "Classical-only recommendation",
    education_only: "Education-first recommendation",
    hybrid_prototype_now: "Hybrid prototype candidate now",
    fault_tolerant_candidate_later: "Fault-tolerant candidate later",
  };

  const summaryMap = {
    classical_only:
      "Keep the workload on classical infrastructure. The quantum value story is too weak or too indirect to justify a prototype path yet.",
    education_only:
      "Use this scenario to teach the hybrid model and sharpen the workload definition, but do not imply that a credible prototype path exists yet.",
    hybrid_prototype_now:
      "Prototype a reduced subproblem with conservative artifacts and explicit caveats, while keeping the broader workflow classical.",
    fault_tolerant_candidate_later:
      "Treat this as a strategic long-term quantum candidate. A toy prototype can help the conversation now, but the meaningful scale is later.",
  };

  const ruleTrace = [
    `weighted_total=${weightedTotal}`,
    `representation_fit=${scores.representationFit}`,
    `time_horizon_fit=${scores.timeHorizonFit}`,
    `candidate_subproblem=${data.candidateSubproblem}`,
    `prototype_scale=${data.prototypeScale}`,
    `gating=${gatingReasons.length ? gatingReasons[0] : "none"}`,
  ].join("\n");

  return {
    disposition,
    title: titleMap[disposition],
    summary: summaryMap[disposition],
    weightedTotal,
    confidence,
    completeness,
    scores,
    rationale: rationale.slice(0, 4),
    assumptions,
    changeDrivers,
    nextStep: nextStepMap[disposition],
    noviceExplanation: noviceExplanationMap[disposition],
    ruleTrace,
    caveat:
      "This assessment is a qualification aid, not proof of quantum advantage or a production deployment recommendation.",
  };
}

function getDispositionUi(disposition) {
  return {
    classical_only: {
      label: "Classical only",
      className: "status-classical",
      hero: "Classical-only path",
    },
    education_only: {
      label: "Education only",
      className: "status-education",
      hero: "Education-first path",
    },
    hybrid_prototype_now: {
      label: "Hybrid prototype now",
      className: "status-hybrid",
      hero: "Prototype-now path",
    },
    fault_tolerant_candidate_later: {
      label: "Fault-tolerant candidate later",
      className: "status-future",
      hero: "Future-horizon path",
    },
  }[disposition];
}

function renderList(target, items, emptyText) {
  target.innerHTML = "";
  const safeItems = items && items.length ? items : [emptyText];
  safeItems.forEach((itemText) => {
    const item = document.createElement("li");
    item.textContent = itemText;
    target.appendChild(item);
  });
}

function buildWorkflowGraph(data, assessment) {
  const baseClassical = [
    {
      label: "Problem intake and baseline capture",
      notes: "Keep business context, data preparation, and orchestration in the classical lane.",
      readiness: "Production-ready",
    },
    {
      label: "Classical preprocessing and filtering",
      notes: "Use the existing workflow to narrow down the candidate region before any quantum experiment.",
      readiness: "Production-ready",
    },
  ];

  const baseVerification = [
    {
      label: "Classical baseline comparison",
      notes: "Document why the generated artifact does or does not beat the current approach.",
      readiness: "Required",
    },
    {
      label: "Customer-ready summary and caveats",
      notes: "Explain what the prototype demonstrates and what it does not prove.",
      readiness: "Required",
    },
  ];

  let quantumItems = [];

  if (assessment.disposition === "classical_only") {
    quantumItems = [
      {
        label: "No credible quantum subproblem yet",
        notes: "Use this lane to explain why the workflow remains classical rather than forcing a quantum story.",
        readiness: "Not recommended",
      },
    ];
  } else if (data.problemFamily === "chemistry_materials") {
    quantumItems = [
      {
        label: "Reduced active-space or molecular subproblem",
        notes: "Good candidate for OpenFermion-style mapping and simulation-first exploration.",
        readiness:
          assessment.disposition === "fault_tolerant_candidate_later"
            ? "Future-facing"
            : "Prototype-only",
      },
    ];
  } else if (data.problemFamily === "optimization") {
    quantumItems = [
      {
        label: "Toy QUBO or graph subproblem",
        notes: "Useful for education and hybrid reasoning, but keep production claims conservative.",
        readiness:
          assessment.disposition === "hybrid_prototype_now"
            ? "Prototype-only"
            : "Teaching-only",
      },
    ];
  } else if (data.problemFamily === "physics_dynamics") {
    quantumItems = [
      {
        label: "Controlled simulation or Hamiltonian-style subproblem",
        notes: "Use as a concept bridge, not an immediate commercial claim.",
        readiness: "Research-oriented",
      },
    ];
  } else {
    quantumItems = [
      {
        label: "Candidate subproblem still unclear",
        notes: "Refine the mapping before generating a technical artifact.",
        readiness: "Needs clarification",
      },
    ];
  }

  return {
    classical: baseClassical,
    quantum: quantumItems,
    verification: baseVerification,
  };
}

function renderWorkflowGraph(data, assessment) {
  const graph = buildWorkflowGraph(data, assessment);
  els.laneGrid.innerHTML = "";

  laneDefinitions.forEach((lane) => {
    const article = document.createElement("article");
    article.className = "lane";
    article.innerHTML = `
      <span class="lane-label">${lane.label}</span>
      <p>${lane.description}</p>
    `;

    graph[lane.key].forEach((node) => {
      const item = document.createElement("div");
      item.className = "workflow-item";
      item.innerHTML = `
        <h4>${node.label}</h4>
        <p>${node.notes}</p>
        <span class="readiness">${node.readiness}</span>
      `;
      article.appendChild(item);
    });

    els.laneGrid.appendChild(article);
  });
}

function getRecommendedTemplate(data) {
  if (data.problemFamily === "chemistry_materials") {
    return "chemistry_openfermion_v1";
  }

  if (data.problemFamily === "optimization") {
    return "optimization_qaoa_v1";
  }

  return "architecture_summary_v1";
}

function buildPrototypeArtifact(data, assessment, templateKey) {
  const summaryLine = `Disposition: ${getDispositionUi(assessment.disposition).label}`;

  if (templateKey === "chemistry_openfermion_v1") {
    return {
      title: "Chemistry prototype notebook outline",
      summary:
        "A conservative notebook scaffold for a reduced chemistry or materials subproblem.",
      content: `# ${data.sessionName || "Chemistry prototype"}\n\n${summaryLine}\n\n## Objective\n${data.businessObjective}\n\n## Why this belongs in a hybrid workflow\n- Most of the screening pipeline remains classical.\n- The candidate quantum lane is a reduced electronic-structure style subproblem.\n- The prototype should stay simulation-first and explicitly compare against a classical baseline.\n\n## Notebook outline\n1. Load reduced molecular or active-space example\n2. State assumptions and scientific caveats\n3. Map the toy problem into an OpenFermion-style representation\n4. Create a Cirq-compatible simulation scaffold\n5. Compare output to a classical reference\n6. Write down what this does not prove\n\n## Libraries\n- OpenFermion\n- Cirq\n- qsim-compatible simulation path\n\n## Trust note\nThis artifact is exploratory and educational. It does not imply production readiness or quantum advantage.`,
    };
  }

  if (templateKey === "optimization_qaoa_v1") {
    return {
      title: "Optimization prototype notebook outline",
      summary:
        "A teaching-first optimization artifact with an explicit classical comparison.",
      content: `# ${data.sessionName || "Optimization prototype"}\n\n${summaryLine}\n\n## Objective\n${data.businessObjective}\n\n## Framing\n- Treat the quantum portion as a narrow graph or QUBO-style teaching example.\n- Keep the production workflow classical.\n- Use the prototype to explain hybrid decomposition rather than claim immediate advantage.\n\n## Notebook outline\n1. Define a reduced graph or routing subproblem\n2. Establish the classical heuristic baseline\n3. Build a toy hybrid loop\n4. Compare solution quality and runtime assumptions\n5. Capture caveats for the customer conversation\n\n## Trust note\nThis is a workshop and education artifact, not a production migration recommendation.`,
    };
  }

  return {
    title: "Architecture summary artifact",
    summary:
      "A customer-ready markdown brief of the workflow split, disposition, and next-step guidance.",
    content: `# ${data.sessionName || "Architecture summary"}\n\n${summaryLine}\n\n## Workload objective\n${data.businessObjective}\n\n## Current baseline\n${data.currentBaseline}\n\n## Current bottleneck\n${data.currentBottleneck}\n\n## Recommended next step\n${assessment.nextStep}\n\n## Hybrid split\n- Classical backbone: intake, orchestration, data handling, production integration\n- Quantum candidate: ${
      data.candidateSubproblem === "yes"
        ? "a narrow structured subproblem"
        : "not yet isolated clearly enough"
    }\n- Verification: baseline comparison, caveats, export artifacts\n\n## Caveat\n${assessment.caveat}`,
  };
}

function buildExportBundle(data, assessment, artifact) {
  return `# ${data.sessionName || "Hybrid Quantum Workload Navigator session"}\n\n## Disposition\n${getDispositionUi(assessment.disposition).label}\n\n## Summary\n${assessment.summary}\n\n## Objective\n${data.businessObjective}\n\n## Baseline\n${data.currentBaseline}\n\n## Bottleneck\n${data.currentBottleneck}\n\n## Rationale\n- ${assessment.rationale.join("\n- ")}\n\n## Assumptions\n- ${assessment.assumptions.join("\n- ")}\n\n## What could change the outcome\n- ${assessment.changeDrivers.join("\n- ")}\n\n## Next step\n${assessment.nextStep}\n\n## Artifact generated\n${artifact ? artifact.title : "No artifact generated yet"}\n\n## Caveat\n${assessment.caveat}\n`;
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderPrototypeTemplates(data) {
  const recommended = getRecommendedTemplate(data);
  if (!selectedTemplateKey) {
    selectedTemplateKey = recommended;
  }
  els.templateGrid.innerHTML = "";

  templateCatalog.forEach((template) => {
    const article = document.createElement("article");
    article.className = `template-card ${selectedTemplateKey === template.key ? "active" : ""}`;
    article.innerHTML = `
      <span>${template.label}</span>
      <h4>${template.key}</h4>
      <p>${template.summary}</p>
      <button class="button secondary compact" type="button">Use template</button>
    `;

    article.querySelector("button").addEventListener("click", () => {
      selectedTemplateKey = template.key;
      renderPrototypeTemplates(currentScenario);
    });

    if (template.key === recommended) {
      const recommendedPill = document.createElement("span");
      recommendedPill.className = "pill";
      recommendedPill.textContent = "Recommended";
      article.appendChild(recommendedPill);
    }

    els.templateGrid.appendChild(article);
  });
}

function renderAssessment(data, assessment) {
  const dispositionUi = getDispositionUi(assessment.disposition);

  els.recommendationBadge.textContent = dispositionUi.label;
  els.recommendationBadge.className = `badge ${dispositionUi.className}`;
  els.recommendationTitle.textContent = assessment.title;
  els.recommendationSummary.textContent = assessment.summary;
  els.weightedTotal.textContent = String(assessment.weightedTotal);
  els.confidenceBand.textContent = assessment.confidence;
  els.completenessValue.textContent = `${assessment.completeness.percentage}%`;
  els.completenessMirror.textContent = `${assessment.completeness.percentage}%`;
  els.scoreClassicalBaseline.textContent = String(assessment.scores.classicalBaselineStrength);
  els.scoreProblemStructure.textContent = String(assessment.scores.problemStructure);
  els.scoreRepresentationFit.textContent = String(assessment.scores.representationFit);
  els.scoreTimeHorizon.textContent = String(assessment.scores.timeHorizonFit);
  els.scoreVerification.textContent = String(assessment.scores.verificationTolerance);
  els.scoreTeamReadiness.textContent = String(assessment.scores.teamReadiness);
  els.nextStep.textContent = assessment.nextStep;
  els.noviceExplanation.textContent = assessment.noviceExplanation;
  els.ruleTrace.textContent = assessment.ruleTrace;
  els.caveatText.textContent = assessment.caveat;
  els.heroDisposition.textContent = dispositionUi.hero;
  els.heroDispositionCopy.textContent = assessment.summary;

  renderList(
    els.reasonList,
    assessment.rationale,
    "Run the fit assessment to see why the recommendation was made."
  );
  renderList(
    els.assumptionList,
    assessment.assumptions,
    "Assumptions appear here after a recommendation is generated."
  );
  renderList(
    els.changeList,
    assessment.changeDrivers,
    "Possible change drivers appear here after the assessment runs."
  );

  renderWorkflowGraph(data, assessment);
  renderPrototypeTemplates(data);

  if (assessment.disposition === "fault_tolerant_candidate_later") {
    els.prototypeNowTitle.textContent = "Toy prototype available now";
    els.prototypeNowCopy.textContent =
      "A reduced simulation-first artifact is still useful for qualification and design reviews.";
    els.futureStateTitle.textContent = "Meaningful scale is future-facing";
    els.futureStateCopy.textContent =
      "The compelling version of this workload depends on resource-estimation logic and fault-tolerant assumptions.";
  } else if (assessment.disposition === "hybrid_prototype_now") {
    els.prototypeNowTitle.textContent = "Prototype now path exists";
    els.prototypeNowCopy.textContent =
      "Use a reduced hybrid artifact and compare it directly against a strong classical baseline.";
    els.futureStateTitle.textContent = "Future path optional";
    els.futureStateCopy.textContent =
      "A later fault-tolerant story may exist, but it is not required for the MVP conversation.";
  } else {
    els.prototypeNowTitle.textContent = "No strong prototype claim yet";
    els.prototypeNowCopy.textContent =
      "Use this app to teach the reasoning and improve the workload definition before promising a prototype.";
    els.futureStateTitle.textContent = "Future path remains speculative";
    els.futureStateCopy.textContent =
      "Do not imply a later quantum path unless a clean structured subproblem is identified.";
  }

  els.trustNote.textContent = assessment.caveat;
}

function updateSessionPreview(data) {
  const completeness = computeCompleteness(data);
  els.sessionTitlePreview.textContent = data.sessionName || "Untitled session";
  els.sessionSummaryCopy.textContent = data.businessObjective
    ? data.businessObjective
    : "No scenario assessed yet. Fill in the intake and run the fit assessment.";
  els.currentPersona.textContent = `Persona: ${titleCase(data.persona || "r_and_d_lead")}`;
  els.currentGoal.textContent = `Goal: ${titleCase(data.sessionGoal || "fit_assessment")}`;
  els.completenessValue.textContent = `${completeness.percentage}%`;
  els.completenessMirror.textContent = `${completeness.percentage}%`;
}

function renderGlossary() {
  glossaryTerms.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "glossary-card";
    article.innerHTML = `
      <h3>${entry.term}</h3>
      <p>${entry.description}</p>
    `;
    els.glossaryGrid.appendChild(article);
  });
}

function setFormData(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = document.getElementById(key);
    if (field) {
      field.value = value;
    }
  });
  currentScenario = getFormData();
  updateSessionPreview(currentScenario);
}

function renderExamples() {
  els.exampleGrid.innerHTML = "";

  exampleScenarios.forEach((scenario) => {
    const article = document.createElement("article");
    article.className = "example-card";
    article.innerHTML = `
      <span class="example-tag">${scenario.tag}</span>
      <h3>${scenario.title}</h3>
      <p>${scenario.data.businessObjective}</p>
      <button class="button secondary compact" type="button">Load scenario</button>
    `;
    article.querySelector("button").addEventListener("click", () => {
      setFormData(scenario.data);
      const assessment = buildAssessment(scenario.data);
      currentAssessment = assessment;
      renderAssessment(scenario.data, assessment);
      renderArtifactPreview();
      window.location.hash = "workspace";
    });
    els.exampleGrid.appendChild(article);
  });
}

function readSavedSessions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSavedSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, 8)));
}

function saveCurrentSession() {
  const data = getFormData();
  const assessment = currentAssessment || buildAssessment(data);
  const sessions = readSavedSessions();
  const saved = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    data,
    assessment,
  };
  writeSavedSessions([saved, ...sessions.filter((item) => item.data.sessionName !== data.sessionName)]);
  renderSavedSessions();
}

function renderSavedSessions() {
  const sessions = readSavedSessions();
  els.sessionList.innerHTML = "";

  if (!sessions.length) {
    els.sessionList.innerHTML = "<p>No saved sessions yet. Save one locally to reuse it.</p>";
    return;
  }

  sessions.forEach((session) => {
    const disposition = session.assessment
      ? getDispositionUi(session.assessment.disposition).label
      : "Unassessed";
    const article = document.createElement("article");
    article.className = "session-item";
    article.innerHTML = `
      <strong>${session.data.sessionName || "Untitled session"}</strong>
      <p>${disposition}</p>
      <button class="button secondary compact" type="button">Load session</button>
    `;
    article.querySelector("button").addEventListener("click", () => {
      setFormData(session.data);
      currentAssessment = buildAssessment(session.data);
      renderAssessment(session.data, currentAssessment);
      renderArtifactPreview();
    });
    els.sessionList.appendChild(article);
  });
}

function renderArtifactPreview() {
  if (!currentAssessment) {
    return;
  }

  const artifact = buildPrototypeArtifact(currentScenario, currentAssessment, selectedTemplateKey);
  els.prototypeTitle.textContent = artifact.title;
  els.prototypeSummary.textContent = artifact.summary;
  els.prototypePreview.textContent = artifact.content;
  els.exportPreview.textContent = buildExportBundle(currentScenario, currentAssessment, artifact);
}

function setMode(mode) {
  currentMode = mode;
  document.body.classList.toggle("builder-mode", currentMode === "builder");
  modeToggle.textContent = currentMode === "builder" ? "Builder mode" : "Executive mode";
  els.heroMode.textContent = currentMode === "builder" ? "Builder" : "Executive";
  els.modePill.textContent = currentMode === "builder" ? "Builder" : "Executive";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  currentScenario = getFormData();
  updateSessionPreview(currentScenario);
  currentAssessment = buildAssessment(currentScenario);
  selectedTemplateKey = getRecommendedTemplate(currentScenario);
  renderAssessment(currentScenario, currentAssessment);
  renderArtifactPreview();
});

form.addEventListener("input", () => {
  currentScenario = getFormData();
  updateSessionPreview(currentScenario);
});

modeToggle.addEventListener("click", () => {
  setMode(currentMode === "builder" ? "executive" : "builder");
});

saveSessionButton.addEventListener("click", () => {
  currentScenario = getFormData();
  if (!currentAssessment) {
    currentAssessment = buildAssessment(currentScenario);
    renderAssessment(currentScenario, currentAssessment);
  }
  saveCurrentSession();
});

clearSessionsButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderSavedSessions();
});

generatePrototypeButton.addEventListener("click", () => {
  currentScenario = getFormData();
  if (!currentAssessment) {
    currentAssessment = buildAssessment(currentScenario);
    renderAssessment(currentScenario, currentAssessment);
  }
  renderArtifactPreview();
});

downloadMarkdownButton.addEventListener("click", () => {
  currentScenario = getFormData();
  if (!currentAssessment) {
    currentAssessment = buildAssessment(currentScenario);
    renderAssessment(currentScenario, currentAssessment);
  }
  renderArtifactPreview();
  downloadTextFile(
    "executive-brief.md",
    els.exportPreview.textContent,
    "text/markdown;charset=utf-8"
  );
});

downloadJsonButton.addEventListener("click", () => {
  currentScenario = getFormData();
  if (!currentAssessment) {
    currentAssessment = buildAssessment(currentScenario);
    renderAssessment(currentScenario, currentAssessment);
  }

  const artifact = buildPrototypeArtifact(currentScenario, currentAssessment, selectedTemplateKey);
  downloadTextFile(
    "session-export.json",
    JSON.stringify(
      {
        scenario: currentScenario,
        assessment: currentAssessment,
        artifact,
      },
      null,
      2
    ),
    "application/json;charset=utf-8"
  );
});

renderExamples();
renderGlossary();
renderSavedSessions();
setMode("executive");
setFormData(exampleScenarios[0].data);
currentAssessment = buildAssessment(exampleScenarios[0].data);
selectedTemplateKey = getRecommendedTemplate(exampleScenarios[0].data);
renderAssessment(exampleScenarios[0].data, currentAssessment);
renderArtifactPreview();
