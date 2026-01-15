"use client";

import { geminiModel } from "@/lib/gemini.client";

type RagResult = {
  id: string;
  title?: string;
  source?: string;
  chunk_index?: number;
  content: string;
  score?: number;
};

type RagResponse = {
  query: string;
  mode: "lexical" | "vector" | "hybrid";
  results: RagResult[];
};

// You should already have a base URL somewhere; if not, add it to .env.local.
// Example: NEXT_PUBLIC_SEARCH_SERVICE_BASE_URL=http://127.0.0.1:8080
const SEARCH_BASE =
  process.env.NEXT_PUBLIC_SEARCH_SERVICE_BASE_URL ?? "http://127.0.0.1:8080";

export async function answerWithRag(params: {
  courseId: string;
  question: string;
  topK?: number;
}) {
  const { courseId, question, topK = 5 } = params;

  const ragResp = await fetch("/api/rag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ courseId, question, topK }),
  });
  

  if (!ragResp.ok) {
    const text = await ragResp.text();
    throw new Error(`ragSearch failed: ${ragResp.status} ${text}`);
  }

  const rag: RagResponse = await ragResp.json();

  const chunks = rag.results ?? [];
  const context = chunks
    .map((c, i) => {
      const label = `SOURCE[${i + 1}] id=${c.id} title=${c.title ?? "n/a"} chunk=${c.chunk_index ?? "n/a"}`;
      return `${label}\n${c.content}`;
    })
    .join("\n\n");

  // 2) Grounding prompt (forces citations)
  const prompt = `You are CourseLLM.
Use ONLY the provided sources to answer.
If the sources do not contain the answer, say you don't know.

Return:
1) Answer (concise)
2) Citations: list SOURCE numbers you used, e.g. [1], [2]

SOURCES:
${context}

QUESTION:
${question}
`;

  // 3) Ask Gemini
  const gen = await geminiModel.generateContent(prompt);
  const answer = gen.response.text();

  return { answer, sources: chunks };
}
