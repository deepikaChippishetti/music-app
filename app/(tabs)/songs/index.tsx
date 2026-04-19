import { useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';
import { typography } from '@/utils/typography';
import { usePlayerStore, initPermissionListener } from '@/stores/usePlayerStore';
import { PermissionDeniedScreen } from '@/components/permission-denied-screen';

export default function SongsScreen() {
  const {
    permissionStatus,
    songs,
    isLoadingSongs,
    checkAndRequestPermission,
    loadSongs,
  } = usePlayerStore();

  useEffect(() => {
    initPermissionListener();

    const init = async () => {
      const status = await checkAndRequestPermission();
      if (status === 'granted') {
        loadSongs();
      }
    };

    init();
  }, [checkAndRequestPermission, loadSongs]);

  if (permissionStatus === 'denied' || permissionStatus === 'blocked') {
    return <PermissionDeniedScreen status={permissionStatus} />;
  }

  if (permissionStatus === 'undetermined' || isLoadingSongs) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (songs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <ThemedText style={styles.emptyText}>No songs found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add music to your library to see it here
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.songItem}>
            <ThemedText type="default">{item.title}</ThemedText>
            <ThemedText style={styles.artistText}>{item.artist}</ThemedText>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  emptySubtext: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.lg,
  },
  songItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  artistText: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
});