# PowerMeter

[![A power meter at −23 kW, regenerating, day theme](../img/widgets/power-meter-light.png#only-light)![A power meter at −23 kW, regenerating, night theme](../img/widgets/power-meter-dark.png#only-dark)](../../marimo/electric/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

The power of the drivetrain in kW, on a scale extending below zero: the green part is
regeneration, and the meter says *REGEN* while the power is negative (EV-003, EV-004).
`ready`: at 0 kW it says *READY*, so that a stopped motor of a vehicle able to move is
not read as off (EV-005).

```python
aa.PowerMeter(-23, min=-60, max=150)
```

**Electric and hybrid** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
