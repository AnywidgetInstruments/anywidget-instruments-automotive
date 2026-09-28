# Roadmap

Where anywidget-automotives is, and the order in which it gets built. Milestones are
sequenced by dependency, not dated: each one rests on the ones before it.

## Where the project is

| Delivered | Notes |
|---|---|
| Documentation site | Catalog, safety notice, standards, head-up display guide, integration with CAN & CANopen Studio, development guide |
| Specification 0.6 | 99 requirements in EARS notation, 16 groups; open questions 1 and 2 resolved |
| 1. Foundations | TypeScript front end on the base view of anywidget-instruments, trait contract and parity cases, Python binding, CI, JupyterLite, documentation images captured in CI |
| 2. Units and robustness | The unit layer and the missing, stale and invalid states, applied by every widget |
| 3. Tell-tales | `TellTale` and `TellTaleCluster`, 22 functions with original symbols |
| 4. Dials | `Speedometer`, `Tachometer`, `FuelGauge`, `TemperatureGauge`; legibility (LEG) waits for the visual angle of open question 3 |
| 5. Digital displays | `TripComputer`, `Odometer`, `GearIndicator`, with the consumption rules of CAN & CANopen Studio |
| Cluster preview | A marimo WebAssembly example made of the real widgets, laid out by marimo until the `Cluster` exists |

The [requirements status](requirements-status.md) shows 75 of 99 requirements
implemented, 68 of them tested.

## Principles

These hold for every milestone below.

* **TypeScript front end first.** The anywidget front-end modules are the
  implementation; Python, Julia, Rust and web pages are hosts that set traits. Anything a
  widget displays is computed in the front end, so every host shows the same figures.
* **Build on anywidget-instruments.** Extend its front end, trait contract and themes;
  send upstream anything a non-automotive display could use.
* **Indicators only.** Nothing is meant to be operated while driving.
* **Conventions, not conformity.** The standards inform the design; the library claims no
  conformity with them.
* **Specification first.** A change of behaviour goes through the specification, with its
  version bumped, before the code.

## Milestones, in order

### 1. Foundations — done

The toolchain of anywidget-instruments, so the two libraries are built, tested and
released the same way.

* TypeScript front end with a bundler, unit tests (vitest), linting and type checks.
* Trait contract: one JSON Schema per widget, a contract file generated for hosts, and
  parity cases run by the front end and by every host binding (HOST-001 .. HOST-004).
* Python host binding: a package depending on anywidget-instruments (GEN-007).
* Continuous integration for all of the above, and the docs workflow extended with
  JupyterLite.
* Documentation images (DOC-005): a day and a night capture of every widget, taken by
  Playwright from the built front end in continuous integration, so the site never shows
  an older look than the code. They take the place of the preview screenshots as the
  widgets arrive.

**Decided** (specification 0.6): the dials are modules of their own, deriving from the
base view of anywidget-instruments and reusing its scale functions; no change upstream
was needed.

### 2. Units and robustness — done

The layer every widget uses, written once in the front end.

* Unit systems `metric`, `imperial` and `us`, per-widget override, exact conversion
  factors, reciprocal fuel economy with reversed scales (UNIT-001 .. UNIT-017).
* Stale and missing values, and the invalid state for rejected traits (ROB, HOST-004).
* Parity cases for every conversion, so a host binding cannot drift.

### 3. Tell-tales — done

The first widgets, and the ones that need no dial.

* `TellTale` and `TellTaleCluster` (TEL-001 .. TEL-008): colour from function, name as
  text as well as symbol, blinking at 1 to 2 Hz, priority order.
* Symbols drawn originally from the published meaning of each ISO 2575 symbol, never
  copied from the standard (open question 2).
* The test that checks every tell-tale colour (QA-002).

### 4. Dials — done, legibility aside

* `Speedometer` with rounding up after conversion, the speed limit marker and its
  boundary tests (SPD, QA-003).
* `Tachometer` with red zone, shift light and the ready state of hybrid and electric
  drivetrains.
* `FuelGauge` and `TemperatureGauge` (DIAL).
* Legibility from the viewing distance, day and night themes (LEG), once the visual angle
  is set from ISO 15008 (open question 3).

### 5. Digital displays — done

* `TripComputer`, `Odometer` and `GearIndicator` (DIG), with the consumption rules shared
  with CAN & CANopen Studio's trip computer: per hour below 5 km/h, no average under
  0.1 km.

### 6. Cluster and head-up display

* `Cluster` layout, the eight-widget default, hold times against flicker, animation
  switch (CLU, DIS).
* Head-up display mode: mirrored, black, one colour, tell-tale colours kept, brightness
  (HUD).
* The preview example replaced by the real widgets.

### 7. Hosts

* Python binding published, with examples in JupyterLab, marimo and in the browser
  (JupyterLite, marimo WebAssembly).
* Julia: a KaimonSlate.jl example, with quantities from DynamicQuantities.jl passed as a
  number and a unit name (HOST-005, UNIT-018).
* Rust: a documented embedding through a web view, traits as JSON (HOST-006).
* CAN & CANopen Studio: dashboard pages using `anywidget_automotives:` widgets, fed by
  its trip computer.

### 8. Version 1.0

* Every requirement marked **M** implemented and covered by a test (QA-001).
* Accessibility (A11Y) and documentation (DOC) complete.
* A release on the package index, with citation metadata.

## After 1.0

Candidates, to be specified before they are built:

* A second speed scale on one speedometer (SPD-005) and km/L (UNIT-014).
* Tyre pressure, oil pressure and other quantities beyond the unit table (open
  question 5).
* Electric and hybrid displays: state of charge, power and regeneration meter, range.
* A widget for the readiness monitors and trouble codes CAN & CANopen Studio reads.
