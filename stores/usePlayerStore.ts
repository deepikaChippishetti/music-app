import { create } from 'zustand';
import { AppState, AppStateStatus } from 'react-native';
import type { Song } from '@/types/Song';
import { discoverSongs } from '@/services/musicDiscoveryService';
import {
  checkPermission,
  requestPermission,
  type PermissionStatus,
} from '@/services/permissionService';

interface PlayerState {
  permissionStatus: PermissionStatus;
  songs: Song[];
  isLoadingSongs: boolean;

  setPermissionStatus: (status: PermissionStatus) => void;
  setSongs: (songs: Song[]) => void;
  setIsLoadingSongs: (isLoading: boolean) => void;
  checkAndRequestPermission: () => Promise<PermissionStatus>;
  loadSongs: () => Promise<void>;

  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffleEnabled: boolean;
  isLoading: boolean;

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