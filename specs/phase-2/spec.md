# Phase 2: Device Access & Music Discovery

## Objective

Request media permissions and build the music dataset using `expo-media-library` consistently on both platforms.

---

## 1. Permission Service

### 1.1 Permission Request

- [ ] Use `MediaLibrary.requestPermissionsAsync()` from `expo-media-library`
- [ ] Works identically on iOS and Android
- [ ] Handle all permission states: `granted`, `denied`, `blocked`, `undetermined`

### 1.2 Permission State Mapping

```ts
import { MediaLibrary } from 'expo-media-library';

type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

async function checkPermission(): Promise<PermissionStatus> {
  const { status } = await MediaLibrary.getPermissionsAsync();
  return mapStatus(status);
}

async function requestPermission(): Promise<PermissionStatus> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (!canAskAgain) return 'blocked';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

function mapStatus(status: string): PermissionStatus {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'restricted':
    case 'limited':
      return 'blocked';
    default:
      return 'undetermined';
  }
}
```

### 1.3 Blocked Permission Handling

- [ ] When permission is `blocked`, call `Linking.openSettings()` to send user to system settings
- [ ] Provide a UI button that triggers this action

### 1.4 App State Listener

- [ ] Re-check permission state when app returns to foreground using `AppState` listener
- [ ] Update store state on app foreground

### 1.5 Store Integration

- [ ] Store permission state in `usePlayerStore`
- [ ] Add `permissionStatus: PermissionStatus` to player store

```ts
// stores/usePlayerStore.ts - add to interface
permissionStatus: PermissionStatus;
setPermissionStatus: (status: PermissionStatus) => void;
```

---

## 2. Permission Denied UI

### 2.1 Full-Screen Empty State

- [ ] When permission is `denied` or `blocked`, show a dedicated full-screen empty state
- [ ] This is NOT an error — it is a standard UI state
- [ ] Empty state includes:
  - Icon (music/library related)
  - Explanation text
  - CTA button ("Open Settings" or "Grant Access")

### 2.2 Component: PermissionDeniedScreen

Create `components/permission-denied-screen.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';
import { Linking } from 'react-native';

interface PermissionDeniedScreenProps {
  status: 'denied' | 'blocked';
}

export function PermissionDeniedScreen({ status }: PermissionDeniedScreenProps) {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={styles.title}>
        {status === 'blocked' ? 'Permission Required' : 'Access Your Music'}
      </Text>
      <Text style={styles.description}>
        {status === 'blocked'
          ? 'You have denied permission permanently. Please enable access in Settings.'
          : 'We need access to your music library to show your songs.'}
      </Text>
      <Pressable style={styles.button} onPress={handleOpenSettings}>
        <Text style={styles.buttonText}>
          {status === 'blocked' ? 'Open Settings' : 'Grant Access'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.sizes.xl,
    ...typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.sizes.md,
    ...typography.weights.semibold,
    color: colors.textInverse,
  },
});
```

---

## 3. Music Discovery Service

### 3.1 Asset Fetching

- [ ] Use `MediaLibrary.getAssetsAsync({ mediaType: MediaLibrary.MediaType.audio })`
- [ ] Works on both platforms
- [ ] Paginate using `after` cursor until `hasNextPage` is false
- [ ] Do NOT assume all assets fit in one call

### 3.2 Asset Info Retrieval

- [ ] For each asset, call `MediaLibrary.getAssetInfoAsync(asset)` to retrieve `localUri`
- [ ] `localUri` is a `file://` path required for `expo-av` playback
- [ ] The `ph://` → `localUri` conversion happens inside the discovery service, never downstream

### 3.3 Filtering Non-Music Assets

- [ ] Filter out assets under 30 seconds (voice memos, ringtones, notification sounds)
- [ ] Use `duration` property from asset info

### 3.4 Metadata Normalization

- [ ] Missing `title` → fall back to filename (strip path and extension)
- [ ] Missing `artist` → fall back to `"Unknown Artist"`
- [ ] Missing `album` → fall back to `"Unknown Album"`

### 3.5 Deduplication

- [ ] Deduplicate songs by `localUri`
- [ ] Return typed `Song[]` array

### 3.6 Service Implementation

Create `services/musicDiscovery.ts`:

```ts
import { MediaLibrary } from 'expo-media-library';
import { Song } from '@/types/Song';

const MIN_DURATION_MS = 30_000; // 30 seconds

export async function discoverSongs(): Promise<Song[]> {
  const allAssets: MediaLibrary.Asset[] = [];
  let after: string | undefined = undefined;

  // Paginate through all assets
  do {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 100,
      after,
    });

    allAssets.push(...result.assets);
    after = result.hasNextPage ? result.endCursor : undefined;
  } while (after);

  // Fetch detailed info for each asset to get localUri
  const songs: Song[] = [];
  const seenUris = new Set<string>();

  // Process in batches to avoid too many sequential calls
  const batchSize = 20;
  for (let i = 0; i < allAssets.length; i += batchSize) {
    const batch = allAssets.slice(i, i + batchSize);
    const detailedInfos = await Promise.all(
      batch.map((asset) => MediaLibrary.getAssetInfoAsync(asset, { copyToCache: false }))
    );

    for (const info of detailedInfos) {
      if (!info.localUri || seenUris.has(info.localUri)) continue;
      if ((info.duration || 0) < MIN_DURATION_MS / 1000) continue;

      seenUris.add(info.localUri);

      songs.push({
        id: info.id,
        title: info.filename?.replace(/\.[^/.]+$/, '') || 'Unknown Title',
        artist: info.artist || 'Unknown Artist',
        album: info.album || 'Unknown Album',
        duration: (info.duration || 0) * 1000, // Convert to milliseconds
        uri: info.localUri,
        artwork: info.uri, // Asset URI for artwork (optional)
      });
    }
  }

  return songs;
}
```

---

## 4. Data Modeling

### 4.1 Song Type Definition

Create `types/Song.ts`:

```ts
export type Song = {
  id: string; // asset.id from expo-media-library
  title: string;
  artist: string;
  album: string;
  duration: number; // milliseconds
  uri: string; // localUri (file://) — safe for expo-av playback
  artwork?: string; // asset URI for artwork, optional
};
```

### 4.2 Type Usage Rules

- [ ] `uri` is always a `file://` path by the time it reaches the store
- [ ] All downstream code imports from `types/Song.ts` — no local type redefinitions
- [ ] Add Song type export to `types/index.ts` if needed

---

## 5. Store Integration

### 5.1 Player Store Updates

Update `stores/usePlayerStore.ts`:

```ts
import { create } from 'zustand';
import { Song } from '@/types/Song';
import { discoverSongs } from '@/services/musicDiscovery';

type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

interface PlayerState {
  // Permission
  permissionStatus: PermissionStatus;
  setPermissionStatus: (status: PermissionStatus) => void;

  // Songs
  songs: Song[];
  isLoadingSongs: boolean;
  setSongs: (songs: Song[]) => void;
  loadSongs: () => Promise<void>;

  // Playback state (empty for now)
  currentSong: null;
  isPlaying: false;
  position: 0;
  duration: 0;
  queue: Song[];
  queueIndex: 0;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  // Permission
  permissionStatus: 'undetermined',
  setPermissionStatus: (status) => set({ permissionStatus: status }),

  // Songs
  songs: [],
  isLoadingSongs: false,
  setSongs: (songs) => set({ songs }),
  loadSongs: async () => {
    set({ isLoadingSongs: true });
    try {
      const songs = await discoverSongs();
      set({ songs, isLoadingSongs: false });
    } catch (error) {
      console.error('Failed to load songs:', error);
      set({ isLoadingSongs: false });
    }
  },

  // Playback state (empty for now)
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
}));
```

---

## 6. Integration Points

### 6.1 Songs Screen Updates

- [ ] Update Songs tab to load songs after permission is granted
- [ ] Show `PermissionDeniedScreen` when permission is denied/blocked
- [ ] Show loading state while discovering songs
- [ ] Show empty state if no songs found (after permission granted)

### 6.2 App Startup Flow

1. App starts → check permission status
2. If `undetermined` → request permission
3. If `granted` → load songs
4. If `denied` → show PermissionDeniedScreen with "Grant Access" button
5. If `blocked` → show PermissionDeniedScreen with "Open Settings" button
6. On app foreground → re-check permission status

### 6.3 Error Handling

- [ ] Handle `asset_unavailable` errors when fetching asset info
- [ ] Log errors to console in development
- [ ] Show user-friendly error message if discovery fails

---

## 7. Verification Checklist

- [ ] Permission request works on iOS
- [ ] Permission request works on Android (requires development build)
- [ ] PermissionDeniedScreen shows when permission denied
- [ ] PermissionDeniedScreen shows when permission blocked
- [ ] "Open Settings" button opens system settings
- [ ] Songs load and display after permission granted
- [ ] Songs under 30 seconds are filtered out
- [ ] Missing metadata uses fallback values
- [ ] No duplicate songs in list
- [ ] App state listener re-checks permission on foreground
- [ ] Songs are playable in Phase 3