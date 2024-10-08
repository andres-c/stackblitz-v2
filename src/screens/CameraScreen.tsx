import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { Box, Button, Center, VStack, Text, useToast, View, Spinner } from 'native-base';
import { StyleSheet, Dimensions } from 'react-native';
import { analyzeReceiptImage, batchAnalyzeGroceryItems } from '../services/openAIService';
import { addItemsToFirestore } from '../services/firestoreService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const FRAME_WIDTH = SCREEN_WIDTH * 0.8;
const FRAME_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        
        // Calculate crop parameters
        const cropWidth = FRAME_WIDTH / SCREEN_WIDTH * photo.width;
        const cropHeight = FRAME_HEIGHT / SCREEN_HEIGHT * photo.height;
        const cropX = (photo.width - cropWidth) / 2;
        const cropY = (photo.height - cropHeight) / 2;

        const croppedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [
            { 
              crop: {
                originX: cropX,
                originY: cropY,
                width: cropWidth,
                height: cropHeight
              }
            },
            { resize: { width: 1000 } }
          ],
          { base64: true }
        );
        
        await processImage(croppedPhoto.base64);
      } catch (error) {
        console.error('Error taking or processing picture:', error);
        toast.show({
          title: "Error",
          description: "Failed to process the image. Please try again.",
          status: "error"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processImage = async (base64Image) => {
    try {
      const { isReceipt, items } = await analyzeReceiptImage(base64Image);
      if (!isReceipt) {
        toast.show({
          title: "Error",
          description: "The image is not a receipt. Please try again.",
          status: "error"
        });
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      const analyzedItems = await batchAnalyzeGroceryItems(items, currentDate);
      const addedItems = await addItemsToFirestore(analyzedItems);
      
      toast.show({
        title: "Success",
        description: `Added ${addedItems.length} items to your food list.`,
        status: "success"
      });
      
      navigation.navigate('FoodList');
    } catch (error) {
      console.error('Error processing image:', error);
      toast.show({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        status: "error"
      });
    }
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Box flex={1} bg="primary.50">
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.maskOuter}>
          <View style={[styles.maskRow, styles.maskFrame]} />
          <View style={[styles.maskCenter, { height: FRAME_HEIGHT }]}>
            <View style={[styles.maskFrame, { width: 0 }]} />
            <View style={styles.maskInner} />
            <View style={[styles.maskFrame, { width: 0 }]} />
          </View>
          <View style={[styles.maskRow, styles.maskFrame]} />
        </View>
        <Center flex={1} mt="auto" mb={4}>
          <VStack space={4} alignItems="center">
            {isProcessing ? (
              <Spinner size="lg" color="primary.500" />
            ) : (
              <Button
                onPress={takePicture}
                bg="primary.200"
                _text={{ color: 'secondary.50' }}
                _pressed={{ bg: 'primary.300' }}
                width="200px"
                height="60px"
                borderRadius="full"
                isDisabled={isProcessing}
              >
                Take Picture
              </Button>
            )}
          </VStack>
        </Center>
      </Camera>
    </Box>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  maskOuter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  maskInner: {
    width: FRAME_WIDTH,
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 2,
  },
  maskFrame: {
    backgroundColor: 'rgba(1,1,1,0.6)',
  },
  maskRow: {
    width: '100%',
  },
  maskCenter: {
    display: 'flex',
    flexDirection: 'row',
  },
});