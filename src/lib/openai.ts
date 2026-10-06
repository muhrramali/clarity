import { z } from "zod";

/**
 * Zod schema for the request body sent to /api/rewrite.
 * Mirrored on the client and server so both layers share one source of truth.
 */
export const rewriteRequestSchema = z.object({
  text: z
    .string()
    .min(10, "Text must be at least 10 characters.")
    .max(5000, "Text must be at most 5000 characters."),
});
export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;

/**
 * One jargon entry returned by the model.
 * `reason` is optional because the model may legitimately omit it.
 */
export const jargonItemSchema = z.object({
  term: z.string().min(1).max(200),
  simpler: z.string().min(1).max(200),
  reason: z.string().max(400).optional().or(z.literal("")),
});
export type JargonItem = z.infer<typeof jargonItemSchema>;

/**
 * Full structured response returned by the model.
 * Readability score is clamped to 0–100.
 */
export const rewriteResponseSchema = z.object({
  rewritten: z.string().min(1).max(20000),
  readabilityScore: z.number().min(0).max(100),
  jargon: z.array(jargonItemSchema).default([]),
  summary: z.string().min(1).max(500),
});
export type RewriteResponse = z.infer<typeof rewriteResponseSchema>;

const SYSTEM_PROMPT = `You are Clarity, an expert plain-language editor.
Your job: rewrite the user's text so that an 8th-grade reader can understand it on the first read.

Rules:
1. Preserve all facts, numbers, names, and the original meaning. Do not invent information.
2. Shorten sentences, replace passive voice with active voice, and prefer everyday words.
3. Keep the same tone (formal stays formal, casual stays casual) — only simplify.
4. Return JSON ONLY with EXACTLY this shape:
   {
     "rewritten": "string — the simplified version",
     "readabilityScore": "number 0–100, where 100 = very easy to read",
     "jargon": [
       { "term": "the original phrase", "simpler": "the simpler phrase you used", "reason": "short explanation, optional" }
     ],
     "summary": "one sentence describing the most important change you made"
   }
5. The "jargon" array must include 0–10 items. Only include terms that actually appeared in the input.
6. "summary" must be a single sentence, max ~25 words.
7. Do not include any text outside the JSON object.`;

/**
 * Calls the OpenAI Chat Completions API with a strict JSON response shape,
 * then validates the parsed object with Zod.
 *
 * Throws a sanitized Error (no API keys, no raw upstream payload) on failure.
 */
export async function rewriteForClarity(input: RewriteRequest): Promise<RewriteResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Clarity is not configured. Set OPENAI_API_KEY on the server.");
  }

  // Lazy import so the SDK is never bundled into the client.
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({ apiKey });

  let raw: string;
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input.text },
      ],
    });
    raw = completion.choices?.[0]?.message?.content ?? "";
  } catch (err) {
    // Never leak headers, request IDs, or raw upstream messages to the client.
    const message =
      err instanceof Error && err.message
        ? "The rewrite service is unavailable. Please try again in a moment."
        : "The rewrite service is unavailable. Please try again in a moment.";
    throw new Error(message);
  }

  if (!raw) {
    throw new Error("The model returned an empty response. Please try again.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("The model returned a malformed response. Please try again.");
  }

  const result = rewriteResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("The model returned an unexpected structure. Please try again.");
  }
  return result.data;
}
