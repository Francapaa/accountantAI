import { cn } from "@/lib/utils";

type MarqueeItem = {
  id: string;
  label: string;
};

type MarqueeProps = {
  items: MarqueeItem[];
  className?: string;
  itemClassName?: string;
  ariaLabel?: string;
};

function Row({ items, itemClassName }: { items: MarqueeItem[]; itemClassName?: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {items.map((item) => (
        <span
          key={item.id}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-muted-foreground",
            itemClassName,
          )}
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent/70" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/**
 * Infinite horizontal marquee. Content is duplicated for a seamless loop;
 * pauses on hover and respects prefers-reduced-motion.
 */
export function Marquee({ items, className, itemClassName, ariaLabel }: MarqueeProps) {
  const doubled = [...items, ...items];

  return (
    <div
      role={ariaLabel ? "marquee" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        <Row items={doubled} itemClassName={itemClassName} />
        {items.length > 0 ? <Row items={doubled} itemClassName={itemClassName} /> : null}
      </div>
    </div>
  );
}