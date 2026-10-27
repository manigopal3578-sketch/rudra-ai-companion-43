# RUDRA AI Companion (43)

# RUDRA — MASTER PRODUCT, DESIGN AND ENGINEERING SPECIFICATION
## Premium AI Personal Assistant | Android First | Multilingual | Voice-First

Act as a principal product architect, senior Android engineer, AI systems engineer, premium UI/UX designer, accessibility specialist and motion-design engineer.

Build RUDRA, a serious, extensible personal AI assistant with a distinctive futuristic identity. This is not merely a landing page, chatbot mockup or developer dashboard. The long-term goal is a genuinely useful assistant that understands natural conversation, speaks naturally, assists with everyday tasks, and performs supported phone actions through authorized native Android APIs.

Create the best possible implementation in the current platform. Do not claim that browser code can perform capabilities that require native Android integration.

## 1. PRODUCT IDENTITY

Product name: RUDRA.

Core identity:
- Premium futuristic AI companion.
- Electric-blue Shiva-inspired trident emblem.
- Luminous glass-like AI orb.
- Deep-black and midnight-navy atmosphere.
- Electric cyan and blue light with subtle violet accents.
- Respectful, distinctive fictional guardian avatar.
- Calm, intelligent, reliable and confident personality.

Design philosophy:
Power through simplicity. Intelligence without clutter. Beautiful visuals backed by honest functionality.

Do not make the interface resemble a generic SaaS dashboard, admin panel, analytics tool or developer workbench.

## 2. VISUAL DESIGN SYSTEM

Use a centralized, consistent design system.

Suggested colors:
- Background: #02040A
- Secondary background: #07111F
- Elevated surfaces: #0B1424
- Electric cyan: #00D9FF
- Primary blue: #258BFF
- Deep blue: #0755D9
- Violet accent: #846BFF
- Primary text: #F4F8FF
- Secondary text: #91A3BA
- Subtle borders: rgba(135,184,255,0.15)

Use modern typography such as Inter or Plus Jakarta Sans. Establish consistent spacing, typography, border radii, shadows and responsive breakpoints.

Avoid excessive gradients, excessive glow, giant text, decorative cards everywhere, unnecessary borders, horizontal scrolling and random colors.

The glowing orb and trident must form a recognizable and consistent visual identity.

Use the provided reference assets when available. Do not replace supplied artwork with unrelated stock images.

## 3. MAIN ASSISTANT SCREEN

Design a premium mobile-first home screen.

Header:
- Small trident emblem.
- RUDRA wordmark.
- Honest availability indicator.
- Minimal settings access.

Central section:
- Large, beautiful luminous AI core.
- Layered glass-like surfaces.
- Controlled electric-blue illumination.
- Subtle orbiting particles and energy ribbons.
- Smooth animation with reduced-motion support.

Greeting:
"Hello, [user name when configured]"

Main heading:
"How can I help you today?"

Supporting text:
"Speak naturally. I'm listening."

Command composer:
- Placeholder: "Ask RUDRA anything..."
- Microphone control.
- Send control.
- Clear focus, disabled, loading and error states.
- Keyboard-aware positioning.
- Readable long responses and Telugu text.

Suggested commands:
- Open an app.
- Teach me Python.
- Set an alarm.
- Show your avatar.

Use no more than four suggestions. Keep the screen focused on the assistant.

## 4. VOICE-FIRST INTERACTION

Create a dedicated immersive voice mode.

Support explicit interface states:
IDLE, LISTENING, TRANSCRIBING, THINKING, SPEAKING, CONFIRMING, EXECUTING, SUCCESS, ERROR and CANCELLED.

When listening:
- Animate the orb gently.
- Show a waveform when actual audio data is available.
- Display the recognized transcript.
- Provide a clear stop/cancel control.

When thinking:
- Use a subtle processing animation.
- Avoid fake progress percentages.

When speaking:
- Display the answer or a readable transcript.
- Stop playback when the user interrupts, where supported.
- Provide replay and stop controls where appropriate.

Make voice interaction feel natural and responsive, not theatrical.

Do not simulate microphone permission, speech recognition, audio playback or continuous listening as if they were real.

## 5. MULTILINGUAL INTELLIGENCE

Design the assistant to support:
- English.
- Telugu script.
- Telugu written in Latin characters.
- Mixed Telugu-English speech and text.

Example requests:
"Hey RUDRA, open Instagram."
"Instagram open cheyyi."
"Instagram తెరువు."
"Amma ki call cheyyi."
"Naaku Python nerpinchu."
"Repu morning six ki alarm pettu."
"Cancel cheyyi."

Preserve proper names. Understand corrections and negation. Ask short clarifying questions when essential information is missing.

Use configurable speech-recognition and speech-synthesis providers. Do not assume all providers support Telugu or code-switching equally well. Test language support and pronunciation using actual audio.

## 6. INTELLIGENT ANSWERS

RUDRA must have a conversational response path separate from device-action proposals.

It should be designed to:
- Answer general questions clearly.
- Teach programming and technical topics step by step.
- Explain concepts at the requested level.
- Maintain relevant conversation context.
- Respond in the user's preferred or detected language.
- Handle follow-up questions naturally.
- Use configured search or retrieval tools when appropriate.
- Distinguish facts from estimates.
- Admit uncertainty.
- Avoid fabricated sources, invented facts and irrelevant generic answers.

