# Requirements status

Where the [specification](specification.md) 0.6 stands in the code. A requirement is
**implemented** when the code does what it says for every widget it concerns, and
**tested** when an automated test fails without it. A requirement met by one layer but
not yet by the widgets that need it — the units of a cluster before the `Cluster` exists — is
listed as partial and not counted.

| Group | Requirements | Implemented | Tested |
|---|---|---|---|
| General (GEN) | 9 | 7 | 7 |
| Common widget API (API) | 6 | 6 | 5 |
| Dials (DIAL) | 13 | 13 | 13 |
| Speed display (SPD) | 5 | 4 | 3 |
| Tell-tales (TEL) | 8 | 8 | 8 |
| Digital displays (DIG) | 7 | 7 | 7 |
| Cluster (CLU) | 3 | 0 | 0 |
| Legibility (LEG) | 5 | 0 | 0 |
| Distraction (DIS) | 4 | 3 | 2 |
| Head-up display (HUD) | 6 | 0 | 0 |
| Units (UNIT) | 14 | 12 | 12 |
| Robustness (ROB) | 3 | 3 | 3 |
| Accessibility (A11Y) | 2 | 2 | 2 |
| Documentation (DOC) | 5 | 4 | 0 |
| Quality and verification (QA) | 3 | 2 | 2 |
| Host independence (HOST) | 6 | 4 | 4 |
| **Total** | **99** | **75** | **68** |

## Implemented

| Requirement | Where | Test |
|---|---|---|
| GEN-001 | `js/src/core/view.ts`: every view derives from the base view of anywidget-instruments | `js/test/entry.test.ts` |
| GEN-002 | `js/build.mjs`: one ES module and one stylesheet, reproducible | CI: build, `check:reproducible`, size budget |
| GEN-003 | `js/src/index.ts`: `initialize` and `render` of the AFM | `js/test/helpers.ts` mounts every widget from a plain dictionary |
| GEN-004 | `js/src/core/units.ts`, `state.ts`: conversion, rounding, states in the front end | `js/test/units.test.ts` |
| GEN-005 | No network access in the front end | `js/test/entry.test.ts` |
| GEN-006 | `LICENSE`, package metadata | `tests/test_license.py` |
| GEN-007 | `src/anywidget_automotives/`, depending on anywidget-instruments, CPython 3.10 to 3.13 | `tests/`, CI matrix |
| API-001 | The schemas extend the instrument schema of anywidget-instruments | `tests/test_contract.py` |
| API-002 | `mode` is the constant `"indicator"`; `"control"` is refused (Python) or shown invalid (front end) | `test_contract.py`, `telltale.test.ts` |
| API-003 | Pointer and key events stop at the widget body | `telltale.test.ts` |
| API-004 | Views redraw on every trait change | `telltale.test.ts` |
| API-005 | `min`, `max`, `unit`, `input_unit` on every widget of a quantity (`quantity.schema.json`) | `test_contract.py` |
| API-006 | The front end writes no trait; traitlets notifies every trait | — |
| DIAL-001 .. DIAL-005, DIAL-101 .. DIAL-108 | `js/src/widgets/dial.ts`, `dials.ts`, `_dial.py` | `js/test/dials.test.ts`, `tests/parity/dials.json` |
| SPD-001 .. SPD-003 | Rounded up after conversion, the limit marked | `dials.test.ts` |
| SPD-004 | The catalog and the safety notice | — |
| DIS-002 | Every widget holds a value changing faster than twice a second for 0.5 s (`AutomotiveView`) | `dials.test.ts` |
| DIS-003 | `animate` on every dial | `dials.test.ts` |
| DIS-004 | The safety notice | — |
| TEL-001 .. TEL-008 | `js/src/widgets/telltales.ts`, `telltale.ts` | `telltale.test.ts`, `contrast.test.ts` |
| UNIT-001 .. UNIT-003, UNIT-005, UNIT-010 .. UNIT-015, UNIT-017 | `units.ts`, `units.schema.json`, applied by the dials | `units.test.ts`, `dials.test.ts`, parity cases, `test_contract.py` |
| ROB-001 .. ROB-003 | `max_age` and `_value_seq`, `null` values, the kernel liveness of anywidget-instruments | `telltale.test.ts`, `dials.test.ts` |
| A11Y-001, A11Y-002 | Accessible names and states (a dial is a `meter`); no blinking and no gliding needle under reduced motion | `telltale.test.ts`, `dials.test.ts` |
| DOC-002 .. DOC-005 | Safety notice, standards, JupyterLite and marimo examples, pictures captured by `npm run images` in CI | — |
| DIG-001 .. DIG-007 | `js/src/core/trip.ts`, `js/src/widgets/digital.ts`, `_digital.py` | `js/test/digital.test.ts`, `tests/parity/trip.json` |
| UNIT-016 | No mpg for a zero consumption, per hour below 5 km/h | `units.test.ts`, `digital.test.ts` |
| QA-002 | Every tell-tale function against its colour, in every theme | `telltale.test.ts` |
| QA-003 | SPD-001 at every boundary of resolutions 1, 0.5, 2 and 0.1, and of mph converted from km/h | `dials.test.ts` |
| HOST-001 .. HOST-004 | Schemas, `static/contract.json`, `tests/parity/`, invalid state | `test_contract.py`, `units.test.ts`, `telltale.test.ts` |

## Partial

| Requirement | What is missing |
|---|---|
| GEN-008 | Styles are scoped (tested); the kernel liveness of anywidget-instruments keeps its registry of heartbeats on `globalThis`. |
| UNIT-004 | Comes with the `Cluster`. |
| LEG-002, LEG-003 | Contrast of the tell-tale colours tested; the light and dark themes are those of anywidget-instruments. |
| DOC-001 | The catalog shows every widget but the `Cluster`, still planned. |

## Order of work

The milestones, sequenced by dependency, are in the [roadmap](roadmap.md).
