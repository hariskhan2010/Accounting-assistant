# Phase 4 - Urdu AI Voice Chatbot

Estimated duration: Weeks 8-9.

## Goal

Implement an Urdu voice assistant that answers business and financial questions using live app data.

## Scope

- Live microphone streaming on supported platforms.
- Gemini Live API for continuous speech input and spoken responses.
- Business data context builder from Supabase.
- Gemini-backed financial prompt/context service.
- Audio playback through the live agent stream.
- Voice chatbot screen.
- Floating diamond voice indicator hidden by default until the wake phrase is detected.
- RTL Urdu chat bubbles.
- Error states for microphone, live agent, and AI response failures.

## Voice Flow

1. The floating diamond voice indicator is hidden by default.
2. User says the wake phrase: "hey accountant".
3. The diamond indicator animates up from the bottom, spins once, and stops in its fixed position.
4. User taps Live on `/app/voice.jsx` or opens the assistant flow.
5. App opens a live voice session.
6. User speech is streamed to the live voice agent.
7. Conversation text and live business data are used to answer financial questions.
8. The assistant speaks the response through the live audio stream.
9. Conversation history is shown with RTL chat bubbles.

## Voice Indicator Rules

- Keep the diamond and wave final positions unchanged unless the request is specifically about their layout.
- The diamond remains still after the wake animation finishes.
- The diamond remains untouchable; tapping it must not open the assistant.
- The wave stays below the diamond with the current spacing.
- Do not adjust `DiamondVoiceIndicator.jsx` or `AssistantProvider.jsx` during unrelated dashboard, accounting, or report changes.

## Data Context

The chatbot should receive only the business data needed for the answer, such as:

- Current date.
- Selected company entity.
- This month's revenue.
- This month's expenses.
- Current stock balance.
- Stock value.
- Net profit.
- Staff salary totals.
- Recent purchases and sales when relevant.

## Example Supported Questions

- What is this month's revenue?
- How much stock is remaining?
- What is this month's profit?
- What is the total staff salary amount?
- What are Company sales this month?
- What is the combined closing balance?

## Security Rules

- Do not expose API keys in the client.
- Prefer Supabase Edge Functions for calls that require secret keys.
- Limit the data sent to Gemini to the minimum required financial context.
- Respect authenticated user permissions when building chatbot context.

## Deliverables

- `useVoiceChat.js`
- `gemini.js`
- live voice agent service
- Voice screen UI.
- RTL chat components.
- Backend or edge function wrappers for protected API calls.

## Edge Functions

The Expo app calls Supabase Edge Functions so provider secrets are not bundled into the client:

- `urdu-gemini-assistant`
- `gemini-live-token`
- `urdu-elevenlabs-tts`

Required Supabase function secrets:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_LIVE_MODEL`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `ELEVENLABS_MODEL_ID`

When Supabase or voice providers are not configured, the app still supports typed questions and returns a local financial answer from current business data.

## Deployment Status - June 12, 2026

Supabase project:

- Project ref: `hyjfqsxavrykjzmaaasd`
- Dashboard: `https://supabase.com/dashboard/project/hyjfqsxavrykjzmaaasd/functions`

Deployed functions:

- `urdu-gemini-assistant`
- `gemini-live-token`
- `urdu-elevenlabs-tts`

The Supabase CLI is not installed globally on the current Windows machine, so use `npx.cmd`:

```bash
npx.cmd supabase functions deploy urdu-gemini-assistant --project-ref hyjfqsxavrykjzmaaasd
npx.cmd supabase functions deploy gemini-live-token --project-ref hyjfqsxavrykjzmaaasd
npx.cmd supabase functions deploy urdu-elevenlabs-tts --project-ref hyjfqsxavrykjzmaaasd
npx.cmd supabase secrets set --env-file .env --project-ref hyjfqsxavrykjzmaaasd
```

The deployment may print `WARNING: Docker is not running`. This is acceptable for the current hosted deployment flow when the output also says `Deployed Functions`.

Verification command:

```bash
node scripts/check-assistant.js
```

Last verified result:

```json
{
  "urduGeminiAssistant": {
    "ok": true,
    "hasAnswer": true
  },
  "geminiLiveToken": {
    "ok": true,
    "hasToken": true,
    "model": "gemini-2.5-flash-native-audio-preview-12-2025"
  }
}
```

Known limitation:

- Gemini Live streaming microphone support is currently implemented for Expo Web. Native iOS and Android still need a native streaming microphone module before live voice mode can work there.

## Acceptance Criteria

- Live voice input works on supported platforms.
- "Hey accountant" reveals the hidden floating diamond indicator.
- The indicator moves up from the bottom, spins once, then stops in its final position.
- The assistant answers in the user's language style.
- Answers are based on live Supabase business data.
- Spoken audio playback works through the live stream.
- Failures show clear retry states.
- Secrets are not bundled into the mobile app.

