import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, MessageCirclePlus, ShieldAlert, Trash2 } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { Orb } from "@/components/orb";
import { loadHistory, saveHistoryList } from "@/lib/conversation-store";
import type { ConversationRecord } from "@/lib/types";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — RUDRA" },
      { name: "description", content: "Recent RUDRA conversations with readable transcripts and action outcomes." },
      { property: "og:title", content: "History — RUDRA" },
      { property: "og:description", content: "Recent RUDRA conversations with readable transcripts and action outcomes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [records, setRecords] = useState<ConversationRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    setRecords(loadHistory());
    setHydrated(true);
  }, []);

  const clearAll = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    saveHistoryList([]);
    setRecords([]);
    setConfirmingClear(false);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-lg">
      <header className="pt-safe px-4 pb-3">
        <h1 className="text-[20px] font-bold text-foreground">History</h1>
        <p className="text-[12px] text-muted-foreground">
          Conversations archived on this device only. Nothing is uploaded to a server.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        {!hydrated ? (
          <div className="shimmer-line h-20 rounded-2xl" />
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <Orb size="md" state="idle" showEmblem />
            <p className="text-[15px] font-semibold text-foreground">No conversations yet</p>
            <p className="max-w-[240px] text-[13px] text-muted-foreground">
              When you archive a conversation, its transcript and any simulated action outcomes appear here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <MessageCirclePlus className="size-4" />
              Talk to RUDRA
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                {confirmingClear ? "Tap again to erase everything" : "Clear history"}
              </button>
            </div>
            {records.map((record) => {
              const expanded = expandedId === record.id;
              return (
                <article key={record.id} className="glass overflow-hidden rounded-2xl">
                  <button
                    onClick={() => setExpandedId(expanded ? null : record.id)}
                    className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
                    aria-expanded={expanded}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-foreground">{record.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {formatDistanceToNow(record.updatedAt, { addSuffix: true })} · {record.messages.length} messages
                      </p>
                    </div>
                    {expanded ? <ChevronUp className="size-4 flex-none text-muted-foreground" /> : <ChevronDown className="size-4 flex-none text-muted-foreground" />}
                  </button>

                  {expanded && (
                    <div className="space-y-3 border-t border-border p-3.5">
                      {record.messages.map((message) => (
                        <div key={message.id} className={message.role === "user" ? "text-right" : ""}>
                          <p
                            className={
                              message.role === "user"
                                ? "inline-block max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md border border-primary/25 bg-primary/15 px-3 py-2 text-left text-[13px] leading-relaxed text-foreground"
                                : "whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/95"
                            }
                          >
                            {message.content}
                          </p>
                          {message.proposal && (
                            <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-violet">
                              <ShieldAlert className="size-3" />
                              Simulated action: {message.proposal.intent}
                              {message.proposal.params.app ? ` · ${message.proposal.params.app}` : ""}
                              {message.proposal.params.name ? ` · ${message.proposal.params.name}` : ""}
                              {message.proposal.params.time ? ` · ${message.proposal.params.time}` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
