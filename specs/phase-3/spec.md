# Phase 3: Core Playback Experience

## Objective

Deliver the complete music playing experience on both platforms: browse, play, control, search.

---

## 1. Song List Screen

### 1.1 Implementation

- [ ] Display songs using `FlatList` with `keyExtractor` on `song.id`
- [ ] Handle all states: `loading`, `empty` (no songs found), `permission_denied`, `error`
- [ ] Each state renders a distinct, meaningful UI — no generic spinners with no context
- [ ] Pull-to-refresh re-triggers the full asset fetch and normalisation

### 1.2 Song Item Component

Create `components/song-list-item.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';
import type { Song } from '@/types/Song';

interface SongListItemProps {
  song: Song;
  onPress: (song: Song) => void;
  isPlaying?: boolean;
}

export function SongListItem({ song, onPress, isPlaying }: SongListItemProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(song)}
    >
      <View style={styles.info}>
        <Text style={[styles.title, isPlaying && styles.playing]} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
      </View>
      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  playing: {
    color: colors.primary,
  },
  artist: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  duration: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
```

---

## 2. Playback Engine

### 2.1 Audio Configuration

- [ ] Configure audio mode once on app startup in `app/_layout.tsx` or a dedicated hook:

```ts
import { Audio } from 'expo-av';

await Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
});
```

### 2.2 Sound Instance Management

- [ ] The `Audio.Sound` instance lives in `usePlayerStore`
- [ ] Create on first play, reuse for track changes via `sound.loadAsync(newSource)`
- [ ] Unload the sound (`sound.unloadAsync()`) before loading a new track

### 2.3 Playback State

- [ ] All playback state in `usePlayerStore`:
  - `currentSong: Song | null`
  - `isPlaying: boolean`
  - `position: number` (milliseconds)
  - `duration: number` (milliseconds)
  - `queue: Song[]`
  - `queueIndex: number`

### 2.4 Playback Controls

Implement in `usePlayerStore`:

```ts
playSong: async (song: Song, queue: Song[]) => {
  const { sound } = await Audio.Sound.createAsync({ uri: song.uri });
  set({ sound, currentSong: song, queue, isPlaying: true });
},

pause: async () => {
  await sound?.pauseAsync();
  set({ isPlaying: false });
},

resume: async () => {
  await sound?.playAsync();
  set({ isPlaying: true });
},

seek: async (position: number) => {
  await sound?.setPositionAsync(position);
  set({ position });
},

next: async () => {
  // Unload current, load next from queue
},

previous: async () => {
  // Unload current, load previous from queue
},
```

### 2.5 Playback Status Updates

- [ ] Subscribe via `sound.setOnPlaybackStatusUpdate`
- [ ] Sync `position`, `duration`, `isPlaying`
- [ ] Auto-advance on track finish

### 2.6 Queue Initialization

- [ ] Tapping a song loads the entire current list into the queue
- [ ] Queue starts at the tapped index

---

## 3. Now Playing Screen

### 3.1 Modal Route

- [ ] Opens as a modal from anywhere in the app
- [ ] Route: `app/modal.tsx` or use `router.push('/modal')`

### 3.2 Component Implementation

Create `app/modal.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';

export default function NowPlayingScreen() {
  const { currentSong, isPlaying, position, duration, play, pause, seek, next, previous } = usePlayerStore();

  if (!currentSong) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <View style={styles.artwork}>
        {currentSong.artwork ? (
          <Image source={{ uri: currentSong.artwork }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🎵</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
      </View>

      <View style={styles.progress}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.time}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={previous} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏮</Text>
        </Pressable>
        <Pressable onPress={isPlaying ? pause : play} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable onPress={next} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏭</Text>
        </Pressable>
      </View>
    </View>
  );
}

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  artwork: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
  },
  info: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  artist: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  progress: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  time: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  controlBtn: {
    padding: spacing.md,
  },
  controlIcon: {
    fontSize: 28,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: colors.textPrimary,
  },
});
```

### 3.3 Seek Bar

- [ ] Seek bar updates every second via `onPlaybackStatusUpdate`
- [ ] Allow seeking by pressing/dragging on progress bar

