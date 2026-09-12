import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface TermsCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  error?: string | null;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  checked,
  onToggle,
  error
}) => {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Custom Accessible Checkbox */}
        <TouchableOpacity
          style={[styles.checkbox, checked && styles.checkboxChecked]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          {checked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
        </TouchableOpacity>

        {/* Text with Clickable Terms & Privacy */}
        <View style={styles.textContainer}>
          <Text style={styles.baseText}>
            I agree to the{' '}
            <Text
              style={styles.linkText}
              onPress={() => setModalType('terms')}
            >
              Terms & Conditions
            </Text>{' '}
            and{' '}
            <Text
              style={styles.linkText}
              onPress={() => setModalType('privacy')}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Terms / Privacy Modal */}
      <Modal visible={modalType !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Ionicons name="close" size={20} color="#777777" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>
                {modalType === 'terms' ? (
                  `1. Account Registration\nBy creating an account, you agree to provide true, accurate, and complete information.\n\n2. Security & Access\nYou are responsible for maintaining the confidentiality of your credentials and account access.\n\n3. Patient Care & Communications\nWe may send transactional SMS, verification codes, and appointment updates.\n\n4. Data Integrity\nAll records are stored securely with 256-bit encryption.`
                ) : (
                  `1. Information Collected\nWe collect your contact details, clinical appointments, and preferences to provide personalized care.\n\n2. Confidentiality\nYour clinical dental records are protected under medical privacy standards and will never be shared without consent.\n\n3. Data Retention\nYou may request account deletion or data portability at any time through our patient support.`
                )}
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setModalType(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Close & Return</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 1
  },
  checkboxChecked: {
    backgroundColor: '#3196F5',
    borderColor: '#3196F5'
  },
  textContainer: {
    flex: 1
  },
  baseText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#777777',
    lineHeight: 18
  },
  linkText: {
    color: '#3196F5',
    fontWeight: '600'
  },
  errorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 30
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
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
    fontWeight: '700',
    color: '#292929'
  },
  modalScroll: {
    maxHeight: 280,
    marginVertical: 10
  },
  modalBody: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#555555',
    lineHeight: 19
  },
  modalCloseBtn: {
    backgroundColor: '#3196F5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12
  },
  modalCloseBtnText: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
