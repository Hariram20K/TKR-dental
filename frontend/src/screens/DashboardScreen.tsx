import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';

interface DashboardScreenProps {
  onNavigate: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { patients, appointments, queue, callQueuePatient, setSelectedPatientId } = useDentalStore();

  const waitingCount = queue.filter(q => q.status === 'waiting').length;
  const todayApts = appointments.filter(a => a.date === '2026-09-09' || a.status !== 'Completed');
  const activeQueueItem = queue.find(q => q.status === 'called' || q.status === 'waiting');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTopRow}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CLINIC LIVE</Text>
          </View>
          <View style={styles.chairsBadge}>
            <Ionicons name="medical" size={10} color="#38bdf8" style={{ marginRight: 4 }} />
            <Text style={styles.chairsBadgeText}>6 Chairs Active</Text>
          </View>
        </View>
        <Text style={styles.bannerGreeting}>Good Morning, Dr. Rajalakshmi 👩‍⚕️</Text>
        <Text style={styles.bannerSubtitle}>Main Consultation Operatory • Tirupathur Branch</Text>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#0284c7' }]}>
          <View style={styles.statIconBox}>
            <Ionicons name="people" size={20} color="#0284c7" />
          </View>
          <Text style={styles.statNumber}>{patients.length}</Text>
          <Text style={styles.statLabel}>Registered Patients</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#f59e0b' }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="time" size={20} color="#d97706" />
          </View>
          <Text style={styles.statNumber}>{waitingCount}</Text>
          <Text style={styles.statLabel}>In Waiting Queue</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#10b981' }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#d1fae5' }]}>
            <Ionicons name="calendar" size={20} color="#059669" />
          </View>
          <Text style={styles.statNumber}>{todayApts.length}</Text>
          <Text style={styles.statLabel}>Today's Appointments</Text>
        </View>

        <View style={[styles.statCard, { borderLeftColor: '#8b5cf6' }]}>
          <View style={[styles.statIconBox, { backgroundColor: '#ede9fe' }]}>
            <Ionicons name="card" size={20} color="#7c3aed" />
          </View>
          <Text style={styles.statNumber}>₹17.3k</Text>
          <Text style={styles.statLabel}>Today's Collections</Text>
        </View>
      </View>

      {/* Live Reception Caller Box */}
      {activeQueueItem && (
        <View style={styles.queueCallerCard}>
          <View style={styles.callerHeader}>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>{activeQueueItem.token}</Text>
            </View>
            <Text style={styles.callerRoom}>{activeQueueItem.room}</Text>
          </View>
          <Text style={styles.callerPatientName}>{activeQueueItem.patientName}</Text>
          <Text style={styles.callerStatus}>Status: {activeQueueItem.status.toUpperCase()}</Text>

          <TouchableOpacity
            style={styles.callVoiceBtn}
            onPress={() => callQueuePatient(activeQueueItem)}
            activeOpacity={0.8}
          >
            <Ionicons name="volume-high" size={18} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.callVoiceBtnText}>Announce / Call Patient (Voice)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Action Hub */}
      <Text style={styles.sectionHeader}>QUICK CLINICAL SHORTCUTS</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('odontogram')}>
          <View style={[styles.quickIconBox, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="fitness" size={22} color="#0284c7" />
          </View>
          <Text style={styles.quickActionTitle}>Odontogram</Text>
          <Text style={styles.quickActionSub}>32-Tooth Chart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('queue')}>
          <View style={[styles.quickIconBox, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="megaphone" size={22} color="#d97706" />
          </View>
          <Text style={styles.quickActionTitle}>Queue Board</Text>
          <Text style={styles.quickActionSub}>Live Tokens</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('treatment')}>
          <View style={[styles.quickIconBox, { backgroundColor: '#ede9fe' }]}>
            <Ionicons name="construct" size={22} color="#7c3aed" />
          </View>
          <Text style={styles.quickActionTitle}>Treatments</Text>
          <Text style={styles.quickActionSub}>Clinical Plans</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => onNavigate('prescriptions')}>
          <View style={[styles.quickIconBox, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="medical" size={22} color="#16a34a" />
          </View>
          <Text style={styles.quickActionTitle}>Prescriptions</Text>
          <Text style={styles.quickActionSub}>Digital Rx</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Schedule List */}
      <View style={styles.scheduleHeaderRow}>
        <Text style={styles.sectionHeader}>TODAY'S CONSULTATIONS</Text>
        <TouchableOpacity onPress={() => onNavigate('appointments')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {todayApts.map(apt => (
        <TouchableOpacity
          key={apt.id}
          style={styles.aptCard}
          onPress={() => {
            setSelectedPatientId(apt.patientId);
            onNavigate('odontogram');
          }}
        >
          <View style={styles.aptTimeBox}>
            <Text style={styles.aptTimeText}>{apt.time}</Text>
            <Text style={styles.aptChairText}>{apt.chair}</Text>
          </View>
          <View style={styles.aptDetails}>
            <Text style={styles.aptPatient}>{apt.patientName}</Text>
            <Text style={styles.aptType}>{apt.type}</Text>
            <Text style={styles.aptNotes} numberOfLines={1}>{apt.notes}</Text>
          </View>
          <View style={[styles.statusBadge, apt.status === 'Checked In' && styles.statusCheckedIn]}>
            <Text style={[styles.statusText, apt.status === 'Checked In' && styles.statusTextCheckedIn]}>
              {apt.status}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
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
  banner: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden'
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  bannerGreeting: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800'
  },
  bannerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 4
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
    marginRight: 6
  },
  liveText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  chairsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  chairsBadgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '600'
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  statCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a'
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2
  },
  queueCallerCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    marginBottom: 20
  },
  callerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenPill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  tokenPillText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12
  },
  callerRoom: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1'
  },
  callerPatientName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8
  },
  callerStatus: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600'
  },
  callVoiceBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  callVoiceBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  quickAction: {
    backgroundColor: '#ffffff',
    width: '23%',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  quickActionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b'
  },
  quickActionSub: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 1
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284c7'
  },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  aptTimeBox: {
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9'
  },
  aptTimeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7'
  },
  aptChairText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  aptDetails: {
    flex: 1,
    paddingHorizontal: 12
  },
  aptPatient: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  aptType: {
    fontSize: 12,
    color: '#475569',
    marginTop: 1
  },
  aptNotes: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  statusBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusCheckedIn: {
    backgroundColor: '#dcfce7'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  statusTextCheckedIn: {
    color: '#16a34a'
  }
});