---

## 4. Mini Player

### 4.1 Implementation

- [ ] Rendered in root layout (`app/_layout.tsx`)
- [ ] Visible on all tab screens, hidden when Now Playing modal is open
- [ ] Displays: song title, artist, play/pause button
- [ ] Tapping anywhere opens Now Playing modal
- [ ] Shows nothing when queue is empty
- [ ] Wrapped in `SafeAreaView`

### 4.2 Component

Create `components/mini-player.tsx`:

```tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';
import { useRouter } from 'expo-router';

export function MiniPlayer() {
  const { currentSong, isPlaying, play, pause } = usePlayerStore();
  const router = useRouter();

  if (!currentSong) return null;

  return (
    <Pressable style={styles.container} onPress={() => router.push('/modal')}>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{currentSong.artist}</Text>
      </View>
      <Pressable
        style={styles.playBtn}
        onPress={(e) => {
          e.stopPropagation();
          isPlaying ? pause() : play();
        }}
      >
        <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  artist: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  playBtn: {
    padding: spacing.sm,
  },
  playIcon: {
    fontSize: 20,
  },
});
```

### 4.3 Root Layout Integration

Update `app/_layout.tsx` to include MiniPlayer above tab navigator:

```tsx
import { MiniPlayer } from '@/components/mini-player';

export default function RootLayout() {
  const hasSong = usePlayerStore((state) => !!state.currentSong);

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="tabs" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {hasSong && <MiniPlayer />}
    </View>
  );
}
```

---

## 5. Search & Sort

### 5.1 Search Implementation

- [ ] Search filters by title and artist (case-insensitive)
- [ ] Active search state lives in local component state

```tsx
const [searchQuery, setSearchQuery] = useState('');

const filteredSongs = songs.filter(
  (song) =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 5.2 Sort Options

- [ ] A–Z (by title)
- [ ] Z–A (by title)
- [ ] by artist
- [ ] by duration

```tsx
type SortOption = 'title-asc' | 'title-desc' | 'artist' | 'duration';

const sortedSongs = [...filteredSongs].sort((a, b) => {
  switch (sortOption) {
    case 'title-asc':
      return a.title.localeCompare(b.title);
    case 'title-desc':
      return b.title.localeCompare(a.title);
    case 'artist':
      return a.artist.localeCompare(b.artist);
    case 'duration':
      return a.duration - b.duration;
    default:
      return 0;
  }
});
```

### 5.3 Search/Sort UI

- [ ] Add search bar at top of Songs screen
- [ ] Add sort button/menu

---

## 6. Audio Mode Configuration

### 6.1 App Startup Configuration

- [ ] Configure once in `app/_layout.tsx` using `useEffect`:

```tsx
useEffect(() => {
  Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}, []);
```

### 6.2 Background Audio

- [ ] Enabled via `staysActiveInBackground: true`
- [ ] Requires `UIBackgroundModes: ["audio"]` in `app.json` (Phase 1)
- [ ] Music continues when screen locks on both platforms

---

## 7. Error Handling

### 7.1 Playback Errors

- [ ] Handle `asset_unavailable` errors when fetching asset info
- [ ] Handle playback failures gracefully
- [ ] Log errors to console in development

### 7.2 UI Error States

- [ ] Show user-friendly error message if playback fails
- [ ] Allow retry action

---

## 8. Verification Checklist

- [ ] Songs display in FlatList with proper styling
- [ ] Pull-to-refresh reloads songs
- [ ] Tapping a song starts playback
- [ ] Play, pause, next, previous controls work
- [ ] Seek bar updates in real-time
- [ ] Now Playing modal opens and displays all info
- [ ] Mini Player appears when song is playing
- [ ] Mini Player opens Now Playing on tap
- [ ] Search filters songs correctly
- [ ] Sort options work correctly
- [ ] Background audio works when screen locks
- [ ] Audio ducking works on Android
- [ ] iOS audio interruptions handled
- [ ] Queue advances automatically on track finish
- [ ] Repeat mode cycles: off → all → one
- [ ] Shuffle toggles correctly