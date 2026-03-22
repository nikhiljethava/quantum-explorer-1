const exampleScenarios = [
  {
    title: "Battery materials",
    tag: "Long-term candidate",
    data: {
      businessGoal:
        "We want to understand whether quantum computing could eventually help us study battery materials more accurately.",
      problemType: "materials",
      classicalFit: "mixed",
      timeNeed: "later",
      subproblem: "yes",
    },
  },
  {
    title: "Delivery routes",
    tag: "Small hybrid pilot",
    data: {
      businessGoal:
        "We want to improve delivery route planning and want to know whether quantum is worth exploring.",
      problemType: "optimization",
      classicalFit: "mixed",
      timeNeed: "pilot",
      subproblem: "yes",
    },
  },
  {
    title: "Fraud analytics",
    tag: "Stay classical",
    data: {
      businessGoal:
        "We want better fraud detection across messy business and behavioral data.",
      problemType: "analytics",
      classicalFit: "strong",
      timeNeed: "now",
      subproblem: "no",
    },
  },
];

const glossaryTerms = [
  {
    term: "Classical computing",
    description:
      "The regular computers and cloud systems businesses already use today.",
  },
  {
    term: "Hybrid approach",
    description:
      "A workflow where regular computers do most of the work and only a small piece is tested with quantum methods.",
  },
  {
    term: "Long-term quantum candidate",
    description:
      "A problem that may matter for quantum in the future, even if it is not practical today.",
  },
];

const recommendationMap = {
  classical: {
    label: "Stay classical",
    className: "status-classical",
    title: "Use classical computing as the main path.",
    summary:
      "This problem is better handled with today's regular computing tools. Quantum is unlikely to be the best next step right now.",
    nextStep:
      "Focus on improving the current workflow, data quality, software, or classical models before opening a quantum workstream.",
    simpleExplanation:
      "This is probably not a strong quantum use case. The problem either already works well with regular tools or does not have the right structure for quantum methods.",
    classicalExplanation:
      "The main workflow should stay on regular cloud and software systems.",
    laterExplanation:
      "If a clearer, smaller, more structured subproblem appears later, you can revisit the question then.",
  },
  learn: {
    label: "Learn first, decide later",
    className: "status-learn",
    title: "This is better as a learning conversation right now.",
    summary:
      "You may not yet have a clear enough quantum candidate. The best next step is to understand the problem more clearly before trying a pilot.",
    nextStep:
      "Clarify the business bottleneck, identify a smaller testable piece, and then revisit whether quantum is worth exploring.",
    simpleExplanation:
      "Quantum might or might not matter here, but the app does not see a clear enough test case yet.",
    classicalExplanation:
      "Keep using classical tools while you narrow the problem definition.",
    laterExplanation:
      "If you can isolate a small, structured piece of the problem, a pilot may make sense later.",
  },
  hybrid: {
    label: "Try a small hybrid pilot",
    className: "status-hybrid",
    title: "A small hybrid pilot could be worth exploring.",
    summary:
      "This looks like the kind of problem where a narrow experiment may be useful, especially if you can test one small part without changing the whole business system.",
    nextStep:
      "Choose one small, clearly defined subproblem and compare any quantum-style experiment against your best classical baseline.",
    simpleExplanation:
      "This does not mean 'move the system to quantum.' It means a small experiment may teach you something useful.",
    classicalExplanation:
      "Most of the workflow should still stay classical. Data handling, orchestration, and production systems remain on regular infrastructure.",
    laterExplanation:
      "If a pilot shows promise, the long-term story can be explored later without overselling it today.",
  },
  later: {
    label: "Good long-term quantum candidate",
    className: "status-later",
    title: "This is a stronger long-term quantum candidate.",
    summary:
      "The problem has the kind of structure people often discuss in quantum computing, but it is more realistic as a future-facing opportunity than a near-term business deployment.",
    nextStep:
      "Treat this as a strategic exploration area. Start with education and small pilots, and avoid promising immediate business value.",
    simpleExplanation:
      "Quantum may matter here in the future, but that does not mean it is ready to solve the full business problem today.",
    classicalExplanation:
      "Your current systems still do most of the work today.",
    laterExplanation:
      "This is where quantum becomes more relevant as hardware and algorithms improve over time.",
  },
};

const form = document.getElementById("assessment-form");
const els = {
  recommendationBadge: document.getElementById("recommendationBadge"),
  recommendationTitle: document.getElementById("recommendationTitle"),
  recommendationSummary: document.getElementById("recommendationSummary"),
  visualizationLabel: document.getElementById("visualizationLabel"),
  reasonList: document.getElementById("reasonList"),
  nextStep: document.getElementById("nextStep"),
  simpleExplanation: document.getElementById("simpleExplanation"),
  classicalExplanation: document.getElementById("classicalExplanation"),
  laterExplanation: document.getElementById("laterExplanation"),
  exampleGrid: document.getElementById("exampleGrid"),
  glossaryGrid: document.getElementById("glossaryGrid"),
};

