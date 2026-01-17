import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Client currently sends { q, courseId, type, topK }
    const q: string = body.q ?? body.query ?? "";
    const courseId: string = body.courseId ?? "";
    const type: string = body.type ?? "all";
    const topK: number = Number(body.topK ?? 5);

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }
    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required (e.g. RAG101 / IR201 / LLM301)" },
        { status: 400 }
      );
    }

    const baseUrl =
        process.env.SEARCH_SERVICE_INTERNAL_BASE_URL?.replace(/\/+$/, "") ||
        process.env.NEXT_PUBLIC_SEARCH_SERVICE_BASE_URL?.replace(/\/+$/, "") ||
        "http://127.0.0.1:8080";

    // Forward auth if present (later you can remove TEST_AUTH_BYPASS and this will matter)
    const authHeader = req.headers.get("authorization");

    const r = await fetch(
      `${baseUrl}/v1/courses/${encodeURIComponent(courseId)}/documents:search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          query: q,
          page_size: Math.min(Math.max(topK, 1), 20),
          mode: "lexical",
        }),
      }
    );

    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json(
        { error: `search-service error ${r.status}`, detail: text },
        { status: 502 }
      );
    }

    const data = await r.json();

    // Map search-service results -> frontend SearchResult shape
    const results = (data.results ?? [])
      .map((x: any) => {
        const inferredType =
          (x?.metadata && (x.metadata.type as string)) || "text";

        return {
          id: x.id,
          title: x.title || x.source || "Untitled",
          courseId: x.course_id,
          type: inferredType,
          url: x.source && typeof x.source === "string" && x.source.startsWith("http") ? x.source : undefined,
          snippet: x.snippet || "",
          score: Number(x.score ?? 0),
        };
      })
      .filter((x: any) => type === "all" || x.type === type);

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Invalid request", detail: String(e?.message ?? e) },
      { status: 400 }
    );
  }
}
