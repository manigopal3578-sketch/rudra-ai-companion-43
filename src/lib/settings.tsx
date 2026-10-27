import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { DEFAULT_SETTINGS, type RudraSettings } from "@/lib/types";

const SETTINGS_KEY = "rudra.settings.v1";

function readSettings(): RudraSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<RudraSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return null;
  }
}

type SettingsContextValue = {
  settings: RudraSettings;
  hydrated: boolean;
  update: (patch: Partial<RudraSettings>) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RudraSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readSettings();
    const reduced =
      typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (stored) {
      setSettings(reduced ? { ...stored, reducedMotion: true } : stored);
    } else if (reduced) {
      setSettings((s) => ({ ...s, reducedMotion: true }));
    }
    setHydrated(true);
  }, []);

  // Reflect motion + intensity on <html> so the orb CSS can react globally.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset["motion"] = settings.reducedMotion ? "reduced" : "full";
    root.dataset["intensity"] = settings.animationIntensity;
  }, [settings.reducedMotion, settings.animationIntensity]);

  const update = useCallback((patch: Partial<RudraSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Storage full/unavailable: settings stay for this session only.
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(SETTINGS_KEY);
    } catch {
      // ignore
    }
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(() => ({ settings, hydrated, update, reset }), [settings, hydrated, update, reset]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
