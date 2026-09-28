// The widgets driven by a Python kernel, in marimo (GEN-009): the cluster
// example, its controls changing the traits the binding sets.
import { expect, test } from "@playwright/test";

const URL = "http://127.0.0.1:2719/";

test("the cluster follows the unit system and the head-up display set from Python", async ({ page }) => {
  await page.goto(URL);
  const speed = page.locator(".awa-root.awa-speedometer").first();
  await expect(speed.locator(".awa-readout")).toHaveText("90", { timeout: 60_000 });
  await expect(speed.locator(".awa-unit")).toHaveText("km/h");

  // the unit system: km/h in, mph shown, rounded up after conversion
  await page.getByRole("combobox").selectOption("us");
  await expect(speed.locator(".awa-unit")).toHaveText("mph");
  await expect(speed.locator(".awa-readout")).toHaveText("56");

  // a tell-tale lit from Python moves to the front of its row
  await page.getByRole("switch", { name: "Oil pressure" }).click();
  await expect(page.locator(".awa-telltalecluster .awa-tt").first()).toHaveAttribute("data-function", "oil_pressure");

  // the head-up display: mirrored, and only the speed and what is marked hud
  await page.getByRole("switch", { name: "Head-up display" }).click();
  const cluster = page.locator(".awa-root.awa-cluster").first();
  await expect(cluster).toHaveClass(/awa-hud-on/);
  await expect(cluster.locator(".awa-cell")).toHaveCount(3);
});

test("the drivetrain picked from Python changes the widgets of the cluster (EV)", async ({ page }) => {
  await page.goto(URL);
  const cluster = page.locator(".awa-root.awa-cluster").first();
  await expect(cluster.locator(".awa-root.awa-tachometer")).toHaveCount(1, { timeout: 60_000 });

  await page.getByRole("radio", { name: "electric" }).check();
  await expect(cluster.locator(".awa-root.awa-powermeter")).toHaveCount(1);
  await expect(cluster.locator(".awa-root.awa-stateofchargegauge")).toHaveCount(1);
  await expect(cluster.locator(".awa-root.awa-tachometer")).toHaveCount(0);
  await expect(cluster.locator(".awa-tripcomputer dt").nth(2)).toHaveText("Energy used");

  await page.getByRole("radio", { name: "hybrid" }).check();
  await expect(cluster.locator(".awa-root.awa-powerflow")).toHaveCount(1);
  await expect(cluster.locator(".awa-root.awa-tachometer")).toHaveCount(1);
});
