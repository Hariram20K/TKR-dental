import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Password',
  error,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          error ? styles.inputWrapperError : null,
          disabled && styles.inputWrapperDisabled
        ]}
      >
        <TextInput
          style={styles.inputField}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!showPassword}
          value={value}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="#777777"
          />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 13,
    height: 48,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        outlineStyle: 'none'
      }
    })
  },
  inputWrapperFocused: {
    borderColor: '#3196F5',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(49, 150, 245, 0.15)'
      }
    })
  },
  inputWrapperError: {
    borderColor: '#EF4444'
  },
  inputWrapperDisabled: {
    backgroundColor: '#F8FAFC',
    opacity: 0.7
  },
  inputField: {
    flex: 1,
    fontFamily: APP_FONT,
    fontSize: 14,
    color: '#292929',
    height: '100%',
    paddingVertical: 0
  },
  eyeBtn: {
    padding: 6,
    marginRight: -4
  },
  errorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 4
  }
});
