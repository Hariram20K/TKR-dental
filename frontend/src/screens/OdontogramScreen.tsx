import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { Odontogram } from '../components/Odontogram';
import { ToothConditionType, ToothSurface } from '../types';

interface OdontogramScreenProps {
  onNavigate: (tab: string) => void;
}

export const OdontogramScreen: React.FC<OdontogramScreenProps> = ({ onNavigate }) => {
  const { patients, selectedPatientId, setSelectedPatientId, teethMap, setToothCondition, addTreatmentPlan } = useDentalStore();
  const [selectedTooth, setSelectedTooth] = useState<number | undefined>(19);
  const [clinicalNotes, setClinicalNotes] = useState('Patient presented with mild sensitivity in tooth #19 under masticatory load.');

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientTeeth = (currentPatient ? teethMap[currentPatient.id] : {}) || {};

  const handleUpdateCondition = (toothNum: number, condition: ToothConditionType, surfaces: ToothSurface[]) => {
    if (!currentPatient) return;
    setToothCondition(currentPatient.id, toothNum, condition, surfaces);
  };

  const teethList = Object.values(patientTeeth);

  const handleCreatePlanFromTeeth = () => {
    if (!currentPatient) return;
    const items = teethList.map((t, idx) => ({
      id: `ITEM-${idx + 1}`,
      tooth: `#${t.number}`,
      procedure: t.condition === 'caries' ? 'Composite Restoration' :
                 t.condition === 'rct' ? 'Molar Root Canal Treatment' :
                 t.condition === 'crown' ? 'Zirconia Crown' : 'Clinical Procedure',
      cost: t.condition === 'crown' ? 12000 : t.condition === 'rct' ? 6500 : 1800,
      status: 'Planned' as const
    }));

    const total = items.reduce((sum, it) => sum + it.cost, 0);

    addTreatmentPlan({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      title: `Plan based on Dental Examination (${currentPatient.name})`,
      status: 'Active',
      items,
      totalCost: total
    });

    onNavigate('treatment');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Patient Selector Strip */}
      <View style={styles.patientStrip}>
        <Text style={styles.stripLabel}>PATIENT:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 8 }}>
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
      </View>

      {/* Patient Summary Header */}
      {currentPatient && (
        <View style={styles.patientInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.patientTitle}>{currentPatient.name}</Text>
            <Text style={styles.patientIdText}>{currentPatient.id}</Text>
          </View>
          <Text style={styles.patientSub}>
            Age: {currentPatient.age} | {currentPatient.gender} | Allergies: {currentPatient.allergies.join(', ')}
          </Text>
        </View>
      )}

      {/* Interactive Odontogram Chart */}
      <Odontogram
        teethData={patientTeeth}
        selectedToothNumber={selectedTooth}
        onSelectTooth={setSelectedTooth}
        onUpdateCondition={handleUpdateCondition}
      />

      {/* Diagnosed Conditions List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Diagnosed Teeth Findings ({teethList.length})</Text>
          {teethList.length > 0 && (
            <TouchableOpacity style={styles.convertBtn} onPress={handleCreatePlanFromTeeth}>
              <Ionicons name="construct-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
              <Text style={styles.convertBtnText}>Generate Treatment Plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {teethList.length === 0 ? (
          <Text style={styles.emptyText}>No pathology marked. Tap teeth above to chart findings.</Text>
        ) : (
          teethList.map(t => (
            <View key={t.number} style={styles.toothRow}>
              <View style={styles.toothNumberBadge}>
                <Text style={styles.toothNumberBadgeText}>#{t.number}</Text>
              </View>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={styles.toothConditionName}>{t.condition.toUpperCase()}</Text>
                <Text style={styles.toothSurfaces}>Surfaces: {t.surfaces.join(', ') || 'Whole Tooth'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleUpdateCondition(t.number, 'healthy', [])}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Clinical Notes */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clinical Examination Notes</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={3}
          value={clinicalNotes}
          onChangeText={setClinicalNotes}
          placeholder="Type clinical notes, diagnostic impressions, RVG X-ray remarks..."
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  patientStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  stripLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b'
  },
  patientChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6
  },
  patientChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
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
  patientInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  patientTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  patientIdText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '700'
  },
  patientSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  convertBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  emptyText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 8
  },
  toothRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  toothNumberBadge: {
    backgroundColor: '#f1f5f9',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  toothNumberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a'
  },
  toothConditionName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  toothSurfaces: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  notesInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
    marginTop: 8,
    textAlignVertical: 'top'
  }
});
