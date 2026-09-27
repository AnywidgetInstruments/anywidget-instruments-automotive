# Requirements status

The library is at the design stage: no requirement of the
[specification](specification.md) is implemented yet. The [examples](examples.md) are a
preview composed from anywidget-instruments widgets, not an implementation.

| Group | Requirements | Implemented | Tested |
|---|---|---|---|
| General (GEN) | 9 | 0 | 0 |
| Common widget API (API) | 6 | 0 | 0 |
| Dials (DIAL) | 13 | 0 | 0 |
| Speed display (SPD) | 5 | 0 | 0 |
| Tell-tales (TEL) | 8 | 0 | 0 |
| Digital displays (DIG) | 7 | 0 | 0 |
| Cluster (CLU) | 3 | 0 | 0 |
| Legibility (LEG) | 5 | 0 | 0 |
| Distraction (DIS) | 4 | 0 | 0 |
| Head-up display (HUD) | 6 | 0 | 0 |
| Units (UNIT) | 14 | 0 | 0 |
| Robustness (ROB) | 3 | 0 | 0 |
| Accessibility (A11Y) | 2 | 0 | 0 |
| Documentation (DOC) | 4 | 0 | 0 |
| Quality and verification (QA) | 3 | 0 | 0 |
| Host independence (HOST) | 6 | 0 | 0 |
| **Total** | **98** | **0** | **0** |

## Order of work

Sequenced by dependency:

1. The base, in the TypeScript front end: extend anywidget-instruments (GEN, API), the
   trait contract and parity cases (HOST), units and conversion (UNIT), stale and
   missing values (ROB).
2. `TellTale` and `TellTaleCluster` (TEL), which need no dial.
3. The dials: `Speedometer`, `Tachometer`, `FuelGauge`, `TemperatureGauge` (DIAL, SPD),
   with legibility (LEG).
4. The digital displays: `TripComputer`, `Odometer`, `GearIndicator` (DIG).
5. `Cluster` with the day, night and head-up display modes (CLU, DIS, HUD).
6. Accessibility, documentation and verification throughout (A11Y, DOC, QA).
