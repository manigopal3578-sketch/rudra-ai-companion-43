import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Square, X } from "lucide-react";

import { ActionProposalCard } from "@/components/action-proposal-card";
import { Orb } from "@/components/orb";
import { describeProposal } from "@/lib/device-actions";
import {
  createRecognizer,
  isSpeechRecognitionSupported,
  startAudioLevelMeter,
  stopSpeaking,
  speak,
  type AudioLevelMeter,
  type Recognizer,
} from "@/lib/speech";
import type { ChatMessage, IntentProposal, VoiceModeState } from "@/lib/types";

const STATE_LABELS: Record<VoiceModeState, string> = {
  closed: "",
  idle: "Tap the orb to speak",
  listening: "Listening…",
  transcribing: "Got it…",
  thinking: "Thinking…",
  speaking: "Speaking — tap stop to interrupt",
  confirming: "Confirm the action",
  executing: "Executing (simulated)…",
  success: "Done (simulated)",
  error: "Voice error",
  cancelled: "Cancelled",
};

/**
 * The immersive voice surface. State machine:
 * IDLE → LISTENING → TRANSCRIBING → THINKING → SPEAKING / CONFIRMING →
 * EXECUTING (simulated) → SUCCESS / CANCELLED → LISTENING…
 *
 * Recognition, transcription, audio playback and the waveform are real
 * browser capabilities (Web Speech API + live microphone analyser). Device
 * action execution is simulated and labelled, because only the native
 * Android host can execute actions.
 */
