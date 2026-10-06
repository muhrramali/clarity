import { NextResponse } from "next/server";
import { rewriteRequestSchema, rewriteForClarity } from "@/lib/openai";

export const runtime = "nodejs";
// Always revalidate; never cache a per-user rewrite.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = rewriteRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const message = firstIssue?.message ?? "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const result = await rewriteForClarity(parsed.data);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Something went wrong while rewriting your text.";
    // 502 — upstream/AI failure, but we never expose keys or raw OpenAI errors.
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
