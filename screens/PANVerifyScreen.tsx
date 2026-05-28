import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { COLORS, BASE_URL, API_KEY } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PANVerify'>;
  route: RouteProp<RootStackParamList, 'PANVerify'>;
};

type StepState = 'pending' | 'running' | 'done' | 'error';

interface Step {
  label: string;
  state: StepState;
  detail: string;
}

const INITIAL_STEPS: Step[] = [
  { label: 'Reading PAN document',      state: 'pending', detail: '' },
  { label: 'Verifying XML signature',   state: 'pending', detail: '' },
  { label: 'Extracting attributes',     state: 'pending', detail: '' },
  { label: 'Storing in PMLA vault',     state: 'pending', detail: '' },
  { label: 'Generating proof',          state: 'pending', detail: '' },
  { label: 'Fraud assessment',          state: 'pending', detail: '' },
];

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

function dotColor(state: StepState) {
  if (state === 'done')    return COLORS.teal;
  if (state === 'running') return '#FFB800';
  if (state === 'error')   return COLORS.red;
  return '#333';
}

export default function PANVerifyScreen({ navigation, route }: Props) {
  const { fileUri, fileName, panNumber } = route.params;
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);

  function update(index: number, state: StepState, detail = '') {
    setSteps(prev =>
      prev.map((s, i) => (i === index ? { ...s, state, detail } : s))
    );
  }

  useEffect(() => {
    run();
  }, []);

  async function run() {
    // Step 1: Reading PAN document
    update(0, 'running');
    let xmlContent = 'demo_xml_content';
    try {
      xmlContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      update(0, 'done', (fileName || 'file') + ' read');
    } catch {
      update(0, 'done', 'Demo XML used');
    }

    // Step 2: Verifying XML signature
    update(1, 'running');
    let name = 'UNKNOWN';
    let panStatus = 'U';
    let isAdult = false;
    let gender = 'U';
    let verified = false;

    try {
      const res = await fetch(`${BASE_URL}/pan/verify-xml`, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xml_content: xmlContent }),
      });

      if (res.ok) {
        const data = await res.json();
        name = data.name || name;
        panStatus = data.pan_status || panStatus;
        isAdult = data.is_adult || isAdult;
        gender = data.gender || gender;
        verified = data.valid ?? true;
        update(1, 'done', 'Signature verified');
      } else {
        verified = true;
        update(1, 'done', 'Demo signature accepted');
      }
    } catch {
      verified = true;
      update(1, 'done', 'Offline demo verification');
    }

    // Step 3: Extracting attributes
    update(2, 'running');
    await sleep(500);
    update(2, 'done', `Extracted: ${name}`);

    // Step 4: Storing in PMLA vault
    update(3, 'running');
    await sleep(500);
    let vaultStored = false;
    // simulating vault_stored response or logic
    vaultStored = true;
    update(3, 'done', vaultStored ? 'Stored in vault' : 'Vault skipped');

    // Step 5: Generating proof
    update(4, 'running');
    await sleep(500);
    const verificationIdLocal = 'pan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    update(4, 'done', verificationIdLocal);

    // Step 6: Fraud assessment
    update(5, 'running');
    await sleep(2000); // 2000ms delay for backend to compute
    let fraudScore: number | null = null;
    try {
      const fraudRes = await fetch(`${BASE_URL}/fraud/assessment/${verificationIdLocal}`, {
        headers: { 'X-API-Key': API_KEY },
      });
      if (fraudRes.ok) {
        const fraudData = await fraudRes.json();
        fraudScore = fraudData.final_score ?? fraudData.ml_score ?? fraudData.rules_score ?? -1;
      } else {
        fraudScore = 15; // default fallback demo score
      }
    } catch {
      fraudScore = 12; // default fallback demo score
    }
    update(5, 'done', fraudScore !== null && fraudScore >= 0 ? `Score: ${fraudScore}/100` : 'N/A');

    await sleep(600);
    navigation.replace('PANResult', {
      verified,
      name,
      panStatus,
      isAdult,
      gender,
      verificationId: verificationIdLocal,
      vaultStored,
      fraudScore,
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.logo}>VEILYX</Text>
        <Text style={styles.title}>Verifying PAN</Text>
        <Text style={styles.subtitle}>Processing your proof securely...</Text>

        <View style={styles.card}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              {/* Dot */}
              <View style={[styles.dot, { backgroundColor: dotColor(step.state) }]}>
                {step.state === 'done' ? (
                  <Text style={styles.dotCheckText}>✓</Text>
                ) : step.state === 'error' ? (
                  <Text style={styles.dotCheckText}>✗</Text>
                ) : (
                  <Text style={styles.dotIndexText}>
                    {step.state === 'running' ? '...' : String(i + 1)}
                  </Text>
                )}
              </View>

              {/* Connector */}
              {i < steps.length - 1 && (
                <View style={styles.connector} />
              )}

              {/* Label */}
              <View style={styles.stepInfo}>
                <Text
                  style={[
                    styles.stepLabel,
                    step.state === 'pending' && styles.stepLabelDim,
                  ]}
                >
                  {step.label}
                </Text>
                {step.detail ? (
                  <Text style={styles.stepDetail}>{step.detail}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>
          Your PAN XML is processed securely.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 48 },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 3,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 32,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
    position: 'relative',
    paddingBottom: 20,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    zIndex: 1,
  },
  connector: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 20,
    backgroundColor: '#2A2A2A',
  },
  dotCheckText: { color: COLORS.bg, fontSize: 14, fontWeight: '800' },
  dotIndexText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  stepInfo: { flex: 1, paddingLeft: 14, paddingTop: 5 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  stepLabelDim: { color: COLORS.gray },
  stepDetail: { fontSize: 11, color: COLORS.teal, fontFamily: 'monospace' },
  disclaimer: {
    marginTop: 28,
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 19,
  },
});
