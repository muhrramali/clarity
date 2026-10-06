# Clarity

> A small, accessible **Plain Language Rewriter** built with Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, the OpenAI SDK, Zod, and Vitest + React Testing Library.

Paste any dense, technical, or jargon-heavy text. Clarity returns:

1. A **plain-language rewrite** aimed at an 8th-grade reading level.
2. A **readability score** from 0–100 with a colored badge (Excellent / Good / Fair / Hard).
3. A list of **jargon replaced** — each term is shown with its simpler alternative and an optional reason.
4. A **one-sentence summary** of the most important change made.

The AI integration is fully **structured**: the OpenAI response is forced to `json_object` and validated on both the client and server with a shared Zod schema.

---

## Stack

| Layer            | Choice                                   |
| ---------------- | ---------------------------------------- |
| Framework        | Next.js 15 (App Router)                  |
| Language         | TypeScript (strict mode)                 |
| Styling          | Tailwind CSS + shadcn/ui primitives      |
| AI               | `openai` SDK, model `gpt-4o-mini`       |
| Validation       | `zod` on both client and server         |
| Testing          | Vitest + React Testing Library + jsdom   |
| Deployment       | Vercel (Node.js runtime)                |

> **Note on the dev sandbox:** the local dev container currently runs Next.js 16 (the latest version of the framework). The source is compatible with both Next.js 15 and 16 — the App Router APIs, the route handler signature, and the OpenAI integration are identical across both versions.

---

## Getting started

### 1. Install dependencies

```bash
npm install
# or: pnpm install / yarn install / bun install
```

### 2. Configure your OpenAI key

Copy `.env.example` to `.env.local` and fill in your key:

```bash
cp .env.example .env.local
```

```dotenv
OPENAI_API_KEY=sk-your-key-here
```

> The key is read **only on the server** (in `src/app/api/rewrite/route.ts`). It is never bundled into the client.

### 3. Run the dev server

```bash
npm run dev
# open http://localhost:3000
```

### 4. Run the tests

```bash
npm test
# or, in watch mode:
npm run test:watch
```

---

## How it works

```
User types text
     │
     ▼
ClarityForm  ──▶  client-side Zod validation (length, type)
     │  (POST /api/rewrite)
     ▼
route.ts     ──▶  server-side Zod validation (same schema)
     │
     ▼
lib/openai.ts  ──▶  OpenAI Chat Completions
                      · model: gpt-4o-mini
                      · response_format: { type: "json_object" }
                      · temperature: 0.3
     │  (raw JSON string)
     ▼
Zod validates the parsed object against `rewriteResponseSchema`
     │
     ▼
Client receives { rewritten, readabilityScore, jargon[], summary }
```

### The structured response

The system prompt forces the model to return exactly this shape:

```json
{
  "rewritten": "string",
  "readabilityScore": 0-100,
  "jargon": [
    { "term": "string", "simpler": "string", "reason": "string (optional)" }
  ],
  "summary": "string"
}
```

`lib/openai.ts` defines matching Zod schemas (`rewriteRequestSchema`, `rewriteResponseSchema`, `jargonItemSchema`) used by **both** the client and the server.

### Error handling

* Network errors and OpenAI failures are caught and re-thrown as **sanitized** messages.
* The API key and raw OpenAI error objects are **never** exposed to the client.
* The error UI is a dismissible alert with `role="alert"` and `aria-live="assertive"`.

---

## Accessibility (WCAG 2.1 AA)

* Every input has a visible `<label htmlFor>`.
* The character counter is `aria-live="polite"` so screen readers announce updates.
* Errors render in a region with `role="alert"` and are linked to the textarea via `aria-describedby`.
* The submit button exposes `aria-busy` while loading.
* The score badge exposes an `aria-label` that reads the score and rating aloud (e.g. *"Readability score 72 out of 100. Good — readable, may need a little effort"*).
* All interactive elements have visible `:focus-visible` rings (2px ring with offset).
* The page is fully keyboard-navigable: tab order is sensible, the dismiss button is reachable, the Copy button works with Enter.
* `prefers-reduced-motion` is honored (animations and transitions are collapsed to ~0ms).
* Color contrast meets AA: badge colors, muted text, and the primary button all pass on both light and dark themes.

---

## Dark mode

Dark mode is handled with `next-themes` and respects the user's system preference. A toggle in the header lets the user override it. The toggle is hydration-safe (renders a stable placeholder on the server, then resolves the icon after mount).

---

## Project structure

```
clarity/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── .env.example
├── .gitignore
├── LICENSE                (MIT)
├── README.md
├── CLAUDE.md
├── DEPLOYMENT_CHECKLIST.md
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── api/rewrite/route.ts
    ├── components/
    │   ├── ClarityForm.tsx
    │   ├── ScoreBadge.tsx
    │   ├── JargonList.tsx
    │   ├── ThemeToggle.tsx
    │   └── theme-provider.tsx
    ├── lib/
    │   └── openai.ts
    └── tests/
        ├── setup.ts
        ├── ScoreBadge.test.tsx
        └── JargonList.test.tsx
```

---

## Deployment

See [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) for the step-by-step Vercel deployment guide.

---

## License

MIT — see [`LICENSE`](./LICENSE).
