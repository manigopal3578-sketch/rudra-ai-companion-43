/** Shared RUDRA domain types (browser-safe). */

export type RudraIntentId =
  | "OPEN_APP"
  | "FIND_CONTACT"
  | "DIAL_CONTACT"
  | "SET_ALARM"
  | "ASK_ASSISTANT"
  | "CANCEL_ACTION"
  | "GENERATE_AVATAR"
  | "UNKNOWN";

/** Intents the assistant may propose on its own. */
export const PROPOSABLE_INTENTS: readonly RudraIntentId[] = [
  "OPEN_APP",
  "FIND_CONTACT",
  "DIAL_CONTACT",
  "SET_ALARM",
  "CANCEL_ACTION",
  "GENERATE_AVATAR",
];

export type IntentParams = {
  app?: string;
  time?: string;
  label?: string;
  name?: string;
  prompt?: string;
};

export type IntentProposal = {
  intent: RudraIntentId;
  params: IntentParams;
};

export type ParsedReply = {
  /** Text safe to display / speak (INTENT marker removed). */
  displayText: string;
  proposal?: IntentProposal;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  proposal?: IntentProposal;
};

export type ConversationRecord = {
  id: string;
  title: string;
  startedAt: number;
  updatedAt: number;
  messages: ChatMessage[];
};

export type LanguageSetting = "auto" | "en" | "te" | "te-Latn";

export type AnimationIntensity = "calm" | "standard" | "vivid";

export type RudraSettings = {
  userName: string;
  language: LanguageSetting;
  speechRate: number; // 0.5 – 1.5, SpeechSynthesis rate
  voiceURI: string;
  soundEffects: boolean;
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  saveHistory: boolean;
};

export const DEFAULT_SETTINGS: RudraSettings = {
  userName: "",
  language: "auto",
  speechRate: 1,
  voiceURI: "",
  soundEffects: true,
  animationIntensity: "standard",
  reducedMotion: false,
  saveHistory: true,
};

export type VoiceModeState =
  | "closed"
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "confirming"
  | "executing"
  | "success"
  | "error"
  | "cancelled";

export type ProposalState = "pending" | "confirmed" | "executing" | "cancelled";

export const LANGUAGE_LABELS: Record<LanguageSetting, string> = {
  auto: "Auto-detect (English + Telugu)",
  en: "English",
  te: "తెలుగు (Telugu script)",
  "te-Latn": "Telugu in English letters (Romanized)",
};
