# Tachometer

[![A tachometer at 3200 rpm, red zone from 6000, day theme](../img/widgets/tachometer-light.png#only-light)![A tachometer at 3200 rpm, red zone from 6000, night theme](../img/widgets/tachometer-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

Engine speed in rpm, the scale in thousands.

```python
aa.Tachometer(3200, redline=6000, shift_light=5800)
```

[![Tachometers, day theme](../img/tachometer-light.png#only-light)![Tachometers, night theme](../img/tachometer-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

* `redline` — the start of the red zone (DIAL-102).
* `shift_light` — a lamp lit amber at and above this engine speed (DIAL-103).
* `ready` — hybrid and electric drivetrains: at 0 rpm the dial says *READY*, so that a
  stopped engine of a vehicle able to move is not read as off (DIAL-104).

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
