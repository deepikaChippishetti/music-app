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