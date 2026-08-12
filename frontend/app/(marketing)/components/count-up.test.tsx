import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CountUp } from "./count-up";

/**
 * Regression: the animation used to reset its baseline every frame because
 * `display` was in the effect deps, freezing the count at tiny eased values
 * (2/4 instead of 48/100) until something else re-triggered it. This drives a
 * controllable rAF that only advances when frames are manually fired.
 */
describe("CountUp regression (multi-frame)", () => {
  const realRaf = globalThis.requestAnimationFrame;
  const realCancel = globalThis.cancelAnimationFrame;

  afterEach(() => {
    vi.stubGlobal("requestAnimationFrame", realRaf);
    vi.stubGlobal("cancelAnimationFrame", realCancel);
  });

  it("progresa hasta el valor final sin resetear su línea de base", () => {
    const queue: FrameRequestCallback[] = [];
    let now = 1000;
    vi.stubGlobal("performance", { now: () => now });
    vi.stubGlobal(
      "requestAnimationFrame",
      ((cb: FrameRequestCallback) => {
        queue.push(cb);
        return queue.length;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());

    render(<CountUp value={100} suffix="%" />);

    // Observer fires + first frame at ~0ms. Then advance in small steps and
    // assert it reaches the final value without ever stalling or re-observing.
    let frames = 0;
    while (queue.length && frames < 200) {
      frames += 1;
      const cb = queue.shift();
      now += 80;
      act(() => cb?.(now));
    }

    const value = screen.getByText("100%");
    expect(value).toBeInTheDocument();
    expect(frames).toBeLessThan(200);
  });

  it("no arranca en 0 con prefers-reduced-motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: true })),
    );
    render(<CountUp value={48} suffix=" h" />);
    expect(screen.getByText("48 h")).toBeInTheDocument();
  });
});