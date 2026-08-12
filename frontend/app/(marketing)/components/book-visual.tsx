import { cn } from "@/lib/utils";

/**
 * Decorative book used as scrub filler behind the stats band. Renders as an
 * open spread split in two 3D halves hinged on the spine: by default (no-JS /
 * reduced-motion) both halves sit nearly perpendicular, so it reads as a
 * closed book; PinHighlights drives `rotationY` down to 0 as the scroll pins,
 * so the book opens in proportion to the scrub. No readable text; hidden from
 * the a11y tree and never receives pointer events.
 */
function BookShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 236" className={cn("block", className)} fill="none">
      {/* Outer covers */}
      <rect x="40" y="52" width="132" height="132" rx="8" fill="oklch(0.45 0.12 235)" />
      <rect x="188" y="52" width="132" height="132" rx="8" fill="oklch(0.45 0.12 235)" />
      <rect
        x="40"
        y="52"
        width="132"
        height="6"
        rx="3"
        fill="oklch(0.55 0.12 250)"
        opacity="0.7"
      />
      <rect
        x="188"
        y="52"
        width="132"
        height="6"
        rx="3"
        fill="oklch(0.55 0.12 250)"
        opacity="0.7"
      />
      {/* Stacked leaves (emerald) */}
      <rect x="45" y="56" width="122" height="114" rx="6" fill="oklch(0.6 0.13 172)" />
      <rect x="46" y="58" width="120" height="112" rx="6" fill="oklch(0.68 0.13 168)" />
      <rect x="193" y="56" width="122" height="114" rx="6" fill="oklch(0.6 0.13 172)" />
      <rect x="194" y="58" width="120" height="112" rx="6" fill="oklch(0.68 0.13 168)" />
      {/* Pages */}
      <rect x="48" y="62" width="116" height="108" rx="6" fill="oklch(0.985 0.005 255)" />
      <rect x="196" y="62" width="116" height="108" rx="6" fill="oklch(0.985 0.005 255)" />
      {/* Abstract text lines — left page */}
      <rect x="60" y="80" width="84" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      <rect x="60" y="93" width="68" height="5" rx="2.5" fill="oklch(0.82 0.015 255)" />
      <rect x="60" y="106" width="90" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      <rect x="60" y="119" width="60" height="5" rx="2.5" fill="oklch(0.78 0.02 255)" />
      <rect x="60" y="132" width="78" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      {/* Abstract text lines — right page */}
      <rect x="208" y="80" width="72" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      <rect x="208" y="93" width="86" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      <rect x="208" y="106" width="58" height="5" rx="2.5" fill="oklch(0.82 0.015 255)" />
      <rect x="208" y="119" width="80" height="5" rx="2.5" fill="oklch(0.76 0.02 255)" />
      <rect x="208" y="132" width="66" height="5" rx="2.5" fill="oklch(0.78 0.02 255)" />
      {/* Highlighted normativa line */}
      <rect
        x="208"
        y="152"
        width="74"
        height="5"
        rx="2.5"
        fill="oklch(0.55 0.12 250)"
        opacity="0.55"
      />
      <rect
        x="208"
        y="163"
        width="50"
        height="4"
        rx="2"
        fill="oklch(0.55 0.12 250)"
        opacity="0.35"
      />
      {/* Chip ARCA/AFIP (decorative tag) */}
      <g transform="rotate(-8 240 160)">
        <rect x="208" y="146" width="64" height="30" rx="8" fill="oklch(0.55 0.12 250)" />
        <circle cx="222" cy="158" r="3.5" fill="oklch(0.985 0.005 255)" opacity="0.9" />
        <rect
          x="230"
          y="154"
          width="32"
          height="4"
          rx="2"
          fill="oklch(0.985 0.005 255)"
          opacity="0.85"
        />
        <rect
          x="230"
          y="163"
          width="24"
          height="3.5"
          rx="1.75"
          fill="oklch(0.985 0.005 255)"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}

/**
 * Fixed furniture of the scene (shadow, spine, valley and bookmark) that does
 * not rotate with the two halves.
 */
function BookFurniture() {
  return (
    <svg viewBox="0 0 360 236" className="block h-full w-full" fill="none">
      <ellipse
        cx="180"
        cy="198"
        rx="134"
        ry="14"
        fill="oklch(0.208 0.042 265.755 / 0.12)"
      />
      {/* Valley between the two pages */}
      <rect x="163" y="54" width="34" height="124" rx="6" fill="oklch(0.32 0.1 244)" />
      {/* Spine */}
      <rect x="176" y="50" width="8" height="136" rx="3" fill="oklch(0.38 0.11 242)" />
      <rect x="178" y="56" width="2" height="124" rx="1" fill="oklch(0.55 0.12 250)" />
      {/* Bookmark ribbon */}
      <path d="M176 176h8v20l-4-4-4 4z" fill="oklch(0.55 0.13 170)" />
      {/* Sparkles */}
      <circle cx="92" cy="40" r="3" fill="oklch(0.55 0.12 250)" opacity="0.4" />
      <circle cx="276" cy="44" r="4" fill="oklch(0.66 0.14 168)" opacity="0.45" />
      <circle cx="308" cy="120" r="2.5" fill="oklch(0.55 0.12 250)" opacity="0.35" />
    </svg>
  );
}

export function BookVisual({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <div
        className="relative aspect-[360/236] w-full"
        style={{ perspective: "1400px" }}
      >
        <div className="absolute inset-0">
          <BookFurniture />
        </div>
        {/* Left half: full spread cropped at the spine (x = 180). */}
        <div
          data-book-half="left"
          className="absolute inset-y-0 left-0 w-1/2 overflow-hidden"
          style={{ transformOrigin: "100% 50%", transform: "rotateY(84deg)" }}
        >
          <BookShape className="absolute top-0 left-0 h-full w-[200%]" />
        </div>
        {/* Right half: full spread cropped at the spine (x = 180). */}
        <div
          data-book-half="right"
          className="absolute inset-y-0 right-0 w-1/2 overflow-hidden"
          style={{ transformOrigin: "0% 50%", transform: "rotateY(84deg)" }}
        >
          <BookShape className="absolute top-0 -left-full h-full w-[200%]" />
        </div>
      </div>
    </div>
  );
}