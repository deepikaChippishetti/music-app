import { create } from 'zustand';
import { AppState, AppStateStatus } from 'react-native';
import type { Song } from '@/types/Song';
import { discoverSongs } from '@/services/musicDiscoveryService';
import {
  checkPermission,
  requestPermission,
  type PermissionStatus,
} from '@/services/permissionService';
import {
  configureAudioMode,
  loadAndPlaySong,
  play,
  pause,
  seekTo,
  unload,
} from '@/services/playbackService';

interface PlayerState {
  permissionStatus: PermissionStatus;
  songs: Song[];
  isLoadingSongs: boolean;

  setPermissionStatus: (status: PermissionStatus) => void;
  setSongs: (songs: Song[]) => void;
  setIsLoadingSongs: (isLoading: boolean) => void;
  checkAndRequestPermission: () => Promise<PermissionStatus>;
  loadSongs: () => Promise<void>;
  initAudio: () => Promise<void>;

  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffleEnabled: boolean;
  isLoading: boolean;

  playSong: (song: Song, queue?: Song[], index?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (queue: Song[], startIndex?: number) => void;
  setQueueIndex: (index: number) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  toggleShuffle: () => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  permissionStatus: 'undetermined',
  songs: [],
  isLoadingSongs: false,

  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setSongs: (songs) => set({ songs }),
  setIsLoadingSongs: (isLoading) => set({ isLoadingSongs: isLoading }),

  checkAndRequestPermission: async () => {
    let status = await checkPermission();
    if (status === 'undetermined') {
      status = await requestPermission();
    }
    set({ permissionStatus: status });
    return status;
  },

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

  initAudio: async () => {
    await configureAudioMode();
  },

  playSong: async (song: Song, queue?: Song[], index?: number) => {
    const songsQueue = queue || usePlayerStore.getState().songs;
    const songIndex = index ?? songsQueue.findIndex((s) => s.id === song.id);
    set({ currentSong: song, queue: songsQueue, queueIndex: songIndex, isLoading: true });

    try {
      await loadAndPlaySong(
        song,
        songsQueue,
        songIndex,
        (status) => {
          set({
            isPlaying: status.isPlaying,
            position: status.position,
            duration: status.duration,
          });
        },
        async () => {
          const { queue, queueIndex, repeatMode } = usePlayerStore.getState();
          let nextIndex = queueIndex + 1;

          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              return;
            }
          }

          const nextSong = queue[nextIndex];
          if (nextSong) {
            usePlayerStore.getState().playSong(nextSong, queue, nextIndex);
          }
        }
      );
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to play song:', error);
      set({ isLoading: false });
    }
  },

  togglePlayPause: async () => {
    const { isPlaying } = usePlayerStore.getState();
    if (isPlaying) {
      await pause();
      set({ isPlaying: false });
    } else {
      await play();
      set({ isPlaying: true });
    }
  },

  seek: async (position: number) => {
    await seekTo(position);
    set({ position });
  },

  next: async () => {
    const { queue, queueIndex, repeatMode } = usePlayerStore.getState();
    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextSong = queue[nextIndex];
    if (nextSong) {
      await loadAndPlaySong(nextSong, queue, nextIndex, (status) => {
        set({ isPlaying: status.isPlaying, position: status.position, duration: status.duration });
      }, () => {});
      set({ currentSong: nextSong, queueIndex: nextIndex });
    }
  },

  previous: async () => {
    const { queue, queueIndex, position } = usePlayerStore.getState();
    if (position > 3000) {
      await seekTo(0);
      set({ position: 0 });
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) return;

    const prevSong = queue[prevIndex];
    if (prevSong) {
      await loadAndPlaySong(prevSong, queue, prevIndex, (status) => {
        set({ isPlaying: status.isPlaying, position: status.position, duration: status.duration });
      }, () => {});
      set({ currentSong: prevSong, queueIndex: prevIndex });
    }
  },

  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  repeatMode: 'off',
  shuffleEnabled: false,
  isLoading: false,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setQueue: (queue, startIndex = 0) => set({ queue, queueIndex: startIndex }),
  setQueueIndex: (index) => set({ queueIndex: index }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

let appStateListener: ReturnType<typeof AppState.addEventListener> | null = null;

export function initPermissionListener() {
  if (appStateListener) return;

  appStateListener = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      const store = usePlayerStore.getState();
      if (store.permissionStatus !== 'granted') {
        checkPermission().then((status) => {
          store.setPermissionStatus(status);
        });
      }
    }
  });
}

export function cleanupPermissionListener() {
  appStateListener?.remove();
  appStateListener = null;
}