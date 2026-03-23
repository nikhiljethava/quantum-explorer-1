const NUM_QUBITS = 2;
const NUM_STEPS = 6;
const SQRT1_2 = 1 / Math.sqrt(2);

const businessExamples = [
  {
    title: "Materials and chemistry",
    detail:
      "Quantum is often discussed for small chemistry and materials problems where simulation becomes hard classically.",
    googlePath: "Google path: OpenFermion for chemistry-style modeling.",
  },
  {
    title: "Optimization and scheduling",
    detail:
      "Optimization is useful for learning hybrid thinking because you can test a small subproblem before touching the whole workflow.",
    googlePath: "Google path: Cirq + qsim-style simulation for toy experiments.",
  },
  {
    title: "Quantum fundamentals for teams",
    detail:
      "Many teams first need intuition: superposition, entanglement, and measurement before any serious prototyping conversation.",
    googlePath: "Google path: visual circuits first, then Cirq code second.",
  },
];

const coreConcepts = [
  {
    title: "Superposition",
    detail:
      "A qubit can be in a mix of 0 and 1 until you measure it. That is why a single Hadamard gate can create two possible outcomes.",
  },
  {
    title: "Bell state",
    detail:
      "A Bell state is a simple two-qubit entangled state. It is a beginner-friendly way to see two qubits become linked.",
  },
  {
    title: "Measurement",
    detail:
      "Measurement turns the quantum state into a classical answer like 00, 01, 10, or 11. In this playground, measurement is treated as the final step.",
  },
  {
    title: "Circuit",
    detail:
      "A quantum circuit is just a sequence of operators applied over time. You can think of it like a visual recipe for the qubits.",
  },
];

const operators = [
  {
    key: "H",
    short: "H",
    name: "Hadamard",
    description: "Creates a superposition so a qubit can behave like both 0 and 1 before measurement.",
  },
  {
    key: "X",
    short: "X",
    name: "Bit flip",
    description: "Flips a qubit from 0 to 1 or from 1 to 0.",
  },
  {
    key: "Z",
    short: "Z",
    name: "Phase flip",
    description: "Changes phase. Beginners often understand it best after seeing H and X first.",
  },
  {
    key: "CNOT",
    short: "CNOT",
    name: "Controlled NOT",
    description: "Connects two qubits and is a key ingredient for entanglement.",
  },
  {
    key: "M",
    short: "M",
    name: "Measure",
    description: "Reads a qubit at the end so you can see the outcome probabilities.",
  },
];

const circuitExamples = [
  {
    key: "superposition",
    title: "Superposition",
    subtitle: "One qubit spreads across two likely outcomes.",
    build: () => {
      const grid = createEmptyGrid();
      grid[0][0] = "H";
      grid[0][4] = "M";
      grid[1][4] = "M";
      return grid;
    },
  },
  {
    key: "bell",
    title: "Bell state",
    subtitle: "A first entanglement example: two qubits start behaving together.",
    build: () => {
      const grid = createEmptyGrid();
      grid[0][0] = "H";
      grid[0][1] = "CONTROL";
      grid[1][1] = "TARGET";
      grid[0][4] = "M";
      grid[1][4] = "M";
      return grid;
    },
  },
  {
    key: "bitflip",
    title: "Bit flip",
    subtitle: "Use X to move the qubit from 0 to 1.",
    build: () => {
      const grid = createEmptyGrid();
      grid[0][0] = "X";
      grid[0][4] = "M";
      grid[1][4] = "M";
      return grid;
    },
  },
  {
    key: "phaseflip",
    title: "Phase trick",
    subtitle: "See how phase becomes visible once Hadamard is involved.",
    build: () => {
      const grid = createEmptyGrid();
      grid[0][0] = "H";
      grid[0][1] = "Z";
      grid[0][2] = "H";
      grid[0][4] = "M";
      grid[1][4] = "M";
      return grid;
    },
  },
];

const googlePathways = [
  {
    title: "Cirq",
    detail:
      "Use Cirq when you are ready to turn a visual circuit into Python code and real circuit objects.",
  },
  {
    title: "qsim",
    detail:
      "Use qsim when you want stronger simulation performance and a path toward larger experiments.",
  },
  {
    title: "OpenFermion",
    detail:
      "Use OpenFermion when your curiosity shifts from gates to chemistry and materials problems.",
  },
];

const gateLookup = Object.fromEntries(operators.map((operator) => [operator.key, operator]));

let selectedGate = "H";
let circuitGrid = createEmptyGrid();
let inspectStep = NUM_STEPS;

