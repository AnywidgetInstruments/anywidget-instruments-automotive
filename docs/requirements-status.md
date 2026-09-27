# Requirements status

The library is at the design stage: no requirement of the
[specification](specification.md) is implemented yet.

| Group | Requirements | Implemented | Tested |
|---|---|---|---|
| General (GEN) | 4 | 0 | 0 |
| Speed display (SPD) | 4 | 0 | 0 |
| Tell-tales (TEL) | 6 | 0 | 0 |
| Legibility (LEG) | 5 | 0 | 0 |
| Distraction (DIS) | 4 | 0 | 0 |
| Head-up display (HUD) | 6 | 0 | 0 |
| Units (UNIT) | 3 | 0 | 0 |
| Stale values (STALE) | 2 | 0 | 0 |
| **Total** | **34** | **0** | **0** |

## Order of work

Sequenced by dependency:

1. The base: derive from anywidget-instruments (GEN-001, GEN-002), stale values (STALE).
2. `TellTale` and `TellTaleCluster` (TEL), which need no dial.
3. `Speedometer` and `Tachometer` (SPD, LEG), then the gauges.
4. `TripComputer`, `Odometer` and `GearIndicator` (UNIT).
5. `Cluster` with the day, night and HUD modes (DIS, HUD).
