import type { GatewayError } from "@lovable.dev/ai-gateway";

/**
 * Maps a failed gateway capability call to an honest HTTP response for the
 * browser. Cancellation from the user's Stop control becomes 499.
 */
export function toErrorResponse(error: unknown, signal: AbortSignal): Response {
  if (signal.aborted) {
    return new Response(null, { status: 499 });
  }
  if (error instanceof Error && (error.name === "AbortError" || error.name === "CancelledError")) {
    return new Response(null, { status: 499 });
  }
  const gatewayError = error as GatewayError | undefined;
  if (gatewayError && typeof gatewayError === "object" && "code" in gatewayError) {
    const status = typeof gatewayError.httpStatus === "number" ? gatewayError.httpStatus : 502;
    const message =
      status === 402
        ? "AI credits for this workspace are used up. Upgrade the workspace plan or top up credits to continue."
        : status === 429
          ? "The AI service is rate limited right now. Please wait a moment and try again."
          : gatewayError.message || "The AI service request failed.";
    return Response.json({ error: message }, { status });
  }
  console.error("Gateway call failed:", error);
  return Response.json({ error: "The AI service request failed." }, { status: 500 });
}
