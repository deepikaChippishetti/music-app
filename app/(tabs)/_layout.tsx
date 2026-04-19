import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { MiniPlayer } from '@/components/mini-player';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { colors } from '@/utils/colors';

export default function TabLayout() {
  return (
    <>
      <MiniPlayer />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.divider,
          },
        }}>
        <Tabs.Screen
          name="songs/index"
          options={{
            title: 'Songs',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="music.note" color={color} />,
          }}
        />
        <Tabs.Screen
          name="library/index"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="library-music" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}