Keep answers concise for simple requests and detailed when requested.

A prompt alone is not a trained model or a connected AI service. Use a documented backend/provider interface for actual inference.

## 7. REAL ANDROID ACTIONS

The long-term Android implementation must support authorized actions such as:
- Open an installed application.
- Resolve contacts.
- Open the dialer for a resolved contact.
- Initiate a call only through appropriate Android permission and confirmation policies.
- Set alarms using supported Android mechanisms.
- Cancel pending assistant actions.
- Display or generate an avatar through a configured image service.

Use a strict intent contract with these initial intents:

OPEN_APP
FIND_CONTACT
DIAL_CONTACT
SET_ALARM
ASK_ASSISTANT
CANCEL_ACTION
GENERATE_AVATAR
UNKNOWN

The AI may propose an action. The Android host must validate, authorize, confirm where required, execute and verify it.

Use this lifecycle:

UNDERSTAND → VALIDATE → AUTHORIZE → CONFIRM IF REQUIRED → EXECUTE → VERIFY → RESPOND.

Never generate arbitrary shell commands. Never bypass permissions. Never fabricate installed applications, contacts, phone numbers, dates or action results.

The website prototype must clearly distinguish simulated device actions from real native Android execution.

## 8. RUDRA AVATAR STUDIO

Create a premium avatar experience.

Visual direction:
- Fictional, respectful Shiva-inspired futuristic guardian.
- Luminous electric-blue trident.
- Midnight-black background.
- Flowing cyan energy ribbons.
- Restrained holographic aura.
- Cinematic lighting and sharp detail.
- Consistent identity across images.

Include:
- Existing avatar preview.
- Generate new avatar.
- Loading state.
- Failure and retry states.
- Save and share.
- Cancellation when supported.

Do not regenerate the avatar merely because the user asks to see it. Reuse an approved image when available.

Only claim image generation works when a compatible image provider has been configured and tested.

## 9. HISTORY AND SETTINGS

History:
- Recent conversations.
- Readable transcripts.
- Actual action outcomes when available.
- Empty state.
- Clear-history action.

Settings:
- Language.
- Voice and speech rate.
- Sound effects.
- Animation intensity.
- Reduced motion.
- Privacy.
- Conversation history.
- Permissions.
- Wake-word availability.
- Connected AI and image services.

Clearly distinguish stored preferences from visual-only settings.

Do not represent a simulated wake-word switch as background microphone functionality.

## 10. NAVIGATION AND RESPONSIVENESS

Use simple navigation:
- Assistant.
- History.
- Settings.

Provide access to Avatar Studio without overcrowding the main screen.

Prioritize mobile widths of approximately 360–430 CSS pixels, then adapt to tablet and desktop.

Requirements:
- No unintended horizontal scrolling.
- No clipped text or controls.
- Safe-area support.
- Keyboard-aware layout.
- Accessible labels and visible focus.
- Adequate contrast.
- Long Telugu and mixed-language text support.
- Touch-friendly controls.
- Reduced-motion support.

## 11. TECHNICAL ARCHITECTURE

For the Lovable deliverable, use React and TypeScript with reusable components, a clean design-token system and separated UI/business logic.

Create interfaces for:
- Conversation service.
- AI provider.
- Speech recognition.
- Text-to-speech.
- Structured intent proposals.
- Image generation.
- Conversation history.
- Capability status.

Do not expose API secrets in frontend code. Use a secured backend for provider credentials.

Avoid unnecessary databases, authentication systems, services and dependencies unless the feature requires them.

The actual Android application will be implemented separately using Kotlin and Jetpack Compose in Antigravity. Do not assume that a React web interface can be copied directly into a native Android app.

Provide an integration handoff that explains how to reproduce the visual system and connect the frontend contracts to the Android implementation.

## 12. IMPLEMENTATION AND TESTING

First inspect the available project environment and implement the best supported result.

If this is a new Lovable project, build the complete frontend foundation.

If an existing project is present, preserve useful components and avoid destructive rewrites.

Implement:
- Main assistant screen.
- Voice mode.
- Conversation interface.
- Avatar Studio.
- History.
- Settings.
- Responsive navigation.
- Loading, empty, error and cancellation states.
- Reusable design components.

Run available type checks, tests and builds. Report actual results, not assumed success.

For every major capability, use one of these statuses:
IMPLEMENTED, PARTIALLY IMPLEMENTED, DEMO ONLY, BLOCKED or NOT TESTED.

## 13. FINAL DELIVERABLE

Produce a premium, consistent, usable RUDRA frontend and a clear technical handoff.

Report:
1. Implemented screens and components.
2. Reusable design tokens and visual assets.
3. Functional interactions.
4. Simulated features.
5. Required backend services and credentials.
6. Android-only features.
7. Test and build results.
8. Known limitations.
9. The exact next steps for Google AI Studio and Antigravity integration.

Do not claim the full personal assistant is complete just because the visual prototype works.

Prioritize real functionality, visual quality, safety, maintainability and honest verification.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7b48d05a-f633-477c-982a-1135ba85c8a8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
