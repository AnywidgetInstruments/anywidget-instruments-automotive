# FuelGauge

[![A fuel gauge at 38 %, filler on the right, day theme](../img/widgets/fuel-gauge-light.png#only-light)![A fuel gauge at 38 %, filler on the right, night theme](../img/widgets/fuel-gauge-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

Fuel level from **E** to **F**, in percent of a full tank. The reserve zone (`reserve`,
12 % by default) is amber, and the fuel pump symbol lights amber in it (DIAL-105); it
points to the side of the filler flap given by `filler_side` (DIAL-106).

```python
aa.FuelGauge(8, filler_side="right")     # in the reserve: the pump symbol lit amber
```

[![Fuel and temperature gauges, day theme](../img/gauges-light.png#only-light)![Fuel and temperature gauges, night theme](../img/gauges-dark.png#only-dark)](../../marimo/dials/ "Open it in marimo, in your browser")

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
