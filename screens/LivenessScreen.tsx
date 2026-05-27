import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';
import * as ImageManipulator from 'expo-image-manipulator';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Liveness'>;
  route: RouteProp<RootStackParamList, 'Liveness'>;
};

const INSTRUCTIONS = [
  { text: 'Look straight at the camera', duration: 2000 },
  { text: 'Turn your head LEFT slowly',  duration: 2000 },
  { text: 'Turn your head RIGHT slowly', duration: 2000 },
  { text: 'Look straight again',         duration: 1000 },
];

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

export default function LivenessScreen({ navigation, route }: Props) {
  const { name, dob, fileUri, fileName } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState<number>(-1); // -1 = not started
  const [running, setRunning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Start the guided flow automatically once camera is ready
  useEffect(() => {
    if (permission?.granted && !running && !photoUri) {
      // small delay so camera preview has time to render
      const t = setTimeout(() => startGuided(), 800);
      return () => clearTimeout(t);
    }
  }, [permission?.granted]);

  const [compressedBase64, setCompressedBase64] = useState<string>('');

  async function startGuided() {
    if (running) return;
    setRunning(true);
    for (let i = 0; i < INSTRUCTIONS.length; i++) {
      setStepIndex(i);
      await sleep(INSTRUCTIONS[i].duration);
    }
    // Auto-capture
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.75 });
      if (photo?.uri) {
        setPhotoUri(photo.uri);

        // Compress photo to max 200KB for vault storage
        let compress = 0.7;
        let result = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 480 } }],
          { compress, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        // If still over 200KB (~270K base64 chars), reduce quality iteratively
        while (result.base64 && result.base64.length > 270000 && compress > 0.1) {
          compress -= 0.15;
          result = await ImageManipulator.manipulateAsync(
            photo.uri,
            [{ resize: { width: 400 } }],
            { compress: Math.max(0.1, compress), format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );
        }
        setCompressedBase64(result.base64 || '');
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please tap Retry.');
    }
    setRunning(false);
    setStepIndex(-1);
  }

  function onContinue() {
    if (!photoUri) return;
    navigation.navigate('Verify', { name, dob, fileUri, fileName, photoUri, compressedPhotoBase64: compressedBase64 });
  }

  /* ── Permission states ── */
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.grayText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.whiteText}>Camera permission required</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* ── Render ── */
  const currentInstruction =
    stepIndex >= 0 && stepIndex < INSTRUCTIONS.length
      ? INSTRUCTIONS[stepIndex].text
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Face Scan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera / preview */}
      <View style={styles.cameraWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={'front' as CameraType}
          />
        )}

        {/* Corner guides */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Instruction overlay */}
        {currentInstruction && !photoUri && (
          <View style={styles.instructionOverlay}>
            <Text style={styles.instructionText}>{currentInstruction}</Text>
          </View>
        )}

        {/* Captured badge */}
        {photoUri && (
          <View style={styles.capturedBadge}>
            <Text style={styles.capturedBadgeText}>Captured</Text>
          </View>
        )}
      </View>

      {/* Progress dots */}
      {!photoUri && (
        <View style={styles.dots}>
          {INSTRUCTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i < stepIndex
                  ? styles.dotDone
                  : i === stepIndex
                  ? styles.dotActive
                  : styles.dotPending,
              ]}
            />
          ))}
        </View>
      )}

      {/* Bottom actions */}
      <View style={styles.actions}>
        {photoUri ? (
          <>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => { setPhotoUri(null); startGuided(); }}
              activeOpacity={0.8}
            >
              <Text style={styles.retakeBtnText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={onContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.guidanceRow}>
            <Text style={styles.guidanceText}>
              {running
                ? 'Follow the instructions above...'
                : 'Preparing camera...'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 8,
  },
  backText: { color: COLORS.teal, fontSize: 15, fontWeight: '600', width: 40 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  cameraWrap: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
  },
  camera: { flex: 1 },
  preview: { flex: 1, resizeMode: 'cover' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: COLORS.teal },
  cornerTL: { top: 12, left: 12, borderTopWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 3, borderLeftWidth: 3, borderRadius: 3 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 3, borderRightWidth: 3, borderRadius: 3 },
  instructionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  instructionText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  capturedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.teal,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  capturedBadgeText: { color: COLORS.bg, fontWeight: '700', fontSize: 12 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotPending: { backgroundColor: '#333' },
  dotActive:  { backgroundColor: COLORS.teal, transform: [{ scale: 1.3 }] },
  dotDone:    { backgroundColor: 'rgba(0,212,170,0.45)' },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 4,
    flexDirection: 'row',
    gap: 14,
  },
  guidanceRow: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  guidanceText: { color: COLORS.gray, fontSize: 14, textAlign: 'center' },
  retakeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  retakeBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  continueBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.teal,
  },
  continueBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: '700' },
  permBtn: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permBtnText: { color: COLORS.bg, fontWeight: '700', fontSize: 15 },
  whiteText: { color: COLORS.white, fontSize: 16, marginBottom: 8 },
  grayText: { color: COLORS.gray },
});