function getRecommendation(data) {
  const reasons = [];

  if (
    data.problemType === "analytics" ||
    data.problemType === "general" ||
    (data.classicalFit === "strong" && data.subproblem === "no")
  ) {
    reasons.push(
      "This looks more like a regular software, analytics, or data problem than a quantum-first problem."
    );
    reasons.push(
      "Current tools already seem to handle a large part of the need, or the problem is too broad to isolate a useful quantum test."
    );
    return { key: "classical", reasons };
  }

  if (data.problemType === "unsure" || data.subproblem === "maybe") {
    reasons.push(
      "You do not yet have a clear small problem to test separately."
    );
    reasons.push(
      "That usually means the right next step is learning and clarification rather than a technical pilot."
    );
    return { key: "learn", reasons };
  }

  if (
    data.problemType === "materials" &&
    data.timeNeed === "later" &&
    data.subproblem === "yes"
  ) {
    reasons.push(
      "Chemistry, materials, and physical simulation are among the strongest areas people discuss for future quantum value."
    );
    reasons.push(
      "You are open to a longer-term exploration, which fits the current reality of quantum better than a near-term production need."
    );
    return { key: "later", reasons };
  }

  if (
    data.problemType === "optimization" &&
    data.timeNeed !== "now" &&
    data.subproblem === "yes"
  ) {
    reasons.push(
      "Optimization is one of the easiest categories for beginners to explore through small hybrid experiments."
    );
    reasons.push(
      "You can isolate a smaller test case instead of changing the whole business workflow."
    );
    return { key: "hybrid", reasons };
  }

  if (
    data.classicalFit === "weak" &&
    data.subproblem === "yes" &&
    data.timeNeed !== "now"
  ) {
    reasons.push(
      "Current tools seem to struggle, and you have a smaller piece that could be tested separately."
    );
    reasons.push(
      "That makes a small hybrid pilot more reasonable than an immediate production bet."
    );
    return { key: "hybrid", reasons };
  }

  reasons.push(
    "The problem may be interesting, but the app does not yet see a strong reason to recommend a quantum-focused next step."
  );
  reasons.push(
    "When in doubt, it is usually better to learn first and keep the current workflow classical."
  );
  return { key: "learn", reasons };
}

function renderRecommendation(result) {
  const recommendation = recommendationMap[result.key];

  els.recommendationBadge.textContent = recommendation.label;
  els.recommendationBadge.className = `badge ${recommendation.className}`;
  els.recommendationTitle.textContent = recommendation.title;
  els.recommendationSummary.textContent = recommendation.summary;
  els.nextStep.textContent = recommendation.nextStep;
  els.simpleExplanation.textContent = recommendation.simpleExplanation;
  els.classicalExplanation.textContent = recommendation.classicalExplanation;
  els.laterExplanation.textContent = recommendation.laterExplanation;
  els.visualizationLabel.textContent = recommendation.label;

  document.querySelectorAll(".journey-step").forEach((step, index) => {
    step.classList.remove("active", "complete");
    const stepKey = step.dataset.step;
    if (stepKey === result.key) {
      step.classList.add("active");
    }

    const order = ["classical", "learn", "hybrid", "later"];
    if (order.indexOf(stepKey) < order.indexOf(result.key)) {
      step.classList.add("complete");
    }
  });

  els.reasonList.innerHTML = "";
  result.reasons.forEach((reason) => {
    const item = document.createElement("li");
    item.textContent = reason;
    els.reasonList.appendChild(item);
  });
}

function setFormData(data) {
  Object.entries(data).forEach(([key, value]) => {
    const field = document.getElementById(key);
    if (field) {
      field.value = value;
    }
  });
}

function renderExamples() {
  exampleScenarios.forEach((scenario) => {
    const article = document.createElement("article");
    article.className = "example-card";
    article.innerHTML = `
      <span class="example-tag">${scenario.tag}</span>
      <h3>${scenario.title}</h3>
      <p>${scenario.data.businessGoal}</p>
      <button class="button secondary" type="button">Load example</button>
    `;

    article.querySelector("button").addEventListener("click", () => {
      setFormData(scenario.data);
      renderRecommendation(getRecommendation(scenario.data));
      document
        .getElementById("result")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });

    els.exampleGrid.appendChild(article);
  });
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  renderRecommendation(getRecommendation(data));
  document
    .getElementById("result")
    .scrollIntoView({ behavior: "smooth", block: "start" });
});

renderExamples();
renderGlossary();
setFormData(exampleScenarios[0].data);
renderRecommendation(getRecommendation(exampleScenarios[0].data));
