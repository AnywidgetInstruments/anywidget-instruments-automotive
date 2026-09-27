# Head-up display mode

A head-up display (HUD) puts the figures in the driver's line of sight by reflecting a
screen in the windscreen. A phone or a tablet laid flat under the windscreen does the
same, if what it shows is mirrored: the reflection then reads the right way round.

```python
cluster = aa.Cluster([speed, rpm], hud=True)
```

## What the mode changes

| Aspect | Normal | HUD |
|---|---|---|
| Orientation | As drawn | Mirrored left to right (HUD-001) |
| Background | Theme | Black, so that only the figures reflect (HUD-002) |
| Colours | Theme | One bright colour for figures; tell-tale colours kept (HUD-003) |
| Content | All widgets | Speed, and what the page marks as `hud` — a HUD shows little (HUD-004) |
| Motion | Animated needles allowed | No animation: values change in place (HUD-005) |
| Brightness | Theme | A `brightness` trait to lower at night (HUD-006) |

Tell-tales keep their colours in the HUD: a red warning stays red.

## Setting it up

* Park first. Lay the device where it neither slides nor blocks a demisting vent or an
  airbag, then adjust the brightness until the reflection is readable without dazzling.
* A windscreen made for a factory HUD has a wedge-shaped interlayer that avoids a double
  image; an ordinary windscreen shows two faint reflections, one from each face. A
  reflective film removes the second.
* Check that the reflection does not hide the road: it belongs low in the field of view.

See the [safety notice](safety.md).
