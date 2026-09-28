# Requirements status

Where the [specification](specification.md) 0.6 stands in the code. A requirement is
**implemented** when the code does what it says for every widget it concerns, and
**tested** when an automated test fails without it. A requirement met by one layer but
not yet by the widgets that need it — the unit conversion before any dial exists — is
listed as partial and not counted.

| Group | Requirements | Implemented | Tested |
|---|---|---|---|
| General (GEN) | 9 | 7 | 7 |
| Common widget API (API) | 6 | 5 | 4 |
| Dials (DIAL) | 13 | 0 | 0 |
| Speed display (SPD) | 5 | 0 | 0 |
| Tell-tales (TEL) | 8 | 8 | 8 |
| Digital displays (DIG) | 7 | 0 | 0 |
| Cluster (CLU) | 3 | 0 | 0 |
| Legibility (LEG) | 5 | 0 | 0 |
| Distraction (DIS) | 4 | 0 | 0 |
| Head-up display (HUD) | 6 | 0 | 0 |
| Units (UNIT) | 14 | 3 | 3 |
| Robustness (ROB) | 3 | 3 | 3 |
| Accessibility (A11Y) | 2 | 2 | 2 |
| Documentation (DOC) | 5 | 4 | 0 |
| Quality and verification (QA) | 3 | 1 | 1 |
| Host independence (HOST) | 6 | 4 | 4 |
| **Total** | **99** | **37** | **32** |

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
| API-006 | The front end writes no trait; traitlets notifies every trait | — |
| TEL-001 .. TEL-008 | `js/src/widgets/telltales.ts`, `telltale.ts` | `telltale.test.ts`, `contrast.test.ts` |
| UNIT-011, UNIT-012, UNIT-017 | `units.ts`, `units.schema.json` | `units.test.ts`, parity cases, `test_contract.py` |
| ROB-001 .. ROB-003 | `max_age` and `_value_seq`, `null` values, the kernel liveness of anywidget-instruments | `telltale.test.ts` |
| A11Y-001, A11Y-002 | Accessible names and states; no blinking under reduced motion | `telltale.test.ts` |
| DOC-002 .. DOC-005 | Safety notice, standards, JupyterLite and marimo examples, pictures captured by `npm run images` in CI | — |
| QA-002 | Every tell-tale function against its colour, in every theme | `telltale.test.ts` |
| HOST-001 .. HOST-004 | Schemas, `static/contract.json`, `tests/parity/`, invalid state | `test_contract.py`, `units.test.ts`, `telltale.test.ts` |

## Partial

| Requirement | What is missing |
|---|---|
| GEN-008 | Styles are scoped (tested); the kernel liveness of anywidget-instruments keeps its registry of heartbeats on `globalThis`. |
| API-005 | The `Quantity` schema has `min`, `max`, `unit` and `input_unit`; no numeric widget uses it yet. |
| UNIT-001 .. UNIT-003, UNIT-005, UNIT-010, UNIT-013, UNIT-015, UNIT-016 | Written and tested in the front end (`units.ts`); applied once the dials and displays exist. |
| LEG-002, LEG-003 | Contrast of the tell-tale colours tested; the light and dark themes are those of anywidget-instruments. |
| DOC-001 | The catalog shows the tell-tales; the other widgets are still planned. |

## Order of work

The milestones, sequenced by dependency, are in the [roadmap](roadmap.md).
