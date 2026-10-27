/** Tiny WebAudio blips for send/receive/confirm/error feedback. */

type BlipKind = "send" | "receive" | "confirm" | "error";

const PROFILES: Record<BlipKind, { freq: number; end: number; duration: number; gain: number }> = {
  send: { freq: 660, end: 880, duration: 0.09, gain: 0.05 },
  receive: { freq: 520, end: 700, duration: 0.12, gain: 0.045 },
  confirm: { freq: 720, end: 1080, duration: 0.16, gain: 0.06 },
  error: { freq: 320, end: 200, duration: 0.18, gain: 0.06 },
};

export function playBlip(kind: BlipKind, enabled: boolean): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const profile = PROFILES[kind];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(profile.freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(profile.end, ctx.currentTime + profile.duration);
    gain.gain.setValueAtTime(profile.gain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + profile.duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + profile.duration + 0.02);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    // Audio is a nicety; never let it break the flow.
  }
}
