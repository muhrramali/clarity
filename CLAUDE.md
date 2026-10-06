# CLAUDE.md — Project Rules for Clarity

> Rules an AI coding agent (or any contributor) MUST follow when working in this repository.

## 1. Stack — do not change

- Next.js 15 (App Router). The local dev container may run a later version (Next 16) — the source must stay forward-compatible. Do not use features removed or renamed in either version.
- TypeScript in **strict** mode. No `any` unless wrapping an untyped third-party call, and even then wrap it behind a Zod parse.
- Tailwind CSS for styling. Use the existing design tokens (`bg-background`, `text-foreground`, `border-border`, `ring-ring`, `text-muted-foreground`, etc.) — do not hardcode hex colors.
- OpenAI SDK (`openai` package) on the server only. **Never** import the OpenAI SDK or read `process.env.OPENAI_API_KEY` from a client component.
- Zod is the single source of truth for request/response shapes. The client and server share the same schemas in `src/lib/openai.ts`.

## 2. File layout — keep it small

```
src/
├── app/                  (routes, layouts, API handlers)
├── components/           (React components — UI only)
├── lib/                  (schemas, AI client, shared utilities)
└── tests/                (Vitest + RTL test files)
```

- New schemas go in `src/lib/openai.ts` (or a sibling lib file). Do not duplicate them in a component.
- New API routes go under `src/app/api/<name>/route.ts`. Always export `runtime = "nodejs"`.
- UI components are pure — they take props and render. State management lives in `ClarityForm` (the single stateful component).

## 3. AI integration rules — strict

- Model: `gpt-4o-mini`. Do not change.
- `response_format: { type: "json_object" }` is **required** on every chat completion.
- The system prompt lives in `src/lib/openai.ts`. If you change it, update the response schema in the same file and the matching Zod schema.
- Always Zod-parse the model's response. If parsing fails, throw a **sanitized** error — never leak the raw JSON.
- Sanitize all upstream errors. The user must never see an API key, request ID, or OpenAI internal message.

## 4. Validation — defense in depth

- Client-side: `ClarityForm` validates input length (10–5000 chars) and disables the submit button when invalid.
- Server-side: `src/app/api/rewrite/route.ts` re-runs the same Zod schema before calling OpenAI. Never trust the client.
- After the network round-trip, the client performs a **shape check** on the response before handing it to React (the API already Zod-validated, but the network is not type-safe).

## 5. Accessibility — non-negotiable

Every interactive element MUST:

- Have a visible `<label htmlFor>` (inputs) or `aria-label` (icon-only buttons).
- Have a visible `:focus-visible` ring (handled by `globals.css`).
- Be reachable by keyboard alone (Tab order, Enter to activate).

Errors MUST:

- Render in a region with `role="alert"`.
- Be linked to the relevant input via `aria-describedby`.
- Be dismissible.

Live regions (character counter, status text) MUST use `aria-live="polite"`.

## 6. Tests — what to test

- `ScoreBadge`: rating thresholds, accessible label, numeric rounding.
- `JargonList`: empty state, populated state, reason rendering, accessible list label.
- Do not test the OpenAI SDK directly — that's a third-party integration. Tests should cover **our** code (Zod schemas, score-to-rating mapping, component rendering).
- Tests run with `npm test` (Vitest + jsdom). Add new tests to `src/tests/` or `tests/`.

## 7. Styling rules

- Use shadcn/ui primitives from `src/components/ui/*` where they already exist.
- Do not introduce indigo or blue as primary colors — the design uses neutral grays with semantic accents (emerald / amber / rose for badge states).
- All layouts must be responsive (mobile-first). Test at 375px, 768px, and 1280px widths.
- Honor `prefers-reduced-motion` (handled globally in `globals.css`).

## 8. Security

- Never log the OpenAI API key or raw request/response bodies.
- Never return raw OpenAI error objects to the client.
- The API route returns 400 for client errors, 502 for upstream failures. No other status codes.
- Rate limiting is intentionally out of scope for this small app — see `DEPLOYMENT_CHECKLIST.md` for production guidance.

## 9. Committing

- Run `npm run lint` before committing.
- Run `npm test` before committing.
- Do not commit `.env`, `.env.local`, or any file containing a real API key.
- Commit messages follow Conventional Commits (e.g. `feat: add jargon reason tooltip`).

## 10. Do not

- ❌ Do not add a database. This app is stateless.
- ❌ Do not add authentication. This app is public.
- ❌ Do not add WebSocket / real-time features. The rewrite is a single request-response cycle.
- ❌ Do not use `getServerSideProps` or the Pages Router — this is App Router only.
- ❌ Do not suppress TypeScript errors with `// @ts-ignore` or `as any`.
- ❌ Do not use emoji in code or commit messages unless the user asks.
