# Tachometer

!!! info "Planned"
    `Tachometer` is specified but not written yet: this page describes what it will show.

![Preview of Tachometer, light theme](../img/widgets/tachometer-light.png#only-light)
![Preview of Tachometer, dark theme](../img/widgets/tachometer-dark.png#only-dark)

*Preview: an anywidget-instruments [`Gauge`](https://s-celles.github.io/anywidget-instruments/widgets/gauge/) with an amber and a red zone, as the [cluster preview](../examples.md) draws it — not yet
`Tachometer` itself. Captured from the running preview, in the theme of this page.*

Engine speed, in rpm or thousands of rpm.

* `redline`: the start of the red zone.
* `shift_light`: a light that comes on at a chosen engine speed.
* Hybrid and electric drivetrains: a `ready` state shown when the engine is stopped but
  the vehicle can move, so that 0 rpm is not read as "off".

**Dials** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
