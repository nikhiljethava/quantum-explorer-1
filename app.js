const exampleScenarios = [
  {
    title: "Delivery route planning",
    tag: "Classical first",
    family: "optimization",
    data: {
      problemStatement:
        "We want to optimize delivery routes for a logistics network with changing demand and time windows.",
      problemFamily: "optimization",
      timeHorizon: "today",
      classicalStrength: "strong",
      primaryGoal: "speed",
      problemStructure: "medium",
      errorTolerance: "medium",
      dataForm: "graph",
      teamReadiness: "low",
    },
  },
  {
    title: "Battery material simulation",
    tag: "Quantum candidate",
    family: "chemistry",
    data: {
      problemStatement:
        "We want better simulation of electronic structure for new battery materials and can support a multi-year R&D effort.",
      problemFamily: "chemistry",
      timeHorizon: "long-term",
      classicalStrength: "mixed",
      primaryGoal: "simulation",
      problemStructure: "high",
      errorTolerance: "medium",
      dataForm: "symbolic",
      teamReadiness: "high",
    },
  },
  {
    title: "Fraud detection model tuning",
    tag: "Stay classical",
    family: "machine-learning",
    data: {
      problemStatement:
        "We want to improve fraud detection on messy transactional and behavioral data.",
      problemFamily: "machine-learning",
      timeHorizon: "today",
      classicalStrength: "strong",
      primaryGoal: "quality",
      problemStructure: "low",
      errorTolerance: "medium",
      dataForm: "messy",
      teamReadiness: "medium",
    },
  },
];

const glossaryTerms = [
  {
    term: "Hybrid workflow",
    description:
      "A setup where classical computers do most orchestration and optimization while quantum hardware or simulators handle only narrow subproblems.",
  },
  {
    term: "Problem structure",
    description:
      "The mathematical regularity in a task. Quantum methods usually need strong structure, not just a large or important business problem.",
  },
  {
    term: "NISQ hardware",
    description:
      "Noisy intermediate-scale quantum devices available today. They are useful for research, but they are not general-purpose replacements for classical systems.",
  },
  {
    term: "Resource estimation",
    description:
      "A way to estimate how many qubits, gates, and error-correction overhead a future quantum algorithm would need before hardware is ready.",
  },
  {
    term: "Quantum-inspired",
    description:
      "Classical techniques influenced by quantum ideas. These can sometimes deliver value sooner than actual quantum hardware.",
  },
  {
    term: "Classical baseline",
    description:
      "The best non-quantum solver or heuristic you compare against before claiming quantum value.",
  },
];

const form = document.getElementById("assessment-form");
const resultEls = {
  badge: document.getElementById("recommendationBadge"),
  title: document.getElementById("recommendationTitle"),
  summary: document.getElementById("recommendationSummary"),
  classicalScore: document.getElementById("classicalScore"),
  hybridScore: document.getElementById("hybridScore"),
  quantumScore: document.getElementById("quantumScore"),
  reasonList: document.getElementById("reasonList"),
  nextStep: document.getElementById("nextStep"),
  noviceExplanation: document.getElementById("noviceExplanation"),
};

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function scoreAssessment(data) {
  let classical = 40;
  let hybrid = 30;
  let quantum = 20;
  const reasons = [];

  const familyBoosts = {
    optimization: { classical: 10, hybrid: 18, quantum: 10 },
    chemistry: { classical: -5, hybrid: 12, quantum: 34 },
    "machine-learning": { classical: 18, hybrid: 6, quantum: -2 },
    cryptography: { classical: 8, hybrid: 0, quantum: 20 },
    search: { classical: 8, hybrid: 10, quantum: 10 },
    other: { classical: 8, hybrid: 4, quantum: 0 },
  };

  const classicalStrengthBoosts = {
    strong: { classical: 24, hybrid: -10, quantum: -18 },
    mixed: { classical: 4, hybrid: 14, quantum: 8 },
    weak: { classical: -10, hybrid: 14, quantum: 18 },
  };

  const horizonBoosts = {
    today: { classical: 18, hybrid: 2, quantum: -20 },
    pilot: { classical: 0, hybrid: 14, quantum: 6 },
    "long-term": { classical: -6, hybrid: 4, quantum: 22 },
  };

  const goalBoosts = {
    speed: { classical: 12, hybrid: 6, quantum: 0 },
    quality: { classical: 8, hybrid: 10, quantum: 6 },
    simulation: { classical: -2, hybrid: 8, quantum: 26 },
    learning: { classical: 0, hybrid: 10, quantum: 10 },
  };

  const structureBoosts = {
    high: { classical: 0, hybrid: 12, quantum: 18 },
    medium: { classical: 8, hybrid: 8, quantum: 2 },
    low: { classical: 14, hybrid: -6, quantum: -18 },
  };

  const toleranceBoosts = {
    low: { classical: 16, hybrid: -4, quantum: -12 },
    medium: { classical: 2, hybrid: 8, quantum: 4 },
    high: { classical: 0, hybrid: 6, quantum: 10 },
  };

  const dataBoosts = {
    symbolic: { classical: 0, hybrid: 8, quantum: 18 },
    graph: { classical: 8, hybrid: 12, quantum: 8 },
    tabular: { classical: 16, hybrid: 0, quantum: -10 },
    messy: { classical: 18, hybrid: -2, quantum: -16 },
  };

  const readinessBoosts = {
    low: { classical: 10, hybrid: -4, quantum: -14 },
    medium: { classical: 2, hybrid: 6, quantum: 4 },
    high: { classical: -2, hybrid: 8, quantum: 12 },
  };

  [
    familyBoosts[data.problemFamily],
    classicalStrengthBoosts[data.classicalStrength],
    horizonBoosts[data.timeHorizon],
    goalBoosts[data.primaryGoal],
    structureBoosts[data.problemStructure],
    toleranceBoosts[data.errorTolerance],
    dataBoosts[data.dataForm],
    readinessBoosts[data.teamReadiness],
  ].forEach((boost) => {
    classical += boost.classical;
    hybrid += boost.hybrid;
    quantum += boost.quantum;
  });

  if (data.problemFamily === "chemistry") {
    reasons.push(
      "Chemistry and materials problems are among the clearest long-term quantum application areas."
    );
  }

  if (data.classicalStrength === "strong") {
    reasons.push(
      "A strong classical baseline is usually a signal to optimize existing methods before reaching for quantum."
    );
  }

  if (data.problemStructure === "low" || data.dataForm === "messy") {
    reasons.push(
      "Low structure or messy data often reduces quantum suitability because mapping the problem cleanly becomes difficult."
    );
  }

  if (data.timeHorizon === "today") {
    reasons.push(
      "If the team needs practical value on current hardware, classical and hybrid approaches are more realistic than pure quantum hardware bets."
    );
  }

  if (data.teamReadiness === "high" && data.timeHorizon !== "today") {
    reasons.push(
      "A research-capable team can justify pilots in simulation, resource estimation, and hybrid experimentation."
    );
  }

  if (data.problemFamily === "optimization" && data.classicalStrength !== "strong") {
    reasons.push(
      "Optimization can be a good hybrid exploration area when the problem has clear combinatorial structure and classical methods are struggling."
    );
  }

  const scores = {
    classical: clamp(classical),
    hybrid: clamp(hybrid),
    quantum: clamp(quantum),
  };

  const ranking = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top = ranking[0][0];

  return {
    scores,
    top,
    reasons: reasons.slice(0, 4),
  };
}

