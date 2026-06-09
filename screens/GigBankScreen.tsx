import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GigBank'>;
};

export default function GigBankScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = () => {
    if (!name.trim() || !account.trim() || !ifsc.trim()) {
      setError('All fields are required');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>VEILYX</Text>
          <Text style={styles.title}>Worker Onboarding</Text>
        </View>

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.successTitle}>Wallet Created Successfully</Text>
            <Text style={styles.successSubtitle}>
              Your identity is verified and stored securely on this device
            </Text>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={() => navigation.navigate('GigDelivery')}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Continue to Delivery Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name as per bank records"
                placeholderTextColor={COLORS.gray}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Account Number"
                placeholderTextColor={COLORS.gray}
                value={account}
                onChangeText={setAccount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                placeholder="IFSC Code"
                placeholderTextColor={COLORS.gray}
                value={ifsc}
                onChangeText={(text) => setIfsc(text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleVerify}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.bg} />
              ) : (
                <Text style={styles.buttonText}>Verify & Create Wallet</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: -10,
  },
  buttonPrimary: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.bg,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  checkIcon: {
    fontSize: 80,
    color: COLORS.teal,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
});
