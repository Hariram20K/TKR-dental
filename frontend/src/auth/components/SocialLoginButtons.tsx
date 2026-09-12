import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface SocialLoginButtonsProps {
  onSocialLogin: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  disabled?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSocialLogin,
  disabled = false
}) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | 'apple' | null>(null);

  const handlePress = async (provider: 'google' | 'facebook' | 'apple') => {
    if (disabled || loadingProvider) return;
    setLoadingProvider(provider);
    try {
      await onSocialLogin(provider);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Google Button */}
      <TouchableOpacity
        style={[styles.socialBtn, styles.googleBtn, disabled && styles.btnDisabled]}
        onPress={() => handlePress('google')}
        disabled={disabled || loadingProvider !== null}
        activeOpacity={0.8}
      >
        {loadingProvider === 'google' ? (
          <ActivityIndicator size="small" color="#292929" />
        ) : (
          <>
            <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 10 }} />
            <Text style={styles.socialBtnTextDark}>Sign in with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Facebook Button */}
      <TouchableOpacity
        style={[styles.socialBtn, styles.facebookBtn, disabled && styles.btnDisabled]}
        onPress={() => handlePress('facebook')}
        disabled={disabled || loadingProvider !== null}
        activeOpacity={0.8}
      >
        {loadingProvider === 'facebook' ? (
          <ActivityIndicator size="small" color="#1877F2" />
        ) : (
          <>
            <Ionicons name="logo-facebook" size={19} color="#1877F2" style={{ marginRight: 10 }} />
            <Text style={styles.socialBtnTextDark}>Sign in with Facebook</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  dividerText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    paddingHorizontal: 12,
    letterSpacing: 0.5
  },
  socialBtn: {
    width: '100%',
    height: 48,
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1
  },
  btnDisabled: {
    opacity: 0.6
  },
  googleBtn: {
    backgroundColor: '#F7F9FC',
    borderColor: '#E8ECF2'
  },
  facebookBtn: {
    backgroundColor: '#F5F8FC',
    borderColor: '#E6EDF7'
  },
  socialBtnTextDark: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#292929',
    letterSpacing: 0.2
  },
  socialBtnTextLight: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2
  }
});
