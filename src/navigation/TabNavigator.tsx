import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'native-base';

export default function TabNavigator() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        // Define the tab bar icon based on the route name
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'foodlist') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        // Customize the tab bar colors using the NativeBase theme
        tabBarActiveTintColor: theme.colors.primary[300],
        tabBarInactiveTintColor: 'gray',
        // Customize the header style
        headerStyle: {
          backgroundColor: theme.colors.primary[200],
        },
        headerTintColor: theme.colors.secondary[50],
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
        }}
      />
      <Tabs.Screen
        name="foodlist"
        options={{
          title: 'Food List',
        }}
      />
    </Tabs>
  );
}