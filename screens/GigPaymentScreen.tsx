import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import { COLORS } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GigPayment'>;
  route: RouteProp<RootStackParamList, 'GigPayment'>;
};

export default function GigPaymentScreen({ navigation, route }: Props) {
  const { transactionId, amount, timestamp, signature } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.checkIcon}>✓</Text>
          </Animated.View>
          <Text style={styles.title}>Payment Released</Text>
          <Text style={styles.subtitle}>
            Platform has received your verified bank details
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Amount:</Text>
            <Text style={styles.amountText}>₹{amount}</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Order:</Text>
            <Text style={styles.cardValue}>#VLX-2241</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Transaction ID:</Text>
            <Text style={styles.cardValue} numberOfLines={1}>
              {transactionId.substring(0, 16)}
            </Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Time:</Text>
            <Text style={styles.cardValue}>{timestamp}</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Attributes:</Text>
            <Text style={styles.cardValue}>Bank account · IFSC · PAN</Text>
          </View>

          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Signature:</Text>
            <Text style={styles.signatureText} numberOfLines={1}>
              {signature.substring(0, 20)}...
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Verified by Veilyx · Zero-storage · TEE signed
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => navigation.navigate('GigDelivery')}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonOutlineText}>New Delivery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonTextOnly}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonTextOnlyText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  checkIcon: {
    fontSize: 40,
    color: '#4CAF50',
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  cardValue: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  amountText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },
  signatureText: {
    fontSize: 12,
    color: COLORS.teal,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  footer: {
    marginTop: 'auto',
    gap: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  buttonOutlineText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.teal,
  },
  buttonTextOnly: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonTextOnlyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
});
