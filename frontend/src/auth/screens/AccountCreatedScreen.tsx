import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

export const AccountCreatedScreen: React.FC = () => {
  const { setCurrentStep, user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Animated Success Badge */}
      <View style={styles.successIconWrapper}>
        <View style={styles.successInnerCircle}>
          <Ionicons name="checkmark" size={36} color="#3196F5" />
        </View>
      </View>

      <Text style={styles.title}>Account Created Successfully</Text>
      <Text style={styles.subtitle}>
        Welcome, {user?.firstName || 'there'}! Your account has been verified and is ready.
      </Text>

      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => setCurrentStep('onboarding_preferences')}
        activeOpacity={0.85}
      >
        <Text style={styles.continueBtnText}>Continue to Personalization</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%'
  },
  successIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDF5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  successInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(49, 150, 245, 0.2)'
      },
      default: {
        shadowColor: '#3196F5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2
      }
    })
  },
  title: {
    fontFamily: APP_FONT,
    fontSize: 20,
    fontWeight: '700',
    color: '#292929',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 26,
    paddingHorizontal: 10
  },
  continueBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#3196F5',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(49, 150, 245, 0.3)'
      },
      default: {
        shadowColor: '#3196F5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3
      }
    })
  },
  continueBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});
