# Widget catalog

Every widget below is **available**. This page describes what each shows and which
convention it follows: this page
describes what they will show and which convention they follow, so that the
specification can be checked against the code. Each is a TypeScript
front-end module extending anywidget-instruments, with its common traits (`value`, `label`, `unit`, `min`, `max`, `theme`, `size`, `disabled`,
`visible`, `tooltip`). The examples use the Python host binding; from Julia, Rust or a
web page, the same widgets take the same traits.

!!! tip "Every picture opens a notebook"
    Click a picture to open the widgets it shows in a [marimo](https://marimo.io)
    notebook, in your browser, with controls to drive them — no installation.

All widgets are **indicators**: the value is set by the kernel and only displayed. A
vehicle display is read, not operated, while driving.

## Units

Every widget reads its value in metric units by default and shows it in the unit system
chosen for it — `metric`, `imperial` (UK) or `us` — or in a unit of its own:

```python
aa.Speedometer(87.3, unit_system="us")                # 87.3 km/h in, 55 mph shown
aa.TemperatureGauge(90, unit_system="us", unit="°C")  # one quantity in a unit of its own
```

Fuel economy is the quantity to watch: L/100 km and mpg are reciprocal, so a scale
converted from one to the other is turned round — its better end stays marked as better
— and a figure that would be infinite, at a standstill, is not shown.

## Day and night

`theme` takes the values of anywidget-instruments — `"auto"`, `"light"`, `"dark"`,
`"system"` — and `"day"` and `"night"` (LEG-003): the day theme is the light one; the
night theme is dark, dimmer than the dark theme, with no large bright area (LEG-004).
Tell-tale colours do not change with the theme. The pictures of this catalog show the
day theme, or the night theme with a dark reading preference.

```python
aa.Speedometer(87.3, theme="night")
```

## Dials

Every dial reads its value, its scale, its zones and its limits in `input_unit` (the
metric unit of its quantity by default) and draws them in the unit of its unit system,
or in its own `unit`. Common traits:

* `min`, `max` — the scale, with major and minor ticks on round values (DIAL-001);
* `zones` — coloured arcs, `{"from", "to", "kind"}` with `kind` one of `"danger"`,
  `"warning"`, `"cold"` (DIAL-005);
* `resolution` — the step of the readout, the value as text below the needle (DIAL-002);
* `animate` — the needle glides to a new value; never under the reduced-motion
  preference (DIS-003, A11Y-002);
* `max_age` — a value older than this is marked *STALE* (ROB-001).

A value above or below the scale stops the needle at its end and lights a marker there
(DIAL-003); NaN or an infinity leaves the needle where it was and reads *INVALID*
(DIAL-004); no value yet reads *NO VALUE*, with no needle (ROB-002). A value changing
more than twice a second is held half a second at a time rather than flicker (DIS-002).

[![Dials with no value, above the scale and invalid, day theme](img/dial-states-light.png#only-light)![Dials with no value, above the scale and invalid, night theme](img/dial-states-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")

### `Speedometer` — available

Vehicle speed on a dial, with a digital readout.

```python
aa.Speedometer(87.3, max=220, limit=90)
aa.Speedometer(87.3, unit_system="us")          # 55 mph: km/h in, mph shown
```

[![Speedometers, day theme](img/speedometer-light.png#only-light)![Speedometers, night theme](img/speedometer-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")

* The unit of the unit system — km/h in `metric`, mph in `imperial` and `us` — or a
  unit of its own (SPD-002).
* **Never rounds down** (SPD-001): 87.3 km/h reads 88, not 87, and the rounding comes
  after the conversion (UNIT-015) — in the direction UN Regulation No. 39 asks of a
  real speedometer.
* `limit` — a mark across the scale; above it, the readout turns red and is underlined
  (SPD-003).

!!! warning "Not the vehicle's speedometer (SPD-004)"
    The widget cannot guarantee the accuracy of the value it is given — a speed read
    over OBD-II is late and may be wrong — and it does not replace the vehicle's own
    speedometer. See the [safety notice](safety.md).

### `Tachometer` — available

Engine speed in rpm, the scale in thousands.

```python
aa.Tachometer(3200, redline=6000, shift_light=5800)
```

[![Tachometers, day theme](img/tachometer-light.png#only-light)![Tachometers, night theme](img/tachometer-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")

* `redline` — the start of the red zone (DIAL-102).
* `shift_light` — a lamp lit amber at and above this engine speed (DIAL-103).
* `ready` — hybrid and electric drivetrains: at 0 rpm the dial says *READY*, so that a
  stopped engine of a vehicle able to move is not read as off (DIAL-104).

### `FuelGauge` — available

Fuel level from **E** to **F**, in percent of a full tank. The reserve zone (`reserve`,
12 % by default) is amber, and the fuel pump symbol lights amber in it (DIAL-105); it
points to the side of the filler flap given by `filler_side` (DIAL-106).

### `TemperatureGauge` — available

Coolant or oil temperature, with a cold zone below `cold` and a hot zone from `hot`,
where the temperature tell-tale lights red (DIAL-107, DIAL-108). °C, or °F in the `us`
unit system.

```python
aa.FuelGauge(8, filler_side="right")
aa.TemperatureGauge(118, hot=115)
```

[![Fuel and temperature gauges, day theme](img/gauges-light.png#only-light)![Fuel and temperature gauges, night theme](img/gauges-dark.png#only-dark)](../marimo/dials/ "Open it in marimo, in your browser")

## Tell-tales

### `TellTale` — available

One tell-tale: the symbol of a function and a state, `"off"`, `"on"` or `"blinking"`.

```python
engine = aa.TellTale("engine", state="on")
engine.state = "blinking"
```

[![Tell-tales, day theme](img/telltale-light.png#only-light)![Tell-tales, night theme](img/telltale-dark.png#only-dark)](../marimo/telltales/ "Open it in marimo, in your browser")

*Oil pressure, engine, dipped beam and main beam lit; brake unlit; ABS with no state
yet. Captured from the widgets by `npm run images`, in the day and the night theme.*

* **Colour from the function, never from the theme** (TEL-001):

    | Colour | Meaning | Functions |
    |---|---|---|
    | Red | Danger, stop | `brake`, `oil_pressure`, `coolant_temperature`, `battery`, `seat_belt`, `airbag`, `door_open` |
    | Amber | Warning, check soon | `engine`, `abs`, `low_fuel`, `tyre_pressure`, `stability_control`, `glow_plug`, `rear_fog` |
    | Green | A function is on | `turn_left`, `turn_right`, `low_beam`, `position_lamps`, `front_fog`, `cruise_control`, `ready` |
    | Blue | Main beam | `high_beam` |

    The list is `aa.TELLTALE_FUNCTIONS`, read from the trait contract.
* **Its name as text** as well as its symbol, so that colour is never the only cue
  (TEL-003); `label` replaces the name of the function.
* **Unlit, it is a dim neutral grey** whatever its colour when lit (TEL-005): an unlit
  red tell-tale cannot be read as a green one.
* **Blinks at 1.5 Hz** (TEL-007). Under the reduced-motion preference it does not
  blink: it stays lit and says *BLINKING* (A11Y-002).
* **No state is not "off"**: a tell-tale created without a state shows *NO VALUE*
  (ROB-002); a state the contract rejects shows *INVALID* (HOST-004); with `max_age`
  set, a state not updated in time shows *STALE* (ROB-001).
* The symbols are original drawings modelled on the published meaning of the ISO 2575
  symbols, not the figures of the standard, and may differ from a vehicle's own:

[![Every tell-tale symbol, day theme](img/telltale-functions-light.png#only-light)![Every tell-tale symbol, night theme](img/telltale-functions-dark.png#only-dark)](../marimo/telltales/ "Open it in marimo, in your browser")

### `TellTaleCluster` — available

A row of tell-tales. The direction indicators come first, side by side, left before
right, whatever their state, so that a blinking arrow stays next to the other
(TEL-009). Then the lit tell-tales, red, then amber, then green and blue; the others
follow in the order given, so that nothing moves among them when one lights up
(TEL-006). Each item is a dict, a `(function, state)` pair or a `TellTale`; `size` is
the size of one tell-tale.

```python
row = aa.TellTaleCluster([("turn_left", "off"), ("low_beam", "on"), ("engine", "on")])
row.set_telltale("turn_left", "blinking")
```

[![A tell-tale cluster, day theme](img/telltalecluster-light.png#only-light)![A tell-tale cluster, night theme](img/telltalecluster-dark.png#only-dark)](../marimo/telltales/ "Open it in marimo, in your browser")

## Digital displays

[![Trip computers, odometer and gear indicators, day theme](img/digital-light.png#only-light)![Trip computers, odometer and gear indicators, night theme](img/digital-dark.png#only-dark)](../marimo/digital/ "Open it in marimo, in your browser")

### `TripComputer` — available

The figures of a trip, computed by the front end from the raw figures a host reads —
the rules of the trip computer of [CAN & CANopen Studio](integration.md):

```python
trip = aa.TripComputer({"speed": 92, "fuel_rate": 5.6, "distance": 48.3,
                        "fuel_used": 3.1, "elapsed": 1930, "range": 420})
trip.update(speed=88, fuel_rate=5.1)
```

`value` holds `speed` (km/h), `fuel_rate` (L/h), `distance` (km), `fuel_used` (L),
`elapsed` (s) and, optionally, `range` (km), each a number or `None`.

* Instant and average consumption, fuel used, distance and elapsed time (DIG-001).
* **Below 5 km/h the consumption is given per hour** — per 100 km it tends to infinity
  at a standstill — and the line says so (DIG-002). In mpg a zero consumption has no
  figure either (UNIT-016).
* **No average before 0.1 km**: a dash, and *after 0.1 km* (DIG-003).
* The range, only where it is given (DIG-004).
* L/100 km, L and km in `metric`; mpg, gallons and miles in `imperial` and `us`; `unit`
  sets the consumption unit alone (`"km/L"`, for instance).

### `Odometer` — available

Total and trip distance on drums, the tenths of the trip inverted, as on a mechanical
counter; a counter never rounds a distance up. km, or miles in `imperial` and `us`.

```python
aa.Odometer(48213.7, trip=48.36)
```

### `GearIndicator` — available

The engaged gear (`P`, `R`, `N`, `D`, `1`–`8`; a number may be given as an int), and an
up or down shift arrow with `suggestion` (DIG-006, DIG-007).

```python
aa.GearIndicator(3, suggestion="up")
```

## Electric and hybrid drivetrains

A vehicle driven by an electric motor, alone or with an engine, is read through the
charge of its battery, the power it draws or regenerates, and an energy consumption
(EV-001 .. EV-008). Power is positive when the drivetrain drives the wheels, negative
when it regenerates.

[![Power meters and battery gauges, day theme](img/electric-light.png#only-light)![Power meters and battery gauges, night theme](img/electric-dark.png#only-dark)](../marimo/electric/ "Open it in marimo, in your browser")

### `PowerMeter` — available

The power of the drivetrain in kW, on a scale extending below zero: the green part is
regeneration, and the meter says *REGEN* while the power is negative (EV-003, EV-004).
`ready`: at 0 kW it says *READY*, so that a stopped motor of a vehicle able to move is
not read as off (EV-005).

```python
aa.PowerMeter(-23, min=-60, max=150)
```

### `StateOfChargeGauge` — available

The charge of the traction battery, 0 to 100 %, with a low zone (`low`, 15 % by default)
where the battery symbol lights amber (EV-001); `charging` shows the charging symbol and
says *CHARGING* (EV-002).

```python
aa.StateOfChargeGauge(38, charging=True)
```

### `PowerFlow` — available

Which of the engine, the battery and the wheels deliver and receive power in a hybrid
drivetrain, by arrows and in text, with the mode a driver reads: *EV*, *HYBRID*,
*ENGINE*, *CHARGING*, *REGEN* or *IDLE* (EV-007). `battery` is positive while it
discharges, negative while it charges; `wheels` negative while braking with
regeneration.

```python
aa.PowerFlow({"engine": 38, "battery": 12, "wheels": 50})    # HYBRID
aa.PowerFlow({"engine": 0, "battery": -21, "wheels": -21})   # REGEN
```

[![Power flows and an electric trip computer, day theme](img/hybrid-light.png#only-light)![Power flows and an electric trip computer, night theme](img/hybrid-dark.png#only-dark)](../marimo/electric/ "Open it in marimo, in your browser")

### The electric `TripComputer` and tell-tales

`TripComputer(..., energy="electric")` takes `power` (kW) and `energy_used` (kWh)
instead of the fuel figures and gives the energy consumption in kWh/100 km, or mi/kWh
in `imperial` and `us`, with the same rules: the power below 5 km/h, no average before
0.1 km (EV-006). While regenerating it shows the power regenerated, never a negative
consumption.

```python
aa.TripComputer({"speed": 96, "power": 15.8, "distance": 62.4, "energy_used": 10.3},
                energy="electric")
```

The tell-tales of an electric drivetrain are part of the set (EV-008): `ready` and
`charging` (green), `low_charge` and `reduced_power` (amber), `ev_fault` (red).

## Layout

### `Cluster` — available

An instrument panel: dials on the sides, tell-tales between them and digital displays
below (CLU-001).

```python
rpm, speed = aa.Tachometer(2600, redline=6200), aa.Speedometer(87.3, limit=90)
lamps = aa.TellTaleCluster([("low_beam", "on"), ("engine", "off")])
fuel, coolant = aa.FuelGauge(38), aa.TemperatureGauge(90)
trip, gear = aa.TripComputer({"speed": 87, "fuel_rate": 5.2}), aa.GearIndicator(5)

cluster = aa.Cluster(
    [rpm, lamps, speed, fuel, coolant, trip, gear],
    unit_system="us", theme="dark", brightness=0.8,
)
speed.value = 104          # shows in the cluster
cluster.hud = True         # head-up display mode
```

[![A cluster, day theme](img/cluster-light.png#only-light)![A cluster, night theme](img/cluster-dark.png#only-dark)](../marimo/cluster_preview/ "Open it in marimo, in your browser")

* `theme`, `brightness` and `unit_system` apply to every widget it holds; a widget with a
  `unit` of its own keeps it (CLU-002, UNIT-004).
* At most eight widgets, or `max_items`; the others are named under the panel, not
  silently dropped (DIS-001).
* `hud` turns on the [head-up display mode](hud.md): mirrored, on black, one colour
  for the figures, tell-tale colours kept, no animation, and only the speedometer and
  the widgets marked `hud=True` (HUD-001 .. HUD-006).
* It is **one widget**: its `value` is the list of the trait dictionaries of the widgets
  it holds, each with its `_kind`, which its front end draws. A host in any language
  sets that list; the Python binding builds it from its widgets and keeps it up to date
  when one of them changes. It shows as one output in JupyterLab, Notebook 7, marimo
  or VS Code, with no support for nested widgets needed (CLU-003).
