import { createFileRoute } from "@tanstack/react-router";
import { generateImageStream } from "@lovable.dev/ai-gateway";

import { toErrorResponse } from "@/lib/ai/errors";
import { RUDRA_IMAGE_MODEL } from "@/lib/rudra-models";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let prompt = "";
        try {
          const body = (await request.json()) as { prompt?: unknown };
          prompt = typeof body.prompt === "string" ? body.prompt : "";
        } catch {
          prompt = "";
        }
        prompt = prompt.trim().slice(0, 2000);
        if (!prompt) {
          return Response.json({ error: "A prompt is required." }, { status: 400 });
        }

        try {
          const stream = await generateImageStream(
            { model: RUDRA_IMAGE_MODEL, prompt, partial_images: 1 },
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
