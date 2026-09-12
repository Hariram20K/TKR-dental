import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';

interface PharmacyScreenProps {
  onNavigate: (tab: string) => void;
}

export const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ onNavigate }) => {
  const { inventory, dispenseStock } = useDentalStore();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dispenseModalVisible, setDispenseModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [dispenseQty, setDispenseQty] = useState('1');

  const categories = ['All', 'Pharmacy', 'Restorative', 'Prosthodontics', 'Anesthesia'];

  const filteredInventory = inventory.filter(item => 
    categoryFilter === 'All' ? true : item.category === categoryFilter
  );

  const selectedItem = inventory.find(i => i.id === selectedItemId);

  const handleOpenDispense = (id: string) => {
    setSelectedItemId(id);
    setDispenseQty('1');
    setDispenseModalVisible(true);
  };

  const handleConfirmDispense = () => {
    if (!selectedItemId) return;
    const qty = parseInt(dispenseQty, 10) || 1;
    dispenseStock(selectedItemId, qty);
    setDispenseModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.topControl}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, categoryFilter === cat && styles.catChipActive]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.catChipText, categoryFilter === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stock Cards */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredInventory.map(item => {
          const isLowStock = item.stock <= item.minStock;

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category} • Batch: {item.batch}</Text>
                </View>
                <View style={styles.stockCountBox}>
                  <Text style={[styles.stockCount, isLowStock && styles.stockCountLow]}>
                    {item.stock}
                  </Text>
                  <Text style={styles.stockUnit}>{item.unit}</Text>
                </View>
              </View>

              {/* Status and expiry alerts */}
              <View style={styles.tagsRow}>
                {isLowStock && (
                  <View style={styles.alertPill}>
                    <Ionicons name="warning" size={12} color="#dc2626" />
                    <Text style={styles.alertPillText}>Low Stock (&lt; {item.minStock})</Text>
                  </View>
                )}
                <View style={styles.expiryPill}>
                  <Ionicons name="calendar-outline" size={12} color="#64748b" />
                  <Text style={styles.expiryPillText}>Exp: {item.expiry}</Text>
                </View>
                <Text style={styles.priceTag}>₹{item.unitPrice} / {item.unit.slice(0, 3)}</Text>
              </View>

              {/* Dispense action */}
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.dispenseBtn} onPress={() => handleOpenDispense(item.id)}>
                  <Ionicons name="medical" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.dispenseBtnText}>Dispense to Chair / Patient</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Dispense Modal */}
      <Modal visible={dispenseModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispense Medication / Stock</Text>
              <TouchableOpacity onPress={() => setDispenseModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedItem && (
              <View style={styles.itemInfo}>
                <Text style={styles.infoName}>{selectedItem.name}</Text>
                <Text style={styles.infoStock}>Current Available Stock: {selectedItem.stock} {selectedItem.unit}</Text>
              </View>
            )}

            <Text style={styles.label}>Quantity to Dispense</Text>
            <TextInput
              style={styles.input}
              value={dispenseQty}
              onChangeText={setDispenseQty}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.confirmDispenseBtn} onPress={handleConfirmDispense}>
              <Text style={styles.confirmDispenseBtnText}>Confirm Dispense & Deduct Stock</Text>
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
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 6
  },
  catChipActive: {
    backgroundColor: '#0284c7'
  },
  catChipText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  listContent: {
    padding: 14,
    paddingBottom: 40
  },
  itemCard: {
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
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  itemCategory: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  stockCountBox: {
    alignItems: 'flex-end',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  stockCount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0284c7'
  },
  stockCountLow: {
    color: '#dc2626'
  },
  stockUnit: {
    fontSize: 10,
    color: '#64748b'
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8
  },
  alertPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#dc2626',
    marginLeft: 3
  },
  expiryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8
  },
  expiryPillText: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 3
  },
  priceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 'auto'
  },
  itemActions: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'flex-end'
  },
  dispenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  dispenseBtnText: {
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
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  itemInfo: {
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  infoName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0369a1'
  },
  infoStock: {
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
  confirmDispenseBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  confirmDispenseBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  }
});
