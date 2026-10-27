import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { BottomNav } from "@/components/bottom-nav";
import { useSettings } from "@/lib/settings";
import { LANGUAGE_LABELS, type AnimationIntensity, type LanguageSetting } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — RUDRA" },
      { name: "description", content: "RUDRA preferences: language, voice, motion and privacy — stored on this device only." },
      { property: "og:title", content: "Settings — RUDRA" },
      { property: "og:description", content: "RUDRA preferences: language, voice, motion and privacy — stored on this device only." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const INTENSITIES: { value: AnimationIntensity; label: string }[] = [
  { value: "calm", label: "Calm" },
  { value: "standard", label: "Standard" },
  { value: "vivid", label: "Vivid" },
];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-4">
      <h2 className="text-[14px] font-bold text-foreground">{title}</h2>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="flex w-full items-center justify-between gap-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-foreground">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      <span
        className={`relative h-6 w-11 flex-none rounded-full border transition ${
          checked ? "border-electric/50 bg-electric/25" : "border-border bg-accent"
        }`}
      >
        <span
          className={`absolute top-0.5 size-4.5 rounded-full transition-all ${
            checked ? "left-[22px] bg-electric" : "left-0.5 bg-muted-foreground"
          }`}
        />
      </span>
    </button>
  );
}

function SettingsPage() {
  const { settings, hydrated, update, reset } = useSettings();
  const [confirmingReset, setConfirmingReset] = useState(false);

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
        <h1 className="text-[20px] font-bold text-foreground">Settings</h1>
        <p className="text-[12px] text-muted-foreground">
          Preferences live on this device only. Nothing is uploaded to a server.
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        {!hydrated ? (
          <div className="shimmer-line h-40 rounded-2xl" />
        ) : (
          <>
            <Section title="Your name" hint="Used so RUDRA can address you naturally in replies.">
              <input
                value={settings.userName}
                onChange={(event) => update({ userName: event.target.value.slice(0, 40) })}
                placeholder="e.g. Gopal"
                maxLength={40}
                className="w-full rounded-xl border border-border bg-accent px-3 py-2 text-[13px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-electric/50"
              />
            </Section>

            <Section title="Language" hint="Auto-detect understands English and Telugu together.">
              <select
                value={settings.language}
                onChange={(event) => update({ language: event.target.value as LanguageSetting })}
                className="w-full rounded-xl border border-border bg-accent px-3 py-2 text-[13px] text-foreground outline-none transition focus:border-electric/50"
              >
                {(Object.keys(LANGUAGE_LABELS) as LanguageSetting[]).map((value) => (
                  <option key={value} value={value} className="bg-background">
                    {LANGUAGE_LABELS[value]}
                  </option>
                ))}
              </select>
            </Section>

            <Section title="Voice" hint="Speech rate applies to spoken replies in voice mode.">
              <label className="block text-[13px] font-semibold text-foreground" htmlFor="speech-rate">
                Speech rate · {settings.speechRate.toFixed(1)}×
              </label>
              <input
                id="speech-rate"
                type="range"
                min={0.5}
                max={1.5}
                step={0.1}
                value={settings.speechRate}
                onChange={(event) => update({ speechRate: Number(event.target.value) })}
                className="w-full accent-[var(--electric)]"
              />
              <Toggle
                label="Sound effects"
                hint="Soft confirmation sounds for actions and voice mode."
                checked={settings.soundEffects}
                onChange={(next) => update({ soundEffects: next })}
              />
            </Section>

            <Section title="Motion" hint="Controls the orb, waveform and screen transitions.">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Animation intensity">
                {INTENSITIES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => update({ animationIntensity: option.value })}
                    aria-pressed={settings.animationIntensity === option.value}
                    className={`rounded-xl border px-2 py-2 text-[12px] font-semibold transition ${
                      settings.animationIntensity === option.value
                        ? "border-electric/50 bg-electric/10 text-electric"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Toggle
                label="Reduced motion"
                hint="Calms all animation — also picked up automatically from your system setting."
                checked={settings.reducedMotion}
                onChange={(next) => update({ reducedMotion: next })}
              />
            </Section>

            <Section title="Privacy" hint="Conversations are archived on this device only.">
              <Toggle
                label="Save conversation history"
                hint="Turn off to stop archiving conversations in History."
                checked={settings.saveHistory}
                onChange={(next) => update({ saveHistory: next })}
              />
              <button
                type="button"
                onClick={() => {
                  if (!confirmingReset) {
                    setConfirmingReset(true);
                    return;
                  }
                  reset();
                  setConfirmingReset(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-semibold text-muted-foreground transition hover:border-destructive/50 hover:text-destructive"
              >
                <RotateCcw className="size-3.5" />
                {confirmingReset ? "Tap again to reset everything" : "Reset all settings"}
              </button>
            </Section>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
