# Phase 1 - Foundation

Estimated duration: Weeks 1-2.

## Goal

Create the base Expo and Supabase application foundation with authentication, navigation, theme primitives, database schema, and Urdu-ready UI support.

## Scope

- Scaffold React Native app with Expo SDK 52.
- Configure Expo Router with auth routes, tab routes, detail routes, and the voice screen.
- Configure NativeWind and shared theme files.
- Add luxury theme tokens:
  - Near black background: `#0A0A0A`
  - Deep navy surfaces: `#1A1A2E`
  - Gold primary accent: `#D4AF37`
  - Royal purple secondary accent: `#9B59B6`
  - Ivory primary text: `#F5F5DC`
  - Aged gold muted text: `#A89060`
  - Deep red danger: `#C0392B`
  - Emerald success: `#1ABC9C`
- Add typography setup for headings, financial data, and Urdu text.
- Configure Supabase client, environment variables, and auth.
- Implement OTP login through Supabase Auth.
- Add role-ready user profile structure.
- Create initial database schema migrations.
- Seed Company A, Company B, and Self.
- Seed initial expense types and stock categories.
- Add RTL support for Urdu text surfaces.

## Initial Routes

- `/app/(auth)/login.jsx`
- `/app/(tabs)/index.jsx`
- `/app/(tabs)/stock.jsx`
- `/app/(tabs)/sales.jsx`
- `/app/(tabs)/expenses.jsx`
- `/app/(tabs)/reports.jsx`
- `/app/voice.jsx`
- `/app/purchase/[id].jsx`
- `/app/sale/[id].jsx`

## Initial Components

- `Card.jsx`
- `GoldButton.jsx`
- `StatBox.jsx`
- `DataTable.jsx`
- `VoiceButton.jsx`
- `ChatBubble.jsx`

## Database Work

Create the base schema for:

- `companies`
- `profiles`
- `purchases`
- `sales`
- `expenses`
- `stock_entries`
- `minerals`
- `staff`
- `salaries`
- `closing_balance`

## Deliverables

- App launches locally on Expo.
- Supabase connection works.
- OTP login flow is available.
- Main navigation shell exists.
- Theme primitives and shared UI components exist.
- Database schema can be recreated from migrations.
- Company A, Company B, and Self exist as seeded entities.

## Acceptance Criteria

- A new developer can install dependencies and run the app.
- Authenticated users can reach the tab dashboard.
- Unauthenticated users are redirected to login.
- All initial business tables include the expected relationship fields.
- Urdu text components render RTL without layout breakage.
