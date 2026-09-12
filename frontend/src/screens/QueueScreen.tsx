import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { QueueItem, QueueStatus } from '../types';

interface QueueScreenProps {
  onNavigate: (tab: string) => void;
}

export const QueueScreen: React.FC<QueueScreenProps> = ({ onNavigate }) => {
  const { queue, patients, addQueueToken, updateQueueStatus, callQueuePatient, setSelectedPatientId } = useDentalStore();
  const [filter, setFilter] = useState<'all' | 'waiting' | 'called' | 'completed'>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatId, setSelectedPatId] = useState(patients[0]?.id || '');
  const [priority, setPriority] = useState<QueueItem['priority']>('Normal');

  const filteredQueue = queue.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'waiting') return q.status === 'waiting';
    if (filter === 'called') return q.status === 'called' || q.status === 'in-consultation';
    if (filter === 'completed') return q.status === 'completed';
    return true;
  });

  const handleIssueToken = () => {
    if (!selectedPatId) return;
    addQueueToken(selectedPatId, priority);
    setModalVisible(false);
  };

  const getStatusBadge = (status: QueueStatus) => {
    switch (status) {
      case 'waiting':
        return { label: 'WAITING', bg: '#fef3c7', text: '#d97706' };
      case 'called':
        return { label: 'CALLED (NOW)', bg: '#fee2e2', text: '#dc2626' };
      case 'in-consultation':
        return { label: 'IN CHAIR', bg: '#e0f2fe', text: '#0284c7' };
      case 'completed':
        return { label: 'CHECKED OUT', bg: '#dcfce7', text: '#16a34a' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topBar}>
        <View style={styles.filterTabs}>
          {(['all', 'waiting', 'called', 'completed'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, filter === tab && styles.filterTabActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.issueBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="ticket-outline" size={16} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.issueBtnText}>Walk-in Token</Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredQueue.map(item => {
          const badge = getStatusBadge(item.status);

          return (
            <View key={item.id} style={styles.queueCard}>
              <View style={styles.cardTop}>
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenText}>{item.token}</Text>
                  {item.priority !== 'Normal' && (
                    <View style={styles.priorityPill}>
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={styles.patientName}>{item.patientName}</Text>
                  <Text style={styles.patientSub}>Arrived: {item.arrivalTime} • {item.room}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardBottom}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
                  onPress={() => callQueuePatient(item)}
                >
                  <Ionicons name="volume-high" size={15} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.actionBtnText}>Voice Call</Text>
                </TouchableOpacity>

                {item.status !== 'in-consultation' && item.status !== 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                    onPress={() => {
                      updateQueueStatus(item.id, 'in-consultation');
                      setSelectedPatientId(item.patientId);
                      onNavigate('odontogram');
                    }}
                  >
                    <Ionicons name="fitness-outline" size={15} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Seat in Chair</Text>
                  </TouchableOpacity>
                )}

                {item.status !== 'completed' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                    onPress={() => updateQueueStatus(item.id, 'completed')}
                  >
                    <Ionicons name="checkmark-done" size={15} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>Checkout</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Issue Token Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Walk-in Queue Token</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Select Arriving Patient *</Text>
            <View style={styles.patientList}>
              {patients.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.patientItem, selectedPatId === p.id && styles.patientItemActive]}
                  onPress={() => setSelectedPatId(p.id)}
                >
                  <Text style={[styles.patientItemText, selectedPatId === p.id && styles.patientItemTextActive]}>
                    {p.name} ({p.id})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Triage Priority</Text>
            <View style={{ flexDirection: 'row', marginBottom: 20 }}>
              {(['Normal', 'Urgent', 'Senior'] as const).map(pr => (
                <TouchableOpacity
                  key={pr}
                  style={[styles.priorityBtn, priority === pr && styles.priorityBtnActive]}
                  onPress={() => setPriority(pr)}
                >
                  <Text style={[styles.priorityBtnText, priority === pr && styles.priorityBtnTextActive]}>{pr}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={handleIssueToken}>
              <Text style={styles.generateBtnText}>Generate Token & Print</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 3
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6
  },
  filterTabActive: {
    backgroundColor: '#ffffff'
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  filterTabTextActive: {
    color: '#0284c7'
  },
  issueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  issueBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  queueCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tokenBox: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  tokenText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '900'
  },
  priorityPill: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800'
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  patientSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8
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
    marginBottom: 8,
    marginTop: 6
  },
  patientList: {
    marginBottom: 14
  },
  patientItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6
  },
  patientItemActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  patientItemText: {
    fontSize: 13,
    color: '#334155'
  },
  patientItemTextActive: {
    color: '#0284c7',
    fontWeight: '700'
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginRight: 6
  },
  priorityBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  priorityBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  priorityBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  generateBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
