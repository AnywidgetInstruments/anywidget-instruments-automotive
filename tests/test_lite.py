"""The marimo notebooks of the documentation run (DOC-004): each cell, as a script."""

from __future__ import annotations

import pathlib
import subprocess
import sys

import pytest

pytest.importorskip("marimo")

NOTEBOOKS = sorted((pathlib.Path(__file__).parent.parent / "lite" / "marimo").glob("*.py"))


@pytest.mark.parametrize("notebook", NOTEBOOKS, ids=[n.stem for n in NOTEBOOKS])
def test_a_notebook_runs_from_top_to_bottom(notebook: pathlib.Path) -> None:
    run = subprocess.run(
        [sys.executable, str(notebook)], capture_output=True, text=True, timeout=300
    )
    assert run.returncode == 0, run.stderr
    assert "Traceback" not in run.stderr, run.stderr
