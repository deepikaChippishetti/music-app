import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';

export default function LibraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Library</ThemedText>
        <ThemedText style={styles.placeholder}>
          Your liked songs and albums will appear here
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  placeholder: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});