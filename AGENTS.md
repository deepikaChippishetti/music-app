# AGENTS.md

## Project Type

Expo SDK 54 + React Native 0.81 + TypeScript app with file-based routing (expo-router).

## Developer Commands

```bash
npm start        # Start dev server (same as npx expo start)
npm run android  # Run on Android emulator
npm run ios      # Run on iOS simulator
npm run web      # Run in browser
npm run lint     # Run ESLint
npm run reset-project  # Reset to fresh project template
```

## Important Constraints

- **Requires Expo Dev Client** — not Expo Go. Media library and background audio need a dev build (`npx expo prebuild` then build native).
- **No bare workflow** — use only Expo-managed libraries (`expo-media-library`, `expo-av`, `expo-file-system`).
- **iOS/Android only** — no web support for media features.

## Architecture

- **Routing**: File-based via `app/` directory (`app/(tabs)/`, `app/modal.tsx`)
- **State**: Zustand stores in `stores/` (`usePlayerStore`, `useLibraryStore`)
- **Services**: Business logic in `services/` (player, library, permissions)
- **Design tokens**: `utils/colors.ts`, `utils/typography.ts`, `utils/spacing.ts`
- **Types**: Shared interfaces in `types/`

## Known Limitations

- No lock screen controls (expo-av limitation)
- Limited metadata (only title, artist, album, duration, artwork)
- No arbitrary filesystem scanning (iOS sandboxing)

## Reference

- Full implementation plan: `docs/implementation.md`