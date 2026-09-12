import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { Appointment, AppointmentStatus } from '../types';

interface AppointmentsScreenProps {
  onNavigate: (tab: string) => void;
}

const APPOINTMENT_TYPES = [
  'Routine Scaling & Cleaning',
  'Root Canal Treatment (RCT)',
  'Crown / Bridge Preparation',
  'Composite Filling / Caries',
  'Clear Aligners Consultation',
  'Tooth Extraction / Oral Surgery',
  'Dental Implant Consultation'
];

export const AppointmentsScreen: React.FC<AppointmentsScreenProps> = ({ onNavigate }) => {
  const { appointments, patients, addAppointment, updateAppointmentStatus, addQueueToken, setSelectedPatientId } = useDentalStore();
  const [filterDate, setFilterDate] = useState('2026-09-09');
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [selectedPatId, setSelectedPatId] = useState(patients[0]?.id || '');
  const [aptTime, setAptTime] = useState('11:00 AM');
  const [aptType, setAptType] = useState(APPOINTMENT_TYPES[0]);
  const [aptChair, setAptChair] = useState('Chair 1');
  const [aptNotes, setAptNotes] = useState('');

  const filteredAppointments = appointments.filter(a => a.date === filterDate || !filterDate);

  const handleBook = () => {
    const pat = patients.find(p => p.id === selectedPatId);
    if (!pat) return;

    addAppointment({
      patientId: pat.id,
      patientName: pat.name,
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      date: filterDate,
      time: aptTime,
      type: aptType,
      status: 'Scheduled',
      chair: aptChair,
      notes: aptNotes.trim() || 'Booked via mobile app.'
    });

    setModalVisible(false);
    setAptNotes('');
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'Checked In': return '#16a34a';
      case 'In Progress': return '#0284c7';
      case 'Completed': return '#64748b';
      case 'Cancelled': return '#dc2626';
      default: return '#d97706';
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Filter & Book Button */}
      <View style={styles.topControl}>
        <View style={styles.dateSelector}>
          <Ionicons name="calendar-outline" size={18} color="#0284c7" style={{ marginRight: 6 }} />
          <Text style={styles.dateText}>Today: Wednesday, 09 Sep 2026</Text>
        </View>

        <TouchableOpacity style={styles.bookBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={18} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.bookBtnText}>Book</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredAppointments.map(apt => {
          const statusColor = getStatusColor(apt.status);

          return (
            <View key={apt.id} style={styles.aptCard}>
              <View style={styles.timeSection}>
                <Text style={styles.timeText}>{apt.time}</Text>
                <View style={styles.chairPill}>
                  <Text style={styles.chairText}>{apt.chair}</Text>
                </View>
              </View>

              <View style={styles.infoSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{apt.status}</Text>
                  </View>
                </View>

                <Text style={styles.procedureText}>{apt.type}</Text>
                <Text style={styles.doctorText}>Doctor: {apt.doctorName}</Text>
                {apt.notes ? <Text style={styles.notesText}>{apt.notes}</Text> : null}

                {/* Status action buttons */}
                <View style={styles.actionsRow}>
                  {apt.status === 'Scheduled' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}
                      onPress={() => {
                        updateAppointmentStatus(apt.id, 'Checked In');
                        addQueueToken(apt.patientId);
                      }}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Check In & Queue</Text>
                    </TouchableOpacity>
                  )}

                  {apt.status === 'Checked In' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#0284c7' }]}
                      onPress={() => {
                        updateAppointmentStatus(apt.id, 'In Progress');
                        setSelectedPatientId(apt.patientId);
                        onNavigate('odontogram');
                      }}
                    >
                      <Ionicons name="fitness-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Start Treatment</Text>
                    </TouchableOpacity>
                  )}

                  {apt.status === 'In Progress' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#64748b' }]}
                      onPress={() => updateAppointmentStatus(apt.id, 'Completed')}
                    >
                      <Ionicons name="checkmark-done" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                      <Text style={styles.actionBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Book Appointment Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book New Appointment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Text style={styles.inputLabel}>Select Patient *</Text>
              <View style={styles.patientPicker}>
                {patients.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.patientPickerItem, selectedPatId === p.id && styles.patientPickerItemActive]}
                    onPress={() => setSelectedPatId(p.id)}
                  >
                    <Text style={[styles.patientPickerText, selectedPatId === p.id && styles.patientPickerTextActive]}>
                      {p.name} ({p.id})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Time Slot *</Text>
              <View style={styles.slotsRow}>
                {['10:00 AM', '11:00 AM', '11:45 AM', '02:00 PM', '04:00 PM', '06:00 PM'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.slotChip, aptTime === s && styles.slotChipActive]}
                    onPress={() => setAptTime(s)}
                  >
                    <Text style={[styles.slotChipText, aptTime === s && styles.slotChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Procedure Type *</Text>
              <View style={styles.typeBox}>
                {APPOINTMENT_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeItem, aptType === t && styles.typeItemActive]}
                    onPress={() => setAptType(t)}
                  >
                    <Text style={[styles.typeText, aptType === t && styles.typeTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Chair / Operatory</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['Chair 1', 'Chair 2', 'Implant Suite'].map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chairBtn, aptChair === c && styles.chairBtnActive]}
                    onPress={() => setAptChair(c)}
                  >
                    <Text style={[styles.chairBtnText, aptChair === c && styles.chairBtnTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Clinical Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="Chief complaint or symptoms..."
                value={aptNotes}
                onChangeText={setAptNotes}
              />
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleBook}>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
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
  topControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8
  },
  bookBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  listContent: {
    padding: 16,
    paddingBottom: 40
  },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  timeSection: {
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
    justifyContent: 'center'
  },
  timeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0284c7'
  },
  chairPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6
  },
  chairText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  infoSection: {
    flex: 1,
    paddingLeft: 12
  },
  patientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  procedureText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2
  },
  doctorText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  notesText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    fontStyle: 'italic'
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: 10
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6
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
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10
  },
  patientPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  patientPickerItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginRight: 6,
    marginBottom: 6
  },
  patientPickerItemActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  patientPickerText: {
    fontSize: 12,
    color: '#475569'
  },
  patientPickerTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  slotChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
    marginBottom: 6
  },
  slotChipActive: {
    backgroundColor: '#0284c7'
  },
  slotChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  slotChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  typeBox: {
    marginBottom: 8
  },
  typeItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 4
  },
  typeItemActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  typeText: {
    fontSize: 12,
    color: '#334155'
  },
  typeTextActive: {
    color: '#0284c7',
    fontWeight: '700'
  },
  chairBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginRight: 6
  },
  chairBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  chairBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600'
  },
  chairBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700'
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
  confirmBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
