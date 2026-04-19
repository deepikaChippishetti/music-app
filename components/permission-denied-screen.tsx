import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { colors } from '@/utils/colors';
import { typography } from '@/utils/typography';
import { spacing } from '@/utils/spacing';

interface PermissionDeniedScreenProps {
  status: 'denied' | 'blocked';
}

export function PermissionDeniedScreen({ status }: PermissionDeniedScreenProps) {
  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎵</Text>
      <Text style={styles.title}>
        {status === 'blocked' ? 'Permission Required' : 'Access Your Music'}
      </Text>
      <Text style={styles.description}>
        {status === 'blocked'
          ? 'You have denied permission permanently. Please enable access in Settings.'
          : 'We need access to your music library to show your songs.'}
      </Text>
      <Pressable style={styles.button} onPress={handleOpenSettings}>
        <Text style={styles.buttonText}>
          {status === 'blocked' ? 'Open Settings' : 'Grant Access'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});