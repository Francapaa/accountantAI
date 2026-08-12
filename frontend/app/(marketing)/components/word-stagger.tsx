"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP);

/**
 * Reveals `[data-word]` spans inside its scope one word at a time with an
 * expo.out stagger. Renders children as-is on SSR / reduced-motion / no-JS so
 * the heading's text (and SEO) is never duplicated or hidden.
 */
export function WordStagger({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const words = scope.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (!words?.length) return;

    const mm = gsap.matchMedia();

    // Opt-in to motion; reduced-motion / no-JS keep the text fully visible.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(
        words,
        { opacity: 0, y: 16, filter: "blur(2px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
          stagger: 0.035,
          ease: "expo.out",
          immediateRender: true,
        },
      );
    });
  }, { scope });

  return (
    <span ref={scope} className="inline">
      {children}
    </span>
  );
}