import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { colors } from '@/utils/colors';
import { spacing } from '@/utils/spacing';

export default function SongsScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title">Songs</ThemedText>
        <ThemedText style={styles.placeholder}>
          Music library loading...
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