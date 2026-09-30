# Specification

## Document Metadata

| Field | Value |
|-------|-------|
| Project | anywidget-instruments-automotive |
| Author | Sébastien Celles |
| Document type | Software requirements specification |
| Notation | EARS (Easy Approach to Requirements Syntax) |
| Version | 0.10 |
| Date | 2026-09-28 |
| Status | Draft for review, during implementation |

---

## 1. Introduction

### 1.1 Purpose

This document specifies a library of automotive instruments for computational notebooks.
anywidget-instruments provides general instrumentation widgets under industrial
conventions; this library provides the instruments of a vehicle display — dials,
tell-tales, digital displays and a cluster — under the conventions of vehicle displays.

The library is a **TypeScript front end first**. Its anywidget front-end modules draw the
widgets and compute everything a widget shows — unit conversion, rounding, zones, stale
states — from a dictionary of traits described by a **trait contract**. Any host that
can set those traits uses the widgets alike: the Python package is one host binding, and
Julia (KaimonSlate.jl), Rust and other languages are others. No host-language code has
to run for a widget to behave as specified.

### 1.2 Scope

**Included:**
- Dials: speedometer, tachometer, fuel gauge, temperature gauge
- Electric and hybrid drivetrains: state of charge, power and regeneration, power flow, energy consumption
- Tell-tales and tell-tale clusters
- Digital displays: trip computer, odometer, gear indicator
- A cluster layout with day, night and head-up display modes
- Cross-cutting features: metric, imperial and US unit systems, legibility, stale values, themes

**Out of scope for version 1.0:**
- Reading a vehicle (OBD-II, CAN): the values are set by the host
- Unit libraries of a host language (pint, DynamicQuantities.jl, uom): a host binding may accept their quantities, but the front end neither needs nor knows them
- Controls operated while driving: every widget is an indicator
- Any function relied on for the safe operation of a vehicle (see the safety notice)
- Navigation maps and media displays

### 1.3 Intended Users

- Engineers and technicians building diagnostic and test dashboards
- Educators and students in automotive and embedded systems
- Developers of driving simulators and aftermarket displays

### 1.4 EARS Patterns Used

| Pattern | Template |
|---------|----------|
| Ubiquitous | The <system> shall <response>. |
| Event-driven | When <trigger>, the <system> shall <response>. |
| State-driven | While <state>, the <system> shall <response>. |
| Unwanted behaviour | If <condition>, then the <system> shall <response>. |
| Optional feature | Where <feature is included>, the <system> shall <response>. |
| Complex | Combination of the above keywords. |

### 1.5 Glossary

| Term | Definition |
|------|------------|
| Widget | An anywidget front-end module drawing one instrument, bound to a dictionary of traits. |
| Front end | The TypeScript code of the widgets, shipped as pre-bundled ES modules. It is the implementation. |
| Trait contract | The JSON Schemas of every widget's traits — names, types, defaults, who writes them — and the file generated from them for hosts. The source of truth. |
| Host | A program that renders the widgets and sets their traits: a Python kernel through anywidget, KaimonSlate.jl in Julia, a Rust application, a web page. |
| Host binding | A library for one language that exposes the widgets as objects of that language, over the trait contract. The Python package is one. |
| Indicator | A widget whose value is set by kernel code and only displayed. |
| Dial | A widget showing a value by a needle on a circular or arc scale. |
| Tell-tale | A light that shows that a function is on or that a fault or condition is present. |
| Cluster | A layout arranging dials, tell-tales and digital displays as an instrument panel. |
| Head-up display (HUD) | A display read as a reflection in the windscreen, in the driver's line of sight. |
| Stale value | A value not updated within the maximum age set for it. |
| Viewing distance | The distance from the driver's eye to the display, from which character sizes are derived. |
| Visual angle | The angle a character subtends at the eye; ISO 15008 expresses legibility with it. |
| Unit system | A consistent choice of units for every quantity: metric, imperial (UK) or US customary. |
| Library | The anywidget-instruments-automotive package as a whole. |

