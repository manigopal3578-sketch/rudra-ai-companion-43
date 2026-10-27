import { useCallback, useRef, useState } from "react";
import { createParser } from "eventsource-parser";

import { parseReply } from "@/lib/intents";
import { playBlip } from "@/lib/sound";
import type { ChatMessage } from "@/lib/types";

/**
 * Client transport for /api/chat (gateway SSE forwarded by the server route).
 * Streams text deltas, parses the device-action INTENT marker out of the
 * final message, and keeps message state for the conversation screens.
 */

export type ChatStatus = "idle" | "submitted" | "streaming" | "error";

let nextId = 0;
function makeId(prefix: string): string {
  nextId += 1;
  return `${prefix}_${Date.now()}_${nextId}`;
}

export type RudraChat = {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  send: (text: string) => void;
  stop: () => void;
  setMessages: (messages: ChatMessage[]) => void;
  dismissError: () => void;
};

export function useRudraChat(options: { language: string; userName: string; soundEffects: boolean }): RudraChat {
  const { language, userName, soundEffects } = options;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: ChatMessage = { id: makeId("u"), role: "user", content: trimmed, createdAt: Date.now() };
    const assistantId = makeId("a");
    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "", createdAt: Date.now() },
    ]);
    setStatus("submitted");
    setError(null);
    playBlip("send", optionsRef.current.soundEffects);

    const history = [...messagesRef.current, userMessage].map((m) => ({ role: m.role, content: m.content }));

    void (async () => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history,
            language: optionsRef.current.language,
            userName: optionsRef.current.userName,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let message = `The assistant could not be reached (status ${res.status}).`;
          try {
            const json = (await res.json()) as { error?: string };
            if (json.error) message = json.error;
          } catch {
            // keep default message
          }
          throw new Error(message);
        }
        if (!res.body) throw new Error("The assistant returned an empty response.");

        const parser = createParser({
          onEvent(event) {
            let payload: { type?: string; delta?: string; error?: { message?: string }; message?: string };
            try {
              payload = JSON.parse(event.data) as typeof payload;
            } catch {
              return;
            }
            const type = event.event || payload.type;
            if (type === "response.output_text.delta" && typeof payload.delta === "string") {
              setStatus("streaming");
              const delta = payload.delta;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m)),
              );
            } else if (type === "error" || type === "response.failed") {
              const message = payload.error?.message ?? payload.message ?? "The assistant response failed.";
              throwObject.current = new Error(message);
            }
          },
        });
        const throwObject = { current: null as Error | null };

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let done = false;
        try {
          while (!done) {
            const chunk = await reader.read();
            if (chunk.done) break;
            parser.feed(chunk.value);
          }
        } finally {
          await reader.cancel().catch(() => {});
        }

        if (throwObject.current) throw throwObject.current;

        setMessages((prev) => {
          const finalMessages = prev.map((m) => {
            if (m.id !== assistantId) return m;
            const { displayText, proposal } = parseReply(m.content);
            return { ...m, content: displayText, proposal };
          });
          messagesRef.current = finalMessages;
          return finalMessages;
        });
        setStatus("idle");
        playBlip("receive", optionsRef.current.soundEffects);
      } catch (err) {
        if (controller.signal.aborted) {
          // Keep the partial answer visible; drop the streaming placeholder text cleanly.
          setMessages((prev) => {
            const kept = prev
              .filter((m) => !(m.id === assistantId && !m.content.trim()))
              .map((m) => {
                if (m.id !== assistantId) return m;
                const { displayText, proposal } = parseReply(m.content);
                return { ...m, content: displayText, proposal };
              });
            messagesRef.current = kept;
            return kept;
          });
          setStatus("idle");
          return;
        }
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setStatus("error");
        // Remove the empty assistant placeholder.
        setMessages((prev) => {
          const kept = prev.filter((m) => m.id !== assistantId || m.content.trim().length > 0);
          messagesRef.current = kept;
          return kept;
        });
      } finally {
        abortRef.current = null;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const setAllMessages = useCallback((next: ChatMessage[]) => {
    messagesRef.current = next;
    setMessages(next);
  }, []);

  const dismissError = useCallback(() => setError(null), []);

  return { messages, status, error, send, stop, setMessages: setAllMessages, dismissError };
}
