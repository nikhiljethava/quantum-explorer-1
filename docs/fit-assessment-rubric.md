# Hybrid Quantum Workload Navigator

## Fit-assessment rubric

This is the deterministic scoring system for the local MVP.

## Dispositions

The engine can emit exactly one of these outcomes:

1. `classical_only`
2. `education_only`
3. `hybrid_prototype_now`
4. `fault_tolerant_candidate_later`

## Scoring dimensions

Each dimension is scored from `-2` to `+2`.

### 1. Classical baseline strength

- `-2`: no clear bottleneck, classical methods already perform well
- `-1`: classical baseline is adequate with manageable tradeoffs
- `0`: mixed picture
- `+1`: classical approach is materially limited
- `+2`: classical approach is clearly inadequate for the candidate subproblem

### 2. Problem structure

- `-2`: loosely defined, mostly unstructured, or business-process driven
- `-1`: partially structured but not mathematically clean
- `0`: some formal structure exists
- `+1`: well-defined graph, constraint, Hamiltonian, or reduced scientific model
- `+2`: strongly structured scientific or algorithmic problem

### 3. Representation fit

- `-2`: representation does not map cleanly to known quantum-relevant forms
- `-1`: mapping is forced or artificial
- `0`: mapping is unclear
- `+1`: candidate subproblem maps to a graph, circuit, molecule, lattice, or Hamiltonian
- `+2`: mapping is natural and central to the workload

### 4. Time horizon fit

- `-2`: requires production value now
- `-1`: requires near-term deployment confidence
- `0`: research pilot is acceptable
- `+1`: prototype-first with simulation is acceptable
- `+2`: long-term fault-tolerant exploration is explicitly acceptable

### 5. Verification and trust tolerance

- `-2`: strict production-grade validation required now
- `-1`: heavy explainability and operational guarantees required
- `0`: moderate tolerance for experimental results
- `+1`: exploratory or educational prototype is acceptable
- `+2`: research-oriented session with explicit tolerance for uncertainty

### 6. Team readiness

- `-2`: novice audience and no technical follow-up path
- `-1`: low technical readiness
- `0`: mixed team
- `+1`: some specialist support exists
- `+2`: strong technical team can inspect and extend artifacts

## Gating rules

These rules override pure score totals.

### Force `classical_only`

If any of the following are true:

- the bottleneck is primarily data quality, UX, or integration work
- the workload is mostly unstructured text, image, or general business analytics
- a strong classical baseline exists and no narrow candidate subproblem is identified

### Force `education_only`

If any of the following are true:

- the scenario is too incomplete to isolate a candidate subproblem
- the user wants concept teaching but not qualification or prototyping
- the mapping to a quantum-relevant representation is unclear

### Allow `hybrid_prototype_now` only if all are true

- `problem_structure >= 1`
- `representation_fit >= 1`
- `time_horizon_fit >= 0`
- a narrow candidate subproblem has been identified

### Allow `fault_tolerant_candidate_later` only if all are true

- `problem_structure >= 1`
- `representation_fit >= 1`
- `time_horizon_fit >= 1`
- the workload is explicitly larger than toy prototype scale or needs later hardware assumptions

## Weighted total

Use this formula:

```text
total =
  (2 * classical_baseline_strength) +
  (2 * problem_structure) +
  (2 * representation_fit) +
  (1 * time_horizon_fit) +
  (1 * verification_and_trust_tolerance) +
  (1 * team_readiness)
```

Possible range: `-18` to `+18`

## Disposition thresholds

After gating rules:

- `total <= -4` => `classical_only`
- `-3 <= total <= 2` => `education_only`
- `3 <= total <= 9` => `hybrid_prototype_now`
- `10+` => `fault_tolerant_candidate_later`

## Confidence bands

### High

- no required intake fields are missing
- no dimension remains `0` due to ambiguity
- no gating rule conflict exists

### Medium

- one or two important assumptions remain open
- recommendation depends on reduced-problem framing

### Low

- key fields are missing
- disposition flips under minor assumption changes

## Required intake fields

The engine must not run without:

- business objective
- current baseline
- current bottleneck
- problem family
- representation
- time horizon

If these are incomplete, return `education_only` with low confidence and list
the missing fields.

## Example outcomes

### Battery materials screening

- classical baseline strength: `+1`
- problem structure: `+2`
- representation fit: `+2`
- time horizon fit: `+1`
- verification tolerance: `0`
- team readiness: `+1`
- total: `10`
- disposition: `fault_tolerant_candidate_later`

If a toy active-space prototype is explicitly acceptable, also surface a
secondary recommendation:

- prototype path: `hybrid_prototype_now`

### Delivery route optimization

- classical baseline strength: `-1`
- problem structure: `+1`
- representation fit: `+1`
- time horizon fit: `-1`
- verification tolerance: `-1`
- team readiness: `0`
- total: `0`
- disposition: `education_only`

If the user is explicitly exploring toy QAOA-style demos, the product can still
offer a prototype template while keeping the primary disposition conservative.

### Fraud detection on messy enterprise data

- classical baseline strength: `-1`
- problem structure: `-1`
- representation fit: `-2`
- time horizon fit: `-1`
- verification tolerance: `-1`
- team readiness: `0`
- total: `-8`
- disposition: `classical_only`

## Narrative requirements

Every assessment response must include:

- one-sentence disposition summary
- two to four rationale bullets
- assumptions list
- a `what would change this outcome` section
- a caveat that the result is not proof of quantum advantage
