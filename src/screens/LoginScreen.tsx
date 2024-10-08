import React, { useEffect } from 'react';
import { Center, Box, Button, Image, VStack, Text, useToast } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GOOGLE_AUTH_CONFIG } from '../config/config';

// Ensure the WebBrowser auth session behaves correctly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  // Set up Google Sign-In request
  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_AUTH_CONFIG);

  const toast = useToast();

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleSignIn(authentication.accessToken);
    }
  }, [response]);

  const handleSignIn = async (accessToken) => {
    try {
      // Create a credential from the access token
      const credential = GoogleAuthProvider.credential(null, accessToken);
      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;
      
      // Check if the user already exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let userData;
      if (!userDoc.exists()) {
        // If user doesn't exist, create a new group and user document
        const groupsCollectionRef = collection(db, 'groups');
        const newGroupRef = await addDoc(groupsCollectionRef, {
          name: `${user.displayName}'s Group`,
          createdBy: user.uid,
          createdAt: new Date().toISOString(),
        });

        userData = {
          email: user.email,
          name: user.displayName,
          groups: [newGroupRef.id],
        };
        await setDoc(userDocRef, userData);
      } else {
        userData = userDoc.data();
      }

      // Store user data in AsyncStorage for local access
      await AsyncStorage.setItem('@user', JSON.stringify(userData));
      
      // Navigate to the food list screen
      router.replace('/foodlist');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.show({
        title: "Sign In Error",
        description: "An error occurred while signing in. Please try again.",
        status: "error"
      });
    }
  };

  return (
    <Center flex={1} bg="primary.50">
      <VStack space={5} alignItems="center">
        <Image 
          source={require('../../assets/images/icon.png')} 
          alt="Fridgly Logo"
          size="xl"
        />
        <Text fontSize="3xl" fontWeight="bold" color="primary.500">
          Welcome to Fridgly
        </Text>
        <Text fontSize="md" textAlign="center" color="gray.600" px={4}>
          Keep track of your food and reduce waste
        </Text>
        <Button
          onPress={() => promptAsync()}
          bg="primary.500"
          _text={{ color: 'white' }}
          _pressed={{ bg: 'primary.600' }}
          width="200px"
          leftIcon={<Image source={require('../../assets/images/google-logo.png')} size="xs" alt="Google logo" />}
        >
          Sign in with Google
        </Button>
      </VStack>
    </Center>
  );
}