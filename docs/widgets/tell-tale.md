# TellTale

[![The engine tell-tale, lit amber, day theme](../img/widgets/tell-tale-light.png#only-light)![The engine tell-tale, lit amber, night theme](../img/widgets/tell-tale-dark.png#only-dark)](../../marimo/telltales/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

One tell-tale: the symbol of a function and a state, `"off"`, `"on"` or `"blinking"`.

```python
engine = aa.TellTale("engine", state="on")
engine.state = "blinking"
```

[![Tell-tales, day theme](../img/telltale-light.png#only-light)![Tell-tales, night theme](../img/telltale-dark.png#only-dark)](../../marimo/telltales/ "Open it in marimo, in your browser")

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

[![Every tell-tale symbol, day theme](../img/telltale-functions-light.png#only-light)![Every tell-tale symbol, night theme](../img/telltale-functions-dark.png#only-dark)](../../marimo/telltales/ "Open it in marimo, in your browser")

## Electric drivetrains

The tell-tales of an electric drivetrain are part of the set (EV-008): `ready` and
`charging` (green), `low_charge` and `reduced_power` (amber), `ev_fault` (red).

**Tell-tales** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
