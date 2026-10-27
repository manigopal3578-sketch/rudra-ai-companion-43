import { createFileRoute } from "@tanstack/react-router";
import { streamResponse } from "@lovable.dev/ai-gateway";

import { toErrorResponse } from "@/lib/ai/errors";
import { buildRudraSystemPrompt } from "@/lib/ai/prompt";
import { RUDRA_CHAT_MODEL } from "@/lib/rudra-models";

type IncomingMessage = { role: "user" | "assistant"; content: string };

function toResponsesInput(messages: IncomingMessage[]) {
  return messages.map((message) =>
    message.role === "assistant"
      ? { role: "assistant" as const, content: [{ type: "output_text" as const, text: message.content }] }
      : { role: "user" as const, content: message.content },
  );
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const { messages, language, userName } = (body ?? {}) as {
          messages?: IncomingMessage[];
          language?: string;
          userName?: string;
        };

        if (
          !Array.isArray(messages) ||
          messages.length === 0 ||
          messages.some((m) => (m?.role !== "user" && m?.role !== "assistant") || typeof m?.content !== "string")
        ) {
          return Response.json(
            { error: "A messages array of user/assistant turns with text content is required." },
            { status: 400 },
          );
        }

        const history = messages
          .map((m) => ({ role: m.role, content: m.content }))
          .slice(-40);

        try {
          const stream = await streamResponse(
            {
              model: RUDRA_CHAT_MODEL,
              instructions: buildRudraSystemPrompt({
                language: typeof language === "string" ? language : "auto",
                userName: typeof userName === "string" ? userName.slice(0, 60) : "",
              }),
              input: toResponsesInput(history),
              reasoning: { effort: "medium", summary: "auto" },
              include: ["reasoning.encrypted_content"],
            },
            { signal: request.signal },
          );
          return stream.toResponse({
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (error) {
          return toErrorResponse(error, request.signal);
        }
      },
    },
  },
});
