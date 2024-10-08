# Fridgly App - Local Development Setup

## Configuration

The Firebase and OpenAI configurations are now hardcoded in their respective files:

- Firebase configuration: `src/config/firebase.ts`
- OpenAI configuration: `src/services/openAIService.ts`

Make sure to replace the placeholder values in these files with your actual project details before running the app.

## Running the App

To run the app, use the following command:

```
npx expo start
```

This will start the Expo development server.

## Development Environment

This project is built using React Native with Expo. Make sure you have the following installed:

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

## Installing Dependencies

Before running the app, install the required dependencies:

```
npm install
```

or if you're using yarn:

```
yarn install
```

## Running on iOS Simulator or Android Emulator

- For iOS (requires macOS):
  ```
  npx expo run:ios
  ```

- For Android:
  ```
  npx expo run:android
  ```

Make sure you have Xcode (for iOS) or Android Studio (for Android) installed and properly configured.

## Building for Production

To create a production build:

1. For iOS:
   ```
   eas build --platform ios
   ```

2. For Android:
   ```
   eas build --platform android
   ```

You'll need an Expo account and to configure EAS Build. Refer to the [Expo documentation](https://docs.expo.dev/build/introduction/) for more details.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed.
2. Clear the npm cache: `npm cache clean --force`
3. Delete the `node_modules` folder and reinstall dependencies.
4. Make sure your development environment is set up correctly for React Native development.

For more help, consult the [React Native documentation](https://reactnative.dev/docs/environment-setup) or [Expo documentation](https://docs.expo.dev/).