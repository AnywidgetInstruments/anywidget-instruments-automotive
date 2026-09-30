# Requirements status

Where the [specification](specification.md) 0.9 stands in the code. A requirement is
**implemented** when the code does what it says for every widget it concerns, and
**tested** when an automated test fails without it. A requirement met by one layer but
not yet by the widgets that need it — the units of a cluster before the `Cluster` exists — is
listed as partial and not counted.

| Group | Requirements | Implemented | Tested |
|---|---|---|---|
| General (GEN) | 9 | 7 | 7 |
| Common widget API (API) | 6 | 6 | 6 |
| Dials (DIAL) | 13 | 13 | 13 |
| Speed display (SPD) | 5 | 4 | 4 |
| Tell-tales (TEL) | 9 | 9 | 9 |
| Digital displays (DIG) | 7 | 7 | 7 |
| Cluster (CLU) | 3 | 3 | 3 |
| Legibility (LEG) | 5 | 3 | 3 |
| Distraction (DIS) | 4 | 4 | 4 |
| Head-up display (HUD) | 6 | 6 | 6 |
| Units (UNIT) | 14 | 14 | 14 |
| Robustness (ROB) | 3 | 3 | 3 |
| Accessibility (A11Y) | 2 | 2 | 2 |
| Documentation (DOC) | 5 | 5 | 4 |
| Quality and verification (QA) | 3 | 2 | 2 |
| Host independence (HOST) | 6 | 6 | 4 |
| Electric and hybrid drivetrains (EV) | 8 | 8 | 8 |
| **Total** | **108** | **102** | **99** |

## Implemented

