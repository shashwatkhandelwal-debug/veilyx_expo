import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PANForm'>;
};

export default function PANFormScreen({ navigation }: Props) {
  const [panNumber, setPanNumber] = useState('');
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const canContinue = panNumber.trim().length === 10 && !!xmlContent;

  async function pickXml() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/xml', 'application/xml', '*/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        const pickedName = asset.name ?? 'pan.xml';
        setFileName(pickedName);

        // Read content immediately while we have access
        let content = '';
        try {
          content = await FileSystem.readAsStringAsync(asset.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
        } catch (e1) {
          try {
            const cacheUri = FileSystem.cacheDirectory + pickedName;
            await FileSystem.copyAsync({
              from: asset.uri,
              to: cacheUri,
            });
            content = await FileSystem.readAsStringAsync(cacheUri, {
              encoding: FileSystem.EncodingType.UTF8,
            });
          } catch (e2) {
            Alert.alert('Debug Error', 
              `e1: ${e1 instanceof Error ? e1.message : String(e1)}\ne2: ${e2 instanceof Error ? e2.message : String(e2)}\nURI: ${asset.uri.substring(0, 80)}`
            );
            return;
          }
        }

        if (content.length < 100) {
          Alert.alert('Error', 'File appears to be empty or invalid.');
          return;
        }

        setXmlContent(content);
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  }

  const handlePanChange = (text: string) => {
    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setPanNumber(cleaned);
  };

  function onContinue() {
    if (!canContinue) return;
    navigation.navigate('PANVerify', {
      panNumber: panNumber.trim(),
      xmlContent: xmlContent!,
      fileName: fileName ?? 'pan.xml',
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Enter PAN Details</Text>
        <Text style={styles.subtitle}>
          Your information is processed locally and never stored.
        </Text>

        <Text style={styles.label}>PAN Number</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAAA9999A"
          placeholderTextColor={COLORS.gray}
          value={panNumber}
          onChangeText={handlePanChange}
          autoCapitalize="characters"
          maxLength={10}
        />

        <Text style={styles.label}>PAN XML</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickXml} activeOpacity={0.8}>
          <Text style={styles.uploadBtnText}>
            {fileName ? 'Change File' : 'Upload PAN XML'}
          </Text>
        </TouchableOpacity>

        {fileName ? (
          <Text style={styles.fileName}>{fileName}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },
  back: { marginBottom: 24 },
  backText: { color: COLORS.teal, fontSize: 15, fontWeight: '600' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 32,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  uploadBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
    marginBottom: 10,
  },
  uploadBtnText: {
    color: COLORS.teal,
    fontSize: 15,
    fontWeight: '600',
  },
  fileName: {
    color: COLORS.teal,
    fontSize: 13,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  continueBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  continueBtnDisabled: {
    backgroundColor: '#1E3330',
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.bg,
  },
});
