"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2, Sparkles, Clipboard, ClipboardCheck, X } from "lucide-react";
import { ScoreBadge } from "./ScoreBadge";
import { JargonList, type JargonItem } from "./JargonList";
import { rewriteRequestSchema } from "@/lib/openai";

const MIN_LENGTH = 10;
const MAX_LENGTH = 5000;

type Status = "idle" | "loading" | "success" | "error";

interface SuccessResult {
  rewritten: string;
  readabilityScore: number;
  jargon: JargonItem[];
  summary: string;
}

export function ClarityForm() {
  const textareaId = useId();
  const charCountId = useId();
  const errorRegionId = useId();
  const successRegionId = useId();

  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Live client-side validation (mirrors the server schema).
  const trimmed = text.trim();
  const clientError =
    trimmed.length === 0
      ? null
      : trimmed.length < MIN_LENGTH
        ? `Text must be at least ${MIN_LENGTH} characters.`
        : trimmed.length > MAX_LENGTH
          ? `Text must be at most ${MAX_LENGTH} characters.`
          : null;

  const charCount = text.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const canSubmit =
    status !== "loading" && trimmed.length >= MIN_LENGTH && !clientError && !isOverLimit;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("loading");
    setError(null);
    setResult(null);
    setCopied(false);

    // Re-validate on the client before the network round-trip.
    const parsed = rewriteRequestSchema.safeParse({ text: trimmed });
    if (!parsed.success) {
      setStatus("error");
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Something went wrong while rewriting your text.";
        setStatus("error");
        setError(message);
        return;
      }

      // Trust-but-verify: the API already Zod-validated, but the network is
      // not type-safe. Be defensive about the shape we hand to React.
      if (
        typeof data !== "object" ||
        data === null ||
        typeof (data as Record<string, unknown>).rewritten !== "string" ||
        typeof (data as Record<string, unknown>).readabilityScore !== "number" ||
        typeof (data as Record<string, unknown>).summary !== "string" ||
        !Array.isArray((data as Record<string, unknown>).jargon)
      ) {
        setStatus("error");
        setError("Received an unexpected response. Please try again.");
        return;
      }

      const payload = data as SuccessResult;
      setResult(payload);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Network error. Please check your connection and try again.");
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.rewritten);
      setCopied(true);
      // Reset the icon after a short delay.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked (e.g. insecure context). Fall back silently.
      setCopied(false);
    }
  }

  function dismissError() {
    setError(null);
    setStatus("idle");
  }

  const charCountColor = isOverLimit
    ? "text-rose-600 dark:text-rose-400"
    : charCount > MAX_LENGTH * 0.9
      ? "text-amber-600 dark:text-amber-400"
      : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-describedby={`${errorRegionId} ${successRegionId}`}
        className="space-y-4"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-foreground"
            >
              Your text
            </label>
            <span
              id={charCountId}
              aria-live="polite"
              className={`text-xs tabular-nums ${charCountColor}`}
            >
              {charCount.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
            </span>
          </div>
          <textarea
            id={textareaId}
            name="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste dense, technical, or jargon-heavy text here…"
            aria-required="true"
            aria-describedby={`${charCountId} ${errorRegionId}`}
            aria-invalid={Boolean(clientError) || isOverLimit}
            rows={8}
            className="block w-full resize-y rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm leading-relaxed shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
          />
          {clientError && !isOverLimit ? (
            <p className="text-xs text-rose-600 dark:text-rose-400" role="note">
              {clientError}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          aria-busy={status === "loading"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <span>Rewriting…</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden="true" />
              <span>Rewrite for clarity</span>
            </>
          )}
        </button>
      </form>

      {/* Error region: live and assertable */}
      <div
        id={errorRegionId}
        role={error ? "alert" : undefined}
        aria-live={error ? "assertive" : "polite"}
        className="space-y-2"
      >
        {error ? (
          <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            <p className="flex-1" data-testid="error-message">
              {error}
            </p>
            <button
              type="button"
              onClick={dismissError}
              aria-label="Dismiss error"
              className="rounded p-1 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:bg-rose-900"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Success region */}
      <div
        id={successRegionId}
        aria-live="polite"
        aria-busy={status === "loading"}
        className="space-y-5"
      >
        {status === "loading" ? (
          <div
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground"
            data-testid="loading-state"
          >
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            <span>Rewriting your text for an 8th-grade reader…</span>
          </div>
        ) : null}

        {status === "success" && result ? (
          <SuccessView
            result={result}
            copied={copied}
            onCopy={handleCopy}
          />
        ) : null}
      </div>
    </div>
  );
}

function SuccessView({
  result,
  copied,
  onCopy,
}: {
  result: SuccessResult;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <section
      className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6"
      data-testid="success-view"
      aria-label="Rewrite result"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Rewritten text</h2>
        <ScoreBadge score={result.readabilityScore} />
      </div>

      <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
        {result.rewritten}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onCopy}
          aria-label={copied ? "Copied" : "Copy rewritten text"}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {copied ? (
            <>
              <ClipboardCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Clipboard className="size-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground">
          {result.summary}
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="text-sm font-semibold text-foreground">
          Jargon replaced
        </h3>
        <JargonList items={result.jargon} />
      </div>
    </section>
  );
}
