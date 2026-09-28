# Use with CAN & CANopen Studio

[CAN & CANopen Studio](https://github.com/s-celles/canopen-studio) reads a vehicle over
OBD-II — through an ELM327 adapter (USB, Wi-Fi or Bluetooth LE) or a CAN adapter — and
runs a trip computer in its Rust core. Its dashboard pages are YAML files that name
anywidget widgets, and a widget of this library is named `module:Class`:

```yaml
id: cluster
title: Cluster
columns: 3
instruments:
  - {widget: "anywidget_automotives:Speedometer", source: trip.speed_kmh, max: 220}
  - {widget: "anywidget_automotives:Tachometer", source: trip.rpm, max: 7000}
```

`just dashboard` in the studio opens the pages in marimo, with its own HUD switch.

The `TripComputer` computes its consumptions itself, with the same rules as the studio
(per hour below 5 km/h, no average under 0.1 km), from the raw figures of the trip. Whatever
feeds it maps the studio's sources onto its fields:

| `TripComputer` field | Studio source |
|---|---|
| `speed` (km/h) | `trip.speed_kmh` |
| `fuel_rate` (L/h) | `trip.instant_lph` |
| `distance` (km) | `trip.distance_km` |
| `fuel_used` (L) | `trip.fuel_used_l` |

<!-- illustration: not run -->
```python
trip = aa.TripComputer()
trip.update(speed=speed_kmh, fuel_rate=instant_lph, distance=distance_km, fuel_used=fuel_used_l)
```

| Source | Meaning |
|---|---|
| `trip.speed_kmh`, `trip.rpm` | Vehicle speed and engine speed (PIDs 0D, 0C) |
| `trip.instant_lph` | Fuel rate, from PID 5E or, on a petrol engine, the MAF |
| `trip.instant_l_per_100km`, `trip.average_l_per_100km` | Instant and average consumption |
| `trip.distance_km`, `trip.fuel_used_l` | Integrated since the trip began |
| `pid.<name>` | Any live-data PID, by the name the vehicle profile gives it |

## What the studio guarantees, and what it does not

* Readings are what the vehicle answered, decoded through the vehicle's profile; nothing
  is invented for a PID the vehicle does not support — the widget is left as it was.
* OBD-II is request and answer: a figure is as old as the last cycle, typically a few
  hundred milliseconds with a Bluetooth adapter. A speedometer fed this way lags the
  vehicle's own.
* The studio reads; it does not write to the vehicle unless explicitly enabled.
