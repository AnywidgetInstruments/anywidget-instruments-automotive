# Widget catalog

The **dials and tell-tales are available**; the other widgets below are **planned**: this page
describes what they will show and which convention they follow, so that the
specification can be reviewed before their code is written. Each is a TypeScript
front-end module extending anywidget-instruments, with its common traits (`value`, `label`, `unit`, `min`, `max`, `theme`, `size`, `disabled`,
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

![Dials with no value, above the scale and invalid, day theme](img/dial-states-light.png#only-light)
![Dials with no value, above the scale and invalid, night theme](img/dial-states-dark.png#only-dark)

### `Speedometer` — available

Vehicle speed on a dial, with a digital readout.

```python
aa.Speedometer(87.3, max=220, limit=90)
aa.Speedometer(87.3, unit_system="us")          # 55 mph: km/h in, mph shown
```

![Speedometers, day theme](img/speedometer-light.png#only-light)
![Speedometers, night theme](img/speedometer-dark.png#only-dark)

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

![Tachometers, day theme](img/tachometer-light.png#only-light)
![Tachometers, night theme](img/tachometer-dark.png#only-dark)

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

![Fuel and temperature gauges, day theme](img/gauges-light.png#only-light)
![Fuel and temperature gauges, night theme](img/gauges-dark.png#only-dark)

## Tell-tales

### `TellTale` — available

One tell-tale: the symbol of a function and a state, `"off"`, `"on"` or `"blinking"`.

```python
engine = aa.TellTale("engine", state="on")
engine.state = "blinking"
```

![Tell-tales, day theme](img/telltale-light.png#only-light)
![Tell-tales, night theme](img/telltale-dark.png#only-dark)

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

![Every tell-tale symbol, day theme](img/telltale-functions-light.png#only-light)
![Every tell-tale symbol, night theme](img/telltale-functions-dark.png#only-dark)

### `TellTaleCluster` — available

A row of tell-tales. The lit ones come first, red, then amber, then green and blue; the
others follow in the order given, so that nothing moves among them when one lights up
(TEL-006). Each item is a dict, a `(function, state)` pair or a `TellTale`; `size` is
the size of one tell-tale.

```python
row = aa.TellTaleCluster([("turn_left", "off"), ("low_beam", "on"), ("engine", "on")])
row.set_telltale("turn_left", "blinking")
```

![A tell-tale cluster, day theme](img/telltalecluster-light.png#only-light)
![A tell-tale cluster, night theme](img/telltalecluster-dark.png#only-dark)

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
