import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../AuthContext';
import { PhoneInput } from '../components/PhoneInput';
import { SocialLoginButtons } from '../components/SocialLoginButtons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

export const LoginForm: React.FC = () => {
  const {
    requestLoginOtp,
    socialLogin,
    setCurrentStep,
    pendingCountry,
    setPendingCountry,
    isLoading,
    error,
    clearError
  } = useAuth();

  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleContinue = async () => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8 || clean.length > 15) {
      setLocalError('Please enter a valid phone number.');
      return;
    }
    setLocalError(null);
    clearError();
    await requestLoginOtp(phone, pendingCountry);
  };

  const isButtonEnabled = phone.replace(/\D/g, '').length >= 8 && !isLoading;
  const displayedError = localError || error;

  return (
    <View style={styles.container}>
      {/* Title & Subtitle */}
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Please log in with your phone number</Text>

      {/* Phone Number Input */}
      <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
      <PhoneInput
        value={phone}
        onChangeText={(val) => {
          setPhone(val);
          if (localError) setLocalError(null);
          if (error) clearError();
        }}
        selectedCountry={pendingCountry}
        onSelectCountry={setPendingCountry}
        error={displayedError}
        placeholder="Phone Number"
        disabled={isLoading}
      />

      {/* Primary Continue Button */}
      <TouchableOpacity
        style={[styles.continueBtn, !isButtonEnabled && styles.continueBtnDisabled]}
        onPress={handleContinue}
        disabled={!isButtonEnabled}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.continueBtnText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Social Login Options */}
      <SocialLoginButtons onSocialLogin={socialLogin} disabled={isLoading} />

      {/* Bottom Switcher */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomMutedText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentStep('signup')} activeOpacity={0.7}>
          <Text style={styles.bottomLinkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  title: {
    fontFamily: APP_FONT,
    fontSize: 22,
    fontWeight: '700',
    color: '#292929',
    marginBottom: 4
  },
  subtitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    marginBottom: 20
  },
  fieldLabel: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.4,
    marginBottom: 6
  },
  continueBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#3196F5',
    borderRadius: 13,
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
  continueBtnDisabled: {
    backgroundColor: '#A0CEFB',
    ...Platform.select({
      web: {
        boxShadow: 'none'
      },
      default: {
        shadowOpacity: 0,
        elevation: 0
      }
    })
  },
  continueBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18
  },
  bottomMutedText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#777777'
  },
  bottomLinkText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#3196F5',
    fontWeight: '600'
  }
});
