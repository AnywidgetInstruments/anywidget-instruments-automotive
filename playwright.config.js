// End-to-end tests: the built front end in a real browser, in a page with no
// kernel (e2e/web.spec.js) and driven by a Python kernel in marimo
// (e2e/marimo.spec.js). Requires `npm run build`; the marimo tests also the
// Python package installed in the active environment.
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8767",
    trace: "retain-on-failure",
    // the Chromium of the environment, when Playwright's own is not installed
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {},
  },
  webServer: [
    {
      command: "python3 -m http.server 8767 --bind 127.0.0.1",
      stderr: "ignore",
      url: "http://127.0.0.1:8767/examples/web/",
      timeout: 30_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "marimo run --headless --port 2719 --no-token lite/marimo/cluster_preview.py",
      url: "http://127.0.0.1:2719",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
