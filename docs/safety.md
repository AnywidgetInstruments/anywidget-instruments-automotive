# Safety notice

!!! danger "Not a vehicle instrument"
    anywidget-instruments-automotive is a library for **visualization, teaching, simulation and
    aftermarket dashboards in notebooks**. Its widgets are not type-approved vehicle
    components, are not designed or verified according to automotive functional safety
    (ISO 26262), and **must not be used in place of a vehicle's own instruments**.

## It does not replace the vehicle's instruments

A vehicle's speedometer, odometer and tell-tales are regulated equipment: their accuracy,
symbols and colours are part of the vehicle's type approval (for example UN Regulations
No. 39 and No. 121 in the countries that apply them). A widget drawing a speedometer or
an engine warning light is none of that:

* the driver must keep relying on the vehicle's own speedometer and warning lights;
* a `TellTale` showing "off" does not mean the vehicle has no fault: it means the code
  feeding it did not report one;
* the tell-tale symbols are original drawings modelled on the meaning of the ISO 2575
  symbols, not the symbols of the standard, and the function a colour is given for is
  the library's choice: a vehicle's own tell-tale may look different or take another
  colour;
* a `Speedometer` is only as right as the value it is given. Values read over OBD-II
  arrive late — a request and its answer take tens to hundreds of milliseconds, and an
  adapter polls several parameters in turn — and can be wrong or stale.

## Driver distraction

Looking at a screen while driving is dangerous, and in many countries using a handheld
device while driving is an offence.

* **Set up, configure and read the dashboard while stationary.** The widgets offer no
  interaction meant to be performed while driving.
* A passenger, not the driver, operates the notebook.
* Mount any device so that it does not obstruct the driver's view of the road nor the
  vehicle's own instruments, and so that it cannot become a projectile in a collision
  or interfere with an airbag.

The design limits on the number of items and on motion (see
[Standards and references](standards.md)) reduce the attention a page demands; they do
not make it safe to use while driving.

## Head-up display mode

The [HUD mode](hud.md) mirrors a page for a reflection in the windscreen. A phone or
tablet laid on the dashboard:

* can dazzle at night or produce a double image; lower its brightness and check the
  reflection before driving;
* must not slide, block air vents meant to demist the windscreen, or sit where an airbag
  deploys.

## Limits of a notebook environment

A notebook is not a real-time system. The kernel, the browser, the host or the link to
the vehicle can freeze, restart or disconnect; displayed values can then be delayed or
stale. A widget shows when its value is stale (see the specification), which reduces
the risk of trusting an old figure but does not remove it.

## Connecting to a vehicle

Reading a vehicle's data is outside the scope of the library: the values come from the
code that feeds the widgets, such as [CAN & CANopen Studio](integration.md). Whoever
connects a vehicle is responsible for doing so read-only unless they know what a write
does, and for complying with the regulations that apply to them.

## No warranty

The library is distributed under the BSD 3-Clause license, "as is", without warranty of
any kind (see the `LICENSE` file). The standards cited in
this notice are listed with their disclaimer in [Standards and references](standards.md).
