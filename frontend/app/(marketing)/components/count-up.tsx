"use client";

import { useEffect, useRef, useState } from "react";

type CountUpProps = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

const EASE_OUT_CUBIC = (t: number) => 1 - Math.pow(1 - t, 3);

function formatValue(value: number, suffix?: string) {
  return `${Math.round(value).toLocaleString("es-AR")}${suffix ?? ""}`;
}

/**
 * Counts from 0 to `value` once when scrolled into view.
 * When reduced motion is requested it renders the final value directly
 * (no count-up, no observer).
 */
export function CountUp({
  value,
  suffix,
  duration = 1200,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);
  const [display, setDisplay] = useState<number | null>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? value
      : 0,
  );

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || doneRef.current) return;
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let disposed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const animate = () => {
          const current = requestAnimationFrame((time) => {
            if (disposed) return;
            const progress = Math.min((time - start) / duration, 1);
            setDisplay(EASE_OUT_CUBIC(progress) * value);
            if (progress < 1) animate();
            else doneRef.current = true;
          });
          rafId = current;
        };

        animate();
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {formatValue(display ?? 0, suffix)}
    </span>
  );
}