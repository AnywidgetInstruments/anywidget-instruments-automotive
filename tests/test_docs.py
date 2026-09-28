"""The documentation (DOC-001 .. DOC-005, SPD-004, DIS-004).

The Python examples of the documentation run here, with ``aa`` imported; a block
that only illustrates carries ``<!-- illustration: not run -->`` on the line before.
"""

from __future__ import annotations

import pathlib
import re

import pytest

import anywidget_automotives as aa

ROOT = pathlib.Path(__file__).parent.parent
DOCS = ROOT / "docs"
WIDGETS = (DOCS / "widgets.md").read_text("utf-8")
BLOCK = re.compile(r"(<!-- illustration: not run -->\n)?```python\n(.*?)```", re.S)
PAGES = sorted([*DOCS.glob("*.md"), ROOT / "README.md"])
WIDGET_CLASSES = sorted(
    n
    for n, c in vars(aa).items()
    if isinstance(c, type) and issubclass(c, aa.AutomotiveWidget) and c._kind.default_value
)


def _blocks(page: pathlib.Path) -> list[str]:
    return [code for skip, code in BLOCK.findall(page.read_text("utf-8")) if not skip]


@pytest.mark.parametrize("page", PAGES, ids=[p.name for p in PAGES])
def test_the_python_examples_of_the_documentation_run(page: pathlib.Path) -> None:
    """The blocks of a page run in turn, as the cells of a notebook."""
    namespace = {"aa": aa}
    for code in _blocks(page):
        exec(compile(code, str(page), "exec"), namespace)


def test_the_catalog_shows_every_widget_with_an_example() -> None:
    """DOC-001."""
    for name in WIDGET_CLASSES:
        section = WIDGETS.split(f"### `{name}`", 1)
        assert len(section) == 2, name
        body = section[1].split("\n### ", 1)[0]
        assert f"aa.{name}(" in body or f"aa.{name}(" in WIDGETS, name


def test_every_widget_is_pictured_in_the_day_and_the_night_theme() -> None:
    """DOC-005: pictures captured by `npm run images`, referenced by the catalog."""
    preview = (ROOT / "js" / "preview" / "index.html").read_text("utf-8")
    shots = re.findall(r'shot\("([\w-]+)"', preview)
    for shot in shots:
        for theme in ("light", "dark"):
            assert (DOCS / "img" / f"{shot}-{theme}.png").exists(), (shot, theme)
    pictured = set(re.findall(r'show\([^,]+, "(\w+)"', preview))
    pictured |= {"Cluster"} if '"Cluster"' in preview else set()
    assert set(WIDGET_CLASSES) <= pictured, sorted(set(WIDGET_CLASSES) - pictured)
    for shot in shots:
        assert f"img/{shot}-light.png" in "".join(p.read_text("utf-8") for p in PAGES), shot


def test_the_safety_notice_says_the_widgets_are_not_vehicle_instruments() -> None:
    """DOC-002."""
    text = (DOCS / "safety.md").read_text("utf-8")
    assert "Not a vehicle instrument" in text
    assert "must not be used in place of a vehicle's own instruments" in text


def test_the_standards_are_listed_with_a_disclaimer_of_conformity() -> None:
    """DOC-003."""
    text = (DOCS / "standards.md").read_text("utf-8")
    assert "ISO 2575" in text and "UN Regulation No. 121" in text and "ISO 15008" in text
    assert "No claim of conformity" in text


def test_no_page_claims_conformity_with_a_standard() -> None:
    """AGENTS.md: conventions, not conformity (GEN-003 speaks of the AFM, not a standard)."""
    for page in PAGES:
        text = page.read_text("utf-8").lower()
        assert not re.search(r"compliant with (?!the anywidget front-end module)", text), page.name


def test_the_speedometer_is_said_not_to_replace_the_vehicle_s() -> None:
    """SPD-004."""
    body = WIDGETS.split("### `Speedometer`", 1)[1].split("\n### ", 1)[0]
    assert "cannot guarantee the accuracy of the value it is given" in body
    assert "does not replace the vehicle's own" in body


def test_pages_are_to_be_configured_and_read_while_stationary() -> None:
    """DIS-004."""
    assert "configure and read the dashboard while stationary" in (DOCS / "safety.md").read_text(
        "utf-8"
    )
