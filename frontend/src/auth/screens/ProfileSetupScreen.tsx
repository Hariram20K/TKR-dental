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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

const AVATAR_PRESETS = ['👤', '🦷', '🌟', '🩺', '👨‍⚕️', '👩‍⚕️'];

export const ProfileSetupScreen: React.FC = () => {
  const { user, saveProfileDetails, setCurrentStep, isLoading } = useAuth();

  const [selectedAvatar, setSelectedAvatar] = useState('👤');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [location, setLocation] = useState('');

  const handleSave = async () => {
    await saveProfileDetails({
      displayName: displayName.trim() || user?.displayName,
      dateOfBirth: dateOfBirth.trim() || undefined,
      location: location.trim() || undefined,
      avatarUri: selectedAvatar
    });
  };

  const handleSkip = () => {
    setCurrentStep('welcome');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Add a few details to personalize your experience.</Text>

      {/* Avatar Selector */}
      <Text style={styles.fieldLabel}>CHOOSE AVATAR (OPTIONAL)</Text>
      <View style={styles.avatarRow}>
        {AVATAR_PRESETS.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            style={[styles.avatarCircle, selectedAvatar === emoji && styles.avatarCircleActive]}
            onPress={() => setSelectedAvatar(emoji)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Display Name */}
      <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Rahul V."
          placeholderTextColor="#A0A0A0"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      {/* Date of Birth (optional) */}
      <Text style={styles.fieldLabel}>DATE OF BIRTH (OPTIONAL)</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#A0A0A0"
          value={dateOfBirth}
          onChangeText={setDateOfBirth}
        />
      </View>

      {/* Location (optional) */}
      <Text style={styles.fieldLabel}>CITY / LOCATION (OPTIONAL)</Text>
      <View style={styles.inputBox}>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Bengaluru, Karnataka"
          placeholderTextColor="#A0A0A0"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Save & Continue */}
      <TouchableOpacity
        style={[styles.continueBtn, isLoading && styles.btnDisabled]}
        onPress={handleSave}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.continueBtnText}>Save & Continue</Text>
        )}
      </TouchableOpacity>

      {/* Skip for now */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <Text style={styles.skipBtnText}>Skip for now</Text>
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
    fontSize: 21,
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
  fieldLabel: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.4,
    marginBottom: 6
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F5F5F7',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarCircleActive: {
    borderColor: '#3196F5',
    backgroundColor: '#EDF5FE'
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
  textInput: {
    fontFamily: APP_FONT,
    fontSize: 14,
    color: '#292929',
    height: '100%',
    paddingVertical: 0
  },
  continueBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#3196F5',
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
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
  continueBtnText: {
    fontFamily: APP_FONT,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8
  },
  skipBtnText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500'
  }
});