### 1.6 Requirement Identifiers and Priority

Requirements use identifiers `<GROUP>-<NNN>` with priorities:
- **M** (Must): Required for version 1.0
- **S** (Should): Targeted for version 1.0, may slip
- **C** (Could): Desirable, planned after 1.0

---

## 2. General and Architecture (GEN)

| ID | Pri. | Requirement |
|---|---|---|
| GEN-001 | M | The library shall implement every widget as an anywidget front-end module written in TypeScript, building on the front end of anywidget-instruments. |
| GEN-002 | M | The library shall ship its front end as pre-bundled ES modules, so that no host needs a JavaScript toolchain. |
| GEN-003 | M | The library shall keep each front-end module compliant with the anywidget Front-End Module (AFM) specification, so that any AFM host can load it. |
| GEN-004 | M | The library shall compute in the front end everything a widget displays — unit conversion, rounding, zones, stale and missing states — so that every host shows the same figures for the same traits. |
| GEN-005 | M | The library shall load no resource from the network at runtime. |
| GEN-006 | M | The library shall be released under the BSD 3-Clause license. |
| GEN-007 | M | The library shall provide a Python host binding, distributed as a package depending on anywidget-instruments, and supporting CPython 3.10 and later. |
| GEN-008 | M | When a widget is loaded, the front end shall not modify global page state or register global CSS outside its own widget roots. |
| GEN-009 | S | The library shall render in the hosts anywidget-instruments supports: JupyterLab, Jupyter Notebook 7, marimo, VS Code notebooks, Google Colab and KaimonSlate.jl. |

---

## 3. Common Widget API (API)

| ID | Pri. | Requirement |
|---|---|---|
| API-001 | M | Every widget shall honour the trait contract of anywidget-instruments: `value`, `label`, `disabled`, `visible`, `tooltip`, `theme` and `size`. |
| API-002 | M | Every widget shall be an indicator: its `mode` shall be `"indicator"` and shall not accept `"control"`. |
| API-003 | M | While a widget is displayed, the front end shall ignore pointer and keyboard input that would modify `value`. |
| API-004 | M | When a host sets `value`, the widget shall update its display without any other action of the host. |
| API-005 | M | Every numeric widget shall expose `min`, `max`, `unit` and `input_unit` traits. |
| API-006 | M | Where a host binding offers change notifications, it shall offer them for every trait the front end writes. |

---

## 4. Dials (DIAL)

### 4.1 Common Dial Behaviour

| ID | Pri. | Requirement |
|---|---|---|
| DIAL-001 | M | Every dial shall display a scale with major and minor ticks computed from `min` and `max`, and a needle. |
| DIAL-002 | M | Every dial shall display its value as text below the needle, in its unit. |
| DIAL-003 | M | If the kernel sets a value outside [`min`, `max`], then the dial shall stop the needle at the scale end and shall show an out-of-range marker. |
| DIAL-004 | M | If the value is NaN or infinite, then the dial shall show a distinct invalid state and shall not move its needle. |
| DIAL-005 | S | Where `zones` are set, the dial shall colour the scale arcs they define. |

### 4.2 Speed Display (SPD)

| ID | Pri. | Requirement |
|---|---|---|
| SPD-001 | M | When the `Speedometer` displays a value, the widget shall round it up to the displayed resolution, never down. |
| SPD-002 | M | The `Speedometer` shall display the speed in the unit of the unit system (UNIT-001), km/h by default, or in its own `unit` where set. |
| SPD-003 | S | Where `limit` is set, the `Speedometer` shall mark the limit on the scale, and while the value exceeds the limit, the widget shall highlight its readout. |
| SPD-004 | M | The documentation of the `Speedometer` shall state that the widget cannot guarantee the accuracy of the value it is given and does not replace the vehicle's speedometer. |
| SPD-005 | C | Where `secondary_unit` is set, the `Speedometer` shall show a second, inner scale in that unit. |

