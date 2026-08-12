"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  ease?: string;
  from?: "start" | "center" | "end";
  /**
   * Targets `[data-draw-line]` inside the scope and animates scaleX 0 → 1 as
   * the section scrolls in (used by HowItWorks connector).
   */
  drawLine?: boolean;
};

/**
 * ScrollTrigger wave-stagger over direct grid children. Respects reduced
 * motion via matchMedia (content stays visible without tweens).
 */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  ease = "back.out(1.4)",
  from = "start",
  drawLine = false,
}: StaggerProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = scope.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    // Opt-in to motion; reduced-motion / no-JS stay visible.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const items = Array.from(el.children).filter(
        (child) => child instanceof HTMLElement && !child.hasAttribute("data-draw-line"),
      );
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease,
            stagger: { each: stagger, from },
            scrollTrigger: { trigger: el, start: "top 82%", once: true },
          },
        );
      }

      if (drawLine) {
        const line = el.querySelector<HTMLElement>("[data-draw-line]");
        if (line) {
          gsap.fromTo(
            line,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.1,
              ease: "power2.inOut",
              scrollTrigger: { trigger: line, start: "top 85%", once: true },
            },
          );
        }
      }
    });
  }, { scope });

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}