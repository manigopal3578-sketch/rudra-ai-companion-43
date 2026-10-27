import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Download, RefreshCw, Sparkles } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { streamImage } from "@/lib/stream-image";
import defaultAvatar from "@/assets/rudra-avatar-default.png";

export const Route = createFileRoute("/avatar")({
  head: () => ({
    meta: [
      { title: "Avatar Studio — RUDRA" },
      { name: "description", content: "Design RUDRA's visual identity: generate and save a custom AI avatar." },
      { property: "og:title", content: "Avatar Studio — RUDRA" },
      { property: "og:description", content: "Design RUDRA's visual identity: generate and save a custom AI avatar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvatarPage,
});

const AVATAR_KEY = "rudra.avatar.v1";

const PRESETS = [
  "RUDRA trident emblem avatar, glowing electric-blue energy orb, dark cosmic background, futuristic minimal",
  "RUDRA guardian avatar, subtle violet lightning aura, obsidian surface, premium sci-fi portrait",
  "RUDRA sage avatar, warm ember glow on a dark slate shield, engraved trident symbol",
];

function loadSavedAvatar(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

function AvatarPage() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [saved, setSaved] = useState<string | null>(loadSavedAvatar);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const generating = status === "generating";

  const generate = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed || generating) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("generating");
    setError("");
    setImage(null);
    try {
      await streamImage("/api/generate-image", { prompt: trimmed }, (dataUrl, isFinal) => {
        setImage(dataUrl);
        if (isFinal) setStatus("done");
      }, controller.signal);
      setStatus((current) => (current === "generating" ? "done" : current));
    } catch (caught) {
      if (controller.signal.aborted) return;
      setError(caught instanceof Error ? caught.message : "Image generation failed");
      setStatus("error");
    }
  };

  const save = () => {
    if (!image) return;
    try {
      window.localStorage.setItem(AVATAR_KEY, image);
      setSaved(image);
    } catch {
      setError("This avatar is too large to store on this device.");
    }
  };

  const restoreDefault = () => {
    try {
      window.localStorage.removeItem(AVATAR_KEY);
    } catch {
      // ignore
    }
    setSaved(null);
    setImage(null);
    setStatus("idle");
  };

  const shown = image ?? saved ?? defaultAvatar;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col md:max-w-lg">
      <header className="pt-safe px-4 pb-3">
        <Link
          to="/"
          aria-label="Back to assistant"
          className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <h1 className="text-[20px] font-bold text-foreground">Avatar Studio</h1>
        <p className="text-[12px] text-muted-foreground">
          Describe the RUDRA you imagine — the design streams in as it renders.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        <div className="glass relative overflow-hidden rounded-2xl">
          <img
            src={shown}
            alt={image ? "Generated RUDRA avatar" : saved ? "Saved RUDRA avatar" : "Default RUDRA avatar"}
            className={`aspect-square w-full object-cover ${generating ? "shimmer-line" : ""}`}
          />
          {generating && (
            <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 pb-3 pt-8 text-center text-[12px] font-semibold text-electric">
              Rendering…
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={generating}
              onClick={() => {
                setPrompt(preset);
                void generate(preset);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition hover:border-electric/50 hover:text-electric disabled:opacity-50"
            >
              {preset.split(",")[0].replace("RUDRA ", "")}
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value.slice(0, 2000))}
          placeholder="Describe the avatar: e.g. a trident forged of light inside a translucent orb…"
          rows={3}
          maxLength={2000}
          disabled={generating}
          className="w-full resize-none rounded-2xl border border-border bg-accent px-3 py-2.5 text-[13px] leading-relaxed text-foreground outline-none transition placeholder:text-muted-foreground focus:border-electric/50 disabled:opacity-60"
        />

        {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void generate(prompt)}
            disabled={generating || !prompt.trim()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {generating ? "Rendering…" : "Generate"}
          </button>
          {image && (
            <button
              type="button"
              onClick={save}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition hover:border-electric/50 hover:text-electric disabled:opacity-50"
            >
              <Download className="size-4" />
              Use as avatar
            </button>
          )}
          {(saved || image) && (
            <button
              type="button"
              onClick={restoreDefault}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
            >
              Reset to default
            </button>
          )}
        </div>

        <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
          Avatars are AI-generated images saved to this device only. The saved design currently lives here in Avatar
          Studio; wiring it across every screen is a next step.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
