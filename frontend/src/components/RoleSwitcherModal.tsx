import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { UserRole } from '../types';

interface RoleSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ visible, onClose }) => {
  const { role, setRole, resetAllData } = useDentalStore();

  const handleSelectRole = (r: UserRole) => {
    setRole(r);
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Demo Records',
      'Are you sure you want to reset all records back to initial seeds?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAllData();
            onClose();
          }
        }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalCard}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Clinical Role</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Experience the system from different perspectives in real-time:
          </Text>

          {/* Dentist Role */}
          <TouchableOpacity
            style={[styles.roleOption, role === 'dentist' && styles.selectedRoleOption]}
            onPress={() => handleSelectRole('dentist')}
          >
            <Text style={styles.roleIcon}>👩‍⚕️</Text>
            <View style={styles.roleTextBox}>
              <Text style={styles.roleName}>Dentist / Doctor</Text>
              <Text style={styles.roleDesc}>Full access to 32-tooth odontogram, diagnosis, treatment plans, prescriptions, and billing.</Text>
            </View>
            {role === 'dentist' && <Ionicons name="checkmark-circle" size={22} color="#0284c7" />}
          </TouchableOpacity>

          {/* Patient Role */}
          <TouchableOpacity
            style={[styles.roleOption, role === 'patient' && styles.selectedRoleOption]}
            onPress={() => handleSelectRole('patient')}
          >
            <Text style={styles.roleIcon}>👤</Text>
            <View style={styles.roleTextBox}>
              <Text style={styles.roleName}>Patient Portal (Mobile App)</Text>
              <Text style={styles.roleDesc}>Personal dental records, upcoming visits, active Rx prescriptions, and online invoice payment.</Text>
            </View>
            {role === 'patient' && <Ionicons name="checkmark-circle" size={22} color="#0284c7" />}
          </TouchableOpacity>

          {/* Admin Role */}
          <TouchableOpacity
            style={[styles.roleOption, role === 'admin' && styles.selectedRoleOption]}
            onPress={() => handleSelectRole('admin')}
          >
            <Text style={styles.roleIcon}>🛡️</Text>
            <View style={styles.roleTextBox}>
              <Text style={styles.roleName}>Clinic Admin</Text>
              <Text style={styles.roleDesc}>Inventory stock alerts, laboratory orders, branch metrics, and data reset.</Text>
            </View>
            {role === 'admin' && <Ionicons name="checkmark-circle" size={22} color="#0284c7" />}
          </TouchableOpacity>

          {/* Reset Demo Data Button */}
          <TouchableOpacity 
            style={styles.resetBtn}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={16} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>Reset Demo Data to Initial Seeds</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    backgroundColor: '#f8fafc'
  },
  selectedRoleOption: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  roleIcon: {
    fontSize: 26,
    marginRight: 12
  },
  roleTextBox: {
    flex: 1
  },
  roleName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  roleDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626'
  }
});
