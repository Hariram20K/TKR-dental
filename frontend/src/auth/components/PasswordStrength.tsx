import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCount = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let strengthLabel = 'Weak';
  let barColor = '#EF4444';
  let barWidth = '33%';

  if (passedCount >= 4 && hasMinLength) {
    strengthLabel = 'Strong';
    barColor = '#10B981';
    barWidth = '100%';
  } else if (passedCount >= 3) {
    strengthLabel = 'Medium';
    barColor = '#F59E0B';
    barWidth = '66%';
  }

  if (!password) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Strength Bar */}
      <View style={styles.strengthRow}>
        <Text style={styles.strengthLabel}>
          Password strength:{' '}
          <Text style={{ color: barColor, fontWeight: '600' }}>{strengthLabel}</Text>
        </Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: barWidth as any, backgroundColor: barColor }]} />
        </View>
      </View>

      {/* Compact Checklist */}
      <View style={styles.checklist}>
        <RequirementItem label="8+ characters" met={hasMinLength} />
        <RequirementItem label="1 uppercase" met={hasUpper} />
        <RequirementItem label="1 lowercase" met={hasLower} />
        <RequirementItem label="1 number" met={hasNumber} />
        <RequirementItem label="1 special char" met={hasSpecial} />
      </View>
    </View>
  );
};

const RequirementItem: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
  <View style={styles.reqItem}>
    <Ionicons
      name={met ? 'checkmark-circle' : 'ellipse-outline'}
      size={12}
      color={met ? '#10B981' : '#A0A0A0'}
      style={{ marginRight: 4 }}
    />
    <Text style={[styles.reqText, met && styles.reqTextMet]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: -8,
    marginBottom: 14,
    paddingHorizontal: 2
  },
  strengthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  strengthLabel: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#777777'
  },
  barTrack: {
    width: 90,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 2
  },
  checklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reqText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#8E8E93'
  },
  reqTextMet: {
    color: '#10B981',
    fontWeight: '500'
  }
});
