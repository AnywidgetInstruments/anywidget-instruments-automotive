// End-to-end tests: the built front end in a real browser, in a page with no
// kernel (e2e/web.spec.js), and driven by a Python kernel in marimo
// (e2e/marimo.spec.js), JupyterLab and Notebook 7 (e2e/jupyter.spec.js).
// Requires `npm run build`, and for the kernels the Python package, marimo,
// jupyterlab and notebook installed in the active environment.
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
      // JupyterLab and Notebook 7 (e2e/jupyter.spec.js), on the notebooks of e2e/notebooks
      command:
        "jupyter lab --no-browser --port 8899 --ServerApp.ip=127.0.0.1 --IdentityProvider.token= --ServerApp.password= --allow-root " +
        "--ServerApp.disable_check_xsrf=True --LabApp.news_url=None --LabApp.user_settings_dir=e2e/lab-settings --notebook-dir=e2e/notebooks",
      url: "http://127.0.0.1:8899/lab",
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
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
