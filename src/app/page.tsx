import { ClarityForm } from "@/components/ClarityForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
              aria-hidden="true"
            >
              <Sparkles className="size-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">
              Clarity
            </span>
            <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">
              Plain Language Rewriter
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Rewrite dense text in plain language.
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Paste any technical, jargon-heavy, or hard-to-read text. Clarity
            rewrites it for an 8th-grade reader, scores the result, and shows
            you exactly which words were swapped for simpler ones.
          </p>
        </div>

        <ClarityForm />
      </main>

      <footer className="mt-auto border-t border-border py-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            Powered by <span className="font-medium">OpenAI</span> · Structured
            output with Zod validation.
          </p>
          <p>MIT Licensed.</p>
        </div>
      </footer>
    </div>
  );
}