### 4.3 Dial Catalog

| ID | Pri. | Requirement |
|---|---|---|
| DIAL-101 | M | The library shall provide a **Speedometer**: vehicle speed on a dial with a digital readout. |
| DIAL-102 | M | The library shall provide a **Tachometer**: engine speed in rpm, with a red zone starting at `redline`. |
| DIAL-103 | S | Where `shift_light` is set, the `Tachometer` shall light a shift indicator while the engine speed is at or above it. |
| DIAL-104 | S | While `ready` is true and the engine speed is zero, the `Tachometer` shall show a ready state, so that a stopped engine of a vehicle able to move is not read as off. |
| DIAL-105 | M | The library shall provide a **FuelGauge**: fuel level from empty to full, with a reserve zone and the fuel pump symbol. |
| DIAL-106 | S | Where `filler_side` is set, the `FuelGauge` shall point its fuel pump symbol towards that side. |
| DIAL-107 | M | The library shall provide a **TemperatureGauge**: coolant or oil temperature, with cold and hot zones. |
| DIAL-108 | M | When the value of a `TemperatureGauge` enters its hot zone, the widget shall light its temperature tell-tale in red. |

---

## 5. Tell-tales (TEL)

| ID | Pri. | Requirement |
|---|---|---|
| TEL-001 | M | The `TellTale` shall take its colour from its function — red for danger, yellow or amber for warning, green for a function on, blue for high beam — and not from the theme. |
| TEL-002 | M | The `TellTale` shall draw the symbol of its function from a set modelled on ISO 2575. |
| TEL-003 | M | The `TellTale` shall show the name of its function as text as well as its symbol, so that colour is never the only cue. |
| TEL-004 | M | The `TellTale` shall accept the states `off`, `on` and `blinking`. |
| TEL-005 | S | While a `TellTale` is off, the widget shall draw its symbol dimmed, so that a lit one stands out. |
| TEL-006 | S | When several tell-tales of a `TellTaleCluster` other than the direction indicators are lit, the widget shall order them red first, then amber, then green and blue. |
| TEL-007 | M | While a `TellTale` is blinking, the widget shall blink at a frequency between 1 and 2 Hz. |
| TEL-008 | M | The library shall provide a **TellTaleCluster**: a row of tell-tales. |
| TEL-009 | S | The `TellTaleCluster` shall show the direction indicators side by side, left before right, at the start of the row, whatever their state, so that one blinking is never separated from the other. |

---

## 6. Digital Displays (DIG)

| ID | Pri. | Requirement |
|---|---|---|
| DIG-001 | M | The library shall provide a **TripComputer** showing instant and average consumption, fuel used, distance and elapsed time. |
| DIG-002 | M | While the speed is below 5 km/h, the `TripComputer` shall show the consumption per hour and not per 100 km. |
| DIG-003 | M | If less than 0.1 km has been covered, then the `TripComputer` shall not show an average consumption. |
| DIG-004 | S | Where `range_km` is given, the `TripComputer` shall show the remaining range. |
| DIG-005 | M | The library shall provide an **Odometer** showing a total and a trip distance. |
| DIG-006 | M | The library shall provide a **GearIndicator** showing `P`, `R`, `N`, `D` or a gear number. |
| DIG-007 | S | Where `suggestion` is set, the `GearIndicator` shall show an up or down shift arrow. |

---

## 7. Cluster (CLU)

A `Cluster` is one front-end module. Its `value` is the list of the widgets it holds,
each given as its trait dictionary with its `_kind`, which the cluster draws itself: a
host sets one list of dictionaries, whatever its language, and needs no support for
nested widgets. A host binding may accept its own widget objects and pass their traits.

