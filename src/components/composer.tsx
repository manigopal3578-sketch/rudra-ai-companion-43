import { useEffect, useRef } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  onMic,
  busy,
  autoFocus,
  micDisabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  onMic: () => void;
  busy: boolean;
  autoFocus?: boolean;
  micDisabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(140, el.scrollHeight)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !busy;

  return (
    <form
      className="glass-strong flex items-end gap-2 rounded-3xl p-2 shadow-[0_8px_40px_-12px_color-mix(in_oklab,var(--color-deep)_60%,transparent)]"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
    >
      <button
        type="button"
        onClick={onMic}
        disabled={micDisabled}
        aria-label="Start voice conversation"
        className="grid size-10 flex-none place-items-center rounded-full border border-electric/30 bg-electric/10 text-electric transition hover:bg-electric/20 disabled:opacity-40"
      >
        <Mic className="size-4" />
      </button>
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        placeholder="Ask RUDRA anything..."
        aria-label="Ask RUDRA anything"
        maxLength={4000}
        className="max-h-[140px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
      />
      {busy ? (
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop the assistant"
          className="grid size-10 flex-none place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
        >
          <Square className="size-3.5 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send message"
          className="grid size-10 flex-none place-items-center rounded-full bg-primary text-primary-foreground transition enabled:hover:bg-primary/90 disabled:opacity-30"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </form>
  );
}
