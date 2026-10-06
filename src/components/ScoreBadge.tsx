import { cva, type VariantProps } from "class-variance-authority";

const badgeStyles = cva(
  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset transition-colors",
  {
    variants: {
      variant: {
        excellent:
          "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-800",
        good: "bg-lime-50 text-lime-800 ring-lime-200 dark:bg-lime-950/60 dark:text-lime-200 dark:ring-lime-800",
        fair:
          "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:ring-amber-800",
        hard: "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:ring-rose-800",
      },
    },
    defaultVariants: { variant: "fair" },
  },
);

export type Rating = "excellent" | "good" | "fair" | "hard";

const RATING_LABELS: Record<Rating, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  hard: "Hard",
};

const RATING_ARIA: Record<Rating, string> = {
  excellent: "Excellent — very easy to read, 8th grade or below",
  good: "Good — readable, may need a little effort",
  fair: "Fair — somewhat difficult for an 8th-grade reader",
  hard: "Hard — difficult to read, needs simplification",
};

/**
 * Maps a numeric readability score (0–100) to one of four rating buckets.
 * Public so unit tests and the parent page can share the same thresholds.
 */
export function scoreToRating(score: number): Rating {
  if (score >= 85) return "excellent";
  if (score >= 65) return "good";
  if (score >= 40) return "fair";
  return "hard";
}

export interface ScoreBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {
  score: number;
  /** Optional override; otherwise computed from `score`. */
  rating?: Rating;
}

export function ScoreBadge({
  score,
  rating,
  className,
  variant,
  ...rest
}: ScoreBadgeProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const resolvedRating = rating ?? scoreToRating(safeScore);
  const resolvedVariant = (variant ?? resolvedRating) as NonNullable<typeof variant>;

  return (
    <span
      role="status"
      aria-label={`Readability score ${safeScore} out of 100. ${RATING_ARIA[resolvedRating]}`}
      className={badgeStyles({ variant: resolvedVariant, className })}
      {...rest}
    >
      <span aria-hidden="true" className="text-base font-bold tabular-nums">
        {safeScore}
      </span>
      <span aria-hidden="true">/100</span>
      <span aria-hidden="true" className="opacity-50">
        ·
      </span>
      <span aria-hidden="true">{RATING_LABELS[resolvedRating]}</span>
    </span>
  );
}