| ID | Pri. | Requirement |
|---|---|---|
| CLU-001 | M | The library shall provide a **Cluster** arranging dials on the sides, tell-tales between them and digital displays below. |
| CLU-002 | M | The `Cluster` shall expose `hud`, `theme` and `brightness` traits applying to every widget it holds. |
| CLU-003 | S | The `Cluster` shall be usable as an anywidget-instruments `Panel` in Jupyter and as a laid-out element in marimo. |

---

## 8. Legibility (LEG)

The `theme` trait takes, beyond the values of anywidget-instruments, `day` and `night`
(LEG-003): the day theme is the light theme; the night theme is dark, with a lower
luminance than the dark theme (LEG-004).

| ID | Pri. | Requirement |
|---|---|---|
| LEG-001 | M | The library shall size digits and scale labels from a `viewing_distance` trait, so that their height subtends a set visual angle. |
| LEG-002 | M | The library shall meet the contrast targets of anywidget-instruments in every theme. |
| LEG-003 | M | The library shall provide a day theme and a night theme. |
| LEG-004 | S | While the night theme is active, the library shall lower the luminance of every widget and avoid large bright areas. |
| LEG-005 | S | The library shall use a typeface in which the digits 0 and 8, and 1 and 7, cannot be mistaken for one another. |

---

## 9. Distraction (DIS)

| ID | Pri. | Requirement |
|---|---|---|
| DIS-001 | M | Where `max_items` is not set, the `Cluster` shall show at most eight widgets. |
| DIS-002 | M | If a value changes more than twice a second, then the widget shall hold each displayed value for at least 0.5 s, rather than flicker. |
| DIS-003 | S | Where needles animate, the widget shall expose an `animate` trait that turns animation off. |
| DIS-004 | M | The documentation shall state that pages are to be configured and read while stationary. |

---

## 10. Head-up Display (HUD)

Every widget has a `hud` trait. On a `Cluster` it turns the head-up display mode on; on a
widget held by a cluster it marks the widget as one the head-up display shows (HUD-004).

| ID | Pri. | Requirement |
|---|---|---|
| HUD-001 | M | While `hud` is true, the `Cluster` shall mirror its content left to right. |
| HUD-002 | M | While `hud` is true, the `Cluster` shall draw on a black background. |
| HUD-003 | M | While `hud` is true, the widgets shall draw their figures in one colour, keeping the colours of tell-tales. |
| HUD-004 | S | While `hud` is true, the `Cluster` shall show only the speed and the widgets whose `hud` trait is true. |
| HUD-005 | M | While `hud` is true, the widgets shall not animate. |
| HUD-006 | S | While `hud` is true, the `Cluster` shall apply its `brightness` trait to every widget. |

---

## 11. Units (UNIT)

A vehicle display is read in the units of its market. The library supports three unit
systems and lets any quantity be set on its own.

| Quantity | `metric` | `imperial` (UK) | `us` |
|---|---|---|---|
| Speed | km/h | mph | mph |
| Distance | km | mi | mi |
| Volume | L | imperial gal | US gal |
| Fuel economy | L/100 km | mpg (imperial) | mpg (US) |
| Temperature | °C | °C | °F |
| Pressure | kPa | psi | psi |
| Fuel rate | L/h | imperial gal/h | US gal/h |
| Power | kW | kW | kW |
| Energy | kWh | kWh | kWh |
| Energy economy | kWh/100 km | mi/kWh | mi/kWh |

The names in this table are the unit names of the trait contract and the text shown
next to a value; the contract also accepts km/L for a fuel economy (UNIT-014) and bar for
a pressure, and lists every name it accepts (UNIT-017). A gallon is always named
`imperial gal` or `US gal`, an mpg `mpg (imperial)` or `mpg (US)` (UNIT-005).

### 11.1 Unit Systems

