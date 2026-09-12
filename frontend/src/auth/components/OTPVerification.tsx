import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Country } from '../types';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface OTPVerificationProps {
  title: string;
  subtitle: string;
  phoneNumber: string;
  country: Country;
  generatedOtp: string;
  resendCountdown: number;
  isLoading: boolean;
  error?: string | null;
  submitButtonText?: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onChangeNumber: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  title,
  subtitle,
  phoneNumber,
  country,
  generatedOtp,
  resendCountdown,
  isLoading,
  error,
  submitButtonText = 'Verify & Continue',
  onVerify,
  onResend,
  onChangeNumber
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focus first input box on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 200);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    setLocalError(null);

    // Handle paste of full 6 digits
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        if (i < cleaned.length) {
          newDigits[i] = cleaned[i];
        }
      }
      setDigits(newDigits);
      const nextIndex = Math.min(cleaned.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleaned;
    setDigits(newDigits);

    // Auto-advance to next box if filled
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
      }
    }
  };

  const handleAutoFill = () => {
    if (!generatedOtp) return;
    const clean = generatedOtp.slice(0, 6).split('');
    const newDigits = clean.concat(Array(6 - clean.length).fill(''));
    setDigits(newDigits);
    setLocalError(null);
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setLocalError('Please enter all 6 digits of the code.');
      return;
    }
    setLocalError(null);
    await onVerify(code);
  };

  const displayedError = localError || error;

  return (
    <View style={styles.container}>
      {/* Title & Subtitle */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {subtitle}{' '}
        <Text style={styles.phoneHighlight}>
          {country.dialCode} {phoneNumber}
        </Text>
      </Text>

      {/* Change Phone Number Link */}
      <TouchableOpacity
        style={styles.changePhoneRow}
        onPress={onChangeNumber}
        activeOpacity={0.7}
      >
        <Ionicons name="pencil-outline" size={12} color="#3196F5" style={{ marginRight: 4 }} />
        <Text style={styles.changePhoneText}>Change Phone Number</Text>
      </TouchableOpacity>

      {/* Realistic Simulated SMS Toast */}
      <View style={styles.smsToast}>
        <View style={styles.smsHeader}>
          <View style={styles.smsBadgeGroup}>
            <Ionicons name="chatbox-ellipses" size={13} color="#3196F5" />
            <Text style={styles.smsBadgeText}>SMS Notification</Text>
          </View>
          <Text style={styles.smsTime}>Just now</Text>
        </View>
        <Text style={styles.smsMessage}>
          Your verification code is{' '}
          <Text style={styles.smsCode}>{generatedOtp}</Text>. Valid for 10 minutes.
        </Text>
        <TouchableOpacity
          style={styles.autofillBtn}
          onPress={handleAutoFill}
          activeOpacity={0.7}
        >
          <Ionicons name="flash" size={12} color="#3196F5" style={{ marginRight: 4 }} />
          <Text style={styles.autofillBtnText}>Auto-Fill Code ({generatedOtp})</Text>
        </TouchableOpacity>
      </View>

      {/* 6 OTP Boxes */}
      <View style={styles.otpRow}>
        {digits.map((digit, index) => {
          const isFilled = Boolean(digit);
          return (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                isFilled && styles.otpBoxFilled,
                displayedError ? styles.otpBoxError : null
              ]}
              keyboardType="number-pad"
              maxLength={6}
              value={digit}
              onChangeText={(val) => handleDigitChange(index, val)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
              selectTextOnFocus
            />
          );
        })}
      </View>

      {/* Error Banner */}
      {displayedError ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={14} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.errorText}>{displayedError}</Text>
        </View>
      ) : null}

      {/* Resend Section */}
      <View style={styles.resendRow}>
        <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
        {resendCountdown > 0 ? (
          <Text style={styles.resendTimer}>Resend available in {resendCountdown}s</Text>
        ) : (
          <TouchableOpacity onPress={onResend} activeOpacity={0.7}>
            <Text style={styles.resendActiveBtn}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          (digits.join('').length < 6 || isLoading) && styles.submitBtnDisabled
        ]}
        onPress={handleVerify}
        disabled={digits.join('').length < 6 || isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>{submitButtonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  title: {
    fontFamily: APP_FONT,
    fontSize: 20,
    fontWeight: '700',
    color: '#292929',
    marginBottom: 6
  },
  subtitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    lineHeight: 19,
    marginBottom: 10
  },
  phoneHighlight: {
    color: '#292929',
    fontWeight: '600'
  },
  changePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  changePhoneText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#3196F5',
    fontWeight: '500'
  },
  smsToast: {
    backgroundColor: '#F4F9FF',
    borderWidth: 1,
    borderColor: '#D8EBFE',
    borderRadius: 12,
    padding: 11,
    marginBottom: 20
  },
  smsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  smsBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  smsBadgeText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#3196F5',
    marginLeft: 4
  },
  smsTime: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#8E8E93'
  },
  smsMessage: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#292929',
    lineHeight: 17
  },
  smsCode: {
    fontWeight: '700',
    color: '#3196F5'
  },
  autofillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B8DBFC',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 7
  },
  autofillBtnText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#3196F5'
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 6
  },
  otpBox: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#292929',
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      }
    })
  },
  otpBoxFilled: {
    borderColor: '#3196F5',
    backgroundColor: '#F9FCFF'
  },
  otpBoxError: {
    borderColor: '#EF4444'
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 12
  },
  errorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#EF4444',
    flex: 1
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  resendPrompt: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#777777'
  },
  resendTimer: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500'
  },
  resendActiveBtn: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#3196F5',
    fontWeight: '600'
  },
  submitBtn: {
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
  submitBtnDisabled: {
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
  submitBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2
  }
});
