import { envNum } from "./config";

const DEFAULT_THRESHOLDS = {
  http_req_failed: ["rate<0.01"],
  http_req_duration: [
    "p(95)<500",
    "p(99)<1000",
    "max<2000",
  ],
};

export type Options = {
  scenarios: Record<string, unknown>;
  thresholds: Record<string, string[]>;
};

/** Shared-iterations, single-VU smoke preset. */
export function smoke(options: SmokeOptions): Options {
  return {
    scenarios: {
      smoke: {
        executor: "shared-iterations",
        vus: options.vus ?? 1,
        iterations: options.iterations ?? 25,
      },
    },
    thresholds: options.thresholds ?? DEFAULT_THRESHOLDS,
  };
}

export interface SmokeOptions {
  iterations?: number;
  vus?: number;
  thresholds?: Record<string, string[]>;
}

/** Ramping-VUs load preset driven by LOAD_* env vars. */
export function load(options: LoadOptions = {}): Options {
  const start = envNum("LOAD_START_VUS", options.startVus ?? 1);
  const peak = envNum("LOAD_PEAK_VUS", options.peakVus ?? 10);
  const stage = envNum("LOAD_STAGE_S", options.stageS ?? 60);
  const hold = envNum("LOAD_HOLD_S", options.holdS ?? 120);

  return {
    scenarios: {
      ramping_up: {
        executor: "ramping-vus",
        startVUs: 0,
        stages: [
          { duration: `${stage}s`, target: start },
          { duration: `${stage}s`, target: peak },
          { duration: `${hold}s`, target: peak },
          { duration: `${stage}s`, target: 0 },
          { duration: "30s", target: 0 },
        ],
        gracefulRampDown: "30s",
      },
    },
    thresholds: options.thresholds ?? DEFAULT_THRESHOLDS,
  };
}

export interface LoadOptions {
  startVus?: number;
  peakVus?: number;
  stageS?: number;
  holdS?: number;
  thresholds?: Record<string, string[]>;
}

export { DEFAULT_THRESHOLDS };