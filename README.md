# anywidget-automotives

Automotive instruments for computational notebooks: speedometer, tachometer, fuel and
temperature gauges, tell-tales, trip computer, gear and shift indicators, and a
head-up display mode.

A **TypeScript front end first**, built on [anywidget](https://anywidget.dev) and on
[anywidget-instruments](https://github.com/s-celles/anywidget-instruments), whose front
end, trait contract and themes it extends. Everything a widget shows, unit conversion
included, is computed in the front end from its traits, so it behaves alike from
**Python**, **Julia** (KaimonSlate.jl), **Rust** or any host that sets those traits.

> **Status: design.** This repository holds the documentation and the specification.
> No widget is implemented yet; every widget in the catalog is *planned*.

> **Safety.** The widgets are for visualization, teaching, simulation and aftermarket
> dashboards. They are **not vehicle instruments**: not type-approved, and they must not
> replace a vehicle's speedometer, odometer or tell-tales. Read the
> [safety notice](docs/safety.md).

## Why a separate library

anywidget-instruments follows industrial conventions (ISA-101, IEC 60073). A vehicle
display follows others: tell-tale colours and symbols from UN Regulation No. 121 and
ISO 2575, legibility from ISO 15008, a speedometer that errs on the high side
(UN Regulation No. 39), and glance-time limits against driver distraction. Those belong
in their own package, one that depends on anywidget-instruments rather than bending it.

## Planned use

```python
import anywidget_automotives as aa

rpm = aa.Tachometer(0, max=7000, redline=6000)
speed = aa.Speedometer(0, max=220, unit="km/h")
engine = aa.TellTale("engine", state="off")

aa.Cluster([speed, rpm, engine], hud=False)
```

## Documentation

Published at <https://s-celles.github.io/anywidget-automotives/>; `mkdocs serve` builds it locally from `docs/`:

* [Widget catalog](docs/widgets.md) — what each planned widget shows and which convention it follows
* [Safety notice](docs/safety.md)
* [Standards and references](docs/standards.md)
* [Head-up display mode](docs/hud.md)
* [Use with CAN & CANopen Studio](docs/integration.md)
* [Specification](docs/specification.md) — requirements in EARS notation
* [Requirements status](docs/requirements-status.md)

## License

BSD 3-Clause, as anywidget-instruments. See [LICENSE](LICENSE).