const els = {
  businessExampleGrid: document.getElementById("businessExampleGrid"),
  conceptGrid: document.getElementById("conceptGrid"),
  operatorGrid: document.getElementById("operatorGrid"),
  circuitExampleGrid: document.getElementById("circuitExampleGrid"),
  gatePalette: document.getElementById("gatePalette"),
  selectedGateName: document.getElementById("selectedGateName"),
  circuitGrid: document.getElementById("circuitGrid"),
  inspectSlider: document.getElementById("inspectSlider"),
  inspectLabel: document.getElementById("inspectLabel"),
  outputTitle: document.getElementById("outputTitle"),
  outputExplanation: document.getElementById("outputExplanation"),
  probabilityBars: document.getElementById("probabilityBars"),
  cirqPreview: document.getElementById("cirqPreview"),
  copyCodeButton: document.getElementById("copyCodeButton"),
  runCircuitButton: document.getElementById("runCircuitButton"),
  clearCircuitButton: document.getElementById("clearCircuitButton"),
};

function createEmptyGrid() {
  return Array.from({ length: NUM_QUBITS }, () => Array(NUM_STEPS).fill(null));
}

function complex(re, im = 0) {
  return { re, im };
}

function addComplex(a, b) {
  return complex(a.re + b.re, a.im + b.im);
}

function multiplyComplex(a, b) {
  return complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
}

function magnitudeSquared(value) {
  return value.re * value.re + value.im * value.im;
}

function applySingleGate(state, gateKey, qubitIndex) {
  const matrices = {
    H: [
      [complex(SQRT1_2), complex(SQRT1_2)],
      [complex(SQRT1_2), complex(-SQRT1_2)],
    ],
    X: [
      [complex(0), complex(1)],
      [complex(1), complex(0)],
    ],
    Z: [
      [complex(1), complex(0)],
      [complex(0), complex(-1)],
    ],
  };

  const matrix = matrices[gateKey];
  if (!matrix) {
    return state;
  }

  const next = state.map((amplitude) => complex(amplitude.re, amplitude.im));
  const mask = qubitIndex === 0 ? 2 : 1;

  for (let index = 0; index < state.length; index += 1) {
    if ((index & mask) !== 0) {
      continue;
    }

    const partner = index | mask;
    const a = state[index];
    const b = state[partner];

    next[index] = addComplex(
      multiplyComplex(matrix[0][0], a),
      multiplyComplex(matrix[0][1], b)
    );
    next[partner] = addComplex(
      multiplyComplex(matrix[1][0], a),
      multiplyComplex(matrix[1][1], b)
    );
  }

  return next;
}

function applyCnot(state) {
  return [state[0], state[1], state[3], state[2]];
}

