# Hosts

The widgets are anywidget front-end modules: a host renders them and sets their traits.
Everything a widget shows is computed by the front end from those traits (GEN-004), so a
host needs no code of its own to convert units, round a speed or draw a head-up display.
What a host sets is described by the [trait contract](development.md#the-trait-contract):
`static/contract.json`, shipped in the wheel, lists every trait of every widget, its
type, bounds and default, and every unit name.

| Host | Status | How it is checked |
|---|---|---|
| marimo, with a Python kernel | tested | `e2e/marimo.spec.js`: the cluster example, driven from Python |
| marimo in the browser (WebAssembly) | built with the site | the [cluster example](examples.md) |
| JupyterLite (Pyodide) | built with the site | the tell-tale notebook of the [examples](examples.md) |
| A web page with no kernel | tested | `e2e/web.spec.js`: `examples/web/index.html` |
| JupyterLab 4, Notebook 7 | tested | `e2e/jupyter.spec.js`: widgets rendered and driven from the kernel |
| VS Code, Google Colab | expected | anywidget hosts, as for anywidget-instruments; not covered by automated tests (GEN-009) |
| Julia, [KaimonSlate.jl](https://github.com/kahliburke/KaimonSlate.jl) | expected, front end only | `examples/kaimonslate/drive.jl`, not run in CI |
| Rust, through a web view | documented | below; not built in CI |

## Python

```python
import anywidget_automotives as aa

speed = aa.Speedometer(0, limit=90)
speed.value = 87.3                    # km/h: shows 88
```

A `QuantityWidget` also takes [pint](https://pint.readthedocs.io) quantities for its
value and limits — install the `units` extra — and passes them to the front end as a
number in `input_unit` (UNIT-018):

```python
import pint
u = pint.UnitRegistry()
speed.value = u.Quantity(30, "m/s")   # 108 km/h
```

The kernel announces heartbeats, as anywidget-instruments does: when they stop, every
widget keeps its last value and marks it **stale** (ROB-003).

## A web page, with no kernel

A page that loads `static/index.js` binds each widget to a plain dictionary of traits,
built from the class defaults of `static/contract.json`, and runs the module's
`initialize` and `render`. `examples/web/index.html` does it in forty lines and exposes
what a host drives:

```js
awa.show("speed", "Speedometer", { value: 87.3, limit: 90 });
awa.set("speed", { value: 120, unit_system: "us" });
```

No widget reports a lost kernel there: the stale indication is on only when a host
announces heartbeats.

## Julia: KaimonSlate.jl

[KaimonSlate.jl](https://github.com/kahliburke/KaimonSlate.jl), a reactive Julia
notebook, hosts anywidget front-end modules through its `SlateAFM` extension:
`pypi_afm` installs a Python package, reads each widget's module and trait defaults, and
serves them; nothing Python runs afterwards.

`examples/kaimonslate/drive.jl` drives a `Cluster` from a simulated car. Its speeds are
[DynamicQuantities.jl](https://github.com/SymbolicML/DynamicQuantities.jl) quantities,
passed on as a number and a unit name of the contract (UNIT-018):

<!-- illustration: not run -->
```julia
kmh(v::AbstractQuantity) = ustrip(v) * 3.6   # SI magnitude, m/s, to km/h
item("speedometer"; value = kmh(car.speed), limit = 130)
```

Until the packages are on the package index, install the wheel of anywidget-instruments
with the `pip` KaimonSlate uses, and point `AWA_PACKAGE` at the wheel of
anywidget-automotives. The notebook is not run in continuous integration.

## Rust: a web view (HOST-006)

A Rust application shows the widgets in a web view — [wry](https://github.com/tauri-apps/wry)
or [Tauri](https://tauri.app) — loading a page like `examples/web/index.html`, served
from the application's assets, with `static/index.js`, `index.css` and `contract.json`
next to it. It sets traits by evaluating a call to `awa.set` with the traits as JSON:

<!-- illustration: not run -->
```rust
let traits = serde_json::json!({ "value": speed_kmh, "unit_system": "us" });
webview.evaluate_script(&format!("awa.set('speed', {traits})"))?;
```

Units stay the front end's: send numbers in the widget's `input_unit` and unit names
from the contract; a [uom](https://github.com/iliekturtles/uom) quantity goes through
`.get::<kilometer_per_hour>()` first. The sketch is not built in continuous integration.

## CAN & CANopen Studio

See [Use with CAN & CANopen Studio](integration.md).
