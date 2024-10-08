import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeBaseProvider, extendTheme } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import TabNavigator from './src/navigation/TabNavigator';
import { setNotificationHandler, registerForPushNotificationsAsync } from './src/services/notificationService';
import { auth } from './src/config/firebase';

const Stack = createNativeStackNavigator();

// Define your custom theme
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
  config: {
    initialColorMode: 'light',
  },
});

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setNotificationHandler();
    registerForPushNotificationsAsync();
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    const user = await AsyncStorage.getItem('@user');
    if (user && auth.currentUser) {
      setInitialRoute('Main');
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <NativeBaseProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary[200],
            },
            headerTintColor: theme.colors.secondary[50],
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}