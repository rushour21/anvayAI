import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { conversation, messages as messagesTable } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import type { ChatMessage } from "@/lib/ai/openrouter";
import { runFinancialAgent, describeError, type AgentEvent } from "@/lib/ai/agent";
import { selectModel } from "@/lib/ai/model-router";
import { isModelMode } from "@/lib/ai/models";
import { OpenRouterError } from "@openrouter/sdk/models/errors";

function statusForUpstreamError(code: number): number {
  if (code === 401 || code === 429 || code === 400) return code;
  return 502;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const convo = await db.query.conversation.findFirst({ where: eq(conversation.id, id) });
  if (!convo || convo.userId !== userId) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Save the user message before calling the model (AGENTS.md Phase 1 §7).
  await db.insert(messagesTable).values({ conversationId: id, role: "user", content });

  const history = await db.query.messages.findMany({
    where: eq(messagesTable.conversationId, id),
    orderBy: asc(messagesTable.createdAt),
  });

  const chatMessages: ChatMessage[] = history.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  // Per-message override (AGENTS.md Phase 2 §8) — falls back to the
  // conversation's stored mode, and never gets written back onto it.
  const effectiveMode = isModelMode(body?.mode) ? body.mode : convo.modelMode;
  const primaryModel = selectModel(effectiveMode, content);

  const generator = runFinancialAgent({
    conversationId: id,
    userId,
    messages: chatMessages,
    model: primaryModel,
  });

  // Drive the first event before responding, so a failure on every candidate
  // model still surfaces as a normal HTTP error status instead of a
  // silently-empty stream.
  let first: IteratorResult<AgentEvent, { modelUsed: string }>;
  try {
    first = await generator.next();
  } catch (err) {
    console.error("Agent run failed:", describeError(err));
    const status = err instanceof OpenRouterError ? statusForUpstreamError(err.statusCode) : 500;
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status }
    );
  }

  const encoder = new TextEncoder();
  let fullText = "";
  let modelUsed = primaryModel;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AgentEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        if (!first.done) {
          if (first.value.type === "text") fullText += first.value.text;
          send(first.value);
        }
        while (true) {
          const next = await generator.next();
          if (next.done) {
            modelUsed = next.value.modelUsed;
            break;
          }
          if (next.value.type === "text") fullText += next.value.text;
          send(next.value);
        }
      } catch (err) {
        console.error("Agent stream failed:", describeError(err));
        // A mid-run failure (e.g. a transient upstream/SDK error on a
        // follow-up turn after a tool already ran) would otherwise leave
        // the client with a stream that just stops — always surface a
        // clean message when no text made it out at all.
        if (!fullText) {
          fullText = "Something went wrong. Please try again.";
          send({ type: "text", text: fullText });
        }
      } finally {
        controller.close();
        if (fullText) {
          await db.insert(messagesTable).values({
            conversationId: id,
            role: "assistant",
            content: fullText,
            modelUsed,
          });
          await db
            .update(conversation)
            .set({ updatedAt: new Date() })
            .where(eq(conversation.id, id));
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}
