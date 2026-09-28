# Widget catalog

The **tell-tales are available**; the other widgets below are **planned**: this page
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
