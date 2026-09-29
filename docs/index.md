# anywidget-automotives

Automotive instruments for computational notebooks: speedometer, tachometer, fuel and
temperature gauges, tell-tales, a trip computer display, gear and shift indicators, and a
head-up display mode.

A **TypeScript front end first**, built on [anywidget](https://anywidget.dev) and on
[anywidget-instruments](https://github.com/s-celles/anywidget-instruments), whose front
end, [trait contract](https://s-celles.github.io/anywidget-instruments/trait-contract/)
and themes it extends. The front end computes everything a widget shows — unit
conversion included — from a dictionary of traits, so the widgets behave alike in every
host: **Python** (JupyterLab, Jupyter Notebook 7, marimo, VS Code, Google Colab),
**Julia** (KaimonSlate.jl), **Rust** or a plain web page — with no JavaScript toolchain
and no network access at runtime.

!!! info "Status: design"
    This site documents the library before it is written. The [catalog](widgets.md)
    describes the planned widgets, the [specification](specification.md) states what they
    shall do, and the [requirements status](requirements-status.md) shows that none is
    implemented yet.

![Instrument cluster preview, light theme](img/cluster-preview-light.png#only-light)
![Instrument cluster preview, dark theme](img/cluster-preview-dark.png#only-dark)

*The [cluster preview](examples.md), composed from anywidget-instruments widgets — not
yet the automotive widgets themselves. The figures are simulated.*

!!! warning "Safety"
    The widgets are for visualization, teaching, simulation and aftermarket dashboards.
    They are **not vehicle instruments**: they are not type-approved, and they must not
    replace a vehicle's speedometer, odometer or tell-tales, nor be operated while
    driving. Read the [safety notice](safety.md) first. The automotive standards that
    inform the design are listed in [Standards and references](standards.md); the library
    does not claim conformity with them.

## Why not anywidget-instruments?

anywidget-instruments speaks the language of process plants: ISA-101 grey-scale
screens, IEC 60073 colours, ISA-18 annunciators. A vehicle display speaks another:

| Concern | Industrial convention | Automotive convention |
|---|---|---|
| Warning colours | IEC 60073 | UN Regulation No. 121 and ISO 2575: red for danger, yellow/amber for warning, green for a function on, blue for high beam |
| Symbols | ISA-5.1 | ISO 2575 tell-tale symbols |
| Speed display | — | UN Regulation No. 39: a speedometer never shows less than the true speed |
| Legibility | WCAG contrast | ISO 15008: character size as a visual angle, day and night luminance |
| Attention | Operator at a console | Driver at the wheel: short glances, few items, no distracting motion |

Those conventions live in their own package, which depends on anywidget-instruments
rather than bending it.

## Planned use

```python
import anywidget_automotives as aa

speed = aa.Speedometer(0, max=220, unit="km/h")
rpm = aa.Tachometer(0, max=7000, redline=6000)
engine = aa.TellTale("engine", state="off")

aa.Cluster([speed, rpm, engine])
```

* [Widget catalog](widgets.md) — every planned widget, and the convention it follows
* [Head-up display mode](hud.md) — mirrored, black, one colour
* [Use with CAN & CANopen Studio](integration.md) — live data from an OBD-II adapter
* [Specification](specification.md) — requirements in EARS notation

## Related projects

| Project | What it is | Documentation |
|---|---|---|
| [anywidget-instruments](https://github.com/s-celles/anywidget-instruments) | Instrumentation widgets for notebooks: gauges, tanks, LEDs, switches, charts, alarms, SCADA objects | <https://s-celles.github.io/anywidget-instruments/> |
| [anywidget-automotives](https://github.com/s-celles/anywidget-automotives) | Automotive instruments built on anywidget-instruments (design stage) | <https://s-celles.github.io/anywidget-automotives/> |
| [afm-host-panel](https://github.com/s-celles/afm-host-panel) | Grafana panel plugin that runs anywidget modules, with both libraries built in | <https://s-celles.github.io/afm-host-panel/> |
