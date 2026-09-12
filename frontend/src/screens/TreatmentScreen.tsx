import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { TreatmentPlan } from '../types';

interface TreatmentScreenProps {
  onNavigate: (tab: string) => void;
}

export const TreatmentScreen: React.FC<TreatmentScreenProps> = ({ onNavigate }) => {
  const { treatmentPlans, patients, selectedPatientId, setSelectedPatientId, addTreatmentPlan, updateTreatmentItemStatus, addInvoice } = useDentalStore();
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for new procedure
  const [toothNum, setToothNum] = useState('#19');
  const [procedureName, setProcedureName] = useState('Zirconia Crown');
  const [procCost, setProcCost] = useState('12000');

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const patientPlans = treatmentPlans.filter(p => p.patientId === currentPatient?.id);

  const handleAddProcedure = () => {
    if (!currentPatient) return;
    const cost = parseInt(procCost, 10) || 1500;

    const existingPlan = patientPlans[0];
    if (existingPlan) {
      // Add item to existing plan
      const newItem = {
        id: `TPI-${Date.now()}`,
        tooth: toothNum,
        procedure: procedureName,
        cost,
        status: 'Planned' as const
      };
      existingPlan.items.push(newItem);
      existingPlan.totalCost += cost;
    } else {
      addTreatmentPlan({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        title: `Comprehensive Treatment Plan - ${currentPatient.name}`,
        status: 'Active',
        items: [
          {
            id: `TPI-${Date.now()}`,
            tooth: toothNum,
            procedure: procedureName,
            cost,
            status: 'Planned'
          }
        ],
        totalCost: cost
      });
    }

    setModalVisible(false);
  };

  const handleInvoicePlan = (plan: TreatmentPlan) => {
    addInvoice({
      patientId: plan.patientId,
      patientName: plan.patientName,
      items: plan.items.map(it => ({
        description: `${it.procedure} (${it.tooth})`,
        tooth: it.tooth,
        quantity: 1,
        rate: it.cost,
        amount: it.cost
      })),
      subtotal: plan.totalCost,
      discount: 500,
      total: Math.max(0, plan.totalCost - 500),
      paid: 0,
      balance: Math.max(0, plan.totalCost - 500),
      paymentMode: 'UPI QR',
      status: 'Unpaid'
    });

    onNavigate('billing');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed': return { bg: '#dcfce7', text: '#16a34a' };
      case 'In Progress': return { bg: '#e0f2fe', text: '#0284c7' };
      default: return { bg: '#fef3c7', text: '#d97706' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Patient Selector */}
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

        <TouchableOpacity style={styles.newProcBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.newProcBtnText}>Add Procedure</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {patientPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="construct-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Treatment Plans Found</Text>
            <Text style={styles.emptySub}>Create a new procedure or generate from Odontogram.</Text>
          </View>
        ) : (
          patientPlans.map(plan => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDate}>Created: {plan.createdAt} • {plan.items.length} Procedures</Text>
                </View>
                <Text style={styles.totalCostText}>₹{plan.totalCost.toLocaleString()}</Text>
              </View>

              {/* Procedures Items */}
              <View style={styles.itemsList}>
                {plan.items.map(item => {
                  const s = getStatusStyle(item.status);

                  return (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemToothPill}>
                        <Text style={styles.itemToothText}>{item.tooth}</Text>
                      </View>
                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Text style={styles.itemProcName}>{item.procedure}</Text>
                        <Text style={styles.itemCost}>₹{item.cost.toLocaleString()}</Text>
                      </View>

                      {/* Status advancement button */}
                      <TouchableOpacity
                        style={[styles.statusPill, { backgroundColor: s.bg }]}
                        onPress={() => {
                          const nextStatus = item.status === 'Planned' ? 'In Progress' :
                                             item.status === 'In Progress' ? 'Completed' : 'Planned';
                          updateTreatmentItemStatus(plan.id, item.id, nextStatus);
                        }}
                      >
                        <Text style={[styles.statusPillText, { color: s.text }]}>{item.status}</Text>
                        <Ionicons name="swap-horizontal" size={12} color={s.text} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Invoice Conversion Footer */}
              <View style={styles.planFooter}>
                <TouchableOpacity style={styles.billBtn} onPress={() => handleInvoicePlan(plan)}>
                  <Ionicons name="receipt-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.billBtnText}>Create Invoice & Collect Bill</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Procedure Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Dental Procedure</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tooth Number</Text>
            <TextInput style={styles.input} value={toothNum} onChangeText={setToothNum} placeholder="e.g. #19, #46, Full Mouth" />

            <Text style={styles.label}>Procedure Description</Text>
            <TextInput style={styles.input} value={procedureName} onChangeText={setProcedureName} placeholder="e.g. Class II Restoration, RCT" />

            <Text style={styles.label}>Standard Fee (₹)</Text>
            <TextInput style={styles.input} value={procCost} onChangeText={setProcCost} keyboardType="numeric" />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddProcedure}>
              <Text style={styles.submitBtnText}>Add to Treatment Plan</Text>
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
  newProcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8
  },
  newProcBtnText: {
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
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  planDate: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  totalCostText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284c7'
  },
  itemsList: {
    marginVertical: 12
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  itemToothPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  itemToothText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155'
  },
  itemProcName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemCost: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '700',
    marginTop: 1
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800'
  },
  planFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  billBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  billBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
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
  label: {
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
