# Specification

## Document Metadata

| Field | Value |
|-------|-------|
| Project | anywidget-automotives |
| Author | Sébastien Celles |
| Document type | Software requirements specification |
| Notation | EARS (Easy Approach to Requirements Syntax) |
| Version | 0.1 |
| Status | Draft for review, before implementation |

---

## 1. Introduction

### 1.1 Purpose

This document specifies a library of automotive instruments for computational notebooks.
anywidget-instruments provides general instrumentation widgets under industrial
conventions; this library provides the ones a vehicle display needs, under the
conventions of vehicle displays.

### 1.2 Scope

**Included:** dials (speedometer, tachometer, fuel and temperature gauges), tell-tales,
digital displays (trip computer, odometer, gear indicator), a cluster layout, day, night
and head-up display modes.

**Out of scope:**

- Reading a vehicle: the values are set by the code using the library.
- Controls meant to be operated while driving: every widget is an indicator.
- Any function relied on for the safe operation of a vehicle (see the safety notice).

### 1.3 Intended Users

- Engineers and technicians building diagnostic and test dashboards
- Educators and students in automotive and embedded systems
- Developers of simulators and aftermarket displays

### 1.4 EARS Patterns Used

| Pattern | Template |
|---------|----------|
| Ubiquitous | The <system> shall <response>. |
| Event-driven | When <trigger>, the <system> shall <response>. |
| State-driven | While <state>, the <system> shall <response>. |
| Unwanted behaviour | If <condition>, then the <system> shall <response>. |
| Optional feature | Where <feature is included>, the <system> shall <response>. |

### 1.5 Requirement Identifiers and Priority

Requirements use identifiers `<GROUP>-<NNN>` with priorities: **M** (Must, required for
1.0), **S** (Should, targeted for 1.0), **C** (Could, after 1.0).

---

## 2. General (GEN)

| ID | Pri. | Requirement |
|---|---|---|
| GEN-001 | M | The library shall derive every widget from the anywidget-instruments base class and honour its trait contract. |
| GEN-002 | M | The library shall render in every host anywidget-instruments supports, with no JavaScript toolchain and no network access at runtime. |
| GEN-003 | M | The library shall set every widget in indicator mode, and shall offer no control meant to be operated while driving. |
| GEN-004 | M | The library shall ship the safety notice in its documentation and link it from the package description. |

## 3. Speed display (SPD)

| ID | Pri. | Requirement |
|---|---|---|
| SPD-001 | M | When the `Speedometer` displays a value, the widget shall round it up to the displayed resolution, never down. |
| SPD-002 | M | The `Speedometer` shall display km/h by default and mph where its unit is set to mph. |
| SPD-003 | S | Where a speed limit is set, the `Speedometer` shall mark it on the scale and shall highlight the readout while the value exceeds it. |
| SPD-004 | M | The documentation of the `Speedometer` shall state that the widget cannot guarantee the accuracy of the value it is given and does not replace the vehicle's speedometer. |

## 4. Tell-tales (TEL)

| ID | Pri. | Requirement |
|---|---|---|
| TEL-001 | M | The `TellTale` shall take its colour from its meaning — red for danger, yellow or amber for warning, green for a function on, blue for high beam — and not from the theme. |
| TEL-002 | M | The `TellTale` shall draw the symbol of its function from a set modelled on ISO 2575. |
| TEL-003 | M | The `TellTale` shall show the name of its function as text as well as its symbol, so that colour is never the only cue. |
| TEL-004 | M | The `TellTale` shall accept the states `off`, `on` and `blinking`. |
| TEL-005 | S | While a `TellTale` is off, the widget shall draw its symbol dimmed, so that a lit one stands out. |
| TEL-006 | S | When several tell-tales are lit in a `TellTaleCluster`, the widget shall order them red first, then amber, then green and blue. |

## 5. Legibility (LEG)

| ID | Pri. | Requirement |
|---|---|---|
| LEG-001 | M | The library shall size digits and scale labels from a viewing distance trait, so that their height subtends a set visual angle. |
| LEG-002 | M | The library shall meet the contrast targets of anywidget-instruments in every theme. |
| LEG-003 | M | The library shall provide a day theme and a night theme. |
| LEG-004 | S | While the night theme is active, the library shall lower the luminance of every widget and avoid large bright areas. |
| LEG-005 | S | The library shall use a typeface with unambiguous digits (0 and 8, 1 and 7). |

## 6. Distraction (DIS)

| ID | Pri. | Requirement |
|---|---|---|
| DIS-001 | M | The `Cluster` shall show at most a set number of widgets, eight by default. |
| DIS-002 | M | If a value changes faster than a set rate, then the widget shall hold the displayed value long enough to be read, rather than flicker. |
| DIS-003 | S | The library shall provide no animation that draws the eye beyond what a value change needs; where needles animate, a trait shall turn animation off. |
| DIS-004 | M | The documentation shall state that pages are to be configured and read while stationary. |

## 7. Head-up display (HUD)

| ID | Pri. | Requirement |
|---|---|---|
| HUD-001 | M | While the HUD mode is on, the `Cluster` shall mirror its content left to right. |
| HUD-002 | M | While the HUD mode is on, the `Cluster` shall draw on a black background. |
| HUD-003 | M | While the HUD mode is on, the widgets shall draw figures in one colour, keeping tell-tale colours. |
| HUD-004 | S | While the HUD mode is on, the `Cluster` shall show only the speed and the widgets marked for the HUD. |
| HUD-005 | M | While the HUD mode is on, the widgets shall not animate. |
| HUD-006 | S | The `Cluster` shall expose a `brightness` trait applied in the HUD mode. |

## 8. Units (UNIT)

| ID | Pri. | Requirement |
|---|---|---|
| UNIT-001 | M | The library shall default to SI-derived units: km/h, km, L, L/100 km, °C. |
| UNIT-002 | S | Where a unit system is set to imperial, the library shall display mph, miles, gallons and mpg, stating whether US or imperial gallons. |
| UNIT-003 | M | The `TripComputer` shall show a consumption per 100 km only above a minimum speed, and per hour below it. |

## 9. Stale values (STALE)

| ID | Pri. | Requirement |
|---|---|---|
| STALE-001 | M | Where a maximum age is set, if a widget's value has not been updated within it, then the widget shall show that the value is stale. |
| STALE-002 | M | If a widget has never received a value, then the widget shall show that no value is available rather than zero. |
