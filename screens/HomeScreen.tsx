import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>VEILYX</Text>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>Secure. Private. Zero Storage.</Text>
        </View>

        <View style={styles.features}>
          {[
            'Hardware-signed identity proof',
            'Aadhaar XML processed on-device',
            'Real-time fraud risk scoring',
            'Zero PII stored anywhere',
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => navigation.navigate('Form')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Verify with Aadhaar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => navigation.navigate('PANForm')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonTextSecondary}>Verify with PAN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 6,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  features: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.teal,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.bg,
    letterSpacing: 0.3,
  },
  buttonTextSecondary: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: 0.3,
  },
});
