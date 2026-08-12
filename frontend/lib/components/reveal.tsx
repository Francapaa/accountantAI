"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ElementType } from "react";

import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  scrub?: boolean;
  as?: "div" | "section" | "li";
};

/**
 * Fades + rises content when it scrolls into view (once), powered by GSAP
 * ScrollTrigger. When prefers-reduced-motion is requested the content stays
 * visible without any tween.
 *
 * With `scrub`, the reveal is linked to scroll position instead: content
 * ascends and fades in in proportion to the scroll, so it emerges from behind
 * pinned sections.
 */
export function Reveal({ children, className, delay = 0, scrub = false, as = "div" }: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = scope.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (scrub) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 48 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
        return;
      }

      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        })
        .fromTo(
          el,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            delay: delay / 1000,
          },
        );
    });
  }, { scope });

  const Tag = as as ElementType;

  return (
    <Tag ref={scope} className={cn(className)}>
      {children}
    </Tag>
  );
}