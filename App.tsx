import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import FormScreen from './screens/FormScreen';
import LivenessScreen from './screens/LivenessScreen';
import VerifyScreen from './screens/VerifyScreen';
import ResultScreen from './screens/ResultScreen';
import PANFormScreen from './screens/PANFormScreen';
import PANVerifyScreen from './screens/PANVerifyScreen';
import PANResultScreen from './screens/PANResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Form: undefined;
  Liveness: {
    name: string;
    dob: string;
    fileUri: string;
    fileName: string;
  };
  Verify: {
    name: string;
    dob: string;
    fileUri: string;
    fileName: string;
    photoUri: string;
    compressedPhotoBase64?: string;
  };
  Result: {
    proofToken: string;
    verificationId: string | null;
    fraudData: any | null;
    valid: boolean;
  };
  PANForm: undefined;
  PANVerify: {
    fileUri: string;
    fileName: string;
    panNumber: string;
  };
  PANResult: {
    verified: boolean;
    name: string;
    panStatus: string;
    isAdult: boolean;
    gender: string;
    verificationId: string;
    vaultStored: boolean;
    fraudScore: number | null;
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
        <Stack.Screen name="PANForm"   component={PANFormScreen} />
        <Stack.Screen name="PANVerify" component={PANVerifyScreen} />
        <Stack.Screen name="PANResult" component={PANResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
