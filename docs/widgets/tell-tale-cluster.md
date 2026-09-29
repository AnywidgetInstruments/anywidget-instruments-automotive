# TellTaleCluster

[![A row of tell-tales, the direction indicators first, day theme](../img/widgets/tell-tale-cluster-light.png#only-light)![A row of tell-tales, the direction indicators first, night theme](../img/widgets/tell-tale-cluster-dark.png#only-dark)](../../marimo/telltales/ "Open it in marimo, in your browser")

*Click the picture to drive it in a marimo notebook, in your browser.*

A row of tell-tales. The direction indicators come first, side by side, left before
right, whatever their state, so that a blinking arrow stays next to the other
(TEL-009). Then the lit tell-tales, red, then amber, then green and blue; the others
follow in the order given, so that nothing moves among them when one lights up
(TEL-006). Each item is a dict, a `(function, state)` pair or a `TellTale`; `size` is
the size of one tell-tale.

```python
row = aa.TellTaleCluster([("turn_left", "off"), ("low_beam", "on"), ("engine", "on")])
row.set_telltale("turn_left", "blinking")
```

[![A tell-tale cluster, day theme](../img/telltalecluster-light.png#only-light)![A tell-tale cluster, night theme](../img/telltalecluster-dark.png#only-dark)](../../marimo/telltales/ "Open it in marimo, in your browser")

**Tell-tales** · [Widget catalog](../widgets.md) · [Specification](../specification.md) ·
[Safety notice](../safety.md)
