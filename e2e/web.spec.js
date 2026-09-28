// A web page with no kernel (HOST-005): the widgets bound to plain trait
// dictionaries, in a real browser with the built bundle.
import { expect, test } from "@playwright/test";

const widget = (page, label) => page.locator(".awa-root").filter({ has: page.locator(":scope > .awi-label", { hasText: new RegExp(`^${label}$`) }) }).first();

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/web/");
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
});

test("a speedometer from a trait dictionary rounds up, and follows a value set by the host", async ({ page }) => {
  const speed = page.locator("#speed");
  await expect(speed.locator(".awa-readout")).toHaveText("88");
  await page.evaluate(() => window.awa.set("speed", { value: 120.2 }));
  await expect(speed.locator(".awa-readout")).toHaveText("121");
  await expect(speed.locator(".awa-root")).toHaveClass(/awa-over-limit/);
  await page.evaluate(() => window.awa.set("speed", { unit_system: "us" }));
  await expect(speed.locator(".awa-unit")).toHaveText("mph");
});

test("a rejected trait is shown invalid, not guessed (HOST-004)", async ({ page }) => {
  await page.evaluate(() => window.awa.set("speed", { unit: "°F" }));
  await expect(page.locator("#speed .awa-readout")).toHaveText("INVALID");
});

test("tell-tales take their colour from their function and the lit ones come first", async ({ page }) => {
  const tiles = page.locator("#lamps .awa-tt");
  await expect(tiles).toHaveCount(3);
  await expect(tiles.nth(0)).toHaveClass(/awa-amber/);
  await expect(tiles.nth(0).locator(".awa-sym")).toHaveCSS("color", "rgb(255, 176, 32)");
  await expect(tiles.nth(1)).toHaveClass(/awa-green/);
});

test("a cluster in head-up display mode is mirrored and shows the speed and what is marked hud", async ({ page }) => {
  const cluster = widget(page, "Cluster");
  await expect(cluster.locator(".awa-cell")).toHaveCount(3);
  await page.evaluate(() => window.awa.set("cluster", { hud: true }));
  await expect(cluster.locator(".awa-cell")).toHaveCount(2);
  await expect(cluster.locator(".awa-panel")).toHaveCSS("transform", "matrix(-1, 0, 0, 1, 0, 0)");
  await expect(cluster.locator(".awa-panel")).toHaveCSS("background-color", "rgb(0, 0, 0)");
});

test("nothing is loaded from the network (GEN-005)", async ({ page }) => {
  const outside = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1")) outside.push(r.url());
  });
  await page.reload();
  await expect(page.locator("body")).toHaveAttribute("data-ready", "true");
  expect(outside).toEqual([]);
});
