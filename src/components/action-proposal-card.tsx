import { Check, Loader2, ShieldAlert, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { describeProposal } from "@/lib/device-actions";
import type { IntentProposal, ProposalState } from "@/lib/types";

/**
 * A proposed device action rendered inside the conversation. In this web
 * prototype every action is simulated and labelled as such; execution and
 * verification belong to the native Android host.
 */
export function ActionProposalCard({
  proposal,
  state,
  onConfirm,
  onCancel,
}: {
  proposal: IntentProposal;
  state: ProposalState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const presentation = describeProposal(proposal);
  if (!presentation) return null;

  return (
    <div className="glass mt-3 rounded-2xl border-violet/25 p-3.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-violet">
        <ShieldAlert className="size-3.5" />
        Simulated device action · needs Android host
      </div>
      <p className="mt-2 text-[15px] font-semibold text-foreground">{presentation.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{presentation.detail}</p>

      {state === "pending" && (
        <div className="mt-3 flex gap-2">
          {presentation.opensAvatarStudio ? (
            <Link
              to="/avatar"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {presentation.confirmLabel}
            </Link>
          ) : (
            <button
              onClick={onConfirm}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {presentation.confirmLabel}
            </button>
          )}
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-muted-foreground transition hover:bg-accent"
          >
            <X className="size-3.5" />
            Cancel
          </button>
        </div>
      )}

      {state === "confirmed" && !presentation.opensAvatarStudio && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-electric">
          <Check className="size-4" />
          {presentation.simulatedOutcome}
        </p>
      )}
      {state === "confirmed" && presentation.opensAvatarStudio && (
        <p className="mt-3 text-[13px] font-medium text-electric">Avatar Studio is open in its own tab.</p>
      )}
      {state === "cancelled" && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          <X className="size-4" />
          Cancelled — nothing was executed.
        </p>
      )}
      {state === "executing" && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Executing (simulated)…
        </p>
      )}
    </div>
  );
}
