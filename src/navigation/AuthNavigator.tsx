import React, { useEffect, useState } from 'react';
import { Redirect, Slot } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Spinner, Center } from 'native-base';

export default function AuthNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await AsyncStorage.getItem('@user');
        setUser(userData ? JSON.parse(userData) : firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <Center flex={1}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}