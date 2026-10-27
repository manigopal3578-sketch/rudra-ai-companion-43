import type { ChatMessage, ConversationRecord } from "@/lib/types";

/**
 * Local conversation persistence for the web prototype.
 * Everything stays in this browser's localStorage — there is no server-side
 * account or database in the prototype. The Android host will replace this
 * with its own encrypted on-device store.
 */

const CURRENT_KEY = "rudra.current-conversation.v1";
const HISTORY_KEY = "rudra.history.v1";
const MAX_HISTORY = 20;

export function newConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function loadCurrent(): ConversationRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationRecord;
    if (!parsed || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveCurrent(messages: ChatMessage[], id: string): void {
  if (typeof window === "undefined" || messages.length === 0) return;
  const firstUser = messages.find((m) => m.role === "user");
  const record: ConversationRecord = {
    id,
    title: firstUser ? firstUser.content.slice(0, 60) : "Conversation",
    startedAt: firstUser?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    messages,
  };
  try {
    window.localStorage.setItem(CURRENT_KEY, JSON.stringify(record));
  } catch {
    // Storage full: keep the session in memory only.
  }
}

export function clearCurrent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CURRENT_KEY);
  } catch {
    // ignore
  }
}

export function archiveCurrent(saveHistory: boolean): ConversationRecord | null {
  const current = loadCurrent();
  clearCurrent();
  if (!current || current.messages.length === 0) return null;
  if (saveHistory) {
    const history = loadHistory();
    history.unshift(current);
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch {
      // Storage full: drop the archive rather than the live session.
    }
  }
  return current;
}

export function loadHistory(): ConversationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ConversationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistoryList(records: ConversationRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function clearAllLocalData(): void {
  clearCurrent();
  clearHistory();
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("rudra.settings.v1");
    window.localStorage.removeItem("rudra.avatar.v1");
  } catch {
    // ignore
  }
}
