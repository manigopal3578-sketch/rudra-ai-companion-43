import { createServerFn } from "@tanstack/react-start";
import { listModels } from "@lovable.dev/ai-gateway";

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
  try {
    const list = await listModels();
    const ids = (list.data ?? []).map((m) => m.id);
    const probe: ServiceProbe = {
      aiChat: ids.includes(RUDRA_CHAT_MODEL),
      imageGeneration: ids.includes(RUDRA_IMAGE_MODEL),
    };
    if (list.workspace_models && list.workspace_models !== "included") {
      probe.detail = "Only the public model catalog was visible; workspace availability is not confirmed.";
    }
    return probe;
  } catch {
    return {
      aiChat: false,
      imageGeneration: false,
      detail: "Could not reach the AI service. Check the workspace connection and credits.",
    };
  }
});
