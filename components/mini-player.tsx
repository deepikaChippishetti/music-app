import { Link } from 'expo-router';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';

export function MiniPlayer() {
  const { currentSong, isPlaying, togglePlayPause } = usePlayerStore();

  if (!currentSong) return null;

  return (
    <Link href="/modal" asChild>
      <Pressable>
        <View style={styles.container}>
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>
          <Pressable style={styles.playBtn} onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  artist: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  playBtn: {
    padding: spacing.sm,
  },
  playIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
});