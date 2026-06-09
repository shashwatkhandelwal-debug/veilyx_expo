import React, { useState } from 'react';
import {
  View,
  Text,
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'GigDelivery'>;
};

export default function GigDeliveryScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCollectPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const transactionId = 'VLX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      const signature = 'MEUCIQDveilyx' + Math.random().toString(36).substring(2, 15);
      
      navigation.navigate('GigPayment', {
        transactionId,
        amount: 85.0,
        timestamp: new Date().toLocaleTimeString(),
        signature,
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Deliveries</Text>
          <View style={styles.accentLine} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orderNumber}>Order: #VLX-2241</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DELIVERED</Text>
            </View>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Platform:</Text>
            <Text style={styles.cardValue}>Platform</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Route:</Text>
            <Text style={styles.cardValue}>Pickup → Drop Location</Text>
          </View>
          
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Amount:</Text>
            <Text style={styles.amountText}>₹85</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.buttonOrange}
          onPress={handleCollectPayment}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Collect Payment — ₹85</Text>
          )}
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  accentLine: {
    width: 60,
    height: 4,
    backgroundColor: '#ff6b00',
    borderRadius: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  badge: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  badgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '800',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 15,
    color: COLORS.gray,
  },
  cardValue: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  buttonOrange: {
    backgroundColor: '#ff6b00',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
});
