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

function nonEmpty(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 120 ? trimmed : null;
}

function validateParams(intent: RudraIntentId, params: IntentParams | undefined): IntentProposal | null {
  const p = params ?? {};
  switch (intent) {
    case "OPEN_APP": {
      const app = nonEmpty(p.app);
      return app ? { intent, params: { app } } : null;
    }
    case "SET_ALARM": {
      const time = nonEmpty(p.time);
      if (!time || !TIME_PATTERN.test(time)) return null;
      const label = nonEmpty(p.label);
      return label ? { intent, params: { time, label } } : { intent, params: { time } };
    }
    case "FIND_CONTACT":
    case "DIAL_CONTACT": {
      const name = nonEmpty(p.name);
      return name ? { intent, params: { name } } : null;
    }
    case "CANCEL_ACTION":
      return { intent, params: {} };
    case "GENERATE_AVATAR": {
      const prompt = nonEmpty(p.prompt);
      return prompt ? { intent, params: { prompt } } : { intent, params: {} };
    }
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
  const result: ParsedReply = { displayText };
  try {
    const parsed = JSON.parse(match[2] ?? "{}") as { intent?: unknown; params?: IntentParams };
    const intent = parsed.intent;
    if (
      typeof intent === "string" &&
      (PROPOSABLE_INTENTS as readonly string[]).includes(intent)
    ) {
      const proposal = validateParams(intent, parsed.params);
      if (proposal) result.proposal = proposal;
    }
  } catch {
    // Malformed marker: strip the line, never propose.
  }
  return result;
}
