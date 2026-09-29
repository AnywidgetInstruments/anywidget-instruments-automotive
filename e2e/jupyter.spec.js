// The widgets driven by a Python kernel in JupyterLab and Jupyter Notebook 7
// (GEN-009): rendered from the kernel, and following what the kernel sets.
import { expect, test } from "@playwright/test";
import { kernelExec, runNotebook } from "./helpers.js";

const JUPYTER = "http://127.0.0.1:8899";
const root = (page, label) => page.locator(".awa-root").filter({ has: page.locator(":scope > .awi-label", { hasText: new RegExp(`^${label}$`) }) }).first();

test.use({ baseURL: JUPYTER });

test("JupyterLab: the widgets render and follow the kernel", async ({ page }) => {
  await runNotebook(page, "widgets.ipynb");
  const speed = root(page, "E2E speed");
  await expect(speed.locator(".awa-readout")).toHaveText("88", { timeout: 60_000 });

  // the direction indicators side by side at the start of the row (TEL-009)
  const tiles = root(page, "E2E lamps").locator(".awa-tt");
  await expect(tiles.nth(0)).toHaveAttribute("data-function", "turn_left");
  await expect(tiles.nth(1)).toHaveAttribute("data-function", "turn_right");

  // values and traits set from Python, converted and rounded by the front end
  await kernelExec(page, "widgets.ipynb", "speed.value = 120.2");
  await expect(speed.locator(".awa-readout")).toHaveText("121");
  await kernelExec(page, "widgets.ipynb", "speed.unit_system = 'us'");
  await expect(speed.locator(".awa-unit")).toHaveText("mph");

  // a cluster is one widget: it follows the widgets it holds and its own hud
  const cluster = root(page, "E2E cluster");
  await expect(cluster.locator(".awa-cell")).toHaveCount(3);
  await kernelExec(page, "widgets.ipynb", "cluster.children[1].value = 99; cluster.hud = True");
  await expect(cluster.locator(".awa-cell")).toHaveCount(2);
  await expect(cluster.locator(".awa-root.awa-speedometer .awa-readout")).toHaveText("99");
});

test("Notebook 7: the widgets render and follow the kernel", async ({ page }) => {
  for (const s of await (await page.request.get("/api/sessions")).json()) await page.request.delete(`/api/sessions/${s.id}`);
  await page.goto("/notebooks/widgets.ipynb");
  await page.locator(".jp-Notebook").waitFor();
  const select = page.locator(".jp-Dialog").getByRole("button", { name: "Select", exact: true });
  await expect(page.locator(".jp-Notebook-ExecutionIndicator[data-status='idle'], #jp-kernel-status, .jp-KernelStatus").first()).toBeVisible({ timeout: 60_000 });
  const prompts = page.locator(".jp-CodeCell .jp-InputPrompt, .jp-CodeCell .jp-OutputPrompt");
  const started = async () => (await prompts.allTextContents()).some((t) => /\[(\d+|\*)\]/.test(t));
  for (let attempt = 0; attempt < 3 && !(await started()); attempt++) {
    if (await select.isVisible().catch(() => false)) await select.click();
    await page.getByRole("menuitem", { name: "Run", exact: true }).click();
    await page.getByRole("menuitem", { name: "Run All Cells", exact: true }).click();
    await expect.poll(started, { timeout: 10_000 }).toBe(true).catch(() => {});
  }
  const speed = root(page, "E2E speed");
  await expect(speed.locator(".awa-readout")).toHaveText("88", { timeout: 60_000 });
  await kernelExec(page, "widgets.ipynb", "speed.value = 49.2");
  await expect(speed.locator(".awa-readout")).toHaveText("50");
});
