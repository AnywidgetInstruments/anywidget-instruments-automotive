"""GEN-006: the library is released under the BSD 3-Clause license."""

from __future__ import annotations

import pathlib
import re

ROOT = pathlib.Path(__file__).parent.parent


def test_the_license_file_is_bsd_3_clause() -> None:
    text = (ROOT / "LICENSE").read_text("utf-8")
    assert "Redistribution and use in source and binary forms" in text
    assert "Neither the name of the copyright holder" in text


def test_the_package_metadata_names_the_same_license() -> None:
    # no tomllib: CPython 3.10 is supported (GEN-007)
    pyproject = (ROOT / "pyproject.toml").read_text("utf-8")
    assert re.search(r'^license = "BSD-3-Clause"$', pyproject, re.M)
    assert '"license": "BSD-3-Clause"' in (ROOT / "package.json").read_text("utf-8")