| ID | Pri. | Requirement |
|---|---|---|
| UNIT-001 | M | The library shall expose a `unit_system` setting accepting `"metric"`, `"imperial"` and `"us"`, defaulting to `"metric"`. |
| UNIT-002 | M | When `unit_system` is set, every widget shall display each quantity in the unit that system assigns to it in the table above. |
| UNIT-003 | M | Where a widget's `unit` is set, the widget shall display that unit whatever the unit system, so that a system can be mixed (for example km/h with °F). |
| UNIT-004 | M | The `Cluster` shall apply its `unit_system` to every widget it holds that has no `unit` of its own. |
| UNIT-005 | M | The library shall display the unit with every numeric value, and shall name the gallon as imperial or US wherever a gallon or an mpg is shown. |

### 11.2 Conversion

Conversion happens in the front end, from the `value`, `input_unit`, `unit` and
`unit_system` traits (GEN-004): a host passes numbers and unit names, never converted
figures, so every host shows the same result.

| ID | Pri. | Requirement |
|---|---|---|
| UNIT-010 | M | Every widget shall read its `value` in the unit named by its `input_unit` trait, defaulting to the metric unit of its quantity, and the front end shall convert it for display. |
| UNIT-011 | M | The front end shall convert with the exact defining factors: 1 mi = 1.609344 km, 1 US gal = 3.785411784 L, 1 imperial gal = 4.54609 L, °F = °C × 9/5 + 32. |
| UNIT-012 | M | When the front end converts a fuel economy between L/100 km and mpg or km/L, or an energy economy between kWh/100 km and mi/kWh or km/kWh, it shall use the reciprocal relation between them, not a proportional one. |
| UNIT-013 | M | When the front end converts a fuel economy between a per-distance unit (L/100 km) and a per-volume unit (mpg, km/L), it shall convert the `min`, `max`, zones and limits too, and shall reverse the scale so that its better end stays marked as better. |
| UNIT-014 | S | The library shall offer km/L as a fuel economy unit. |
| UNIT-015 | M | When the `Speedometer` converts a speed, the front end shall round up after the conversion (SPD-001), not before. |
| UNIT-016 | M | If a fuel economy in L/100 km is zero, or the speed is below the threshold of DIG-002, then the front end shall not display an mpg or km/L value, which would be infinite. |
| UNIT-017 | M | The trait contract shall list every unit name the front end accepts, so that a host can check a unit before setting it. |
| UNIT-018 | C | Where a host language has a unit library — pint in Python, DynamicQuantities.jl in Julia, uom in Rust — its host binding may accept that library's quantities, and shall pass them to the front end as a number and a unit name from the contract. |

---

## 12. Robustness (ROB)

A host binding that sets an unchanged value still updates it, although a trait
synchronisation only carries changes: it then increments the `_value_seq` trait, from
which the front end counts `max_age` (ROB-001) as from a change of `value`.

| ID | Pri. | Requirement |
|---|---|---|
| ROB-001 | M | Where `max_age` is set, if a widget's value has not been updated within it, then the widget shall show that the value is stale. |
| ROB-002 | M | If a widget has never received a value, then the widget shall show that no value is available rather than zero. |
| ROB-003 | M | If the kernel is disconnected, then the widget shall keep its last value shown as stale. |

---

## 13. Accessibility (A11Y)

| ID | Pri. | Requirement |
|---|---|---|
| A11Y-001 | M | Every widget shall expose an accessible name and its value to assistive technologies, with the ARIA roles of anywidget-instruments. |
| A11Y-002 | M | While the reduced-motion preference of the user agent is set, the widgets shall not animate. |

---

## 14. Documentation and Teaching (DOC)

| ID | Pri. | Requirement |
|---|---|---|
| DOC-001 | M | The library shall publish a documentation site with a catalog of every widget and an example for each. |
| DOC-002 | M | The documentation shall carry a safety notice stating that the widgets are not vehicle instruments. |
| DOC-003 | M | The documentation shall list the standards that inform the design, with a disclaimer of conformity. |
| DOC-004 | S | The documentation shall offer examples runnable in the browser, without installation. |
| DOC-005 | M | The documentation shall show every widget in the day theme and in the night theme, with pictures captured from the widgets themselves by an automated run, so that no picture shows an older look than the code. |