function simulateCircuit(grid, stepsToRun) {
  let state = [complex(1), complex(0), complex(0), complex(0)];

  for (let column = 0; column < stepsToRun; column += 1) {
    const topGate = grid[0][column];
    const bottomGate = grid[1][column];

    if (topGate === "CONTROL" && bottomGate === "TARGET") {
      state = applyCnot(state);
      continue;
    }

    if (topGate === "H" || topGate === "X" || topGate === "Z") {
      state = applySingleGate(state, topGate, 0);
    }

    if (bottomGate === "H" || bottomGate === "X" || bottomGate === "Z") {
      state = applySingleGate(state, bottomGate, 1);
    }
  }

  const basis = ["|00>", "|01>", "|10>", "|11>"];
  const probabilities = basis.map((label, index) => ({
    label,
    value: magnitudeSquared(state[index]),
  }));

  return { probabilities };
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function describeProbabilities(probabilities) {
  const rounded = probabilities.map((item) => item.value);
  const dominant = probabilities.reduce((best, item) => {
    return item.value > best.value ? item : best;
  });

  const bellLike =
    rounded[0] > 0.45 &&
    rounded[3] > 0.45 &&
    rounded[1] < 0.1 &&
    rounded[2] < 0.1;

  const superpositionTop =
    rounded[0] > 0.45 &&
    rounded[2] > 0.45 &&
    rounded[1] < 0.1 &&
    rounded[3] < 0.1;

  const superpositionBottom =
    rounded[0] > 0.45 &&
    rounded[1] > 0.45 &&
    rounded[2] < 0.1 &&
    rounded[3] < 0.1;

  if (bellLike) {
    return "This looks like a Bell-style pattern: the qubits move together, which is a good beginner sign of entanglement.";
  }

  if (superpositionTop) {
    return "The top qubit is in a simple superposition, so measurement splits between two outcomes.";
  }

  if (superpositionBottom) {
    return "The bottom qubit is in a simple superposition, so measurement splits between two outcomes.";
  }

  if (dominant.value > 0.94) {
    return `The circuit strongly favors one outcome: ${dominant.label}.`;
  }

  return "The circuit spreads probability across several outcomes. That usually means the gates are creating a more mixed quantum state.";
}

function buildStepLabel(step) {
  if (step === 0) {
    return "Showing the start state before any gates are applied.";
  }

  if (step === NUM_STEPS) {
    return "Showing the final result after all steps.";
  }

  return `Showing the state after step ${step}.`;
}

function buildCirqCode(grid) {
  const lines = [
    "import cirq",
    "",
    "q0, q1 = cirq.LineQubit.range(2)",
    "circuit = cirq.Circuit(",
  ];

  const operations = [];

  for (let column = 0; column < NUM_STEPS; column += 1) {
    const topGate = grid[0][column];
    const bottomGate = grid[1][column];

    if (topGate === "H") {
      operations.push("    cirq.H(q0),");
    }
    if (topGate === "X") {
      operations.push("    cirq.X(q0),");
    }
    if (topGate === "Z") {
      operations.push("    cirq.Z(q0),");
    }
    if (bottomGate === "H") {
      operations.push("    cirq.H(q1),");
    }
    if (bottomGate === "X") {
      operations.push("    cirq.X(q1),");
    }
    if (bottomGate === "Z") {
      operations.push("    cirq.Z(q1),");
    }
    if (topGate === "CONTROL" && bottomGate === "TARGET") {
      operations.push("    cirq.CNOT(q0, q1),");
    }
    if (topGate === "M") {
      operations.push('    cirq.measure(q0, key="q0"),');
    }
    if (bottomGate === "M") {
      operations.push('    cirq.measure(q1, key="q1"),');
    }
  }

  if (!operations.length) {
    operations.push("    # Add gates in the visual editor to generate Cirq code.");
  }

  lines.push(...operations);
  lines.push(")", "", "print(circuit)");

  return lines.join("\n");
}

function tokenMarkup(gate) {
  if (!gate) {
    return "";
  }

  if (gate === "CONTROL") {
    return '<span class="gate-token control" aria-label="CNOT control"></span>';
  }

  if (gate === "TARGET") {
    return '<span class="gate-token target" aria-label="CNOT target"></span>';
  }

  if (gate === "M") {
    return '<span class="gate-token measure">M</span>';
  }

  return `<span class="gate-token">${gate}</span>`;
}

function renderBusinessExamples() {
  els.businessExampleGrid.innerHTML = "";

  businessExamples.forEach((example) => {
    const article = document.createElement("article");
    article.className = "business-card";
    article.innerHTML = `
      <span>${example.title}</span>
      <p>${example.detail}</p>
      <p>${example.googlePath}</p>
    `;
    els.businessExampleGrid.appendChild(article);
  });
}

function renderConcepts() {
  els.conceptGrid.innerHTML = "";

  coreConcepts.forEach((concept) => {
    const article = document.createElement("article");
    article.className = "business-card";
    article.innerHTML = `
      <span>${concept.title}</span>
      <p>${concept.detail}</p>
    `;
    els.conceptGrid.appendChild(article);
  });
}

function renderOperators() {
  els.operatorGrid.innerHTML = "";

  operators.forEach((operator) => {
    const article = document.createElement("article");
    article.className = "operator-card";
    article.innerHTML = `
      <span>${operator.short}</span>
      <h3>${operator.name}</h3>
      <p>${operator.description}</p>
    `;
    els.operatorGrid.appendChild(article);
  });
}

function renderCircuitExamples() {
  els.circuitExampleGrid.innerHTML = "";

  circuitExamples.forEach((example) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "example-button";
    button.innerHTML = `
      <span>${example.title}</span>
      <strong>${example.subtitle}</strong>
    `;
    button.addEventListener("click", () => {
      circuitGrid = example.build();
      inspectStep = NUM_STEPS;
      renderAll();
      document
        .getElementById("playground")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    });
    els.circuitExampleGrid.appendChild(button);
  });
}

function renderGatePalette() {
  els.gatePalette.innerHTML = "";

  [...operators, { key: "CLEAR", short: "Clear", name: "Erase", description: "Remove whatever is in a cell." }].forEach(
    (gate) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `gate-button ${selectedGate === gate.key ? "active" : ""}`;
      button.innerHTML = `
        <strong>${gate.short}</strong>
        <small>${gate.name}</small>
      `;
      button.addEventListener("click", () => {
        selectedGate = gate.key;
        renderGatePalette();
        const selectedName = gateLookup[gate.key]?.name || gate.name;
        els.selectedGateName.textContent = selectedName;
      });
      els.gatePalette.appendChild(button);
    }
  );
}

