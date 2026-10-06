import { ArrowRight } from "lucide-react";

export interface JargonItem {
  term: string;
  simpler: string;
  reason?: string;
}

export interface JargonListProps {
  items: JargonItem[];
  /** Render an empty-state message when there are no items. */
  emptyMessage?: string;
}

export function JargonList({
  items,
  emptyMessage = "No jargon detected. The text is already plain.",
}: JargonListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="jargon-empty">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul
      className="space-y-3"
      aria-label="Jargon replaced with simpler alternatives"
      data-testid="jargon-list"
    >
      {items.map((item, index) => (
        <li
          key={`${item.term}-${index}`}
          className="rounded-lg border border-border bg-card/60 p-3 sm:p-4"
          data-testid="jargon-item"
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span
              className="font-semibold text-foreground line-through decoration-rose-400/70 decoration-2"
              data-testid="jargon-term"
            >
              {item.term}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <span
              className="font-medium text-emerald-700 dark:text-emerald-300"
              data-testid="jargon-simpler"
            >
              {item.simpler}
            </span>
          </div>
          {item.reason && item.reason.trim().length > 0 ? (
            <p
              className="mt-1.5 text-xs text-muted-foreground"
              data-testid="jargon-reason"
            >
              {item.reason}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
