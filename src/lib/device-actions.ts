import type { IntentProposal } from "@/lib/types";

/**
 * Honest rendering of device-action proposals in the web prototype.
 * The web app cannot execute any of these — they require the native Android
 * host (Kotlin + Jetpack Compose). Everything here is explicitly labelled
 * "simulated".
 */

export type ProposalPresentation = {
  title: string;
  detail: string;
  confirmLabel: string;
  /** What the Android host would do and report back after execution. */
  simulatedOutcome: string;
  /** CANCEL_ACTION runs without an extra confirmation step. */
  autoExecute: boolean;
  /** GENERATE_AVATAR routes to Avatar Studio instead of a simulated run. */
  opensAvatarStudio: boolean;
};

export function describeProposal(proposal: IntentProposal): ProposalPresentation | null {
  switch (proposal.intent) {
    case "OPEN_APP":
      return {
        title: `Open ${proposal.params.app}`,
        detail: `Android host action: launch the installed app "${proposal.params.app}" from the device launcher. The host verifies the app exists before opening it.`,
        confirmLabel: "Simulate open",
        simulatedOutcome: `On your phone, RUDRA would now verify "${proposal.params.app}" is installed and open it. (Simulated here — the web prototype cannot launch Android apps.)`,
        autoExecute: false,
        opensAvatarStudio: false,
      };
    case "SET_ALARM":
      return {
        title: `Set alarm for ${proposal.params.time}${proposal.params.label ? ` — ${proposal.params.label}` : ""}`,
        detail: `Android host action: create the alarm at ${proposal.params.time} using the device's supported alarm mechanism. Times are shown for your confirmation before anything is set.`,
        confirmLabel: "Simulate set alarm",
        simulatedOutcome: `On your phone, RUDRA would set an alarm for ${proposal.params.time} and confirm it in the alarm app. (Simulated here — the web prototype cannot set device alarms.)`,
        autoExecute: false,
        opensAvatarStudio: false,
      };
    case "FIND_CONTACT":
      return {
        title: `Find ${proposal.params.name} in contacts`,
        detail: `Android host action: search your on-device contacts for "${proposal.params.name}". Contact data stays on the device; nothing is uploaded.`,
        confirmLabel: "Simulate search",
        simulatedOutcome: `On your phone, RUDRA would read the matched contact from your address book and show it. (Simulated here — the web prototype has no access to your contacts.)`,
        autoExecute: false,
        opensAvatarStudio: false,
      };
    case "DIAL_CONTACT":
      return {
        title: `Call ${proposal.params.name}`,
        detail: `Android host action: resolve "${proposal.params.name}" in your contacts, then open the dialer. Placing the call happens only after the standard Android call permission and your confirmation.`,
        confirmLabel: "Simulate call",
        simulatedOutcome: `On your phone, RUDRA would resolve the contact and open the dialer for you to confirm the call. (Simulated here — the web prototype cannot call anyone.)`,
        autoExecute: false,
        opensAvatarStudio: false,
      };
    case "CANCEL_ACTION":
      return {
        title: "Cancel pending action",
        detail: "Cancels the assistant's most recent pending device action before it is confirmed or executed.",
        confirmLabel: "Cancel action",
        simulatedOutcome: "The pending action was cancelled. Nothing was executed.",
        autoExecute: true,
        opensAvatarStudio: false,
      };
    case "GENERATE_AVATAR":
      return {
        title: "Generate a new avatar",
        detail: "Opens Avatar Studio, where the connected image service generates a new guardian avatar for you.",
        confirmLabel: "Open Avatar Studio",
        simulatedOutcome: "",
        autoExecute: true,
        opensAvatarStudio: true,
      };
    default:
      return null;
  }
}
