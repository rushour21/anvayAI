import { NextRequest, NextResponse } from "next/server";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { conversation, messages as messagesTable } from "@/db/schema";
import { getAuthUserId } from "@/lib/auth/requireUser";
import { streamChat, type ChatMessage } from "@/lib/ai/openrouter";
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

  let modelStream;
  try {
    modelStream = await streamChat({ messages: chatMessages });
  } catch (err) {
    console.error("OpenRouter request failed:", err);
    const status = err instanceof OpenRouterError ? statusForUpstreamError(err.statusCode) : 500;
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status }
    );
  }

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of modelStream) {
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) {
            fullText += text;
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        console.error("OpenRouter stream failed:", err);
      } finally {
        controller.close();
        if (fullText) {
          await db.insert(messagesTable).values({
            conversationId: id,
            role: "assistant",
            content: fullText,
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
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
