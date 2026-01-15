import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SEARCH_INTERNAL =
  process.env.SEARCH_SERVICE_INTERNAL_BASE_URL ?? "http://127.0.0.1:8080";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { courseId, question, topK = 5 } = body ?? {};

    if (!courseId || !question) {
      return NextResponse.json(
        { error: "courseId and question are required" },
        { status: 400 }
      );
    }

    const upstream = await fetch(
      `${SEARCH_INTERNAL}/v1/courses/${encodeURIComponent(courseId)}/documents:ragSearch`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          mode: "lexical",
          page_size: topK,
        }),
        cache: "no-store",
      }
    );

    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Proxy failed" },
      { status: 500 }
    );
  }
}
