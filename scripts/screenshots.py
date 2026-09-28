# Captures the documentation images of docs/img/ in the light and the dark colour
# scheme, from the running notebook, so that the site shows what the reader will get.
#
#   pip install marimo playwright anywidget-instruments
#   playwright install chromium
#   python scripts/screenshots.py
from __future__ import annotations

import socket
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "docs" / "img"
NOTEBOOKS = {"cluster-preview": ROOT / "lite" / "marimo" / "cluster_preview.py"}


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def wait_for(url: str, timeout: float = 60) -> None:
    import urllib.request

    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            urllib.request.urlopen(url, timeout=2)
            return
        except OSError:
            time.sleep(0.5)
    raise TimeoutError(url)


def capture(name: str, notebook: Path) -> None:
    port = free_port()
    server = subprocess.Popen(
        [
            sys.executable,
            "-m",
            "marimo",
            "run",
            str(notebook),
            "--headless",
            "--port",
            str(port),
            "--no-token",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        url = f"http://127.0.0.1:{port}/"
        wait_for(url)
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for scheme in ("light", "dark"):
                page = browser.new_page(
                    color_scheme=scheme,
                    viewport={"width": 1100, "height": 900},
                    device_scale_factor=2,
                )
                page.goto(url)
                page.get_by_text("Instant consumption").first.wait_for(timeout=60_000)
                # Light a warning and a function tell-tale, so the picture shows the
                # colours by meaning next to unlit ones. Not the direction indicator:
                # it blinks, and a capture would catch it at random.
                for label in ("Engine (MIL)", "High beam"):
                    page.get_by_role("switch", name=label).click()
                # Widgets animate their needles towards the value; let them settle.
                page.wait_for_timeout(2_500)
                # The cluster is the output of the last cell: the picture is of the
                # instruments, not of the controls that drive them.
                cluster = page.locator(".output-area").last
                out = IMG / f"{name}-{scheme}.png"
                cluster.screenshot(path=out)
                print(out.relative_to(ROOT))
                page.close()
            browser.close()
    finally:
        server.terminate()
        server.wait()


if __name__ == "__main__":
    IMG.mkdir(parents=True, exist_ok=True)
    for name, notebook in NOTEBOOKS.items():
        capture(name, notebook)
