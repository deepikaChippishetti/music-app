import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Song } from '@/types/Song';

let soundInstance: Audio.Sound | null = null;

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}

export async function loadAndPlaySong(
  song: Song,
  queue: Song[],
  queueIndex: number,
  onStatusUpdate: (status: {
    isPlaying: boolean;
    position: number;
    duration: number;
  }) => void,
  onSongEnd: () => void
): Promise<void> {
  if (soundInstance) {
    await soundInstance.unloadAsync();
    soundInstance = null;
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri: song.uri },
    { shouldPlay: true },
    (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        onStatusUpdate({
          isPlaying: status.isPlaying,
          position: status.positionMillis,
          duration: status.durationMillis || 0,
        });

        if (status.didJustFinish && !status.isLooping) {
          onSongEnd();
        }
      }
    }
  );

  soundInstance = sound;
}

export async function play(): Promise<void> {
  if (soundInstance) {
    await soundInstance.playAsync();
  }
}

export async function pause(): Promise<void> {
  if (soundInstance) {
    await soundInstance.pauseAsync();
  }
}

export async function seekTo(positionMillis: number): Promise<void> {
  if (soundInstance) {
    await soundInstance.setPositionAsync(positionMillis);
  }
}

export async function unload(): Promise<void> {
  if (soundInstance) {
    await soundInstance.unloadAsync();
    soundInstance = null;
  }
}