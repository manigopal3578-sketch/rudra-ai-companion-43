import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";

import { createResponsesCall } from "@/lib/ai/responses";
import { buildRudraSystemPrompt, RUDRA_MODEL } from "@/lib/ai/prompt";

const GATEWAY_URL = "https://ai.gateway.lovable.dev";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "The AI service is not configured on this server." },
            { status: 500 },
          );
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const { messages, language, userName } = (body ?? {}) as {
          messages?: UIMessage[];
          language?: string;
          userName?: string;
        };

        if (!Array.isArray(messages) || messages.length === 0) {
          return Response.json({ error: "A non-empty messages array is required." }, { status: 400 });
        }

        const modelMessages = await convertToModelMessages(messages);
        const { result, response } = createResponsesCall(
          request,
          { baseURL: GATEWAY_URL, apiKey, model: RUDRA_MODEL },
          modelMessages,
          buildRudraSystemPrompt({
            language: typeof language === "string" ? language : "auto",
            userName: typeof userName === "string" ? userName.slice(0, 60) : "",
          }),
          { originalMessages: messages },
        );

        return response();
      },
    },
  },
});
