/**
 * Browser Web Speech API wrappers for the RUDRA voice mode.
 *
 * Honest capabilities of the web prototype:
 * - Speech recognition uses the browser's built-in recognizer (best support:
 *   Chrome / Edge). Telugu ("te-IN") availability depends on the browser and
 *   device; the app reports this rather than assuming it works.
 * - Speech synthesis uses the browser's installed voices. Telugu voice
 *   presence is detected and surfaced in Settings.
 * - The Android host will replace all of this with native Android speech
 *   services (that contract lives in the Android handoff, not here).
 */

export type RecognitionAlternative = { transcript: string; confidence: number };
export type RecognitionResultItem = { isFinal: boolean; length: number; 0: RecognitionAlternative };
export type RecognitionEvent = { resultIndex: number; results: { length: number } & Record<number, RecognitionResultItem> };
export type RecognitionErrorEvent = { error: string };

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export type Recognizer = {
  start: () => void;
  stop: () => void;
};

export type RecognizerOptions = {
  lang: string;
  interimResults?: boolean;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
};

export function createRecognizer(options: RecognizerOptions): Recognizer | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = options.lang;
  recognition.continuous = false;
  recognition.interimResults = options.interimResults ?? true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0]?.transcript ?? "";
      if (result.isFinal) {
        options.onResult(transcript.trim(), true);
      } else {
        interim += transcript;
      }
    }
    if (interim.trim()) options.onResult(interim.trim(), false);
  };
  recognition.onerror = (event) => options.onError(event.error);
  recognition.onend = () => options.onEnd();

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // start() throws InvalidStateError if already started; ignore.
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}

/** Map the app language setting to a BCP-47 recognition language tag. */
export function recognitionLang(language: string): string {
  if (language === "te" || language === "te-Latn") return "te-IN";
  return "en-IN";
}

/* ---------------- Speech synthesis ---------------- */

export function listVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices();
}

function pickVoice(preferredURI: string, lang: string): SpeechSynthesisVoice | undefined {
  const voices = listVoices();
  if (preferredURI) {
    const exact = voices.find((v) => v.voiceURI === preferredURI);
    if (exact) return exact;
  }
  const base = lang.split("-")[0];
  return (
    voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(base))
  );
}

export type SpeakOptions = {
  lang: string;
  rate: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
};

/**
 * Speak text aloud. Long text is split into sentence chunks and queued in
 * order (some browsers cut off very long single utterances). Returns false
 * when speech synthesis is unavailable.
 */
export function speak(text: string, options: SpeakOptions): boolean {
  if (!isSpeechSynthesisSupported() || !text.trim()) return false;
  stopSpeaking();
  const voice = pickVoice(options.voiceURI ?? "", options.lang);

  const chunks = splitIntoChunks(text, 180);
  chunks.forEach((chunk, index) => {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.lang = options.lang;
    utterance.rate = Math.min(2, Math.max(0.5, options.rate));
    if (voice) utterance.voice = voice;
    if (index === 0) utterance.onstart = () => options.onStart?.();
    if (index === chunks.length - 1) {
      utterance.onend = () => options.onEnd?.();
      utterance.onerror = () => options.onEnd?.();
    }
    window.speechSynthesis.speak(utterance);
  });
  return true;
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

function splitIntoChunks(text: string, max: number): string[] {
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?।]+[.!?।]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > max && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

/* ---------------- Live microphone level (for the waveform) ---------------- */

export type AudioLevelMeter = {
  getLevel: () => number;
  stop: () => void;
};

/**
 * Opens the microphone and returns a real RMS level (0..1) from an analyser
 * node. Used only to drive the waveform visualization — never recorded.
 * Returns null when permission is denied or the API is unavailable.
 */
export async function startAudioLevelMeter(): Promise<AudioLevelMeter | null> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return null;
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    return null;
  }
  const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    stream.getTracks().forEach((t) => t.stop());
    return null;
  }
  const context = new AudioCtx();
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
  const data = new Uint8Array(analyser.fftSize);

  return {
    getLevel: () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      return Math.min(1, Math.sqrt(sum / data.length) * 3);
    },
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      context.close().catch(() => {});
    },
  };
}
