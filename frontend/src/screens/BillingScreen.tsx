import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { Invoice } from '../types';

interface BillingScreenProps {
  onNavigate: (tab: string) => void;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({ onNavigate }) => {
  const { invoices, recordPayment } = useDentalStore();
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'UPI QR' | 'Cash' | 'Card'>('UPI QR');

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    if (filter === 'paid') return inv.status === 'Paid';
    if (filter === 'unpaid') return inv.status !== 'Paid';
    return true;
  });

  const totalRevenue = invoices.reduce((sum, i) => sum + i.paid, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balance, 0);

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balance.toString());
    setPayModalVisible(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedInvoice) return;
    const amount = parseInt(payAmount, 10) || selectedInvoice.balance;
    recordPayment(selectedInvoice.id, amount);
    setPayModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Revenue Snapshot Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
          <Text style={styles.kpiLabel}>TOTAL COLLECTED</Text>
          <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString()}</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: '#dc2626' }]}>
          <Text style={styles.kpiLabel}>OUTSTANDING BALANCE</Text>
          <Text style={styles.kpiValue}>₹{totalOutstanding.toLocaleString()}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {(['all', 'unpaid', 'paid'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, filter === t && styles.tabBtnActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.tabBtnText, filter === t && styles.tabBtnTextActive]}>
              {t === 'all' ? 'ALL INVOICES' : t === 'unpaid' ? 'PENDING BALANCE' : 'FULLY PAID'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invoices List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredInvoices.map(inv => (
          <View key={inv.id} style={styles.invoiceCard}>
            <View style={styles.invHeader}>
              <View>
                <Text style={styles.invId}>{inv.id}</Text>
                <Text style={styles.invPatient}>{inv.patientName}</Text>
              </View>
              <View style={[styles.badge, inv.status === 'Paid' ? styles.badgePaid : styles.badgePartial]}>
                <Text style={[styles.badgeText, inv.status === 'Paid' ? styles.badgeTextPaid : styles.badgeTextPartial]}>
                  {inv.status.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Line items */}
            <View style={styles.itemsBox}>
              {inv.items.map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemDesc}>{it.description}</Text>
                  <Text style={styles.itemAmt}>₹{it.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>

            {/* Totals Breakdown */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryVal}>₹{inv.total.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount Paid ({inv.paymentMode}):</Text>
                <Text style={[styles.summaryVal, { color: '#16a34a' }]}>₹{inv.paid.toLocaleString()}</Text>
              </View>
              {inv.balance > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Balance Due:</Text>
                  <Text style={[styles.summaryVal, { color: '#dc2626' }]}>₹{inv.balance.toLocaleString()}</Text>
                </View>
              )}
            </View>

            {/* Action buttons */}
            {inv.balance > 0 && (
              <TouchableOpacity style={styles.collectBtn} onPress={() => handleOpenPay(inv)}>
                <Ionicons name="card-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.collectBtnText}>Collect Payment (₹{inv.balance})</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Collect Payment Modal */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Collect Patient Payment</Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <View style={styles.invInfoCard}>
                <Text style={styles.invInfoName}>{selectedInvoice.patientName}</Text>
                <Text style={styles.invInfoSub}>Invoice: {selectedInvoice.id} • Balance: ₹{selectedInvoice.balance}</Text>
              </View>
            )}

            <Text style={styles.label}>Select Payment Method</Text>
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {(['UPI QR', 'Cash', 'Card'] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeBtn, payMode === mode && styles.modeBtnActive]}
                  onPress={() => setPayMode(mode)}
                >
                  <Text style={[styles.modeBtnText, payMode === mode && styles.modeBtnTextActive]}>{mode}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {payMode === 'UPI QR' && (
              <View style={styles.qrSimulatorBox}>
                <Ionicons name="qr-code-outline" size={90} color="#0284c7" />
                <Text style={styles.qrLabel}>Scan with GPay / PhonePe / Paytm</Text>
                <Text style={styles.upiIdText}>UPI ID: tkrdental@okaxis</Text>
              </View>
            )}

            <Text style={styles.label}>Amount to Collect (₹)</Text>
            <TextInput
              style={styles.input}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.confirmPayBtn} onPress={handleConfirmPayment}>
              <Text style={styles.confirmPayBtnText}>Confirm Receipt & Close Balance</Text>
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
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b'
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 4
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 8
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 6
  },
  tabBtnActive: {
    backgroundColor: '#0284c7'
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  tabBtnTextActive: {
    color: '#ffffff'
  },
  listContent: {
    padding: 14,
    paddingBottom: 40
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
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
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 10
  },
  invId: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7'
  },
  invPatient: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  badgePaid: {
    backgroundColor: '#dcfce7'
  },
  badgePartial: {
    backgroundColor: '#fef3c7'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  badgeTextPaid: {
    color: '#16a34a'
  },
  badgeTextPartial: {
    color: '#d97706'
  },
  itemsBox: {
    paddingVertical: 8
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  itemDesc: {
    fontSize: 12,
    color: '#334155'
  },
  itemAmt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    marginTop: 6
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b'
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a'
  },
  collectBtn: {
    flexDirection: 'row',
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10
  },
  collectBtnText: {
    color: '#ffffff',
    fontSize: 12,
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
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  invInfoCard: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  invInfoName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369a1'
  },
  invInfoSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    marginRight: 6
  },
  modeBtnActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  modeBtnText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600'
  },
  modeBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  qrSimulatorBox: {
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginVertical: 10
  },
  qrLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6
  },
  upiIdText: {
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 2
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16
  },
  confirmPayBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  confirmPayBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
