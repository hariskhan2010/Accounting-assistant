# Phase 5 - Polish, Testing, and Deployment

Estimated duration: Week 10.

## Goal

Stabilize the app for real use, polish the luxury experience, verify accounting accuracy, and prepare mobile and web deployment.

## Scope

- UI and UX polish.
- Dashboard charts and KPIs.
- Smooth animations with Reanimated.
- Chart implementation with Victory Native XL.
- Device testing on iOS and Android.
- Web testing through Expo Web.
- Accounting rule tests.
- Export tests.
- Voice chatbot integration tests where practical.
- EAS Build setup.
- App Store and Play Store build preparation.
- Web deployment to Vercel or Netlify.
- Operational documentation.

## UI Polish

- Ensure luxury theme consistency.
- Use gold accents for primary actions.
- Keep financial tables readable and dense.
- Ensure Urdu text is correctly aligned and readable.
- Add loading, empty, and error states.
- Verify charts render across mobile and web.

## Testing Priorities

- Purchase totals.
- Sale totals.
- Stock inward and outward calculations.
- Expense totals.
- Salary payment totals.
- Specimen profit.
- Closing balance.
- Monthly and annual reports.
- Entity filters for Company, Self, and all entities.
- PDF and Excel export values.
- Authentication redirects.
- Voice flow error handling.

## Deployment Targets

- iOS: EAS Build to `.ipa` for App Store submission.
- Android: EAS Build to `.apk` or `.aab` for Play Store submission.
- Web: Expo Web hosted on Vercel or Netlify.
- Backend: Supabase cloud.
- Updates: Expo OTA updates for JavaScript changes.

## Deliverables

- Tested production build configuration.
- EAS project configuration.
- Store-ready mobile builds.
- Web deployment configuration.
- Final user-facing polish pass.
- Setup and troubleshooting documentation.

## Acceptance Criteria

- App works on tested iOS and Android devices.
- Expo Web build works for browser access.
- Core financial calculations pass automated tests.
- Dashboard and reports use accurate live data.
- Build configuration can be reproduced from a clean checkout.
- Deployment docs explain environment variables, Supabase setup, and external API keys.

