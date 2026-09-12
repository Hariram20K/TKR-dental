import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { Patient } from '../types';

interface PatientsScreenProps {
  onNavigate: (tab: string) => void;
}

export const PatientsScreen: React.FC<PatientsScreenProps> = ({ onNavigate }) => {
  const { patients, selectedPatientId, setSelectedPatientId, addPatient, addQueueToken } = useDentalStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [address, setAddress] = useState('');
  const [medicalHistoryStr, setMedicalHistoryStr] = useState('');
  const [allergiesStr, setAllergiesStr] = useState('');
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('72 bpm');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  const handleRegister = () => {
    if (!name.trim() || !phone.trim() || !age.trim()) {
      Alert.alert('Missing Details', 'Please fill in all required fields (Name, Age, and Phone).');
      return;
    }

    addPatient({
      name: name.trim(),
      age: parseInt(age, 10) || 30,
      gender,
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      bloodGroup,
      address: address.trim() || 'Tirupathur, Tamil Nadu',
      emergencyContact: 'Family Contact',
      medicalHistory: medicalHistoryStr ? medicalHistoryStr.split(',').map(s => s.trim()) : ['None'],
      allergies: allergiesStr ? allergiesStr.split(',').map(s => s.trim()) : ['NKDA'],
      assignedDoctorId: 'DOC-1',
      vitals: {
        bp,
        pulse,
        spo2: '99%',
        temp: '98.6 F',
        sugar: '100 mg/dL'
      },
      notes: 'New patient registered via mobile app.'
    });

    setModalVisible(false);
    // Reset inputs
    setName('');
    setAge('');
    setPhone('');
    setEmail('');
    setMedicalHistoryStr('');
    setAllergiesStr('');
  };

  return (
    <View style={styles.container}>
      {/* Search & Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patient by name, ID or phone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="person-add" size={18} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredPatients.map(pat => {
          const isSelected = pat.id === selectedPatientId;
          const hasAllergies = pat.allergies.length > 0 && pat.allergies[0] !== 'NKDA' && pat.allergies[0] !== 'No known drug allergies (NKDA)';

          return (
            <TouchableOpacity
              key={pat.id}
              style={[styles.patientCard, isSelected && styles.selectedCard]}
              onPress={() => setSelectedPatientId(pat.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{pat.gender === 'Female' ? '👩' : '👨'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.patientName}>{pat.name}</Text>
                    <Text style={styles.patientIdBadge}>{pat.id}</Text>
                  </View>
                  <Text style={styles.patientMeta}>
                    {pat.age} Yrs • {pat.gender} • Blood: {pat.bloodGroup}
                  </Text>
                </View>
              </View>

              {/* Vitals Row */}
              <View style={styles.vitalsRow}>
                <Text style={styles.vitalChip}>BP: {pat.vitals.bp}</Text>
                <Text style={styles.vitalChip}>Pulse: {pat.vitals.pulse}</Text>
                <Text style={styles.vitalChip}>Sugar: {pat.vitals.sugar}</Text>
              </View>

              {/* Alerts & Medical conditions */}
              <View style={styles.tagsContainer}>
                {hasAllergies && (
                  <View style={styles.allergyTag}>
                    <Ionicons name="warning" size={12} color="#dc2626" />
                    <Text style={styles.allergyTagText}>Allergy: {pat.allergies.join(', ')}</Text>
                  </View>
                )}
                {pat.medicalHistory.map((m, idx) => (
                  <View key={idx} style={styles.medHistoryTag}>
                    <Text style={styles.medHistoryText}>{m}</Text>
                  </View>
                ))}
              </View>

              {/* Quick Card Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
                  onPress={() => {
                    setSelectedPatientId(pat.id);
                    onNavigate('odontogram');
                  }}
                >
                  <Ionicons name="fitness" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.actionBtnText}>Odontogram</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#d97706' }]}
                  onPress={() => {
                    addQueueToken(pat.id);
                    onNavigate('queue');
                  }}
                >
                  <Ionicons name="ticket" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.actionBtnText}>Issue Token</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                  onPress={() => {
                    setSelectedPatientId(pat.id);
                    onNavigate('prescriptions');
                  }}
                >
                  <Ionicons name="medical" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.actionBtnText}>Rx</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Registration Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Patient</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput style={styles.input} placeholder="e.g. S. Meenakshi" value={name} onChangeText={setName} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>Age *</Text>
                  <TextInput style={styles.input} placeholder="e.g. 29" keyboardType="numeric" value={age} onChangeText={setAge} />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderRow}>
                    {['Male', 'Female'].map(g => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                        onPress={() => setGender(g)}
                      >
                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput style={styles.input} placeholder="+91 98765 43210" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

              <Text style={styles.inputLabel}>Medical History (comma separated)</Text>
              <TextInput style={styles.input} placeholder="e.g. Hypertension, Thyroid" value={medicalHistoryStr} onChangeText={setMedicalHistoryStr} />

              <Text style={styles.inputLabel}>Drug Allergies</Text>
              <TextInput style={styles.input} placeholder="e.g. Penicillin, Sulfa drugs" value={allergiesStr} onChangeText={setAllergiesStr} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>Blood Pressure</Text>
                  <TextInput style={styles.input} value={bp} onChangeText={setBp} />
                </View>
                <View style={{ width: '48%' }}>
                  <Text style={styles.inputLabel}>Pulse</Text>
                  <TextInput style={styles.input} value={pulse} onChangeText={setPulse} />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
              <Text style={styles.submitBtnText}>Complete Registration</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  topBar: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center'
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a'
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  selectedCard: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 22
  },
  patientName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  patientIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  patientMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  vitalsRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  vitalChip: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4
  },
  allergyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 4
  },
  medHistoryTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4
  },
  medHistoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d97706'
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 10
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a'
  },
  genderRow: {
    flexDirection: 'row'
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginRight: 4
  },
  genderBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  genderText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  genderTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
