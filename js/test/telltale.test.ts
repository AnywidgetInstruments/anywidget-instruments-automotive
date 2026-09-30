/// <reference types="node" />
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CONTRACTS } from "../src/generated/contract.js";
import { type Lamp, orderLamps } from "../src/widgets/telltale.js";
import { BLINK_HZ, FUNCTIONS } from "../src/widgets/telltales.js";
import { defaults, frame, mount } from "./helpers.js";

const css = readFileSync("js/src/styles.css", "utf8");

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.textContent = "";
});

/** The colour each function is lit in, from its meaning (TEL-001). */
const EXPECTED_COLOUR: Record<string, string> = {
  brake: "red", oil_pressure: "red", coolant_temperature: "red", battery: "red", seat_belt: "red", airbag: "red", door_open: "red", ev_fault: "red",
  engine: "amber", abs: "amber", low_fuel: "amber", tyre_pressure: "amber", stability_control: "amber", glow_plug: "amber", rear_fog: "amber", low_charge: "amber", reduced_power: "amber",
  turn_left: "green", turn_right: "green", low_beam: "green", position_lamps: "green", front_fog: "green", cruise_control: "green", charging: "green", ready: "green",
  high_beam: "blue",
};

const telltale = (traits: Record<string, unknown> = {}) => mount(defaults("TellTale", traits));
const cluster = (traits: Record<string, unknown> = {}) => mount(defaults("TellTaleCluster", traits));
const tile = (el: HTMLElement) => el.querySelector(".awa-tt") as HTMLElement;

