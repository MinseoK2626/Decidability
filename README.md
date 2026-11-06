# The Limits of Computation

An interactive computability research laboratory built with React, TypeScript, Vite, Tailwind CSS, React Flow, and KaTeX. All computations happen locally in the browser; no service, account, or API key is needed.

## Develop

Use Node.js 24 and npm 11 (see `.nvmrc`).

```sh
npm ci
npm run dev -- --host 0.0.0.0
```

```sh
npm test                 # Vitest computational engine tests
npm run lint             # Static analysis
npm run build            # TypeScript and production bundle
# If no system Chromium is installed:
npx playwright install --with-deps chromium
npm run test:e2e          # Desktop and mobile browser scenarios
npm run preview          # Serve the production bundle
```

Playwright uses `/usr/bin/chromium` when present, or its managed Chromium otherwise. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use another installed browser.

## Experiments

**Turing Machine Simulator.** Choose binary increment, binary parity, or an endless scan. Set an input, run or single-step, pause, rewind the last 500 transitions, and reset. A sparse tape extends in either direction. The active state, tape head, transition labels, and execution count are visible. Drag diagram nodes and pan or zoom using React Flow. Export definitions or edit and apply JSON to create a custom deterministic machine.

**Reduction Constructor.** Construct an executable bounded simulation of a wrapper N that ignores its own input, simulates a fixed M on w, and accepts, rejects, or loops after a selected event. Export a self-contained JSON recipe including the embedded source machine and input. Compare correct and incorrect constructions for the mapping reduction HALT_TM ≤m A_TM. Selecting “halts” followed by “accept” preserves the equivalence: M halts on w iff N accepts its input. This argument applies to all sources, including nonterminating sources; finite examples alone do not prove a reduction.

### Machine semantics

A transition has `from`, `read`, `write`, `move` (L/R/S), and `to`. Tape symbols are single Unicode code points and `_` is blank. The initial head is at 0. Accept/reject state sets are disjoint and have no outgoing transitions. Missing transitions halt without acceptance (`stuck`). Terminal states do not consume further transitions. The JSON editor validates determinism and schema before applying a machine.

Built-in input alphabet is {0,1}; custom machines may use other single-symbol alphabets. An unsupported input symbol triggers a missing-transition halt. There is no claimed decision procedure for arbitrary halting. The simulator stops after 10,000 transitions; the constructor uses a configurable budget of 1–10,000. An exhausted budget yields **unknown**, never a claim of divergence. “Loop” is only reported when the constructed program explicitly enters its intentional looping branch.

## Architecture

- `src/engines/turing.ts`: immutable configurations, sparse tape, transition validation, single-step and bounded execution, examples.
- `src/engines/reduction.ts`: computable wrapper encoding, bounded interpretation, and verification of the specific HALT-to-ACCEPT recipe.
- `src/App.tsx`: experiment controls, execution timer, history, diagram, JSON editor, reduction interface.
- `src/App.css`, `src/index.css`: responsive visual system with Tailwind's Vite integration.
- `src/engines/engines.test.ts`: semantic and boundary cases.
- `tests/laboratory.spec.ts`: real Chromium interactions at desktop and mobile sizes.

The reduction UI intentionally exposes a constrained wrapper grammar rather than claiming to verify arbitrary mathematical proofs. Source simulation is synchronous and bounded; the timed simulator yields to the browser between transitions. There is no persistence across reloads; export JSON to retain experiments.

## GitHub Pages

The included workflow validates lint, unit tests, type checking, build, and browser tests before deploying pushes to `main`. In repository **Settings → Pages**, choose **GitHub Actions** as the source, then push this project to `main`. The production base is `/Decidability/` when `GITHUB_ACTIONS` is set. Adjust `vite.config.ts` if the repository name changes or a custom domain is used. Pull requests validate without deploying. No deployment has been performed by local setup.

## Mathematical context

Turing machines formalize effective procedures. Recognizing acceptance and deciding it are different capabilities. If an acceptance decider existed, the computable construction in this application would produce a halting decider, contradicting halting undecidability. The simulator illustrates individual executions; the symbolic construction supplies the general implication.

## Machine-level proof laboratory

The default view is now a structured proof notebook. The existing machine tools remain available through “Open existing machine tools”; no additional generic simulator was introduced.

- **A_TM ≤m M_HEAD**: inspect M, w, their encoding, M′, f, the hypothetical target decider H, and source decider S. The construction exposes its two-way tape model, product alphabet and origin marker, safe initialization, L → LRL motion compilation, acceptance-only LLL signal, and macro-boundary invariant. The physical trace viewer runs a concrete source fixture through micro-instructions and compares full tape/head configurations at macro boundaries. The symbolic accept/reject/loop cases are separate predefined mathematical examples.
- **A_TM ≤m HALT_TM**: acceptance halts the wrapper; rejection enters an explicit infinite loop. The rejecting-source counterexample explains why preserving arbitrary source halting would be wrong.
- **Diagonalization**: H, D, ⟨D⟩, and D(⟨D⟩) remain distinct objects. Explore both hypothetical H answers and the opposing actual D branch.
- **Proof debugger**: inspect four invalid arguments, violated obligations, concrete counterexamples, and corrected inferences.

Each mapping proof has seven selectable execution stages, formal notation, pseudocode, two implications, and expandable proof obligations. H is never an implemented oracle. Selecting an H branch explores a hypothetical premise, independent of a bounded machine execution. A predefined looping fixture is mathematically known to loop; an arbitrary bounded trace reports unknown.

Proof architecture:

- `src/proofs/engine.ts`: typed proof representation, explicit wrapper grammar, encoded construction, symbolic branching, diagonal negation, and motion transformation rules.
- `src/proofs/content.ts`: mathematical definitions, proofs, assumptions, source cases, and debugger arguments separated from rendering.
- `src/proofs/compiler.ts`: bounded physical micro-instruction trace compiler over a marked product tape, safe initialization, tape/head invariant checks, and an executable delayed-acceptance counterexample.
- `src/proofs/ProofLaboratory.tsx`: reusable `MachineConstructionViewer`, `ReductionDiagram`, `HypotheticalDeciderPanel`, `ProofObligationInspector`, `ContradictionExplorer`, `CounterexampleDebugger`, and `FormalProofRenderer`.
- `src/proofs/proofs.test.ts` and `tests/proofs.spec.ts`: exhaustive short movement-word safety checks, concrete machine invariants, source cases, timeout counterexample, and desktop/mobile proof interactions.

The engine supports these specified constructions, not arbitrary undecidability proof search or verification. Proof text supplies the general infinite-case argument; exhaustive finite-word tests and bounded execution provide implementation evidence and do not replace that argument. Invalid input encodings are mapped to a fixed nonaccepting right-loop target to make the mathematical transformation total. JSON proof exports serialize the proof and wrapper recipe; they are inspectable artifacts, not claims of a general formal verification certificate.
