try; import KaimonSlate; catch; error("This is a Kaimon Slate notebook — running it as plain Julia needs the KaimonSlate runtime in this environment. Add it with `import Pkg; Pkg.add(\"KaimonSlate\")`, or open it in Kaimon Slate."); end; KaimonSlate.standalone!(@__MODULE__; dir=@__DIR__)

#%% md id=intro
@md"""
# A drive — anywidget-instruments-automotive in Julia

An instrument cluster driven by **Julia**: a simulated car accelerates, cruises and brakes, and
the cluster shows its speed, engine speed, fuel, coolant temperature, trip and tell-tales.

The widgets are the front-end modules of the Python package `anywidget-instruments-automotive`, hosted by
the **SlateAFM** extension: no Python kernel runs. Julia sets the traits — numbers in metric
units, unit names from the trait contract — and the front end converts, rounds up the speed and
applies the head-up display mode, as it does for Python. The speeds of the model are
**DynamicQuantities.jl** quantities, passed on as a number and a unit name (UNIT-018).

Not a vehicle instrument: see the safety notice of the documentation.
"""

#%% md id=setup_doc
@md"""
## Setup

`pypi_afm` installs the Python package with the system `pip`, reads each widget's front-end
module and trait defaults, and serves them; nothing Python runs afterwards. Until the packages
are published, install the wheel of anywidget-instruments with that `pip` first, and point
`AWA_PACKAGE` at the wheel of anywidget-instruments-automotive (both are built by the documentation
workflow, or with `python -m build` in each repository).
"""

#%% code id=setup
using SlateAFM
using DynamicQuantities

const AWA = get(ENV, "AWA_PACKAGE", "anywidget-instruments-automotive")
awa(class; traits...) = pypi_afm(AWA; import_as = "anywidget_instruments_automotive", class = class, traits...)

"Current traits of the bound widget `name`, as a plain Dict."
traits(name::Symbol) = Dict{String,Any}(String(k) => v for (k, v) in getfield(@__MODULE__, name))

"Write some traits of the bound widget `name`: the widget redraws, the other traits are kept."
setw!(name::Symbol; kw...) = set_bind(name, merge(traits(name), Dict{String,Any}(String(k) => v for (k, v) in kw)))

"A speed as the contract takes it: a number in km/h (UNIT-018)."
function kmh(v::AbstractQuantity)
    dimension(v) == dimension(u"m/s") || throw(ArgumentError("not a speed: $v"))
    return ustrip(v) * 3.6          # SI magnitude, m/s, to km/h
end

#%% md id=cluster_doc
@md"""
## Cluster

One widget: its `value` is the list of the trait dictionaries of the widgets it holds, each with
its `_kind`. Change `unit_system` to `"us"` or `"imperial"`, or `hud` to `true`, and re-run.
"""

#%% code id=cluster
item(kind; traits...) = Dict{String,Any}("_kind" => "awa-$kind", (String(k) => v for (k, v) in traits)...)

panel(s) = [
    item("tachometer"; value = s.rpm, redline = 6200, shift_light = 5800),
    item("telltalecluster"; hud = true, value = [
        Dict("function" => "low_beam", "state" => "on"),
        Dict("function" => "engine", "state" => "off"),
        Dict("function" => "low_fuel", "state" => s.fuel < 12 ? "on" : "off"),
        Dict("function" => "coolant_temperature", "state" => s.coolant >= 115 ? "on" : "off"),
    ]),
    item("speedometer"; value = kmh(s.speed), limit = 130),
    item("fuelgauge"; value = s.fuel, filler_side = "right"),
    item("temperaturegauge"; value = s.coolant),
    item("tripcomputer"; value = Dict("speed" => kmh(s.speed), "fuel_rate" => s.fuel_rate,
                                      "distance" => s.distance, "fuel_used" => s.fuel_used,
                                      "elapsed" => s.elapsed)),
    item("gearindicator"; value = s.gear, hud = true),
]

@bind cluster awa("Cluster"; unit_system = "metric", hud = false, theme = "system")

#%% md id=model_doc
@md"""
## Model

A deliberately crude car: an acceleration profile, a gearbox with fixed ratios, a fuel rate
rising with engine speed. Enough to move the needles, not a model of any vehicle.
"""

#%% code id=model
mutable struct Car
    speed::typeof(1.0u"m/s")
    rpm::Float64
    gear::String
    fuel::Float64        # percent of a 50 L tank
    coolant::Float64     # °C
    fuel_rate::Float64   # L/h
    distance::Float64    # km
    fuel_used::Float64   # L
    elapsed::Float64     # s
end

const CAR = Car(0.0u"m/s", 800.0, "N", 64.0, 40.0, 0.0, 0.0, 0.0, 0.0)
const TOPS = (5.0u"m/s", 11.0u"m/s", 17.0u"m/s", 23.0u"m/s", 30.0u"m/s", 45.0u"m/s")

"Acceleration of the profile at time `t` (s): away, cruise, brake, stop."
accel(t) = t % 120 < 40 ? 1.2u"m/s^2" : t % 120 < 90 ? 0.0u"m/s^2" : t % 120 < 110 ? -1.5u"m/s^2" : 0.0u"m/s^2"

function tick!(dt = 1.0)
    c = CAR
    c.elapsed += dt
    c.speed = max(0.0u"m/s", c.speed + accel(c.elapsed) * dt * u"s")
    g = findfirst(top -> c.speed < top, TOPS)
    g = something(g, length(TOPS))
    c.gear = c.speed == 0.0u"m/s" ? "N" : string(g)
    c.rpm = c.speed == 0.0u"m/s" ? 800.0 : 1200.0 + 4000.0 * ustrip(c.speed) / ustrip(TOPS[g])
    c.fuel_rate = 0.6 + c.rpm / 1000 * 1.3
    c.distance += kmh(c.speed) * dt / 3600
    c.fuel_used += c.fuel_rate * dt / 3600
    c.fuel = max(0.0, 64.0 - c.fuel_used / 50 * 100)
    c.coolant = min(90.0, c.coolant + 0.5 * dt)
    setw!(:cluster; value = panel(c))
end

#%% md id=run_doc
@md"""
## Run

The drive runs while the button's handler runs; press it again to restart it.
"""

#%% code id=run
@bind run Button("Drive")

#%% code id=loop
@onclick run for _ in 1:600
    tick!()
    pause(1.0)
end
