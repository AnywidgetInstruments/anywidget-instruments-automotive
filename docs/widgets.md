# Widget catalog

Every widget below is **planned**: this page describes what it will show and which
convention it follows, so that the specification can be reviewed before any code is
written. Each is a TypeScript front-end module extending anywidget-instruments, with its
common traits (`value`, `label`, `unit`, `min`, `max`, `theme`, `size`, `disabled`,
`visible`, `tooltip`). The examples use the Python host binding; from Julia, Rust or a
web page, the same widgets take the same traits.

All widgets are **indicators**: the value is set by the kernel and only displayed. A
vehicle display is read, not operated, while driving.

## Units

Every widget reads its value in metric units by default and shows it in the unit system
chosen for it — `metric`, `imperial` (UK) or `us` — or in a unit of its own:

```python
aa.Cluster([speed, economy], unit_system="us")        # mph, mpg (US), °F
aa.TripComputer(6.2, unit="mpg (imperial)")           # one widget in its own unit
```

Fuel economy is the quantity to watch: L/100 km and mpg are reciprocal, so a scale
converted from one to the other is turned round — its better end stays marked as better
— and a figure that would be infinite, at a standstill, is not shown.

## Dials

### `Speedometer`

Vehicle speed on a dial, with a digital readout.

* The unit of the unit system — km/h in `metric`, mph in `imperial` and `us` — or a
  unit of its own, with the other shown as an inner scale on request.
* **Never rounds down** (SPD-001): 49.6 km/h reads 50, not 49 — in the direction
  UN Regulation No. 39 asks of a real speedometer, although the widget cannot guarantee
  the accuracy of the value it is given.
* An optional speed limit marker.

```python
aa.Speedometer(87.3, max=220, unit="km/h", limit=90)
```

### `Tachometer`

Engine speed, in rpm or thousands of rpm.

* `redline`: the start of the red zone.
* `shift_light`: a light that comes on at a chosen engine speed.
* Hybrid and electric drivetrains: a `ready` state shown when the engine is stopped but
  the vehicle can move, so that 0 rpm is not read as "off".

### `FuelGauge`

Fuel level as a fraction, from empty to full, with the reserve zone and the fuel pump
symbol (ISO 2575) on the side of the filler flap when it is known.

### `TemperatureGauge`

Coolant or oil temperature, cold and hot zones, and the temperature tell-tale when the
hot zone is reached.

## Tell-tales

### `TellTale`

One warning light: a symbol from the ISO 2575 set and a state (`off`, `on`, `blinking`).
Its colour follows its meaning, not the page's theme (TEL-001):

| Colour | Meaning | Examples |
|---|---|---|
| Red | Danger, stop | Oil pressure, brake system, coolant temperature |
| Yellow / amber | Warning, check soon | Engine (MIL), low fuel, tyre pressure |
| Green | A function is on | Direction indicators, low beam |
| Blue | High beam | Main beam |

A tell-tale also carries its name as text, so that colour is never the only cue.

### `TellTaleCluster`

A row of tell-tales, ordered by priority (red before amber before green) when several are
lit at once.

## Digital displays

### `TripComputer`

The figures of a trip: instant and average consumption, fuel used, distance, elapsed
time, range. Each figure says what it rests on — an average over 0.1 km is noise and is
not shown — and a consumption at a standstill is given per hour, not per 100 km.

### `Odometer`

Total and trip distance, in a mechanical-counter style.

### `GearIndicator`

The engaged gear (`P`, `R`, `N`, `D`, `1`–`8`), and an up or down shift suggestion.

## Layout

### `Cluster`

Arranges widgets as an instrument cluster: dials left and right, tell-tales between, and
digital displays below. It carries the [head-up display mode](hud.md) and the day and
night themes.
