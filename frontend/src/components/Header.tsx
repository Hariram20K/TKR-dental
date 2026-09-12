import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenRolePicker: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenRolePicker, title, subtitle }) => {
  const { role, patients, selectedPatientId } = useDentalStore();
  const currentPat = patients.find(p => p.id === selectedPatientId);

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'dentist': return 'Dentist';
      case 'patient': return 'Patient';
      case 'admin': return 'Admin';
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandingBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🦷</Text>
          </View>
          <View>
            <Text style={styles.clinicTitle}>TKR DENTAL CARE</Text>
            <Text style={styles.clinicTagline}>Healthy Smiles, Happier Lives</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.roleButton} 
          onPress={onOpenRolePicker}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 13, marginRight: 3 }}>
            {role === 'dentist' ? '👩‍⚕️' : role === 'patient' ? '👤' : '🛡️'}
          </Text>
          <Text style={styles.roleButtonText}>{getRoleLabel(role)}</Text>
          <Ionicons name="chevron-down" size={13} color="#0284c7" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      {title && (
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
        </View>
      )}

      {role === 'dentist' && currentPat && (
        <View style={styles.activePatientBar}>
          <View style={styles.activePatientInfo}>
            <Text style={styles.activePatientLabel}>ACTIVE PATIENT:</Text>
            <Text style={styles.activePatientName}>{currentPat.name} ({currentPat.id})</Text>
          </View>
          {currentPat.allergies.length > 0 && currentPat.allergies[0] !== 'No known drug allergies (NKDA)' && (
            <View style={styles.alertBadge}>
              <Ionicons name="warning" size={12} color="#dc2626" />
              <Text style={styles.alertText}>Allergy: {currentPat.allergies[0]}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  logoIcon: {
    fontSize: 20
  },
  clinicTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.5
  },
  clinicTagline: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700'
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1'
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 4
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b'
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  activePatientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7'
  },
  activePatientInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  activePatientLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    marginRight: 6
  },
  activePatientName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6
  },
  alertText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 3
  }
});
