import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../AuthContext';
import { PhoneInput } from '../components/PhoneInput';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrength } from '../components/PasswordStrength';
import { TermsCheckbox } from '../components/TermsCheckbox';
import { SignupFormData } from '../types';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

export const SignupForm: React.FC = () => {
  const {
    requestSignupOtp,
    setCurrentStep,
    pendingCountry,
    setPendingCountry,
    isLoading,
    error,
    clearError
  } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: pendingCountry.dialCode,
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Please enter your first name.';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Please enter your last name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      errors.phone = 'Please enter a valid phone number.';
    }

    // Password validation: 8+ chars, upper, lower, number, special
    const p = formData.password;
    if (
      p.length < 8 ||
      !/[A-Z]/.test(p) ||
      !/[a-z]/.test(p) ||
      !/\d/.test(p) ||
      !/[^A-Za-z0-9]/.test(p)
    ) {
      errors.password = 'Please create a stronger password meeting all requirements.';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      errors.terms = 'Please accept the Terms & Conditions to continue.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAccount = async () => {
    clearError();
    if (!validate()) return;
    await requestSignupOtp({
      ...formData,
      countryCode: pendingCountry.dialCode
    });
  };

  return (
    <View style={styles.container}>
      {/* Title & Subtitle */}
      <Text style={styles.title}>Create Your Account</Text>
      <Text style={styles.subtitle}>Join us and get started in just a few steps</Text>

      {/* Global Server/Auth Error */}
      {error ? (
        <View style={styles.serverErrorBox}>
          <Text style={styles.serverErrorText}>{error}</Text>
        </View>
      ) : null}

      {/* Name Row */}
      <View style={styles.twoColRow}>
        <View style={{ flex: 1, marginRight: 6 }}>
          <Text style={styles.fieldLabel}>FIRST NAME *</Text>
          <View style={[styles.inputBox, fieldErrors.firstName ? styles.inputBoxError : null]}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your first name"
              placeholderTextColor="#A0A0A0"
              value={formData.firstName}
              onChangeText={(val) => {
                setFormData({ ...formData, firstName: val });
                if (fieldErrors.firstName) setFieldErrors({ ...fieldErrors, firstName: '' });
              }}
            />
          </View>
          {fieldErrors.firstName ? (
            <Text style={styles.fieldError}>{fieldErrors.firstName}</Text>
          ) : null}
        </View>

        <View style={{ flex: 1, marginLeft: 6 }}>
          <Text style={styles.fieldLabel}>LAST NAME *</Text>
          <View style={[styles.inputBox, fieldErrors.lastName ? styles.inputBoxError : null]}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your last name"
              placeholderTextColor="#A0A0A0"
              value={formData.lastName}
              onChangeText={(val) => {
                setFormData({ ...formData, lastName: val });
                if (fieldErrors.lastName) setFieldErrors({ ...fieldErrors, lastName: '' });
              }}
            />
          </View>
          {fieldErrors.lastName ? (
            <Text style={styles.fieldError}>{fieldErrors.lastName}</Text>
          ) : null}
        </View>
      </View>

      {/* Email */}
      <Text style={styles.fieldLabel}>EMAIL *</Text>
      <View style={[styles.inputBox, fieldErrors.email ? styles.inputBoxError : null]}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter your email address"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(val) => {
            setFormData({ ...formData, email: val });
            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
          }}
        />
      </View>
      {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

      {/* Phone Number */}
      <Text style={styles.fieldLabel}>PHONE NUMBER *</Text>
      <PhoneInput
        value={formData.phone}
        onChangeText={(val) => {
          setFormData({ ...formData, phone: val });
          if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
        }}
        selectedCountry={pendingCountry}
        onSelectCountry={setPendingCountry}
        error={fieldErrors.phone}
        placeholder="Phone Number"
        disabled={isLoading}
      />

      {/* Password */}
      <Text style={styles.fieldLabel}>PASSWORD *</Text>
      <PasswordInput
        value={formData.password}
        onChangeText={(val) => {
          setFormData({ ...formData, password: val });
          if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
        }}
        placeholder="Create a password"
        error={fieldErrors.password}
        disabled={isLoading}
      />

      {/* Compact Password Strength Indicator */}
      <PasswordStrength password={formData.password} />

      {/* Confirm Password */}
      <Text style={styles.fieldLabel}>CONFIRM PASSWORD *</Text>
      <PasswordInput
        value={formData.confirmPassword}
        onChangeText={(val) => {
          setFormData({ ...formData, confirmPassword: val });
          if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
        }}
        placeholder="Confirm your password"
        error={fieldErrors.confirmPassword}
        disabled={isLoading}
      />

      {/* Terms & Conditions Checkbox */}
      <TermsCheckbox
        checked={formData.agreeTerms}
        onToggle={() => {
          setFormData({ ...formData, agreeTerms: !formData.agreeTerms });
          if (fieldErrors.terms) setFieldErrors({ ...fieldErrors, terms: '' });
        }}
        error={fieldErrors.terms}
      />

      {/* Create Account Primary Button */}
      <TouchableOpacity
        style={[styles.createBtn, isLoading && styles.createBtnDisabled]}
        onPress={handleCreateAccount}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.createBtnText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* Bottom Switcher */}
      <View style={styles.bottomRow}>
        <Text style={styles.bottomMutedText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setCurrentStep('login')} activeOpacity={0.7}>
          <Text style={styles.bottomLinkText}>Login</Text>
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
    marginBottom: 16
  },
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  fieldLabel: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.4,
    marginBottom: 5
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginBottom: 14
  },
  inputBoxError: {
    borderColor: '#EF4444'
  },
  textInput: {
    fontFamily: APP_FONT,
    fontSize: 14,
    color: '#292929',
    height: '100%',
    paddingVertical: 0
  },
  fieldError: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#EF4444',
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 4
  },
  serverErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14
  },
  serverErrorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '500'
  },
  createBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#3196F5',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
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
  createBtnDisabled: {
    backgroundColor: '#A0CEFB'
  },
  createBtnText: {
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