| Requirement | Where | Test |
|---|---|---|
| GEN-001 | `js/src/core/view.ts`: every view derives from the base view of anywidget-instruments | `js/test/entry.test.ts` |
| GEN-002 | `js/build.mjs`: one ES module and one stylesheet, reproducible | CI: build, `check:reproducible`, size budget |
| GEN-003 | `js/src/index.ts`: `initialize` and `render` of the AFM | `js/test/helpers.ts` mounts every widget from a plain dictionary |
| GEN-004 | `js/src/core/units.ts`, `state.ts`: conversion, rounding, states in the front end | `js/test/units.test.ts` |
| GEN-005 | No network access in the front end | `js/test/entry.test.ts` |
| GEN-006 | `LICENSE`, package metadata | `tests/test_license.py` |
| GEN-007 | `src/anywidget_instruments_automotive/`, depending on anywidget-instruments, CPython 3.10 to 3.13 | `tests/`, CI matrix |
| API-001 | The schemas extend the instrument schema of anywidget-instruments | `tests/test_contract.py` |
| API-002 | `mode` is the constant `"indicator"`; `"control"` is refused (Python) or shown invalid (front end) | `test_contract.py`, `telltale.test.ts` |
| API-003 | Pointer and key events stop at the widget body | `telltale.test.ts` |
| API-004 | Views redraw on every trait change | `telltale.test.ts` |
| API-005 | `min`, `max`, `unit`, `input_unit` on every widget of a quantity (`quantity.schema.json`) | `test_contract.py` |
| API-006 | The front end writes no trait; traitlets notifies every trait | `test_contract.py` |
| DIAL-001 .. DIAL-005, DIAL-101 .. DIAL-108 | `js/src/widgets/dial.ts`, `dials.ts`, `_dial.py` | `js/test/dials.test.ts`, `tests/parity/dials.json` |
| SPD-001 .. SPD-003 | Rounded up after conversion, the limit marked | `dials.test.ts` |
| SPD-004 | The catalog and the safety notice | `tests/test_docs.py` |
| CLU-001 .. CLU-003, DIS-001, UNIT-004 | `js/src/widgets/cluster.ts`, `_cluster.py`: one widget drawing the trait dictionaries it holds | `js/test/cluster.test.ts`, `tests/test_cluster.py` |
| HUD-001 .. HUD-006 | `hud` on the cluster and on every widget; mirrored, black, one colour, no animation, brightness | `cluster.test.ts` |
| DIS-002 | Every widget holds a value changing faster than twice a second for 0.5 s (`AutomotiveView`) | `dials.test.ts` |
| DIS-003 | `animate` on every dial | `dials.test.ts` |
| DIS-004 | The safety notice | `tests/test_docs.py` |
| TEL-001 .. TEL-009 | `js/src/widgets/telltales.ts`, `telltale.ts` | `telltale.test.ts`, `contrast.test.ts` |
| UNIT-001 .. UNIT-003, UNIT-005, UNIT-010 .. UNIT-015, UNIT-017 | `units.ts`, `units.schema.json`, applied by the dials | `units.test.ts`, `dials.test.ts`, parity cases, `test_contract.py` |
| ROB-001 .. ROB-003 | `max_age` and `_value_seq`, `null` values, the kernel liveness of anywidget-instruments | `telltale.test.ts`, `dials.test.ts` |
| A11Y-001, A11Y-002 | Accessible names and states (a dial is a `meter`); no blinking and no gliding needle under reduced motion | `telltale.test.ts`, `dials.test.ts` |
| DOC-001 .. DOC-005 | Catalog with an example for each widget, run by the tests; safety notice, standards, JupyterLite and marimo examples, pictures captured by `npm run images` in CI | `tests/test_docs.py` (all but DOC-004) |
| DIG-001 .. DIG-007 | `js/src/core/trip.ts`, `js/src/widgets/digital.ts`, `_digital.py` | `js/test/digital.test.ts`, `tests/parity/trip.json` |
| UNIT-016 | No mpg for a zero consumption, per hour below 5 km/h | `units.test.ts`, `digital.test.ts` |
| QA-002 | Every tell-tale function against its colour, in every theme | `telltale.test.ts` |
| LEG-002 .. LEG-004 | `theme` `day` and `night`: the light theme, and the dark one at a lower luminance | `contrast.test.ts`, `dials.test.ts` |
| QA-003 | SPD-001 at every boundary of resolutions 1, 0.5, 2 and 0.1, and of mph converted from km/h | `dials.test.ts` |
| UNIT-018 | pint quantities for the value and limits of a `QuantityWidget`; DynamicQuantities.jl in the Julia example | `tests/test_quantities.py` |
| HOST-005 | [Hosts](hosts.md): Python, Julia (KaimonSlate.jl), a page with no kernel | `e2e/web.spec.js`, `e2e/marimo.spec.js` |
| HOST-006 | [Hosts](hosts.md): a Rust web view | — |
| EV-001 .. EV-008 | `StateOfChargeGauge`, `PowerMeter`, `PowerFlow`, the electric `TripComputer`, five tell-tales | `js/test/electric.test.ts`, `tests/test_electric.py`, `tests/parity/trip.json`, `e2e/marimo.spec.js` |
| HOST-001 .. HOST-004 | Schemas, `static/contract.json`, `tests/parity/`, invalid state | `test_contract.py`, `units.test.ts`, `telltale.test.ts` |

## Partial

| Requirement | What is missing |
|---|---|
| GEN-008 | Styles are scoped (tested); the kernel liveness of anywidget-instruments keeps its registry of heartbeats on `globalThis`. |
| LEG-001 | Waits for the visual angle of ISO 15008 (open question 3). |
| GEN-009 | Tested in JupyterLab, Notebook 7 and marimo (`e2e/jupyter.spec.js`, `e2e/marimo.spec.js`); VS Code, Colab and KaimonSlate.jl, hosts of anywidget-instruments, are not tested with this library. |
| QA-001 | `tests/test_traceability.py` checks that a test cites every requirement marked M; LEG-001 is the one left. |
| LEG-005 | Every figure asks for a slashed zero and digits of equal width (tested); whether 1 and 7 differ, and whether the zero is slashed, depends on the typeface of the page, which the library does not ship (GEN-005, no font from the network). |

## Order of work

The milestones, sequenced by dependency, are in the [roadmap](roadmap.md).
