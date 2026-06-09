import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

const CHIPS = [
  'Age 18+',
  'Valid Document',
  'XML Uploaded',
  'Face Captured',
];

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

export default function ResultScreen({ navigation, route }: Props) {
  const { proofToken, verificationId, fraudData, valid } = route.params;
  const faceMatchScore: number = (route.params as any).faceMatchScore ?? 0;
  const fraudScore: number     = (route.params as any).fraudScore ?? -1;

  // Use passed fraudScore directly
  const score = fraudScore;

  const scoreAvailable = score >= 0;
  const scoreColor = scoreAvailable ? getScoreColor(score) : COLORS.gray;
  const riskLabel  = scoreAvailable ? getRiskLabel(score)  : 'N/A';

  const barAnim     = useRef(new Animated.Value(0)).current;
  const faceBarAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;

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
      Animated.timing(faceBarAnim, {
        toValue: faceMatchScore / 100,
        duration: 1000,
        delay: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const faceBarWidth = faceBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const faceConfidence =
    faceMatchScore >= 90 ? 'HIGH CONFIDENCE' :
    faceMatchScore >= 70 ? 'MEDIUM CONFIDENCE' :
    'LOW CONFIDENCE';

  const faceConfidenceColor =
    faceMatchScore >= 90 ? COLORS.teal :
    faceMatchScore >= 70 ? '#FFB800' :
    COLORS.red;

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
              { borderColor: valid ? COLORS.teal : COLORS.red },
            ]}>
              <Text style={[
                styles.circleText,
                { color: valid ? COLORS.teal : COLORS.red },
              ]}>
                {valid ? 'V' : 'X'}
              </Text>
            </View>
            <Text style={styles.resultTitle}>
              {valid ? 'Identity Verified' : 'Verification Failed'}
            </Text>
            <Text style={styles.resultSub}>
              {valid
                ? 'Your identity has been verified with hardware-signed proof.'
                : 'Verification could not be completed. Please try again.'}
            </Text>
          </View>

          {/* Proof token */}
          <View style={styles.tokenCard}>
            <Text style={styles.tokenLabel}>Proof Token</Text>
            <Text style={styles.tokenValue} numberOfLines={3}>
              {proofToken}
            </Text>
            {verificationId ? (
              <Text style={styles.verificationIdText} numberOfLines={1}>
                ID: {verificationId}
              </Text>
            ) : null}
          </View>

          {/* Attribute chips */}
          <Text style={styles.sectionLabel}>Verified Attributes</Text>
          <View style={styles.chips}>
            {CHIPS.map((chip, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipCheck}>+</Text>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>

          {/* Face Verification */}
          {faceMatchScore > 0 && (
            <>
              <Text style={styles.sectionLabel}>Face Verification</Text>
              <View style={styles.faceCard}>
                <View style={styles.faceRow}>
                  <Text style={styles.facePct}>{faceMatchScore}%</Text>
                  <View style={styles.faceRight}>
                    <Text style={styles.faceSubtitle}>Match confidence</Text>
                    <View style={[styles.faceConfPill, { borderColor: faceConfidenceColor }]}>
                      <Text style={[styles.faceConfText, { color: faceConfidenceColor }]}>
                        {faceConfidence}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <Animated.View
                    style={[styles.barFill, { width: faceBarWidth, backgroundColor: COLORS.teal }]}
                  />
                </View>
              </View>
            </>
          )}

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
            {fraudData?.velocity_severity ? (
              <Text style={styles.velocityText}>
                Velocity: {String(fraudData.velocity_severity).toUpperCase()}
              </Text>
            ) : null}
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
            style={styles.panBtn}
            onPress={() => navigation.navigate('PANForm')}
            activeOpacity={0.85}
          >
            <Text style={styles.panBtnText}>Continue to PAN Verification →</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Zero PII stored. Proof signed with hardware key.
          </Text>

        </Animated.View>
      </ScrollView>
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
  verificationIdText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 8,
    fontFamily: 'monospace',
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
  velocityText: { fontSize: 12, color: COLORS.gray, marginTop: 10 },
  faceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,212,170,0.2)',
    marginBottom: 28,
  },
  faceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 16,
  },
  facePct: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.teal,
    lineHeight: 52,
  },
  faceRight: { flex: 1, gap: 8 },
  faceSubtitle: { fontSize: 13, color: COLORS.gray },
  faceConfPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  faceConfText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  againBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  againBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.bg },
  panBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.85,
  },
  panBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.bg },
  footer: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
});
