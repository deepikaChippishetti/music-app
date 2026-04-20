import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';

export default function NowPlayingScreen() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    togglePlayPause,
    seek,
    next,
    previous,
    queue,
    queueIndex,
  } = usePlayerStore();

  if (!currentSong) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No song playing</Text>
          <Link href="/" dismissTo style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Link>
        </View>
      </ThemedView>
    );
  }

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    const seekAmount = direction === 'forward' ? 10000 : -10000;
    const newPosition = Math.max(0, Math.min(duration, position + seekAmount));
    seek(newPosition);
  };

  return (
    <ThemedView style={styles.container}>
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
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={previous} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏮</Text>
        </Pressable>
        <Pressable onPress={() => handleSeek('backward')} style={styles.controlBtn}>
          <Text style={styles.smallIcon}>⏪</Text>
        </Pressable>
        <Pressable onPress={togglePlayPause} style={styles.playBtn}>
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable onPress={() => handleSeek('forward')} style={styles.controlBtn}>
          <Text style={styles.smallIcon}>⏩</Text>
        </Pressable>
        <Pressable onPress={next} style={styles.controlBtn}>
          <Text style={styles.controlIcon}>⏭</Text>
        </Pressable>
      </View>

      <Text style={styles.queueInfo}>
        {queueIndex + 1} / {queue.length}
      </Text>

      <Link href="/" dismissTo style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.lg,
  },
  artwork: {
    aspectRatio: 1,
    width: '100%',
    maxHeight: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xl,
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
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  controlBtn: {
    padding: spacing.md,
  },
  controlIcon: {
    fontSize: 28,
  },
  smallIcon: {
    fontSize: 22,
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
  queueInfo: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xl,
  },
  closeButton: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
  },
});