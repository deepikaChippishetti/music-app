import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import { MiniPlayer } from '@/components/mini-player';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const hasSong = usePlayerStore((state) => !!state.currentSong);

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Now Playing' }} />
        </Stack>
        {hasSong && <MiniPlayer />}
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}