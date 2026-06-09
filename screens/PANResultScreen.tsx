import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PANResult'>;
  route: RouteProp<RootStackParamList, 'PANResult'>;
};

function getScoreColor(score: number) {
  if (score < 30) return COLORS.teal;
  if (score <= 70) return '#FFB800';
  return COLORS.red;
}

function getRiskLabel(score: number) {
  if (score < 30) return 'LOW RISK';
  if (score <= 70) return 'MEDIUM RISK';
  return 'HIGH RISK';
}

export default function PANResultScreen({ navigation, route }: Props) {
  const {
    verified,
    name,
    panStatus,
    isAdult,
    gender,
    verificationId,
    vaultStored,
    fraudScore,
  } = route.params;

  const [showConsent, setShowConsent] = useState(false);

  const score = fraudScore ?? -1;
  const scoreAvailable = score >= 0;
  const scoreColor = scoreAvailable ? getScoreColor(score) : COLORS.gray;
  const riskLabel = scoreAvailable ? getRiskLabel(score) : 'N/A';

  const barAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(barAnim, {
        toValue: scoreAvailable ? score / 100 : 0,
        duration: 1100,
        delay: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const chips = [
    { label: 'Name', value: name, active: !!name },
    { label: 'PAN Active', value: panStatus === 'A' ? 'Yes' : 'No', active: panStatus === 'A' },
    { label: 'Age 18+', value: isAdult ? 'Yes' : 'No', active: isAdult },
    { label: 'Gender', value: gender, active: !!gender },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={{ opacity: fadeAnim }}>

          <Text style={styles.logo}>VEILYX</Text>

          {/* Result indicator */}
          <View style={styles.resultBlock}>
            <View style={[
              styles.circle,
              { borderColor: verified ? COLORS.teal : COLORS.red },
            ]}>
              <Text style={[
                styles.circleText,
                { color: verified ? COLORS.teal : COLORS.red },
              ]}>
                {verified ? '✓' : '✗'}
              </Text>
            </View>
            <Text style={styles.resultTitle}>
              {verified ? 'PAN Verified' : 'Verification Failed'}
            </Text>
            <Text style={styles.resultSub}>
              {verified
                ? 'Your PAN has been verified securely.'
                : 'PAN verification could not be completed. Please try again.'}
            </Text>
          </View>

          {/* Verification ID */}
          <View style={styles.tokenCard}>
            <Text style={styles.tokenLabel}>VERIFICATION ID</Text>
            <Text style={styles.tokenValue} numberOfLines={1}>
              {verificationId}
            </Text>
          </View>

          {/* Attribute chips */}
          <Text style={styles.sectionLabel}>Verified Attributes</Text>
          <View style={styles.chips}>
            {chips.map((chip, i) => (
              <View
                key={i}
                style={[
                  styles.chip,
                  !chip.active && { borderColor: 'rgba(255,100,100,0.3)', backgroundColor: 'rgba(255,100,100,0.05)' },
                ]}
              >
                <Text style={[styles.chipCheck, !chip.active && { color: COLORS.red }]}>
                  {chip.active ? '+' : '-'}
                </Text>
                <Text style={styles.chipText}>
                  {chip.label}: {chip.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Vault Storage */}
          <Text style={styles.sectionLabel}>Vault Storage</Text>
          <View style={styles.vaultCard}>
            <Text style={[styles.vaultText, { color: vaultStored ? COLORS.teal : '#FFB800' }]}>
              {vaultStored ? 'Stored in PMLA Vault' : 'Vault storage pending'}
            </Text>
          </View>

          {/* Fraud score */}
          <Text style={styles.sectionLabel}>Fraud Risk Score</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreNum, { color: scoreColor }]}>
                {scoreAvailable ? score : 'N/A'}
              </Text>
              {scoreAvailable && <Text style={styles.scoreMax}>/100</Text>}
              <View style={[styles.riskPill, { borderColor: scoreColor }]}>
                <Text style={[styles.riskPillText, { color: scoreColor }]}>
                  {riskLabel}
                </Text>
              </View>
            </View>
            <View style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  { width: barWidth, backgroundColor: scoreColor },
                ]}
              />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.againBtn}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.againBtnText}>Verify Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gigBtn}
            onPress={() => setShowConsent(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.gigBtnText}>
              Continue to Payment Demo →
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      <Modal
        visible={showConsent}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConsent(false)}
      >
        <View style={consentStyles.overlay}>
          <View style={consentStyles.sheet}>
            <Text style={consentStyles.title}>
              Payment Consent
            </Text>
            <Text style={consentStyles.body}>
              I consent to Veilyx to use my bank details
              and/or any relevant details for payment
              purposes for the next 30 days.{'\n\n'}
              Your Aadhaar and PAN data has been verified
              and permanently discarded. Only your payment
              details will be stored securely on your device.
            </Text>
            <Text style={consentStyles.note}>
              You can revoke this consent at any time
              from your wallet settings.
            </Text>
            <TouchableOpacity
              style={consentStyles.acceptBtn}
              onPress={() => {
                setShowConsent(false);
                navigation.navigate('GigBank');
              }}
            >
              <Text style={consentStyles.acceptText}>
                I Consent — Continue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={consentStyles.declineBtn}
              onPress={() => setShowConsent(false)}
            >
              <Text style={consentStyles.declineText}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 60 },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 3,
    marginBottom: 32,
  },
  resultBlock: { alignItems: 'center', marginBottom: 32 },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  circleText: { fontSize: 34, fontWeight: '800' },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSub: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  tokenCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    marginBottom: 28,
  },
  tokenLabel: {
    fontSize: 11,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  tokenValue: {
    color: COLORS.teal,
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.3)',
    backgroundColor: 'rgba(0,212,170,0.07)',
  },
  chipCheck: { color: COLORS.teal, fontSize: 12, fontWeight: '700' },
  chipText: { color: COLORS.white, fontSize: 13, fontWeight: '500' },
  vaultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 28,
    alignItems: 'center',
  },
  vaultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scoreCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 32,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 16,
  },
  scoreNum: { fontSize: 52, fontWeight: '800', lineHeight: 56 },
  scoreMax: { fontSize: 20, color: COLORS.gray, marginBottom: 8 },
  riskPill: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-end',
    marginBottom: 6,
  },
  riskPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  barTrack: {
    height: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 99 },
  againBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  againBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.bg },
  gigBtn: {
    backgroundColor: '#ff6b00',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  gigBtnText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#ffffff' 
  },
});

const consentStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 28,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 28,
  },
  acceptBtn: {
    backgroundColor: '#00D4AA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0A0A0A',
  },
  declineBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  declineText: {
    fontSize: 15,
    color: '#888888',
  },
});
