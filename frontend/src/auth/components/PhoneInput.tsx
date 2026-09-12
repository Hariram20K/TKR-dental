import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Country, COUNTRIES } from '../types';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  error?: string | null;
  placeholder?: string;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  selectedCountry,
  onSelectCountry,
  error,
  placeholder = 'Phone Number',
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dialCode.includes(searchQuery)
  );

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
        {/* Country Selector Button */}
        <TouchableOpacity
          style={styles.countryBtn}
          onPress={() => !disabled && setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
          <Ionicons name="chevron-down" size={13} color="#777777" style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        <View style={styles.verticalDivider} />

        {/* Numeric Phone Input */}
        <TextInput
          style={styles.inputField}
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          keyboardType="phone-pad"
          maxLength={15}
          value={value}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChangeText={(text) => onChangeText(text.replace(/[^\d\s-]/g, ''))}
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Country Selection Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#777777" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchBar}
              placeholder="Search country or code..."
              placeholderTextColor="#A0A0A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />

            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
              {filteredCountries.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.countryItemActive
                  ]}
                  onPress={() => {
                    onSelectCountry(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.itemFlag}>{item.flag}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCode}>{item.dialCode}</Text>
                  {selectedCountry.code === item.code && (
                    <Ionicons name="checkmark" size={16} color="#3196F5" style={{ marginLeft: 6 }} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 12,
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
  countryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8
  },
  countryFlag: {
    fontSize: 18,
    marginRight: 6
  },
  countryCode: {
    fontFamily: APP_FONT,
    fontSize: 14,
    fontWeight: '500',
    color: '#292929'
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 10
  },
  inputField: {
    flex: 1,
    fontFamily: APP_FONT,
    fontSize: 14,
    color: '#292929',
    height: '100%',
    paddingVertical: 0
  },
  errorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 4
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
      }
    })
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  modalTitle: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#292929'
  },
  searchBar: {
    fontFamily: APP_FONT,
    backgroundColor: '#F5F5F7',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#292929',
    marginBottom: 12
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  countryItemActive: {
    backgroundColor: '#F0F7FF'
  },
  itemFlag: {
    fontSize: 18,
    marginRight: 10
  },
  itemName: {
    flex: 1,
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#292929'
  },
  itemCode: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#777777',
    fontWeight: '500'
  }
});
