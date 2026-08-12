import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// GSAP uses its own ticker (requestAnimationFrame loop); run it as a no-op in
// jsdom so mounted Reveal/pin components don't recurse against the rAF stub.
const noop = () => {};
const tweenMock = Object.assign(noop, {
  fromTo: noop,
  to: noop,
  from: noop,
  set: noop,
  add: noop,
  stagger: noop,
  delay: noop,
  duration: noop,
  ease: noop,
  kill: noop,
  scrollTrigger: {},
});
const gsapMock = Object.assign(noop, {
  registerPlugin: noop,
  timeline: () => tweenMock,
  fromTo: noop,
  from: noop,
  to: noop,
  set: noop,
  matchMedia: () => ({ add: noop, revert: noop }),
  ticker: { add: noop, remove: noop },
  utils: { wrap: (v: unknown) => () => v },
});

vi.mock("@gsap/react", () => ({
  useGSAP: (
    callback: (context: unknown, contextSafe?: unknown) => unknown,
    deps: { scope?: { current: unknown | null }; dependencies?: unknown[] } = {},
  ) => {
    callback?.({}, {});
    return deps;
  },
}));

vi.mock("gsap", () => ({
  __esModule: true,
  default: gsapMock,
  gsap: gsapMock,
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    create: () => ({ kill: noop }),
    refresh: noop,
    kill: noop,
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// jsdom lacks these browser primitives used by Reveal/CountUp.
class IntersectionObserverMock {
  private cb: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }

  observe(_target: Element) {
    void _target;
    this.cb(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })),
);

let rafId = 0;
vi.stubGlobal(
  "requestAnimationFrame",
  vi.fn((cb: FrameRequestCallback) => {
    rafId += 1;
    // Advance well past any CountUp duration so a single frame completes.
    cb(performance.now() + 6000);
    return rafId;
  }),
);
vi.stubGlobal("cancelAnimationFrame", vi.fn(() => {}));

afterEach(() => {
  rafId = 0;
  vi.useRealTimers();
});