---

## 15. Quality and Verification (QA)

| ID | Pri. | Requirement |
|---|---|---|
| QA-001 | M | Every requirement marked M shall be covered by at least one automated test. |
| QA-002 | M | The test suite shall check the colour of every tell-tale function against TEL-001. |
| QA-003 | M | The test suite shall check SPD-001 at every boundary of the displayed resolution. |

---

## 16. Host Independence (HOST)

| ID | Pri. | Requirement |
|---|---|---|
| HOST-001 | M | The library shall describe every widget's traits in a JSON Schema, the single source of truth for the front end and for every host binding. |
| HOST-002 | M | The library shall ship a contract file generated from the schemas, readable by a host in any language without running the Python package. |
| HOST-003 | M | The library shall ship parity cases — traits in, figures out — that the front end and every host binding shipped with the library pass alike. |
| HOST-004 | M | If a host sets a trait to a value its schema rejects, then the widget shall show an invalid state rather than a guessed figure. |
| HOST-005 | S | The documentation shall show the widgets driven from Python, from Julia (KaimonSlate.jl) and from a page with no kernel. |
| HOST-006 | C | The library shall document how a Rust application embeds the widgets through a web view, with the traits as JSON. |

---

## 17. Electric and Hybrid Drivetrains (EV)

A vehicle driven by an electric motor, alone or with an engine, is read through other
figures: the charge of its battery rather than a fuel level, the power it draws or
regenerates rather than an engine speed, and an energy consumption. Power is positive
when the drivetrain drives the wheels and negative when it regenerates.

| ID | Pri. | Requirement |
|---|---|---|
| EV-001 | M | The library shall provide a **StateOfChargeGauge**: the charge of the traction battery from 0 to 100 %, with a low zone and a battery symbol lit in it. |
| EV-002 | S | While `charging` is true, the `StateOfChargeGauge` shall show a charging symbol and the text CHARGING. |
| EV-003 | M | The library shall provide a **PowerMeter**: the power of the drivetrain in kW on a scale extending below zero, the part below zero marked as regeneration. |
| EV-004 | M | While the power is negative, the `PowerMeter` shall show that the vehicle regenerates, in text as well as by the position of the needle. |
| EV-005 | S | While `ready` is true and the power is zero, the `PowerMeter` shall show a ready state, so that a stopped motor of a vehicle able to move is not read as off. |
| EV-006 | M | Where `energy` is `"electric"`, the `TripComputer` shall show the energy consumption and the energy used instead of fuel, with the rules of DIG-002 and DIG-003: the power below 5 km/h, no average under 0.1 km. |
| EV-007 | S | The library shall provide a **PowerFlow** display showing, for a hybrid drivetrain, which of the engine, the battery and the wheels deliver and receive power, by arrows and in text. |
| EV-008 | M | The tell-tale set shall include the functions of an electric drivetrain: ready to drive, charging, low battery charge, reduced power, and electric drive system fault. |

## 18. Traceability of Cluster Components

