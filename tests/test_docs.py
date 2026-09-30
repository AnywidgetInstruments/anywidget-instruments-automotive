"""The documentation (DOC-001 .. DOC-005, SPD-004, DIS-004).

The Python examples of the documentation run here, with ``aa`` imported; a block
that only illustrates carries ``<!-- illustration: not run -->`` on the line before.
"""

from __future__ import annotations

import pathlib
import re

import pytest

import anywidget_instruments_automotive as aa

ROOT = pathlib.Path(__file__).parent.parent
DOCS = ROOT / "docs"
WIDGETS = (DOCS / "widgets.md").read_text("utf-8")
BLOCK = re.compile(r"(<!-- illustration: not run -->\n)?```python\n(.*?)```", re.S)
PAGES = sorted([*DOCS.glob("*.md"), *DOCS.glob("widgets/*.md"), ROOT / "README.md"])
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


def _page_of(name: str) -> pathlib.Path:
    """docs/widgets/<page>.md of a widget class: TellTaleCluster -> tell-tale-cluster."""
    slug = re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()
    return DOCS / "widgets" / f"{slug}.md"


def test_the_catalog_gives_every_widget_a_page_with_its_picture_and_an_example() -> None:
    """DOC-001, DOC-005."""
    for name in WIDGET_CLASSES:
        page = _page_of(name)
        assert page.exists(), name
        text = page.read_text("utf-8")
        assert f"aa.{name}(" in text, name
        assert re.search(r"img/[\w/-]+-light\.png#only-light", text), name
        assert f"widgets/{page.stem}.md" in WIDGETS, name
        assert "Planned" not in text and "not written yet" not in text, name


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
    body = _page_of("Speedometer").read_text("utf-8")
    assert "cannot guarantee the accuracy of the value it is given" in body
    assert "does not replace the vehicle's own" in body


def test_pages_are_to_be_configured_and_read_while_stationary() -> None:
    """DIS-004."""
    assert "configure and read the dashboard while stationary" in (DOCS / "safety.md").read_text(
        "utf-8"
    )


def test_every_picture_of_a_widget_opens_a_notebook_that_exists() -> None:
    """A picture is a link to the marimo notebook of what it shows."""
    notebooks = {p.stem for p in (ROOT / "lite" / "marimo").glob("*.py")}
    # pictures of this library's widgets; a picture of another project stays a picture
    ours = re.compile(r"(?:\.\./)?img/((?:widgets/)?[\w-]+)-light\.png#only-light")
    for page in PAGES:
        text = page.read_text("utf-8")
        for target in re.findall(r"\]\((?:\.\./)*marimo/([\w-]+)/", text):
            assert target in notebooks, (page.name, target)
        pictures = [
            p for p in re.findall(r"!\[[^\]]*\]\(" + ours.pattern, text) if "grafana" not in p
        ]
        linked = re.findall(r"\[!\[[^\]]*\]\(" + ours.pattern, text)
        assert sorted(pictures) == sorted(linked), page.name


def test_the_api_reference_documents_every_widget() -> None:
    api = (DOCS / "api.md").read_text("utf-8")
    for name in [*WIDGET_CLASSES, "AutomotiveWidget", "QuantityWidget", "DialWidget"]:
        assert f"::: anywidget_instruments_automotive.{name}\n" in api, name
