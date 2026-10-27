import { createServerFn } from "@tanstack/react-start";

import { RUDRA_CHAT_MODEL, RUDRA_IMAGE_MODEL } from "@/lib/rudra-models";

export type ServiceProbe = {
  aiChat: boolean;
  imageGeneration: boolean;
  detail?: string;
};

/**
 * Live capability probe used for the honest availability indicator in the
 * header and the "Connected services" list in Settings. Runs server-side so
 * the gateway key never reaches the browser.
 */
export const probeServices = createServerFn({ method: "GET" }).handler(async (): Promise<ServiceProbe> => {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return { aiChat: false, imageGeneration: false, detail: "The AI service key is not configured." };
  }
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      return {
        aiChat: false,
        imageGeneration: false,
        detail: `The AI service is unavailable right now (status ${res.status}).`,
      };
    }
    const json = (await res.json()) as { data?: { id?: string }[] };
    const ids = (json.data ?? []).map((m) => m.id ?? "");
    return {
      aiChat: ids.includes(RUDRA_CHAT_MODEL) || ids.some((id) => id.startsWith("openai/")),
      imageGeneration: ids.includes(RUDRA_IMAGE_MODEL),
    };
  } catch {
    return { aiChat: false, imageGeneration: false, detail: "Could not reach the AI service." };
  }
});
