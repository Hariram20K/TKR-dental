import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

export const WelcomeScreen: React.FC = () => {
  const { finishOnboarding, isLoading, user } = useAuth();

  return (
    <View style={styles.container}>
      {/* Celebration Badge */}
      <View style={styles.partyBadgeWrapper}>
        <View style={styles.partyBadgeInner}>
          <Text style={{ fontSize: 32 }}>🎉</Text>
        </View>
      </View>

      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>
        Welcome aboard, {user?.displayName || user?.firstName || 'valued member'}! Your account is active and personalized.
      </Text>

      {/* Highlights summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          <Text style={styles.summaryText}>Mobile Number Verified</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="sparkles" size={14} color="#3196F5" />
          <Text style={styles.summaryText}>Personalized Preferences Saved</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="lock-closed" size={14} color="#6366F1" />
          <Text style={styles.summaryText}>256-Bit SSL Protected Session</Text>
        </View>
      </View>

      {/* Primary Go to Dashboard Button */}
      <TouchableOpacity
        style={[styles.dashboardBtn, isLoading && styles.btnDisabled]}
        onPress={finishOnboarding}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </>
        )}
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
  partyBadgeWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDF5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  partyBadgeInner: {
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
    fontSize: 22,
    fontWeight: '700',
    color: '#292929',
    textAlign: 'center',
    marginBottom: 6
  },
  subtitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 22
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  summaryText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
    marginLeft: 8
  },
  dashboardBtn: {
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
  btnDisabled: {
    backgroundColor: '#A0CEFB'
  },
  dashboardBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});