function clearColumnIfCnot(column) {
  if (circuitGrid[0][column] === "CONTROL" && circuitGrid[1][column] === "TARGET") {
    circuitGrid[0][column] = null;
    circuitGrid[1][column] = null;
  }
}

function placeGate(row, column) {
  if (selectedGate === "CLEAR") {
    clearColumnIfCnot(column);
    circuitGrid[row][column] = null;
    renderAll();
    return;
  }

  if (selectedGate === "CNOT") {
    circuitGrid[0][column] = "CONTROL";
    circuitGrid[1][column] = "TARGET";
    renderAll();
    return;
  }

  if (selectedGate === "M") {
    const measurementColumn = NUM_STEPS - 1;
    clearColumnIfCnot(measurementColumn);
    circuitGrid[row][measurementColumn] = "M";
    renderAll();
    return;
  }

  clearColumnIfCnot(column);
  circuitGrid[row][column] = selectedGate;
  renderAll();
}

function renderCircuitBoard() {
  const board = document.createElement("div");
  board.className = "circuit-board";

  const corner = document.createElement("div");
  corner.className = "board-corner";
  corner.textContent = "Steps";
  board.appendChild(corner);

  for (let column = 0; column < NUM_STEPS; column += 1) {
    const header = document.createElement("div");
    header.className = "circuit-header-cell";
    header.textContent = `${column + 1}`;
    board.appendChild(header);
  }

  for (let row = 0; row < NUM_QUBITS; row += 1) {
    const label = document.createElement("div");
    label.className = "qubit-label";
    label.textContent = `q${row}`;
    board.appendChild(label);

    for (let column = 0; column < NUM_STEPS; column += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gate-cell";
      button.innerHTML = tokenMarkup(circuitGrid[row][column]);
      button.addEventListener("click", () => placeGate(row, column));
      board.appendChild(button);
    }
  }

  els.circuitGrid.innerHTML = "";
  els.circuitGrid.appendChild(board);
}

function renderProbabilities() {
  const simulation = simulateCircuit(circuitGrid, inspectStep);
  const explanation = describeProbabilities(simulation.probabilities);

  els.inspectSlider.value = String(inspectStep);
  els.inspectLabel.textContent = buildStepLabel(inspectStep);
  els.outputTitle.textContent =
    inspectStep === NUM_STEPS ? "Final circuit result" : `Circuit state after step ${inspectStep}`;
  els.outputExplanation.textContent = explanation;

  els.probabilityBars.innerHTML = "";
  simulation.probabilities.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <span>${entry.label}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${entry.value * 100}%"></div>
      </div>
      <span>${formatPercent(entry.value)}</span>
    `;
    els.probabilityBars.appendChild(row);
  });
}

function renderCirqPreview() {
  els.cirqPreview.textContent = buildCirqCode(circuitGrid);
}

function renderGooglePathways() {
  els.googlePathGrid.innerHTML = "";

  googlePathways.forEach((path) => {
    const article = document.createElement("article");
    article.className = "google-card";
    article.innerHTML = `
      <span>${path.title}</span>
      <p>${path.detail}</p>
    `;
    els.googlePathGrid.appendChild(article);
  });
}

function renderAll() {
  renderGatePalette();
  renderCircuitBoard();
  renderProbabilities();
  renderCirqPreview();
}

els.inspectSlider.addEventListener("input", (event) => {
  inspectStep = Number.parseInt(event.target.value, 10);
  renderProbabilities();
});

els.runCircuitButton.addEventListener("click", () => {
  inspectStep = NUM_STEPS;
  renderProbabilities();
  document
    .querySelector(".output-column")
    .scrollIntoView({ behavior: "smooth", block: "start" });
});

els.clearCircuitButton.addEventListener("click", () => {
  circuitGrid = createEmptyGrid();
  inspectStep = NUM_STEPS;
  renderAll();
});

els.copyCodeButton.addEventListener("click", async () => {
  const code = buildCirqCode(circuitGrid);

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "absolute";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }

    els.copyCodeButton.textContent = "Copied";
    setTimeout(() => {
      els.copyCodeButton.textContent = "Copy Cirq code";
    }, 1200);
  } catch (error) {
    els.copyCodeButton.textContent = "Copy failed";
    setTimeout(() => {
      els.copyCodeButton.textContent = "Copy Cirq code";
    }, 1400);
  }
});

renderBusinessExamples();
renderConcepts();
renderOperators();
renderCircuitExamples();
renderGooglePathways();
circuitGrid = circuitExamples[1].build();
renderAll();
