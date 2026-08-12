"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import { BookVisual } from "./book-visual";
import { CountUp } from "./count-up";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const highlights = [
  { value: 48, suffix: " h", label: "Ahorradas por semana en consultas repetitivas" },
  { value: 100, suffix: "%", label: "Respuestas con cita a la normativa" },
  { value: 1, suffix: "", label: "Carpeta por cliente con su historial" },
];

/**
 * Stat band that pins on desktop while the next section scrolls behind it.
 * On mobile / reduced-motion it renders as a plain static grid (no pinning).
 */
export function PinHighlights() {
  const bandRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Desktop only (>=980px) and only when motion is allowed.
    mm.add("(min-width: 980px) and (prefers-reduced-motion: no-preference)", () => {
      const band = bandRef.current;
      if (!band) return;

      ScrollTrigger.create({
        trigger: band,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      });

      gsap.to(band.querySelectorAll("[data-stat]"), {
        y: -6,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.15,
      });

      const book = band.querySelector("[data-book]");
      if (book) {
        gsap.fromTo(
          book,
          { y: 220, opacity: 0, rotate: 8 },
          {
            y: 0,
            opacity: 1,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: band,
              start: "top top",
              end: "+=150%",
              scrub: 0.6,
            },
          },
        );
      }

      const bookScroll = {
        trigger: band,
        start: "top top",
        end: "+=150%",
        scrub: 0.6,
      };

      const halfLeft = band.querySelector("[data-book-half='left']");
      const halfRight = band.querySelector("[data-book-half='right']");
      if (halfLeft) {
        gsap.fromTo(
          halfLeft,
          { rotationY: 84 },
          {
            rotationY: 0,
            ease: "none",
            transformPerspective: 1400,
            scrollTrigger: bookScroll,
          },
        );
      }
      if (halfRight) {
        gsap.fromTo(
          halfRight,
          { rotationY: 84 },
          {
            rotationY: 0,
            ease: "none",
            transformPerspective: 1400,
            scrollTrigger: bookScroll,
          },
        );
      }
    });
  }, { scope: bandRef });

  return (
    <section
      ref={bandRef}
      aria-label="Impacto en horas"
      className="relative z-20 border-y border-border/60 bg-background/95 backdrop-blur"
    >
      <dl className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {highlights.map((item) => (
          <div
            key={item.label}
            data-stat
            className="text-center sm:text-left"
          >
            <dt className="sr-only">{item.label}</dt>
            <dd className="text-3xl font-bold tabular-nums text-primary">
              <CountUp value={item.value} suffix={item.suffix} />
            </dd>
            <dd className="mt-1 text-sm text-muted-foreground">{item.label}</dd>
          </div>
        ))}
      </dl>
      <div
        data-book
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full z-10 flex justify-center"
      >
        <BookVisual className="w-80 sm:w-96" />
      </div>
    </section>
  );
}