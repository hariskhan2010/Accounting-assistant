# Design and Animation Pipeline

## Flow

1. Figma defines layout, spacing, colors, typography, component states, and motion intent.
2. Codex converts the design into Expo Router screens and reusable React Native components.
3. GSAP powers luxury web scroll reveals and timeline animation where scroll timing matters.
4. Spline or Three.js powers advanced gemstone visuals, loaded lazily so the app remains fast.

## Performance Rule

Heavy visual systems must not be imported directly by first-load routes. Use lazy bridge components:

- `LazyGemScene` for Three.js gemstone effects.
- `GsapReveal` for web scroll reveal animation.

The first screen should render useful accounting UI immediately, then load premium motion layers after initial paint.

## Current Implementation

- Dashboard uses `LazyGemScene` for deferred Three.js gemstone effects.
- Dashboard uses `GsapReveal` for scroll animation.
- Login uses lightweight `GemHero` for fast authentication loading.
- The original Three.js scene remains available in `components/gemstone/GemScene.jsx`.
