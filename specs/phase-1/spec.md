# Phase 1: Foundation & Project Setup

## Objective

Establish the base structure, environment, and shared foundations that all future phases build on — for both iOS and Android.

---

## 1. Project Initialization

### 1.1 Scaffold & Structure

- [x] Already scaffolded via `npx create-expo-app@latest`
- [x] Already has folder structure with:
  - `services/` — business logic
  - `utils/` — pure helpers
  - `types/` — shared TypeScript interfaces
  - `components/` — reusable UI components
  - `screens/` — full screen components
  - `stores/` — Zustand store definitions
  - `hooks/` — custom React hooks

### 1.2 Path Aliases

- [x] Configure `@/*` path alias in `tsconfig.json`
- [x] Already configured via base config

---

## 2. Design System Foundation

### 2.1 Colors (`utils/colors.ts`)

Create with full dark theme tokens:

```ts
export const colors = {
  // Base
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#666666',

  // Accent
  primary: '#BB86FC',
  primaryDark: '#9A67EA',

  // Functional
  error: '#CF6679',
  success: '#4CAF50',

  // Misc
  divider: '#333333',
  overlay: 'rgba(0, 0, 0, 0.5)',
};
```

### 2.2 Typography (`utils/typography.ts`)

Create font size and weight scale:

```ts
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    h1: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
```

### 2.3 Spacing (`utils/spacing.ts`)

Create spacing scale:

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

---

## 3. Navigation Shell

### 3.1 Expo Router Setup

- [x] Already using expo-router file-based routing
- [x] Verified bottom tab navigator configuration

### 3.2 Route Structure

Create/verify these routes:

```
app/
├── _layout.tsx           # Root layout with providers
├── (tabs)/
│   ├── _layout.tsx       # Tab navigator
│   ├── songs/
│   │   └── index.tsx     # Songs tab screen
│   └── library/
│       └── index.tsx     # Library tab screen
└── modal.tsx             # Now Playing modal
```

### 3.3 Placeholder Screens

- [x] Created placeholder for Songs tab screen
- [x] Created placeholder for Library tab screen
- [x] Created placeholder for Now Playing modal

---

## 4. Store Scaffolding

### 4.1 Player Store (`stores/usePlayerStore.ts`)

Create with initial shape (empty state for now, logic added in Phase 3):

```ts
import { create } from 'zustand';

interface PlayerState {
  // Empty for now — will be populated in Phase 3
  currentSong: null;
  isPlaying: false;
  position: 0;
  duration: 0;
  queue: [];
  queueIndex: 0;

  // Actions (empty for now)
  play: () => void;
  pause: () => void;
  // ...
}

export const usePlayerStore = create<PlayerState>((set) => ({
  // Initial empty state
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,

  // Actions placeholder — implement in Phase 2/3
  play: () => {},
  pause: () => {},
}));
```

### 4.2 Library Store (`stores/useLibraryStore.ts`)

Create with initial shape (empty state for now, logic added in Phase 4):

```ts
import { create } from 'zustand';

interface LibraryState {
  likedSongIds: string[];
  albums: Array<{
    id: string;
    name: string;
    songIds: string[];
    createdAt: string;
  }>;

  // Actions (empty for now)
  toggleLike: () => void;
  // ...
}

export const useLibraryStore = create<LibraryState>((set) => ({
  likedSongIds: [],
  albums: [],

  // Actions placeholder
  toggleLike: () => {},
}));
```

---

## 5. Native Platform Configuration

### 5.1 Android (`app.json`)

Update the `android` section:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-media-library",
        {
          "isAccessMediaLocationEnabled": true
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": false
        }
      ]
    ],
    "android": {
      "package": "com.musicapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#121212"
      },
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "READ_MEDIA_AUDIO"
      ],
      "useNextNotificationsApi": true
    }
  }
}
```

### 5.2 iOS (`app.json`)

Update the `ios` section:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.musicapp",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to display album artwork.",
        "NSAppleMusicUsageDescription": "This app needs access to your music library to play your songs.",
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

### 5.3 Configuration Notes

- [x] Both platforms configured via `app.json` only
- [x] No manual edits to `AndroidManifest.xml` or `Info.plist`
- [x] Regenerate native folders with `npx expo prebuild` after config changes

---

## 6. Dependencies

- [x] Installed: `expo` (^54.0.0)
- [x] Installed: `expo-router` (^4.0.0)
- [x] Installed: `react-native` (0.81.x)
- [x] Installed: `expo-av` (^15.0.0)
- [x] Installed: `expo-media-library` (^18.0.0)
- [x] Installed: `expo-file-system` (^18.0.0)
- [x] Installed: `zustand` (^5.0.0)
- [x] Installed: `typescript` (^5.0.0)

---

## 7. Verification Checklist

- [x] `@/*` path alias works in TypeScript files
- [x] `utils/colors.ts` exports dark theme colors
- [x] `utils/typography.ts` exports font scale
- [x] `utils/spacing.ts` exports spacing scale
- [x] App renders bottom tabs: "Songs" and "Library"
- [x] Tab navigation works between screens
- [x] Mini Player component created (shows when song playing)
- [x] Now Playing modal opens from tabs
- [x] Native projects generated with `npx expo prebuild`
- [x] Lint passes (1 warning only)