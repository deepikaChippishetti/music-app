import { View, Text, StyleSheet, Pressable } from 'react-native';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';

interface StatusCardProps {
  onPress?: () => void;
}

export function StatusCard({ onPress }: StatusCardProps) {
  const { currentSong, isPlaying, queueIndex, queue } = usePlayerStore();

  if (!currentSong) return null;

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.artwork}>
        {currentSong.artwork ? (
          <View style={styles.artworkImage} />
        ) : (
          <Text style={styles.artworkIcon}>🎵</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentSong.artist}
        </Text>
        <View style={styles.statusRow}>
          <Text style={styles.status}>
            {isPlaying ? '▶ Now Playing' : '⏸ Paused'}
          </Text>
          {queue.length > 0 && (
            <Text style={styles.queueStatus}>
              {queueIndex + 1}/{queue.length}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.actions}>
        <Text style={styles.actionIcon}>{isPlaying ? '⏸' : '▶'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceElevated,
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  artworkIcon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  artist: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  status: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
  },
  queueStatus: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
  },
  actions: {
    padding: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
});