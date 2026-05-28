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
  Animated,
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

  // Animation values for scan lines and badges
  const scanAnim = useRef(new Animated.Value(0)).current;
  const badgePulseAnim = useRef(new Animated.Value(1)).current;

  // Scan line animation loop
  useEffect(() => {
    if (photoUri) {
      scanAnim.setValue(0);
      return;
    }
    const scanLoop = Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, [photoUri]);

  // Badge pulse animation loop
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    const isPulsing = !photoUri && stepIndex !== 1 && stepIndex !== 2;
    
    if (isPulsing) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulseAnim, {
            toValue: 0.35,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      badgePulseAnim.setValue(1);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [photoUri, stepIndex]);

  // Helper selectors for dynamic UI styling
  const getOvalColor = () => {
    if (photoUri) return COLORS.teal;
    if (stepIndex === 1 || stepIndex === 2) return '#FFB347'; // Turn left or right (amber)
    return COLORS.teal; // default teal
  };

  const getBadgeText = () => {
    if (photoUri) return '✓ CAPTURED';
    if (stepIndex === 1) return 'TURN LEFT';
    if (stepIndex === 2) return 'TURN RIGHT';
    return 'SCANNING';
  };

  const getSubInstructionText = () => {
    if (photoUri) return 'Press Continue to proceed';
    if (stepIndex === 0) return 'Position your face inside the oval';
    if (stepIndex === 1) return 'Keep your shoulders still';
    if (stepIndex === 2) return 'Keep your shoulders still';
    if (stepIndex === 3) return 'Hold still for automatic capture';
    return 'Fit your face in the oval frame';
  };

  const ovalColor = getOvalColor();
  const leftActive = stepIndex === 1;
  const rightActive = stepIndex === 2;

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 185],
  });

  const scanOpacity = scanAnim.interpolate({
    inputRange: [0, 0.15, 0.5, 0.85, 1],
    outputRange: [0, 0.8, 1, 0.8, 0],
  });

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

        {/* eKYC Cutout Mask Overlay (Darkened outer zone, transparent core) */}
        <View style={styles.maskOverlay} pointerEvents="none">
          <View style={styles.ovalMask} />
        </View>

        {/* Oval Bounding Box containing the Oval Border and scan line */}
        <View style={styles.ovalBoundingBox} pointerEvents="none">
          <View style={[styles.ovalBorder, { borderColor: ovalColor }]} />

          {/* Animated scan line */}
          {!photoUri && (
            <Animated.View style={[
              styles.scanLineContainer,
              {
                transform: [{ translateY }],
                opacity: scanOpacity,
              }
            ]}>
              <View style={[styles.scanLineGlow, { backgroundColor: ovalColor }]} />
              <View style={[styles.scanLineCore, { backgroundColor: ovalColor }]} />
            </Animated.View>
          )}
        </View>

        {/* Brackets Box (shares same position/size, does not clip corners) */}
        <View style={styles.bracketsBox} pointerEvents="none">
          {/* 4 Corner Markers */}
          <View style={[styles.cornerMarker, styles.cornerTL, { borderColor: ovalColor }]} />
          <View style={[styles.cornerMarker, styles.cornerTR, { borderColor: ovalColor }]} />
          <View style={[styles.cornerMarker, styles.cornerBL, { borderColor: ovalColor }]} />
          <View style={[styles.cornerMarker, styles.cornerBR, { borderColor: ovalColor }]} />
        </View>
      </View>

      {/* Instructions Overlay/Container */}
      <View style={styles.instructionsContainer}>
        {/* Status Badge */}
        <Animated.View style={[
          styles.badgePill,
          {
            borderColor: ovalColor,
            opacity: getBadgeText() === '✓ CAPTURED' ? 1 : badgePulseAnim
          }
        ]}>
          <Text style={[styles.badgeText, { color: ovalColor }]}>
            {getBadgeText()}
          </Text>
        </Animated.View>

        {/* Instruction Text */}
        <Text style={styles.mainInstructionText}>
          {photoUri ? 'Face capture completed' : (currentInstruction || 'Preparing face scan...')}
        </Text>
        <Text style={styles.subInstructionText}>
          {getSubInstructionText()}
        </Text>

        {/* Direction Arrows Row */}
        {!photoUri && (
          <View style={styles.arrowsRow}>
            {/* LEFT Arrow */}
            <View style={styles.arrowBox}>
              <View style={[
                styles.arrowCircle,
                leftActive ? {
                  borderColor: '#FFB347',
                  backgroundColor: 'rgba(255,179,71,0.12)',
                } : {
                  borderColor: '#333333',
                  backgroundColor: 'transparent',
                }
              ]}>
                <Text style={[
                  styles.arrowChar,
                  { color: leftActive ? '#FFB347' : '#333333' }
                ]}>
                  ←
                </Text>
              </View>
              <Text style={styles.arrowLabel}>LEFT</Text>
            </View>

            {/* RIGHT Arrow */}
            <View style={styles.arrowBox}>
              <View style={[
                styles.arrowCircle,
                rightActive ? {
                  borderColor: '#FFB347',
                  backgroundColor: 'rgba(255,179,71,0.12)',
                } : {
                  borderColor: '#333333',
                  backgroundColor: 'transparent',
                }
              ]}>
                <Text style={[
                  styles.arrowChar,
                  { color: rightActive ? '#FFB347' : '#333333' }
                ]}>
                  →
                </Text>
              </View>
              <Text style={styles.arrowLabel}>RIGHT</Text>
            </View>
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
    flex: 1.1, // slightly increased relative share to make oval visually dominant
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: { ...StyleSheet.absoluteFillObject },
  preview: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  
  // Cutout Mask Overlay
  maskOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ovalMask: {
    width: 160,
    height: 200,
    borderRadius: 100,
    borderWidth: 600,
    borderColor: 'rgba(0,0,0,0.72)',
    position: 'absolute',
  },

  // Oval Bounding Box & Border
  ovalBoundingBox: {
    width: 160,
    height: 200,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // clips scan line to the oval contour
    borderRadius: 100,
  },
  ovalBorder: {
    width: 160,
    height: 200,
    borderRadius: 100,
    borderWidth: 2.5,
    position: 'absolute',
  },

  // Brackets box to contain brackets without clipping
  bracketsBox: {
    width: 160,
    height: 200,
    position: 'absolute',
  },
  // Corner Bracket Markers
  cornerMarker: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderWidth: 3,
    zIndex: 10,
  },
  cornerTL: {
    top: -4,
    left: -4,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: -4,
    right: -4,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: -4,
    left: -4,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: -4,
    right: -4,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },

  // Animated Scan Line
  scanLineContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 10,
  },
  scanLineGlow: {
    position: 'absolute',
    height: 8,
    width: '85%',
    borderRadius: 4,
    opacity: 0.25,
  },
  scanLineCore: {
    height: 2,
    width: '90%',
    borderRadius: 1,
  },

  // Instructions Container Panel
  instructionsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    alignItems: 'center',
  },
  badgePill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mainInstructionText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  subInstructionText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Direction Arrows
  arrowsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    marginTop: 2,
    marginBottom: 4,
  },
  arrowBox: {
    alignItems: 'center',
    gap: 4,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowChar: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: COLORS.gray,
    letterSpacing: 0.5,
  },

  // Progress dots
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotPending: { backgroundColor: '#333333' },
  dotActive:  { backgroundColor: '#FFFFFF', transform: [{ scale: 1.3 }] },
  dotDone:    { backgroundColor: '#00D4AA' },

  // Bottom actions
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
