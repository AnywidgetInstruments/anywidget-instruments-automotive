# anywidget-instruments-automotive

Automotive instruments for computational notebooks: speedometer, tachometer, fuel and
temperature gauges, tell-tales, a trip computer display, gear and shift indicators, the
indicators of electric and hybrid drivetrains, and a head-up display mode.

Part of the [anywidget instruments family](https://anywidgetinstruments.github.io/):
the core, the industrial, automotive and aeronautics widget libraries, their
hosts (Python, Julia, Grafana) and their live demos.

A **TypeScript front end first**, built on [anywidget](https://anywidget.dev) and on
[anywidget-instruments](https://github.com/AnywidgetInstruments/anywidget-instruments), whose front
end, [trait contract](https://anywidgetinstruments.github.io/anywidget-instruments-industrial/trait-contract/)
and themes it extends. The front end computes everything a widget shows — unit
conversion included — from a dictionary of traits, so the widgets behave alike in every
host: **Python** (JupyterLab, Jupyter Notebook 7, marimo, VS Code, Google Colab),
**Julia** (KaimonSlate.jl), **Rust** or a plain web page — with no JavaScript toolchain
and no network access at runtime.

!!! info "Status: early implementation"
    Every widget of the [catalog](widgets.md) is written — electric and hybrid
    drivetrains, the `Cluster` and its head-up display mode included — and used from
    Python; click a picture to open it in a notebook. Hosts beyond Python, the
    legibility rules and a first release are next: the [roadmap](roadmap.md) orders
    them, and the [requirements status](requirements-status.md) shows where each
    requirement of the [specification](specification.md) stands.

[![Instrument cluster preview, light theme](img/cluster-preview-light.png#only-light)![Instrument cluster preview, dark theme](img/cluster-preview-dark.png#only-dark)](marimo/cluster_preview/ "Open it in marimo, in your browser")

*The [cluster example](examples.md): one `Cluster` of the widgets of
anywidget-instruments-automotive. The figures are simulated.*

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

## Use

```python
import anywidget_instruments_automotive as aa

speed = aa.Speedometer(0, max=220, unit="km/h")
rpm = aa.Tachometer(0, max=7000, redline=6000)
engine = aa.TellTale("engine", state="off")

aa.Cluster([speed, rpm, engine])
```

* [Widget catalog](widgets.md) — every widget, and the convention it follows
* [Hosts](hosts.md) — Python, a web page, Julia (KaimonSlate.jl), Rust
* [Development](development.md) — building, testing, the trait contract
* [Head-up display mode](hud.md) — mirrored, black, one colour
* [Use with CAN & CANopen Studio](integration.md) — live data from an OBD-II adapter
* [Specification](specification.md) — requirements in EARS notation

## Related projects

| Project | What it is | Documentation |
|---|---|---|
| [anywidget-instruments](https://github.com/AnywidgetInstruments/anywidget-instruments) | Core of the family: base view and class, trait contract, themes, liveness | <https://anywidgetinstruments.github.io/anywidget-instruments/> |
| [anywidget-instruments-industrial](https://github.com/AnywidgetInstruments/anywidget-instruments-industrial) | Instrumentation widgets for notebooks: gauges, tanks, LEDs, switches, charts, alarms, SCADA objects | <https://anywidgetinstruments.github.io/anywidget-instruments-industrial/> |
| [anywidget-instruments-automotive](https://github.com/AnywidgetInstruments/anywidget-instruments-automotive) | Automotive instruments built on anywidget-instruments | <https://anywidgetinstruments.github.io/anywidget-instruments-automotive/> |
| [afm-host-panel](https://github.com/AnywidgetInstruments/afm-host-panel) | Grafana panel plugin that runs anywidget modules, with both libraries built in | <https://anywidgetinstruments.github.io/afm-host-panel/> |
