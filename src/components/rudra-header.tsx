import { Link } from "@tanstack/react-router";
import { Plus, Settings2, Sparkle } from "lucide-react";

import { TridentLogo } from "@/components/trident-logo";

/**
 * App header: trident emblem + wordmark, an honest AI availability indicator,
 * a new-conversation action and settings access.
 */
export function RudraHeader({
  availability,
  onNewConversation,
  showNewConversation,
}: {
  availability: "checking" | "ok" | "down";
  onNewConversation: () => void;
  showNewConversation: boolean;
}) {
  const dotClass =
    availability === "ok" ? "bg-electric" : availability === "down" ? "bg-destructive" : "bg-muted-foreground";
  const dotLabel =
    availability === "ok"
      ? "AI service connected"
      : availability === "down"
        ? "AI service unavailable — text answers are offline"
        : "Checking AI service…";

  return (
    <header className="pt-safe flex items-center justify-between gap-2 px-4 pb-2">
      <div className="flex items-center gap-2.5">
        <TridentLogo size={26} />
        <div>
          <p className="text-[15px] font-extrabold tracking-[0.22em] text-foreground">RUDRA</p>
          <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className={`pulse-dot inline-block size-1.5 rounded-full ${dotClass}`} aria-hidden />
            {dotLabel}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {showNewConversation && (
          <button
            onClick={onNewConversation}
            aria-label="Start a new conversation"
            title="New conversation"
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" />
          </button>
        )}
        <Link
          to="/settings"
          aria-label="Open settings"
          title="Settings"
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Settings2 className="size-4" />
        </Link>
        <Link
          to="/avatar"
          aria-label="Open Avatar Studio"
          title="Avatar Studio"
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Sparkle className="size-4" />
        </Link>
      </div>
    </header>
  );
}
