import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { PrescriptionMed } from '../types';

interface PrescriptionScreenProps {
  onNavigate: (tab: string) => void;
}

const COMMON_DRUGS = [
  { name: 'Amoxicillin + Clavulanate 625mg', dosage: '1 Tab', frequency: 'Twice daily (after food)', duration: '5 Days', instructions: 'Full antibiotic course' },
  { name: 'Ibuprofen 400mg', dosage: '1 Tab', frequency: 'Twice daily', duration: '3 Days', instructions: 'Take for dental pain' },
  { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10 ml', frequency: 'Twice daily', duration: '7 Days', instructions: 'Rinse thoroughly 60s' },
  { name: 'Paracetamol 650mg', dosage: '1 Tab', frequency: 'Thrice daily', duration: '3 Days', instructions: 'For pain & fever' }
];

export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = ({ onNavigate }) => {
  const { prescriptions, patients, selectedPatientId, setSelectedPatientId, addPrescription } = useDentalStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [meds, setMeds] = useState<PrescriptionMed[]>([COMMON_DRUGS[0]]);
  const [generalInstructions, setGeneralInstructions] = useState('Avoid hard, crunchy foods. Warm salt water gargle 3 times a day.');

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientPrescriptions = prescriptions.filter(rx => rx.patientId === currentPatient?.id);

  const handleAddMedPreset = (drug: typeof COMMON_DRUGS[0]) => {
    setMeds(prev => [...prev, drug]);
  };

  const handleRemoveMed = (idx: number) => {
    setMeds(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRx = () => {
    if (!currentPatient || meds.length === 0) return;

    addPrescription({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      doctorName: 'Dr. E. Rajalakshmi',
      medications: meds,
      instructions: generalInstructions
    });

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Patient Strip */}
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {patients.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.patientChip, selectedPatientId === p.id && styles.patientChipActive]}
              onPress={() => setSelectedPatientId(p.id)}
            >
              <Text style={[styles.patientChipText, selectedPatientId === p.id && styles.patientChipTextActive]}>
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.newRxBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.newRxBtnText}>Write Rx</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {patientPrescriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="medical-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Prescriptions Recorded</Text>
            <Text style={styles.emptySub}>Tap "Write Rx" to formulate a digital prescription.</Text>
          </View>
        ) : (
          patientPrescriptions.map(rx => (
            <View key={rx.id} style={styles.rxCard}>
              {/* Rx Clinic Letterhead Header */}
              <View style={styles.rxLetterhead}>
                <View>
                  <Text style={styles.rxDoctorTitle}>{rx.doctorName}, BDS, MDS</Text>
                  <Text style={styles.rxDoctorSub}>Chief Dental Surgeon • Reg: TN-MED-DEN-2018-0941</Text>
                </View>
                <View style={styles.rxSymbol}>
                  <Text style={styles.rxSymbolText}>℞</Text>
                </View>
              </View>

              {/* Patient Meta */}
              <View style={styles.patientMetaRow}>
                <Text style={styles.metaText}>Patient: <Text style={{ fontWeight: 'bold' }}>{rx.patientName}</Text></Text>
                <Text style={styles.metaText}>Date: {rx.date}</Text>
              </View>

              {/* Medications List */}
              <View style={styles.medsContainer}>
                {rx.medications.map((m, idx) => (
                  <View key={idx} style={styles.medItem}>
                    <View style={styles.medNumber}>
                      <Text style={styles.medNumberText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 8 }}>
                      <Text style={styles.medName}>{m.name}</Text>
                      <Text style={styles.medDose}>{m.dosage} • {m.frequency} • {m.duration}</Text>
                      <Text style={styles.medInst}>{m.instructions}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Doctor instructions */}
              <View style={styles.rxInstructionsBox}>
                <Text style={styles.rxInstTitle}>Special Instructions:</Text>
                <Text style={styles.rxInstBody}>{rx.instructions}</Text>
              </View>

              {/* Digital Signature */}
              <View style={styles.signatureRow}>
                <View style={styles.stampBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16a34a" />
                  <Text style={styles.stampText}>Digitally Verified</Text>
                </View>
                <Text style={styles.signatureText}>Dr. E. Rajalakshmi</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Write Rx Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Formulate Digital Rx</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.sectionLabel}>One-Tap Add Common Dental Medications:</Text>
              <View style={styles.presetGrid}>
                {COMMON_DRUGS.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.presetChip}
                    onPress={() => handleAddMedPreset(d)}
                  >
                    <Ionicons name="add" size={12} color="#0284c7" />
                    <Text style={styles.presetChipText}>{d.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Active Prescriptions in this Rx ({meds.length}):</Text>
              {meds.map((m, idx) => (
                <View key={idx} style={styles.activeMedRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.activeMedName}>{m.name}</Text>
                    <Text style={styles.activeMedDetail}>{m.dosage} | {m.frequency} | {m.duration}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveMed(idx)}>
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={[styles.sectionLabel, { marginTop: 12 }]}>General Directions / Dietary Restrictions:</Text>
              <TextInput
                style={styles.input}
                value={generalInstructions}
                onChangeText={setGeneralInstructions}
                multiline
                numberOfLines={2}
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveRx}>
              <Text style={styles.saveBtnText}>Sign & Save Prescription</Text>
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
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  patientChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6
  },
  patientChipActive: {
    backgroundColor: '#0284c7'
  },
  patientChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  patientChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  newRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8
  },
  newRxBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4
  },
  rxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  rxLetterhead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0284c7',
    paddingBottom: 10
  },
  rxDoctorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  rxDoctorSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1
  },
  rxSymbol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rxSymbolText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0284c7'
  },
  patientMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  metaText: {
    fontSize: 12,
    color: '#334155'
  },
  medsContainer: {
    paddingVertical: 10
  },
  medItem: {
    flexDirection: 'row',
    marginBottom: 10
  },
  medNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  medNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569'
  },
  medName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  medDose: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 1
  },
  medInst: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  rxInstructionsBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6
  },
  rxInstTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  rxInstBody: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  stampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  stampText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
    marginLeft: 4
  },
  signatureText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontStyle: 'italic'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7',
    marginLeft: 4
  },
  activeMedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  activeMedName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  activeMedDetail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0f172a'
  },
  saveBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
