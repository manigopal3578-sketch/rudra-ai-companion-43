import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { ActionProposalCard } from "@/components/action-proposal-card";
import { BottomNav } from "@/components/bottom-nav";
import { Composer } from "@/components/composer";
import { Orb } from "@/components/orb";
import { RudraHeader } from "@/components/rudra-header";
import { VoiceOverlay } from "@/components/voice-overlay";
import { probeServices } from "@/lib/capabilities.functions";
import { archiveCurrent, loadCurrent, newConversationId, saveCurrent } from "@/lib/conversation-store";
import { useSettings } from "@/lib/settings";
import { isSpeechRecognitionSupported, recognitionLang } from "@/lib/speech";
import { useRudraChat } from "@/lib/use-rudra-chat";
import type { ChatMessage, ProposalState } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RUDRA — Your personal AI companion" },
      {
        name: "description",
        content:
          "RUDRA is a voice-first personal AI companion: natural conversation, English and Telugu, and proposed device actions you confirm.",
      },
      { property: "og:title", content: "RUDRA — Your personal AI companion" },
      {
        property: "og:description",
        content: "Speak naturally. RUDRA listens, answers and proposes phone actions you confirm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SUGGESTIONS = ["Open an app", "Teach me Python", "Set an alarm", "Show your avatar"];

function Index() {
  const { settings } = useSettings();
  const chat = useRudraChat({
    language: settings.language,
    userName: settings.userName,
    soundEffects: settings.soundEffects,
  });

  const [input, setInput] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [proposalStates, setProposalStates] = useState<Record<string, ProposalState>>({});
  // Mic support is browser-only: resolve after hydration to avoid SSR mismatch.
  const [micSupported, setMicSupported] = useState(false);
  const conversationIdRef = useRef(newConversationId());
  const restoredRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Restore the current conversation after hydration (browser storage only).
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadCurrent();
    if (saved && saved.messages.length > 0) {
      conversationIdRef.current = saved.id;
      chat.setMessages(saved.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the current conversation locally when idle.
  useEffect(() => {
    if (chat.status !== "idle") return;
    if (chat.messages.length > 0) saveCurrent(chat.messages, conversationIdRef.current);
  }, [chat.messages, chat.status]);

  // Live, honest availability indicator for the AI service.
  const probe = useQuery({ queryKey: ["services"], queryFn: () => probeServices(), staleTime: 60_000 });
  const availability = probe.isLoading ? "checking" : probe.data?.aiChat ? "ok" : "down";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chat.messages]);

  const busy = chat.status === "submitted" || chat.status === "streaming";
  const lastAssistant = useMemo<ChatMessage | null>(
    () => [...chat.messages].reverse().find((m) => m.role === "assistant") ?? null,
    [chat.messages],
  );

  const submit = () => {
    if (!input.trim() || busy) return;
    chat.send(input);
    setInput("");
  };

  const startNewConversation = () => {
    chat.stop();
    archiveCurrent(settings.saveHistory);
    conversationIdRef.current = newConversationId();
    chat.setMessages([]);
    setProposalStates({});
  };

  const setProposalState = (messageId: string, state: ProposalState) =>
    setProposalStates((prev) => ({ ...prev, [messageId]: state }));

  const empty = chat.messages.length === 0;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-lg">
      {/* Ambient background light */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 12%, color-mix(in oklab, var(--color-deep) 28%, transparent) 0%, transparent 70%), radial-gradient(50% 35% at 80% 80%, color-mix(in oklab, var(--color-violet) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <RudraHeader
        availability={availability as "checking" | "ok" | "down"}
        onNewConversation={startNewConversation}
        showNewConversation={!empty}
      />

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <button
            onClick={() => setVoiceOpen(true)}
            aria-label="Open voice mode"
            className="rounded-full outline-offset-8 transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Orb size="xl" state="idle" />
          </button>
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-muted-foreground">
              {settings.userName ? `Hello, ${settings.userName}` : "Hello"}
            </p>
            <h1 className="text-[22px] font-bold leading-tight text-foreground">How can I help you today?</h1>
            <p className="text-[13px] text-muted-foreground">Speak naturally. I'm listening.</p>
          </div>
          <div className="mt-2 grid w-full max-w-xs grid-cols-2 gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="glass rounded-2xl px-3 py-2.5 text-[13px] font-medium text-muted-foreground transition hover:border-electric/30 hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pb-2" aria-live="polite">
          <div className="space-y-4 py-2">
            {chat.messages.map((message) =>
              message.role === "user" ? (
                <div key={message.id} className="fade-up flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-primary/25 bg-primary/15 px-3.5 py-2.5 text-[14px] leading-relaxed text-foreground">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="fade-up space-y-1">
                  <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-foreground/95">
                    {message.content || (busy ? "" : "…")}
                  </p>
                  {message.proposal && (
                    <ActionProposalCard
                      proposal={message.proposal}
                      state={proposalStates[message.id] ?? "pending"}
                      onConfirm={() => setProposalState(message.id, "confirmed")}
                      onCancel={() => setProposalState(message.id, "cancelled")}
                    />
                  )}
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-1.5 py-1" aria-label="RUDRA is thinking">
                <span className="pulse-dot size-1.5 rounded-full bg-electric" />
                <span className="pulse-dot size-1.5 rounded-full bg-electric [animation-delay:0.2s]" />
                <span className="pulse-dot size-1.5 rounded-full bg-electric [animation-delay:0.4s]" />
              </div>
            )}
            {chat.error && !busy && (
              <div className="glass flex items-start gap-2 rounded-2xl border-destructive/40 p-3 text-[13px] text-destructive">
                <AlertTriangle className="mt-0.5 size-4 flex-none" />
                <p className="flex-1 leading-relaxed">{chat.error}</p>
                <button onClick={chat.dismissError} aria-label="Dismiss error" className="p-0.5">
                  <X className="size-4" />
                </button>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <div className="px-4 pb-1 pt-2">
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={submit}
          onStop={chat.stop}
          onMic={() => setVoiceOpen(true)}
          busy={busy}
          micDisabled={!micSupported}
        />
      </div>

      <BottomNav />

      <VoiceOverlay
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onSend={chat.send}
        onStopChat={chat.stop}
        chatBusy={busy}
        chatError={chat.error}
        lastAssistant={lastAssistant}
        speechLang={recognitionLang(settings.language)}
        speechRate={settings.speechRate}
        voiceURI={settings.voiceURI}
        onErrorAcknowledge={chat.dismissError}
      />
    </div>
  );
}
