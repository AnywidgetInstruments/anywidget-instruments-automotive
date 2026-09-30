import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { readTrip } from "../src/core/trip.js";
import { flows, mode, readPowers } from "../src/widgets/powerflow.js";
import { defaults, frame, mount } from "./helpers.js";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.body.textContent = "";
});

async function widget(title: Parameters<typeof defaults>[0], traits: Record<string, unknown> = {}) {
  const w = mount(defaults(title, traits));
  await frame();
  const q = (sel: string) => w.el.querySelector(sel) as HTMLElement;
  return {
    ...w,
    q,
    async push(v: unknown) {
      await vi.advanceTimersByTimeAsync(600);
      w.model.set("value", v);
      await frame();
    },
  };
}

describe("state of charge (EV-001, EV-002)", () => {
  test("shows the charge from 0 to 100 %, with a low zone and the battery symbol lit in it (EV-001)", async () => {
    const w = await widget("StateOfChargeGauge", { value: 64 });
    expect(w.q(".awa-readout").textContent).toBe("64 %");
    expect(w.el.querySelectorAll(".awa-zone-warning").length).toBe(1);
    const battery = w.el.querySelectorAll(".awa-dial-tt")[0];
    expect(battery.classList.contains("awa-amber")).toBe(true);
    expect(battery.classList.contains("awa-lit")).toBe(false);
    await w.push(15);
    expect(battery.classList.contains("awa-lit")).toBe(true);
  });

  test("while charging, shows a charging symbol and says CHARGING (EV-002)", async () => {
    const w = await widget("StateOfChargeGauge", { value: 40, charging: true });
    expect(w.q(".awa-note").textContent).toBe("CHARGING");
    expect(w.el.querySelectorAll(".awa-dial-tt")[1].classList.contains("awa-lit")).toBe(true);
    w.model.set("charging", false);
    await frame();
    expect(w.q(".awa-note").textContent).toBe("");
  });
});

describe("power meter (EV-003 .. EV-005)", () => {
  test("draws a scale below zero, the regeneration zone (EV-003)", async () => {
    const w = await widget("PowerMeter", { value: 20 });
    expect(w.el.querySelectorAll(".awa-zone-charge").length).toBe(1);
    expect([...w.el.querySelectorAll(".awa-tick-label")].map((t) => t.textContent)).toContain("-50");
    expect(w.q(".awa-unit").textContent).toBe("kW");
  });

  test("says REGEN in text while the power is negative (EV-004)", async () => {
    const w = await widget("PowerMeter", { value: 20 });
    expect(w.root.classList.contains("awa-regen")).toBe(false);
    await w.push(-12);
    expect(w.root.classList.contains("awa-regen")).toBe(true);
    expect(w.q(".awa-ready").textContent).toBe("REGEN");
    expect(w.q(".awa-readout").textContent).toBe("-12");
  });

  test("says READY at 0 kW while the vehicle can move, and not otherwise (EV-005)", async () => {
    expect((await widget("PowerMeter", { value: 0, ready: true })).q(".awa-ready").textContent).toBe("READY");
    expect((await widget("PowerMeter", { value: 0 })).q(".awa-ready").style.display).toBe("none");
  });
});

describe("electric trip computer (EV-006)", () => {
  test("shows the energy consumption and the energy used instead of fuel", async () => {
    const w = await widget("TripComputer", { energy: "electric", value: { speed: 100, power: 16, distance: 50, energy_used: 8 } });
    expect([...w.el.querySelectorAll("dt")].map((d) => d.textContent)).toEqual(["Instant", "Average", "Energy used", "Distance", "Time"]);
    expect(w.q("dd[data-key=instant]").textContent).toContain("kWh/100 km");
  });

  test("a regenerating drivetrain reads as regenerating power, not a negative consumption", async () => {
    const w = await widget("TripComputer", { energy: "electric", value: { speed: 60, power: -12.5 } });
    expect(w.q("dd[data-key=instant]").textContent).toBe("12.5kWregenerating");
  });

  test("a fuel economy unit on an electric trip computer is shown invalid (HOST-004)", async () => {
    const w = await widget("TripComputer", { energy: "electric", unit: "mpg (US)", value: { speed: 50, power: 10 } });
    expect(w.q(".awa-state-line").textContent).toBe("INVALID");
  });

  test("power and energy used may be negative; the other figures may not", () => {
    expect(readTrip({ power: -3, energy_used: -0.2 })).toEqual({ power: -3, energy_used: -0.2 });
    expect(readTrip({ distance: -1 })).toBeUndefined();
  });
});

describe("power flow (EV-007)", () => {
  test.each([
    [{ engine: 38, battery: 12, wheels: 50 }, "HYBRID", ["engine>wheels", "battery>wheels"]],
    [{ engine: 0, battery: 18, wheels: 18 }, "EV", ["battery>wheels"]],
    [{ engine: 30, battery: 0, wheels: 30 }, "ENGINE", ["engine>wheels"]],
    [{ engine: 40, battery: -10, wheels: 30 }, "ENGINE + CHARGING", ["engine>wheels", "engine>battery"]],
    [{ engine: 8, battery: -8, wheels: 0 }, "CHARGING", ["engine>battery"]],
    [{ engine: 0, battery: -21, wheels: -21 }, "REGEN", ["wheels>battery"]],
    [{ engine: 0, battery: 0.05, wheels: 0 }, "IDLE", []],
  ])("%j reads %s", (p, m, expected) => {
    const f = flows(p);
    expect(f.map((x) => `${x.from}>${x.to}`)).toEqual(expected);
    expect(mode(f)).toBe(m);
  });

  test("draws the live flows as arrows with a head, and says them in text", async () => {
    const w = await widget("PowerFlow", { value: { engine: 38, battery: 12, wheels: 50 } });
    expect(w.el.querySelectorAll(".awa-flow-arrow.awa-on").length).toBe(2);
    expect(w.el.querySelectorAll(".awa-flow-arrow[marker-end]").length).toBe(2);
    expect(w.q(".awa-flow-mode").textContent).toBe("HYBRID");
    expect(w.q(".awa-flow-text").textContent).toBe("Engine → wheels, Battery → wheels");
    expect(w.body.getAttribute("aria-label")).toBe("Power flow: hybrid; Engine → wheels, Battery → wheels");
  });

  test("a negative engine power is rejected: an engine does not absorb power (HOST-004)", async () => {
    expect(readPowers({ engine: -3 })).toBeUndefined();
    const w = await widget("PowerFlow", { value: { engine: -3 } });
    expect(w.q(".awa-flow-mode").textContent).toBe("INVALID");
  });

  test("with no value says NO VALUE (ROB-002)", async () => {
    expect((await widget("PowerFlow")).q(".awa-flow-mode").textContent).toBe("NO VALUE");
  });
});