| Component of a vehicle display | Widget or trait | Requirements |
|---|---|---|
| Speedometer | Speedometer | SPD-001 to SPD-005, DIAL-101 |
| Tachometer, red zone, shift light | Tachometer | DIAL-102 to DIAL-104 |
| Fuel gauge, reserve, filler side | FuelGauge | DIAL-105, DIAL-106 |
| Temperature gauge | TemperatureGauge | DIAL-107, DIAL-108 |
| Warning and indicator lights | TellTale, TellTaleCluster | TEL-001 to TEL-009 |
| Trip computer | TripComputer | DIG-001 to DIG-004 |
| Odometer and trip meter | Odometer | DIG-005 |
| Gear display and shift suggestion | GearIndicator | DIG-006, DIG-007 |
| Instrument panel layout | Cluster | CLU-001 to CLU-003 |
| Head-up display | `hud` trait of Cluster | HUD-001 to HUD-006 |
| Day and night illumination | `theme`, `brightness` traits | LEG-003, LEG-004 |
| State of charge, power and regeneration, power flow | StateOfChargeGauge, PowerMeter, PowerFlow | EV-001 to EV-007 |
| Electric drivetrain tell-tales | TellTale | EV-008 |
| Market units (metric, UK, US) | `unit_system`, `unit`, `input_unit` traits | UNIT-001 to UNIT-018 |

---

## 19. Open Questions

1. *Resolved in 0.6.* The dials are front-end modules of their own, deriving from the base view of anywidget-instruments — its common traits, scheduling, themes and kernel liveness — and reusing its scale functions, not from its `Gauge` view, which is a control with alarm levels, a value entry and peak hold. No change upstream is needed.
2. *Resolved in 0.6.* The symbols are original drawings on a 24 × 24 grid, modelled on the published meaning of each ISO 2575 symbol and not copied from the figures of the standard; the set is listed in the widget catalog.
3. The visual angle LEG-001 targets, to be set after reading ISO 15008.
4. Whether mph and km/h scales on one `Speedometer` (SPD-005) are needed for 1.0.
5. Whether pressure (tyre) and other quantities beyond the table of section 11 are in scope for 1.0.

## Revision History

| Version | Changes |
|---|---|
| 0.1 | Initial draft. |
| 0.10 | The project renamed anywidget-instruments-automotive, in the family of anywidget-instruments with anywidget-instruments-industrial; no requirement changed. |
| 0.9 | TEL-009 added: the direction indicators side by side, left before right, at the start of a tell-tale row; TEL-006 orders the other tell-tales. |
| 0.8 | Section 17 added: electric and hybrid drivetrains (EV-001 .. EV-008). Unit table: power, energy and energy economy; UNIT-012 extended to energy economy. Former sections 17 and 18 renumbered 18 and 19. |
| 0.7 | Section 7: a `Cluster` holds its widgets as a list of trait dictionaries and draws them itself. Section 10: the `hud` trait of every widget. Section 8: the `theme` values `day` and `night`. |
| 0.6 | Open questions 1 (dials derive from the base view of anywidget-instruments) and 2 (original tell-tale drawings) resolved. Unit table: fuel rate added, unit names stated as those of the trait contract and of the display. Section 12: the `_value_seq` trait, by which a host signals an update that does not change the value (ROB-001). |
| 0.5 | DOC-005 added: every widget pictured in the day and the night theme, captured from the widgets themselves by an automated run. |
| 0.4 | The library is a TypeScript front end first, used from Python, Julia, Rust and other hosts: GEN rewritten (front-end modules, AFM, everything displayed computed in the front end), HOST-001 .. HOST-006 added (trait contract, contract file, parity cases), API made host-neutral. Unit conversion moved to the front end (UNIT-010 .. UNIT-018); pint is no longer a requirement but an optional convenience of the Python binding, as DynamicQuantities.jl and uom are of theirs. |
| 0.3 | Units rewritten (UNIT-001 .. UNIT-017): metric, imperial and US unit systems, per-widget override, exact conversion factors, reciprocal fuel economy with converted and reversed scales, rounding after conversion. |
| 0.2 | Rewritten in the structure of the anywidget-instruments specification: glossary, identifiers and priorities, dial catalog (DIAL), digital displays (DIG), cluster (CLU), robustness (ROB, was STALE), accessibility (A11Y), documentation (DOC), quality (QA), traceability table and open questions. Vague requirements given values: DIS-001 (eight widgets), DIS-002 (0.5 s hold), TEL-007 (1 to 2 Hz). |
