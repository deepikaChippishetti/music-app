import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';

export function MiniPlayer() {
  const currentSong = usePlayerStore((state) => state.currentSong);

  if (!currentSong) return null;

  return (
    <Link href="/modal" asChild>
      <Pressable>
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </ThemedText>
          </View>
        </ThemedView>
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
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  artist: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
});