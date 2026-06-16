# Gems and Minerals Accounting App - Phase Docs

This documentation breaks the project plan from `AGENTS.md` into implementation phases.

## Product Summary

The app is a mobile and web accounting system for gems, minerals, and raw material trading businesses. It must support purchases, sales, stock movement, expenses, mineral specimens, staff salaries, financial reporting, company plus self account separation, and an Urdu voice assistant.

## Required Stack

- Frontend: React Native, Expo SDK 52, Expo Router, NativeWind, Reanimated.
- Backend: Supabase PostgreSQL, Supabase Auth, Supabase Storage, Supabase Edge Functions when needed.
- AI and voice: Gemini Live API for continuous multilingual voice, Gemini-backed financial context, and server-side provider secrets.
- Wake phrase: "hey accountant" reveals the hidden floating diamond voice indicator.
- Exports: PDF invoices/reports and Excel financial data.

## Phase Index

1. [Phase 1 - Foundation](phase-01-foundation.md)
2. [Phase 2 - Core Accounting](phase-02-core-accounting.md)
3. [Phase 3 - Extended Business Modules](phase-03-extended-business-modules.md)
4. [Phase 4 - Urdu AI Voice Chatbot](phase-04-urdu-ai-voice-chatbot.md)
5. [Phase 5 - Polish, Testing, and Deployment](phase-05-polish-testing-deployment.md)

## Current Deployment Notes

- Supabase project ref: `hyjfqsxavrykjzmaaasd`.
- Assistant Edge Functions deployed on June 12, 2026:
  - `urdu-gemini-assistant`
  - `gemini-live-token`
  - `urdu-elevenlabs-tts`
- Function secrets were uploaded from `.env` with `npx.cmd supabase secrets set --env-file .env --project-ref hyjfqsxavrykjzmaaasd`.
- The assistant diagnostic passed with Gemini text answers and Gemini Live token generation.
- If `supabase` is not recognized on Windows, use `npx.cmd supabase ...`.

## Cross-Phase Rules

- Every business record that belongs to an entity must include `company_id`.
- Supported entities are Company and Self.
- Financial data must be filterable per entity and combined across entities.
- Stock must distinguish raw materials, polished gems, and mineral specimens.
- Urdu UI and chatbot surfaces must support right-to-left text.
- Generated accounting records must preserve traceability back to the source purchase, sale, expense, salary, or specimen record.

