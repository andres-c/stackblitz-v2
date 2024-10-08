import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { setNotificationHandler, registerForPushNotificationsAsync } from '../src/services/notificationService';

// Define the custom theme for NativeBase
const theme = extendTheme({
  colors: {
    primary: {
      50: '#d2f3ea',
      100: '#8cd9c6',
      200: '#5cb7a4',
      300: '#4a9284',
      400: '#387064',
      500: '#264d44',
    },
    secondary: {
      50: '#f9f7f5',
      100: '#f0f0f0',
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    setNotificationHandler();
    registerForPushNotificationsAsync();
  }, []);

  return (
    <NativeBaseProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </NativeBaseProvider>
  );
}