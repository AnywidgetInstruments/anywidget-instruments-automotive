# Speedometer

!!! info "Planned"
    `Speedometer` is specified but not written yet: this page describes what it will show.

![Preview of Speedometer, light theme](../img/widgets/speedometer-light.png#only-light)
![Preview of Speedometer, dark theme](../img/widgets/speedometer-dark.png#only-dark)

*Preview: an anywidget-instruments [`Gauge`](https://s-celles.github.io/anywidget-instruments/widgets/gauge/), 0 to 200 km/h, as the [cluster preview](../examples.md) draws it — not yet
`Speedometer` itself. Captured from the running preview, in the theme of this page.*

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

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
