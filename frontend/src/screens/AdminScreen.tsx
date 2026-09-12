import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';

interface AdminScreenProps {
  onNavigate?: (tab: string) => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = () => {
  const { labOrders, resetAllData, patients, appointments, invoices } = useDentalStore();

  const handleReset = () => {
    Alert.alert(
      'Reset Demo Records',
      'Are you sure you want to restore default demo records? Any modifications will be reset.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetAllData }
      ]
    );
  };

  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Clinic System Profile */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>TKR Dental Care - Clinic Administration</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>BRANCH #1 ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.infoText}>Address: FHW8+CWM, Tirupathur, Tamil Nadu 635601</Text>
        <Text style={styles.infoText}>Chief Dental Surgeon: Dr. E. Rajalakshmi, BDS, MDS</Text>
        <Text style={styles.infoText}>Operatory Capacity: 6 Clinical Dental Chairs Active</Text>
      </View>

      {/* High Level Clinic Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{patients.length}</Text>
          <Text style={styles.metricLabel}>Total Patients</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>{appointments.length}</Text>
          <Text style={styles.metricLabel}>Total Bookings</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricVal}>₹{totalBilled.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Gross Billed</Text>
        </View>
      </View>

      {/* External Dental Laboratory Orders */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dental Laboratory Orders ({labOrders.length})</Text>
          <Ionicons name="flask-outline" size={18} color="#0284c7" />
        </View>

        {labOrders.map(order => (
          <View key={order.id} style={styles.labRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labItemName}>{order.item} ({order.toothNumber})</Text>
              <Text style={styles.labSub}>{order.labName} • Shade: {order.shade}</Text>
              <Text style={styles.labDates}>Sent: {order.sentDate} | Expected: {order.expectedDate}</Text>
            </View>
            <View style={[styles.labStatusBadge, order.status === 'Fitted' ? styles.labStatusFitted : styles.labStatusSent]}>
              <Text style={[styles.labStatusText, order.status === 'Fitted' ? styles.labStatusTextFitted : styles.labStatusTextSent]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Audit Log & Backup */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Persistence & Maintenance</Text>
        <Text style={styles.bodyText}>
          All clinic state is persistently stored locally with `@react-native-async-storage/async-storage`.
        </Text>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.resetBtnText}>Restore Default Seed Records</Text>
        </TouchableOpacity>
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
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a'
  },
  infoText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricCard: {
    backgroundColor: '#ffffff',
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284c7'
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center'
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  labItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  labSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  labDates: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2
  },
  labStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  labStatusSent: {
    backgroundColor: '#eff6ff'
  },
  labStatusFitted: {
    backgroundColor: '#dcfce7'
  },
  labStatusText: {
    fontSize: 10,
    fontWeight: '800'
  },
  labStatusTextSent: {
    color: '#0284c7'
  },
  labStatusTextFitted: {
    color: '#16a34a'
  },
  bodyText: {
    fontSize: 12,
    color: '#64748b',
    marginVertical: 10
  },
  resetBtn: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  resetBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
});
