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
- RTL Urdu chat bubbles.
- Error states for microphone, live agent, and AI response failures.

## Voice Flow

1. User taps Live on `/app/voice.jsx`.
2. App opens a live voice session.
3. User speech is streamed to the live voice agent.
4. Conversation text and live business data are used to answer financial questions.
5. The assistant speaks the response through the live audio stream.
6. Conversation history is shown with RTL chat bubbles.

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
- What are Company A's sales this month?
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

Required Supabase function secrets:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_LIVE_MODEL`

When Supabase or voice providers are not configured, the app still supports typed questions and returns a local financial answer from current business data.

## Acceptance Criteria

- Live voice input works on supported platforms.
- The assistant answers in the user's language style.
- Answers are based on live Supabase business data.
- Spoken audio playback works through the live stream.
- Failures show clear retry states.
- Secrets are not bundled into the mobile app.
