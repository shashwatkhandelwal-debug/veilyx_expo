import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import FormScreen from './screens/FormScreen';
import LivenessScreen from './screens/LivenessScreen';
import VerifyScreen from './screens/VerifyScreen';
import ResultScreen from './screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Form: undefined;
  Liveness: {
    name: string;
    dob: string;
    fileUri: string;
    fileName: string;
    xmlData?: any;
  };
  Verify: {
    name: string;
    dob: string;
    fileUri: string;
    fileName: string;
    photoUri: string;
    compressedPhotoBase64?: string;
    xmlData?: any;
  };
  Result: {
    proofToken: string;
    verificationId: string | null;
    fraudData: any | null;
    valid: boolean;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home"     component={HomeScreen} />
        <Stack.Screen name="Form"     component={FormScreen} />
        <Stack.Screen name="Liveness" component={LivenessScreen} />
        <Stack.Screen name="Verify"   component={VerifyScreen} />
        <Stack.Screen name="Result"   component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
