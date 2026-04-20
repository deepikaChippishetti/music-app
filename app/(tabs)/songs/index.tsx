import { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, Text, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';
import { typography } from '@/utils/typography';
import { usePlayerStore, initPermissionListener } from '@/stores/usePlayerStore';
import { PermissionDeniedScreen } from '@/components/permission-denied-screen';
import { SongListItem } from '@/components/song-list-item';
import type { Song } from '@/types/Song';

type SortOption = 'title-asc' | 'title-desc' | 'artist' | 'duration';

export default function SongsScreen() {
  const {
    permissionStatus,
    songs,
    isLoadingSongs,
    currentSong,
    checkAndRequestPermission,
    loadSongs,
    initAudio,
    playSong,
  } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('title-asc');

  useEffect(() => {
    initPermissionListener();
    initAudio();

    const init = async () => {
      const status = await checkAndRequestPermission();
      if (status === 'granted') {
        loadSongs();
      }
    };

    init();
  }, [checkAndRequestPermission, loadSongs, initAudio]);

  const getFilteredSongs = (): Song[] => {
    return songs
      .filter(
        (song) =>
          !searchQuery ||
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
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
  };

  const handleSongPress = async (song: Song) => {
    const filtered = getFilteredSongs();
    await playSong(song, filtered, filtered.findIndex((s) => s.id === song.id));
  };

  const handleSortPress = () => {
    const options: SortOption[] = ['title-asc', 'title-desc', 'artist', 'duration'];
    const currentIdx = options.indexOf(sortOption);
    setSortOption(options[(currentIdx + 1) % options.length]);
  };

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

  const filteredSongs = getFilteredSongs();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Pressable style={styles.sortButton} onPress={handleSortPress}>
          <Text style={styles.sortButtonText}>Sort</Text>
        </Pressable>
      </View>

      {filteredSongs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎵</Text>
          <ThemedText style={styles.emptyText}>No songs found</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add music to your library to see it here
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongListItem
              song={item}
              onPress={handleSongPress}
              isPlaying={item.id === currentSong?.id}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sortButtonText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
  },
});