function buildRecommendation(data) {
  const { scores, top, reasons } = scoreAssessment(data);

  if (top === "classical") {
    return {
      label: "Classical first",
      title: "Use classical methods as the default path.",
      summary:
        "This problem is better framed as a classical computing challenge right now. You may still borrow quantum-inspired ideas, but production value is most likely to come from stronger baselines, heuristics, or ML.",
      nextStep:
        "Benchmark the best available classical solver first, then document where it fails on cost, latency, or quality before opening any quantum workstream.",
      noviceExplanation:
        "Quantum does not automatically help just because a problem is hard. If standard methods already work or the data is messy, classical systems usually win on reliability and time to value.",
      scores,
      reasons,
      statusClass: "status-classical",
    };
  }

  if (top === "hybrid") {
    return {
      label: "Hybrid exploration",
      title: "Test a hybrid classical-quantum workflow.",
      summary:
        "This looks like a candidate for structured experimentation, especially if you can isolate a narrow optimization or simulation component. Hybrid is often the right middle ground for education and research pilots.",
      nextStep:
        "Define a narrow subproblem, compare against a strong classical baseline, and validate on simulators before considering hardware access.",
      noviceExplanation:
        "A hybrid approach means the classical computer still does most of the work. The quantum part is a targeted experiment, not a wholesale replacement for your stack.",
      scores,
      reasons,
      statusClass: "status-hybrid",
    };
  }

  return {
    label: "Quantum candidate",
    title: "Explore this as a strategic quantum candidate.",
    summary:
      "This problem has characteristics that line up with the kinds of domains quantum researchers care about, especially for long-term simulation or algorithm research. It still needs careful validation and resource estimation.",
    nextStep:
      "Turn this into a research brief with the mathematical formulation, classical bottlenecks, and a resource-estimation path before making any platform commitments.",
    noviceExplanation:
      "This does not mean quantum will solve it today. It means the problem has enough structure and strategic value to justify future-looking quantum investigation.",
    scores,
    reasons,
    statusClass: "status-quantum",
  };
}

function renderRecommendation(recommendation) {
  resultEls.badge.textContent = recommendation.label;
  resultEls.badge.className = `badge ${recommendation.statusClass}`;
  resultEls.title.textContent = recommendation.title;
  resultEls.summary.textContent = recommendation.summary;
  resultEls.classicalScore.textContent = recommendation.scores.classical;
  resultEls.hybridScore.textContent = recommendation.scores.hybrid;
  resultEls.quantumScore.textContent = recommendation.scores.quantum;
  resultEls.nextStep.textContent = recommendation.nextStep;
  resultEls.noviceExplanation.textContent = recommendation.noviceExplanation;

  resultEls.reasonList.innerHTML = "";
  recommendation.reasons.forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    resultEls.reasonList.appendChild(item);
  });
}

function populateExamples() {
  const container = document.getElementById("exampleGrid");
  exampleScenarios.forEach((scenario) => {
    const article = document.createElement("article");
    article.className = "example-card";
    article.innerHTML = `
      <span class="example-tag">${scenario.tag}</span>
      <h3>${scenario.title}</h3>
      <p>${scenario.data.problemStatement}</p>
      <button class="button secondary">Load scenario</button>
    `;

    article.querySelector("button").addEventListener("click", () => {
      Object.entries(scenario.data).forEach(([key, value]) => {
        const field = document.getElementById(key);
        if (field) {
          field.value = value;
        }
      });
      renderRecommendation(buildRecommendation(scenario.data));
      document
        .getElementById("explorer")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });

    container.appendChild(article);
  });
}

function populateGlossary() {
  const container = document.getElementById("glossaryGrid");
  glossaryTerms.forEach((entry) => {
    const article = document.createElement("article");
    article.className = "glossary-card";
    article.innerHTML = `
      <h3>${entry.term}</h3>
      <p>${entry.description}</p>
    `;
    container.appendChild(article);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const recommendation = buildRecommendation(data);
  renderRecommendation(recommendation);
});

populateExamples();
populateGlossary();