describe("functions (TEL-001, TEL-002, QA-002)", () => {
  test("the functions of the schema are exactly the functions the front end draws", () => {
    expect(CONTRACTS.TellTale.traits.function.values).toEqual(Object.keys(FUNCTIONS));
    expect(Object.keys(EXPECTED_COLOUR).sort()).toEqual(Object.keys(FUNCTIONS).sort());
  });

  test.each(Object.entries(EXPECTED_COLOUR))("a lit %s tell-tale is %s, in every theme", async (fn, colour) => {
    expect(FUNCTIONS[fn].colour).toBe(colour);
    for (const theme of ["light", "dark", "system", "auto"]) {
      const w = telltale({ function: fn, value: "on", theme });
      await frame();
      expect(tile(w.el).classList.contains(`awa-${colour}`)).toBe(true);
      for (const other of ["red", "amber", "green", "blue"].filter((c) => c !== colour)) expect(tile(w.el).classList.contains(`awa-${other}`)).toBe(false);
      w.cleanup();
    }
  });

  test("the colour of a lit tell-tale is set by its function alone, not by a theme rule", () => {
    for (const c of ["red", "amber", "green", "blue"]) {
      const rules = css.split("\n").filter((l: string) => l.includes(".awa-tt:") && l.includes(`.awa-${c} {`));
      expect(rules.length).toBe(1);
      expect(rules[0]).not.toMatch(/theme/);
      expect(rules[0]).toContain(`var(--awa-tt-${c})`);
    }
    expect(css).not.toMatch(/awi-theme-(light|dark)[^{]*\{[^}]*--awa-tt-(red|amber|green|blue)/);
  });

  test("the set includes the functions of an electric drivetrain (EV-008)", () => {
    for (const f of ["ready", "charging", "low_charge", "reduced_power", "ev_fault"]) expect(Object.keys(FUNCTIONS)).toContain(f);
  });

  test("every function has a symbol drawn from its own parts", () => {
    for (const f of Object.values(FUNCTIONS)) expect(f.symbol.length).toBeGreaterThan(0);
  });
});

describe("a tell-tale (TEL-003 .. TEL-005, TEL-007)", () => {
  test("shows the name of its function as text, as well as its symbol (TEL-003)", async () => {
    const w = telltale({ function: "oil_pressure", value: "on" });
    await frame();
    expect(w.root.querySelector(".awi-label")!.textContent).toBe("Oil pressure");
    expect(w.body.querySelectorAll(".awa-sym > *").length).toBeGreaterThan(0);
    expect(w.body.getAttribute("aria-label")).toBe("Oil pressure: on");
  });

  test("shows its label in place of the name of the function when one is set", async () => {
    const w = telltale({ function: "engine", value: "off", label: "Check engine" });
    await frame();
    expect(w.root.querySelector(".awi-label")!.textContent).toBe("Check engine");
  });

  test.each(["off", "on", "blinking"])("accepts the state %s (TEL-004)", async (state) => {
    const w = telltale({ function: "abs", value: state });
    await frame();
    expect(tile(w.el).dataset.state).toBe(state);
    expect(w.body.getAttribute("aria-label")).toBe(`ABS: ${state}`);
  });

  test("an unlit tell-tale is drawn in a dim neutral colour, not its own (TEL-005)", async () => {
    const w = telltale({ function: "brake", value: "off" });
    await frame();
    expect(tile(w.el).classList.contains("awa-tt-off")).toBe(true);
    expect(css).toMatch(/\.awa-tt \{[^}]*color: var\(--awa-tt-off\)/);
  });

  test("blinks between 1 and 2 Hz (TEL-007)", async () => {
    expect(BLINK_HZ).toBeGreaterThanOrEqual(1);
    expect(BLINK_HZ).toBeLessThanOrEqual(2);
    const w = telltale({ function: "turn_left", value: "blinking" });
    await frame();
    const period = parseFloat(tile(w.el).style.getPropertyValue("--awa-blink-period"));
    expect(1 / period).toBeGreaterThanOrEqual(1);
    expect(1 / period).toBeLessThanOrEqual(2);
    expect(css).toMatch(/\.awa-tt-blinking \.awa-sym \{ animation: awa-blink var\(--awa-blink-period/);
  });

  test("does not blink under reduced motion, and says it blinks in text (A11Y-002)", () => {
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(reduced).toMatch(/\.awa-tt-blinking \.awa-sym \{ animation: none; \}/);
    expect(reduced).toMatch(/\.awa-tt-blinking \.awa-tt-flag/);
  });

  test("follows the value set by the host, with no other action (API-004)", async () => {
    const w = telltale({ function: "high_beam", value: "off" });
    await frame();
    w.model.set("value", "on");
    await frame();
    expect(tile(w.el).dataset.state).toBe("on");
    expect(tile(w.el).classList.contains("awa-blue")).toBe(true);
  });
});

describe("states of the value (ROB-001, ROB-002, HOST-004)", () => {
  test("a tell-tale that never received a state says so, rather than off (ROB-002)", async () => {
    const w = telltale({ function: "engine" });
    await frame();
    expect(tile(w.el).dataset.state).toBe("missing");
    expect(w.el.querySelector(".awa-tt-flag")!.textContent).toBe("NO VALUE");
    expect(w.body.getAttribute("aria-label")).toBe("Engine: no value");
  });

  test.each([["value", "lit"], ["value", 1], ["function", "warp_drive"], ["max_age", "soon"], ["mode", "control"]])("a %s of %j is shown invalid, not guessed (HOST-004)", async (trait, raw) => {
    const w = telltale({ function: "engine", value: "on", [trait]: raw });
    await frame();
    expect(tile(w.el).dataset.state).toBe("invalid");
    expect(w.el.querySelector(".awa-tt-flag")!.textContent).toBe("INVALID");
    expect(w.root.classList.contains("awa-invalid")).toBe(true);
  });

  test("a value not updated within max_age is shown stale, and live again on the next update (ROB-001)", async () => {
    const w = telltale({ function: "engine", value: "on", max_age: 2 });
    await frame();
    expect(tile(w.el).dataset.state).toBe("on");
    await vi.advanceTimersByTimeAsync(2500);
    expect(tile(w.el).dataset.state).toBe("stale");
    expect(w.body.getAttribute("aria-label")).toBe("Engine: stale");
    // an unchanged value, re-sent by a host that counts its updates
    w.model.set("_value_seq", 1);
    await frame();
    expect(tile(w.el).dataset.state).toBe("on");
  });

  test("without max_age a value never goes stale", async () => {
    const w = telltale({ function: "engine", value: "on" });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(tile(w.el).dataset.state).toBe("on");
  });

  test("keeps its last state, shown stale, when the kernel is lost (ROB-003)", async () => {
    const w = telltale({ function: "engine", value: "on", _session: "k1", _heartbeat: 1 });
    w.model.fireMsg({ type: "hb", session: "k1" });
    await frame();
    expect(w.root.classList.contains("awi-stale")).toBe(false);
    await vi.advanceTimersByTimeAsync(6000);
    expect(w.root.classList.contains("awi-stale")).toBe(true);
    expect(tile(w.el).dataset.state).toBe("on");
  });
});

describe("indicator only (API-002, API-003)", () => {
  test("the mode of every widget is fixed to indicator by the contract", () => {
    for (const c of Object.values(CONTRACTS)) expect(c.traits.mode).toMatchObject({ type: "const", values: ["indicator"], default: "indicator" });
  });

  test("clicks and keys on a widget change nothing", async () => {
    const w = telltale({ function: "engine", value: "on" });
    await frame();
    w.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    w.body.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    w.body.click();
    await frame();
    expect(w.model.saved).toEqual([]);
    expect(w.model.traits.value).toBe("on");
  });
});

describe("a tell-tale cluster (TEL-006, TEL-008, TEL-009)", () => {
  const lamp = (fn: string, state: Lamp["state"]): Lamp => ({ fn: FUNCTIONS[fn], function: fn, state, label: fn });

  test("orders the lit tell-tales red, amber, then green and blue, and the unlit ones after, as given (TEL-006)", () => {
    const order = orderLamps([lamp("high_beam", "on"), lamp("seat_belt", "off"), lamp("engine", "blinking"), lamp("low_beam", "on"), lamp("brake", "on"), lamp("abs", "off"), lamp("oil_pressure", "on")]);
    expect(order.map((l) => l.function)).toEqual(["brake", "oil_pressure", "engine", "low_beam", "high_beam", "seat_belt", "abs"]);
  });

  test.each([
    ["one blinking", "blinking", "off"],
    ["the other blinking", "off", "blinking"],
    ["both, hazard lights", "blinking", "blinking"],
    ["neither", "off", "off"],
  ])("keeps the direction indicators side by side, left before right, at the start of the row: %s (TEL-009)", (_n, left, right) => {
    const order = orderLamps([lamp("brake", "on"), lamp("turn_right", right as Lamp["state"]), lamp("engine", "on"), lamp("low_beam", "off"), lamp("turn_left", left as Lamp["state"])]);
    expect(order.map((l) => l.function).slice(0, 2)).toEqual(["turn_left", "turn_right"]);
    expect(order.map((l) => l.function).slice(2)).toEqual(["brake", "engine", "low_beam"]);
  });

  test("shows a row of tell-tales, each with its name (TEL-008)", async () => {
    const w = cluster({ value: [{ function: "turn_left", state: "off" }, { function: "engine", state: "on" }, { function: "brake", state: "off", label: "Handbrake" }] });
    await frame();
    const tiles = [...w.el.querySelectorAll(".awa-tt")] as HTMLElement[];
    expect(tiles.map((t) => t.querySelector(".awa-tt-name")!.textContent)).toEqual(["Turn left", "Engine", "Handbrake"]);
    expect(tiles.map((t) => t.getAttribute("role"))).toEqual(["listitem", "listitem", "listitem"]);
    expect(w.body.getAttribute("aria-description")).toBe("1 lit of 3");
  });

  test("reorders when a tell-tale lights up", async () => {
    const w = cluster({ value: [{ function: "high_beam", state: "on" }, { function: "brake", state: "off" }] });
    await frame();
    w.model.set("value", [{ function: "high_beam", state: "on" }, { function: "brake", state: "on" }]);
    await frame();
    expect([...w.el.querySelectorAll(".awa-tt")].map((t) => (t as HTMLElement).dataset.function)).toEqual(["brake", "high_beam"]);
  });

  test("shows a rejected item invalid, and the others as they are (HOST-004)", async () => {
    const w = cluster({ value: [{ function: "engine", state: "on" }, { function: "engine", state: "lit" }, { function: "nope", state: "on" }, { function: "abs" }, "abs"] });
    await frame();
    const states = [...w.el.querySelectorAll(".awa-tt")].map((t) => (t as HTMLElement).dataset.state);
    expect(states).toEqual(["on", "invalid", "invalid", "invalid", "invalid"]);
  });

  test("a value that is not a list makes the whole row invalid", async () => {
    const w = cluster({ value: "engine" });
    await frame();
    expect(w.el.querySelector(".awa-row-flag")!.textContent).toBe("INVALID");
  });

  test("an item whose state is null has no state yet (ROB-002)", async () => {
    const w = cluster({ value: [{ function: "engine", state: null }] });
    await frame();
    expect((w.el.querySelector(".awa-tt") as HTMLElement).dataset.state).toBe("missing");
  });
});
