# Speedometer

[![A speedometer at 87.3 km/h, reading 88, with a limit of 90 marked, day theme](../img/widgets/speedometer-light.png#only-light)![A speedometer at 87.3 km/h, reading 88, with a limit of 90 marked, night theme](../img/widgets/speedometer-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

Vehicle speed on a dial, with a digital readout.

```python
aa.Speedometer(87.3, max=220, limit=90)
aa.Speedometer(87.3, unit_system="us")          # 55 mph: km/h in, mph shown
```

[![Speedometers, day theme](../img/speedometer-light.png#only-light)![Speedometers, night theme](../img/speedometer-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

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
    speedometer. See the [safety notice](../safety.md).

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
