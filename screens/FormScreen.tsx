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

const parseAadhaarXml = (xmlString: string) => {
  try {
    let name = '';
    const nameAttr = xmlString.match(/name="([^"]+)"/i);
    if (nameAttr) name = nameAttr[1];
    else {
      const nameTag = xmlString.match(/<name>([^<]+)<\/name>/i);
      if (nameTag) name = nameTag[1];
    }

    let dob = '';
    const dobAttr = xmlString.match(/dob="([^"]+)"/i);
    if (dobAttr) dob = dobAttr[1];
    else {
      const dobTag = xmlString.match(/<dob>([^<]+)<\/dob>/i);
      if (dobTag) dob = dobTag[1];
    }
    if (dob) {
      dob = dob.replace(/[-]/g, '/');
    }

    let gender = '';
    const genderAttr = xmlString.match(/gender="([^"]+)"/i);
    if (genderAttr) gender = genderAttr[1];
    else {
      const genderTag = xmlString.match(/<gender>([^<]+)<\/gender>/i);
      if (genderTag) gender = genderTag[1];
    }

    const hasPhoto = xmlString.toLowerCase().includes('<pht>') || xmlString.toLowerCase().includes('pht=');

    return { name, dob, gender, hasPhoto };
  } catch {
    return { name: '', dob: '', gender: '', hasPhoto: false };
  }
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Form'>;
};

export default function FormScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [xmlData, setXmlData] = useState<any | null>(null);

  const canContinue = name.trim().length > 0 && !!fileUri;

  async function pickXml() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/xml', 'application/xml', '*/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length) {
        const pickedUri = result.assets[0].uri;
        const pickedName = result.assets[0].name;

        // Copy file to local cache to resolve Android content URI restrictions
        const cachedUri = FileSystem.cacheDirectory + pickedName;
        await FileSystem.copyAsync({ from: pickedUri, to: cachedUri });

        // Read XML file content immediately
        const xmlContent = await FileSystem.readAsStringAsync(cachedUri);
        const parsed = parseAadhaarXml(xmlContent);

        setFileUri(pickedUri);
        setFileName(pickedName);
        setXmlData(parsed);

        // Autofill form inputs if extracted
        if (parsed.name) setName(parsed.name);
        if (parsed.dob) setDob(parsed.dob);
      }
    } catch {
      Alert.alert('Error', 'Could not open or read XML file.');
    }
  }

  const handleDobChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    const isDeleting = text.length < dob.length;
    if (isDeleting && dob.endsWith('/') && !text.endsWith('/')) {
      cleaned = cleaned.slice(0, -1);
    }
    let formatted = '';
    if (cleaned.length > 0) {
      formatted += cleaned.substring(0, 2);
      if (cleaned.length > 2 || (cleaned.length === 2 && !isDeleting)) {
        formatted += '/';
      }
      if (cleaned.length > 2) {
        formatted += cleaned.substring(2, 4);
        if (cleaned.length > 4 || (cleaned.length === 4 && !isDeleting)) {
          formatted += '/';
        }
        if (cleaned.length > 4) {
          formatted += cleaned.substring(4, 8);
        }
      }
    }
    setDob(formatted);
  };

  function onContinue() {
    if (!canContinue) return;
    navigation.navigate('Liveness', {
      name: name.trim(),
      dob: dob.trim(),
      fileUri: fileUri!,
      fileName: fileName ?? 'aadhaar.xml',
      xmlData,
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

        <Text style={styles.title}>Enter Your Details</Text>
        <Text style={styles.subtitle}>
          Your information is processed locally and never stored.
        </Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="As on Aadhaar"
          placeholderTextColor={COLORS.gray}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={COLORS.gray}
          value={dob}
          onChangeText={handleDobChange}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Aadhaar XML</Text>
        <TouchableOpacity style={styles.uploadBtn} onPress={pickXml} activeOpacity={0.8}>
          <Text style={styles.uploadBtnText}>
            {fileName ? 'Change File' : 'Upload Aadhaar XML'}
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
