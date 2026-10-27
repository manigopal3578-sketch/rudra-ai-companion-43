import { createFileRoute } from "@tanstack/react-router";

import { generateImage, imageSettings } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

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
          const upstream = await generateImage({ ...imageSettings, apiKey }, prompt, true, request.signal);
          return new Response(upstream.body, {
            status: upstream.status,
            headers: {
              "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
              "Cache-Control": "no-cache",
            },
          });
        } catch (error) {
          if (request.signal.aborted || (error instanceof Error && error.name === "AbortError")) {
            return new Response(null, { status: 499 });
          }
          throw error;
        }
      },
    },
  },
});
