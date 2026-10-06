# Deployment Checklist — Clarity on Vercel

A step-by-step guide to take Clarity from local dev to a production URL on Vercel.

---

## 1. Pre-flight (local)

- [ ] `npm run lint` passes with no errors.
- [ ] `npm test` passes (Vitest + React Testing Library).
- [ ] `npm run build` completes without errors.
- [ ] `.env.local` exists locally and contains a valid `OPENAI_API_KEY`.
- [ ] You can complete the full user flow locally: paste text → submit → see rewrite, score, jargon, summary → copy → dismiss error state.
- [ ] No `console.log` of secrets or raw OpenAI responses remains in the codebase.
- [ ] `.gitignore` excludes `.env*` (except `.env.example`).
- [ ] No real API keys are committed to the repository.

## 2. Push to GitHub

- [ ] Repository is initialized: `git init && git add . && git commit -m "feat: initial Clarity app"`.
- [ ] Push to a public or private GitHub repository.

## 3. Create the Vercel project

1. Go to <https://vercel.com/new>.
2. Import the GitHub repository.
3. Vercel auto-detects Next.js — accept the defaults:
   - **Framework preset:** Next.js
   - **Build command:** `next build` (Vercel handles this automatically)
   - **Output directory:** `.next` (auto)
   - **Install command:** `npm install` (auto)
4. Click **Deploy**.

## 4. Configure environment variables

In the Vercel dashboard:

1. Go to **Project Settings → Environment Variables**.
2. Add:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-...` (your real key)
   - **Environments:** Production, Preview, Development (or restrict as needed)
3. Click **Save**.

> ⚠️ **Never** commit `.env.local`. The Vercel dashboard is the only place the production key should live.

## 5. Redeploy

- [ ] Trigger a new deployment (Vercel → Deployments → Redeploy, or push a new commit).
- [ ] Wait for the build to finish.
- [ ] Open the production URL — confirm the page loads, the form is interactive, and the dark-mode toggle works.

## 6. Smoke test on production

Visit the production URL and verify:

- [ ] The page renders without console errors.
- [ ] The character counter updates as you type.
- [ ] The submit button is disabled when the textarea is empty or below 10 chars.
- [ ] Submitting valid text returns a rewrite within ~5 seconds.
- [ ] The readability badge shows a numeric score and a rating label.
- [ ] The jargon list shows term → simpler pairs.
- [ ] The Copy button copies the rewritten text to the clipboard.
- [ ] Dismissing an error works.
- [ ] Dark mode persists across navigation/reload.
- [ ] The layout is responsive on mobile (375px) and desktop (1280px).
- [ ] Lighthouse (Chrome DevTools) scores ≥ 95 on Accessibility.

## 7. Production hardening (recommended, not required for v1)

These are intentionally **out of scope** for the v1 codebase but should be considered for a public launch:

- [ ] **Rate limiting.** Add Vercel KV + Upstash Ratelimit, or use `@vercel/edge` middleware, to cap requests per IP (e.g. 10/minute).
- [ ] **Abuse protection.** Add a CAPTCHA (hCaptcha or Cloudflare Turnstile) on the form if you expect non-trivial traffic.
- [ ] **Cost monitoring.** Set a monthly spend limit in the OpenAI dashboard to avoid runaway bills.
- [ ] **Logging.** Forward sanitized server logs to Vercel Log Drains (e.g. Datadog, Logflare) — never log the API key or raw responses.
- [ ] **Analytics.** Add Vercel Analytics or Plausible to track usage without cookies.
- [ ] **Custom domain.** Point a custom domain at the Vercel project and enable HTTPS (automatic).

## 8. Rollback

If a deploy goes bad:

1. Vercel → Deployments → find the last known-good deployment.
2. Click the `⋯` menu → **Promote to Production**.
3. Confirm the production URL now serves the previous version.

## 9. Tear-down

To remove the project entirely:

1. Vercel → Project Settings → **Delete Project**.
2. Revoke the OpenAI API key at <https://platform.openai.com/api-keys>.
3. Delete the GitHub repository (optional).
