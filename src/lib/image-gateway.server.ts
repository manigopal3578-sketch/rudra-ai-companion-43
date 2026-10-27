/**
 * Server-only image generation helper for RUDRA Avatar Studio.
 * Uses the workspace default image model in the `openai` request format,
 * streamed as SSE and forwarded untouched to the browser.
 */

export type ImageConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  format: "openai";
};

export const imageSettings: Omit<ImageConfig, "apiKey"> = {
  baseURL: "https://ai.gateway.lovable.dev",
  model: RUDRA_IMAGE_MODEL,
  format: "openai",
};

export function generateImage(
  config: ImageConfig,
  prompt: string,
  stream = true,
  signal?: AbortSignal,
): Promise<Response> {
  const input: Record<string, unknown> = stream ? { prompt, partial_images: 1 } : { prompt };
  return fetch(`${config.baseURL}/v1/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, ...input, ...(stream ? { stream: true } : {}) }),
    signal: signal ?? null,
  });
}
