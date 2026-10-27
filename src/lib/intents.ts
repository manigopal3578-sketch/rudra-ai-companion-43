import { PROPOSABLE_INTENTS, type IntentParams, type IntentProposal, type ParsedReply, type RudraIntentId } from "@/lib/types";

/**
 * The assistant ends a device-action proposal with a single final line:
 *   INTENT:{"intent":"OPEN_APP","params":{"app":"Instagram"}}
 * This parser strips that line from the display/speech text and validates the
 * proposal against the strict intent contract. Unknown or malformed intents
 * are ignored (never executed) — the Android host re-validates everything.
 */

const INTENT_MARKER = /(^|\n)INTENT:\s*(\{[\s\S]*?\})\s*$/;

const TIME_PATTERN = /^([01]?\d|2[0-3]):[0-5]\d$/;

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 120;
}

function validateParams(intent: RudraIntentId, params: IntentParams | undefined): IntentProposal | null {
  const p = params ?? {};
  switch (intent) {
    case "OPEN_APP":
      return nonEmpty(p.app) ? { intent, params: { app: p.app.trim() } } : null;
    case "SET_ALARM":
      return nonEmpty(p.time) && TIME_PATTERN.test(p.time.trim())
        ? { intent, params: { time: p.time.trim(), label: nonEmpty(p.label) ? p.label.trim() : undefined } }
        : null;
    case "FIND_CONTACT":
    case "DIAL_CONTACT":
      return nonEmpty(p.name) ? { intent, params: { name: p.name.trim() } } : null;
    case "CANCEL_ACTION":
      return { intent, params: {} };
    case "GENERATE_AVATAR":
      return { intent, params: { prompt: nonEmpty(p.prompt) ? p.prompt.trim() : undefined } };
    default:
      // ASK_ASSISTANT / UNKNOWN are never executable proposals.
      return null;
  }
}

export function parseReply(raw: string): ParsedReply {
  const text = raw ?? "";
  const match = INTENT_MARKER.exec(text);
  if (!match) {
    return { displayText: text.trim() };
  }

  const displayText = text.slice(0, match.index).trim();
  let proposal: IntentProposal | undefined;
  try {
    const parsed = JSON.parse(match[2]) as { intent?: unknown; params?: IntentParams };
    const intent = parsed.intent as RudraIntentId;
    if (
      typeof intent === "string" &&
      (PROPOSABLE_INTENTS as readonly string[]).includes(intent)
    ) {
      proposal = validateParams(intent, parsed.params) ?? undefined;
    }
  } catch {
    proposal = undefined;
  }
  return { displayText, proposal };
}
