# PowerFlow

[![A hybrid power flow: engine and battery driving the wheels, day theme](../img/widgets/power-flow-light.png#only-light)![A hybrid power flow: engine and battery driving the wheels, night theme](../img/widgets/power-flow-dark.png#only-dark)](../../marimo/electric/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

Which of the engine, the battery and the wheels deliver and receive power in a hybrid
drivetrain, by arrows and in text, with the mode a driver reads: *EV*, *HYBRID*,
*ENGINE*, *CHARGING*, *REGEN* or *IDLE* (EV-007). `battery` is positive while it
discharges, negative while it charges; `wheels` negative while braking with
regeneration.

```python
aa.PowerFlow({"engine": 38, "battery": 12, "wheels": 50})    # HYBRID
aa.PowerFlow({"engine": 0, "battery": -21, "wheels": -21})   # REGEN
```

[![Power flows and an electric trip computer, day theme](../img/hybrid-light.png#only-light)![Power flows and an electric trip computer, night theme](../img/hybrid-dark.png#only-dark)](../../marimo/electric/ "Open it in marimo, in your browser")

**Electric and hybrid** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