export function VoiceOverlay({
  open,
  onClose,
  onSend,
  onStopChat,
  chatBusy,
  chatError,
  lastAssistant,
  speechLang,
  speechRate,
  voiceURI,
  onErrorAcknowledge,
}: {
  open: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  onStopChat: () => void;
  chatBusy: boolean;
  chatError: string | null;
  lastAssistant: ChatMessage | null;
  speechLang: string;
  speechRate: number;
  voiceURI: string;
  onErrorAcknowledge: () => void;
}) {
  const [state, setState] = useState<VoiceModeState>("idle");
  const [transcript, setTranscript] = useState("");
  const [level, setLevel] = useState(0);
  const [activeProposal, setActiveProposal] = useState<IntentProposal | null>(null);
  const [proposalState, setProposalState] = useState<"confirmed" | "cancelled" | null>(null);
  const [micSupported] = useState(() => isSpeechRecognitionSupported());

  const recognizerRef = useRef<Recognizer | null>(null);
  const meterRef = useRef<AudioLevelMeter | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const closedRef = useRef(true);
  const spokenReplyIdRef = useRef<string | null>(null);
  const finalTextRef = useRef("");
  const stateRef = useRef<VoiceModeState>("idle");
  stateRef.current = state;

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    recognizerRef.current = null;
    meterRef.current?.stop();
    meterRef.current = null;
    cancelAnimationFrame(rafRef.current);
    setLevel(0);
  }, []);

  const startListening = useCallback(() => {
    if (!micSupported) {
      setState("error");
      return;
    }
    setTranscript("");
    setState("listening");
    const recognizer = createRecognizer({
      lang: speechLang,
      interimResults: true,
      onResult: (text, isFinal) => {
        if (isFinal) {
          finalTextRef.current = text;
          setTranscript(text);
          stopListening();
          setState("transcribing");
          window.setTimeout(() => {
            if (closedRef.current) return;
            if (finalTextRef.current.trim()) {
              setState("thinking");
              onSend(finalTextRef.current.trim());
            } else {
              setState("idle");
            }
          }, 350);
        } else {
          setTranscript(text);
        }
      },
      onError: (error) => {
        stopListening();
        if (error === "no-speech") {
          setState("idle");
        } else if (error === "not-allowed" || error === "service-not-allowed") {
          setState("error");
          setTranscript("Microphone access was denied. Allow the microphone and try again.");
        } else if (error !== "aborted") {
          setState("error");
          setTranscript(`Speech recognition error: ${error}`);
        }
      },
      onEnd: () => {
        // Recognition ends after each utterance; the state machine takes over.
      },
    });
    if (!recognizer) {
      setState("error");
      return;
    }
    recognizerRef.current = recognizer;
    recognizer.start();

    void startAudioLevelMeter().then((meter) => {
      if (closedRef.current || stateRef.current !== "listening") {
        meter?.stop();
        return;
      }
      meterRef.current = meter;
      if (meter && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx2d = canvas.getContext("2d");
        const bars = 40;
        const heights = new Array<number>(bars).fill(2);
        const loop = () => {
          rafRef.current = requestAnimationFrame(loop);
          const l = meter.getLevel();
          setLevel(l);
          heights.push(2 + l * 46);
          if (heights.length > bars) heights.shift();
          if (!ctx2d) return;
          const w = canvas.width;
          const h = canvas.height;
          ctx2d.clearRect(0, 0, w, h);
          const barWidth = w / bars;
          heights.forEach((value, i) => {
            const barHeight = Math.max(2, (value / 48) * h);
            ctx2d.fillStyle = `color-mix(in oklab, var(--color-electric) ${55 + value}%, transparent)`;
            ctx2d.fillRect(i * barWidth + 1, h / 2 - barHeight / 2, barWidth - 2, barHeight);
          });
        };
        loop();
      }
    });
  }, [micSupported, onSend, speechLang, stopListening]);

  // Open / close lifecycle.
  useEffect(() => {
    if (open) {
      closedRef.current = false;
      spokenReplyIdRef.current = lastAssistant?.id ?? null;
      setState("idle");
      startListening();
    } else {
      closedRef.current = true;
      stopListening();
      stopSpeaking();
      setState("idle");
    }
    return () => {
      closedRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // THINKING → SPEAKING / CONFIRMING when the reply completes.
  useEffect(() => {
    if (state !== "thinking" || chatBusy) return;
    const reply = lastAssistant;
    if (!reply || !reply.content.trim() || spokenReplyIdRef.current === reply.id) return;
    spokenReplyIdRef.current = reply.id;
    if (reply.proposal) {
      setActiveProposal(reply.proposal);
      setProposalState(null);
      setState("confirming");
      return;
    }
    setState("speaking");
    const spoke = speak(reply.content, {
      lang: speechLang,
      rate: speechRate,
      voiceURI,
      onEnd: () => {
        if (!closedRef.current && stateRef.current === "speaking") {
          setState("idle");
          window.setTimeout(() => {
            if (!closedRef.current && stateRef.current === "idle") startListening();
          }, 450);
        }
      },
    });
    if (!spoke) {
      setState("idle");
      window.setTimeout(() => {
        if (!closedRef.current && stateRef.current === "idle") startListening();
      }, 450);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAssistant, chatBusy, state]);

  // Chat errors surface in the voice flow too.
  useEffect(() => {
    if (state === "thinking" && chatError) {
      setState("error");
      setTranscript(chatError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatError]);

  const handleStop = () => {
    switch (stateRef.current) {
      case "listening":
        stopListening();
        setState("idle");
        break;
      case "speaking":
        stopSpeaking();
        setState("idle");
        break;
      case "thinking":
        onStopChat();
        break;
      default:
        break;
    }
  };

  const confirmProposal = () => {
    if (!activeProposal) return;
    setProposalState("confirmed");
    setState("executing");
    window.setTimeout(() => {
      if (closedRef.current) return;
      setState("success");
      window.setTimeout(() => {
        if (closedRef.current || stateRef.current !== "success") return;
        setActiveProposal(null);
        setProposalState(null);
        setState("idle");
        startListening();
      }, 1600);
    }, 900);
  };

  const cancelProposal = () => {
    setActiveProposal(null);
    setProposalState(null);
    setState("cancelled");
    window.setTimeout(() => {
      if (closedRef.current || stateRef.current !== "cancelled") return;
      setState("idle");
      startListening();
    }, 900);
  };

  if (!open) return null;

  const speaking = state === "speaking";
  const replyText = lastAssistant?.content ?? "";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="RUDRA voice mode">
      <div className="pt-safe flex items-center justify-between px-5 pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Voice mode</p>
        <button
          onClick={() => {
            stopListening();
            stopSpeaking();
            onClose();
          }}
          aria-label="Close voice mode"
          className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <Orb size="xl" state={state === "listening" ? "listening" : state === "speaking" ? "speaking" : state === "thinking" ? "thinking" : "idle"} level={level} />

        <canvas
          ref={canvasRef}
          width={320}
          height={56}
          className={`h-14 w-72 ${state === "listening" && meterRef.current ? "opacity-100" : "hidden"}`}
          aria-hidden
        />

        <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-electric">
          {STATE_LABELS[state]}
        </p>

        <div className="max-h-[26vh] w-full max-w-md overflow-y-auto text-center">
          {state === "listening" && (
            <p className="min-h-[3rem] text-[17px] leading-relaxed text-foreground/90">
              {transcript || <span className="text-muted-foreground">Speak naturally — English, Telugu, or a mix.</span>}
            </p>
          )}
          {(state === "transcribing" || state === "thinking") && transcript && (
            <p className="text-[15px] leading-relaxed text-muted-foreground">“{transcript}”</p>
          )}
          {(speaking || state === "idle") && replyText && state !== "listening" && (
            <p className="text-[17px] leading-relaxed text-foreground/95 whitespace-pre-wrap">{replyText}</p>
          )}
          {state === "error" && (
            <p className="text-[15px] leading-relaxed text-destructive">{transcript || "Something went wrong with the voice flow."}</p>
          )}
          {state === "success" && (
            <p className="text-[15px] font-medium text-electric">
              {activeProposal ? describeProposal(activeProposal)?.simulatedOutcome : "Done."}
            </p>
          )}
          {state === "cancelled" && <p className="text-[15px] text-muted-foreground">Cancelled — nothing was executed.</p>}
        </div>

        {state === "confirming" && activeProposal && (
          <div className="w-full max-w-md">
            <ActionProposalCard proposal={activeProposal} state="pending" onConfirm={confirmProposal} onCancel={cancelProposal} />
          </div>
        )}
        {(state === "executing" || state === "success") && activeProposal && (
          <div className="w-full max-w-md opacity-70">
            <ActionProposalCard
              proposal={activeProposal}
              state={proposalState === "confirmed" ? (state === "success" ? "confirmed" : "executing") : "cancelled"}
              onConfirm={() => {}}
              onCancel={() => {}}
            />
          </div>
        )}

        {!micSupported && state === "error" && (
          <p className="max-w-sm text-center text-[13px] text-muted-foreground">
            This browser does not expose speech recognition. Voice mode works in Chrome/Edge, and natively in the
            Android app.
          </p>
        )}
      </div>

      <div className="pb-safe flex items-center justify-center gap-4 px-6 pt-2">
        {state === "speaking" && (
          <button
            onClick={() => {
              if (!lastAssistant) return;
              speak(lastAssistant.content, { lang: speechLang, rate: speechRate, voiceURI });
            }}
            aria-label="Replay the answer"
            className="grid size-12 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="size-4" />
          </button>
        )}
        <button
          onClick={state === "idle" ? startListening : handleStop}
          aria-label={state === "idle" ? "Start listening" : "Stop"}
          className={`grid size-16 place-items-center rounded-full border transition ${
            state === "idle"
              ? "border-electric/40 bg-electric/10 text-electric hover:bg-electric/20"
              : "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
          }`}
        >
          {state === "idle" ? <span className="text-[11px] font-bold tracking-widest">START</span> : <Square className="size-4 fill-current" />}
        </button>
        {state === "error" && chatError && (
          <button
            onClick={() => {
              onErrorAcknowledge();
              setTranscript("");
              setState("idle");
              startListening();
            }}
            className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-muted-foreground transition hover:bg-accent"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
