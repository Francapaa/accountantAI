"use client";

import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

const handleWebVitals: ReportWebVitalsCallback = (metric) => {
  const value = Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value);

  if (typeof window.plausible === "function") {
    window.plausible("web-vitals", {
      props: {
        name: metric.name,
        value,
        rating: metric.rating,
        id: metric.id,
      },
    });
  } else if (process.env.NODE_ENV !== "production") {
    console.info("Web Vital:", metric.name, value, metric.rating);
  }
};

export function WebVitals() {
  useReportWebVitals(handleWebVitals);
  return null;
}