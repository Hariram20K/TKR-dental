import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { 
  Patient, Doctor, Appointment, QueueItem, ToothCondition, 
  TreatmentPlan, Prescription, InventoryItem, Invoice, LabOrder, UserRole,
  ToothConditionType, ToothSurface
} from '../types';
import {
  INITIAL_DOCTORS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_QUEUE,
  INITIAL_TEETH_MAP,
  INITIAL_TREATMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_LAB_ORDERS
} from '../data/seedData';

const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const STORAGE_KEY = '@tkr_dental_store_v57';

interface DentalStoreContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  queue: QueueItem[];
  teethMap: Record<string, Record<number, ToothCondition>>;
  treatmentPlans: TreatmentPlan[];
  prescriptions: Prescription[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  labOrders: LabOrder[];
  isServerConnected: boolean;
  // Actions
  addPatient: (patient: Omit<Patient, 'id' | 'totalVisits' | 'balanceDue' | 'registrationDate'>) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addQueueToken: (patientId: string, priority?: QueueItem['priority']) => void;
  updateQueueStatus: (id: string, status: QueueItem['status']) => void;
  callQueuePatient: (item: QueueItem) => void;
  setToothCondition: (patientId: string, toothNum: number, condition: ToothConditionType, surfaces: ToothSurface[]) => void;
  addTreatmentPlan: (plan: Omit<TreatmentPlan, 'id' | 'createdAt'>) => void;
  updateTreatmentItemStatus: (planId: string, itemId: string, status: 'Planned' | 'In Progress' | 'Completed') => void;
  addPrescription: (rx: Omit<Prescription, 'id' | 'date'>) => void;
  dispenseStock: (itemId: string, quantity: number) => void;
  addInvoice: (inv: Omit<Invoice, 'id' | 'date'>) => void;
  recordPayment: (invoiceId: string, amount: number) => void;
  resetAllData: () => Promise<void>;
  refreshFromServer: () => Promise<void>;
}

const DentalStoreContext = createContext<DentalStoreContextType | null>(null);

export const DentalStoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('patient');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('TKR-P-1001');
  const [isServerConnected, setIsServerConnected] = useState<boolean>(false);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [teethMap, setTeethMap] = useState<Record<string, Record<number, ToothCondition>>>(INITIAL_TEETH_MAP);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>(INITIAL_TREATMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);

  // Function to pull from backend server
  const refreshFromServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/sync`, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.patients) setPatients(d.patients);
          if (d.appointments) setAppointments(d.appointments);
          if (d.queue) setQueue(d.queue);
          if (d.teethMap) setTeethMap(d.teethMap);
          if (d.treatmentPlans) setTreatmentPlans(d.treatmentPlans);
          if (d.prescriptions) setPrescriptions(d.prescriptions);
          if (d.inventory) setInventory(d.inventory);
          if (d.invoices) setInvoices(d.invoices);
          if (d.labOrders) setLabOrders(d.labOrders);
          setIsServerConnected(true);
          return;
        }
      }
      setIsServerConnected(false);
    } catch (e) {
      // Backend not reached, keep local state
      setIsServerConnected(false);
    }
  };

  // Load on startup: try backend first, fallback to AsyncStorage
  useEffect(() => {
    const initData = async () => {
      // 1. Try local storage cache
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.patients) setPatients(parsed.patients);
          if (parsed.appointments) setAppointments(parsed.appointments);
          if (parsed.queue) setQueue(parsed.queue);
          if (parsed.teethMap) setTeethMap(parsed.teethMap);
          if (parsed.treatmentPlans) setTreatmentPlans(parsed.treatmentPlans);
          if (parsed.prescriptions) setPrescriptions(parsed.prescriptions);
          if (parsed.inventory) setInventory(parsed.inventory);
          if (parsed.invoices) setInvoices(parsed.invoices);
          if (parsed.labOrders) setLabOrders(parsed.labOrders);
          if (parsed.selectedPatientId) setSelectedPatientId(parsed.selectedPatientId);
        }
      } catch (err) {
        console.warn('Could not load local storage', err);
      }

      // 2. Fetch fresh snapshot from central server
      await refreshFromServer();
    };

    initData();

    // 3. Setup periodic sync polling (every 3 seconds for 2-way real-time responsiveness)
    const interval = setInterval(() => {
      refreshFromServer();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Persist locally as fallback cache
  useEffect(() => {
    const saveState = async () => {
      try {
        const stateToSave = {
          patients,
          appointments,
          queue,
          teethMap,
          treatmentPlans,
          prescriptions,
          inventory,
          invoices,
          labOrders,
          role,
          selectedPatientId
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.warn('Could not persist dental state', err);
      }
    };
    saveState();
  }, [patients, appointments, queue, teethMap, treatmentPlans, prescriptions, inventory, invoices, labOrders, role, selectedPatientId]);

  const addPatient = async (newP: Omit<Patient, 'id' | 'totalVisits' | 'balanceDue' | 'registrationDate'>) => {
    const nextId = `TKR-P-${1000 + patients.length + 1}`;
    const today = new Date().toISOString().split('T')[0];
    const created: Patient = {
      ...newP,
      id: nextId,
      totalVisits: 1,
      balanceDue: 0,
      registrationDate: today
    };
    setPatients(prev => [created, ...prev]);
    setSelectedPatientId(created.id);

    try {
      await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
    } catch (e) {
      console.log('Local save only, server offline', e);
    }
  };

  const addAppointment = async (apt: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...apt,
      id: `APT-${100 + appointments.length + 1}`
    };
    setAppointments(prev => [newApt, ...prev]);

    try {
      await fetch(`${API_BASE}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apt)
      });
    } catch (e) {
      console.log('Local save only, server offline', e);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    try {
      await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.log('Local update only', e);
    }
  };

  const addQueueToken = async (patientId: string, priority: QueueItem['priority'] = 'Normal') => {
    const pat = patients.find(p => p.id === patientId);
    if (!pat) return;
    const tokenNum = 100 + queue.length + 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item: QueueItem = {
      id: `Q-${queue.length + 1}`,
      token: `TKR-Q-${tokenNum}`,
      patientId: pat.id,
      patientName: pat.name,
      doctorId: pat.assignedDoctorId || 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      arrivalTime: timeStr,
      status: 'waiting',
      room: 'Consultation Operatory 1',
      priority
    };
    setQueue(prev => [...prev, item]);

    try {
      await fetch(`${API_BASE}/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, priority })
      });
    } catch (e) {
      console.log('Local queue save only', e);
    }
  };

  const updateQueueStatus = async (id: string, status: QueueItem['status']) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    try {
      await fetch(`${API_BASE}/queue/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.log('Local queue update only', e);
    }
  };

  const callQueuePatient = (item: QueueItem) => {
    updateQueueStatus(item.id, 'called');
    try {
      const speechText = `Calling token ${item.token}. ${item.patientName}, please proceed to ${item.room}`;
      Speech.speak(speechText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.95
      });
    } catch (e) {
      console.log('Voice announcement triggered:', item.token);
    }
  };

  const setToothCondition = async (patientId: string, toothNum: number, condition: ToothConditionType, surfaces: ToothSurface[]) => {
    setTeethMap(prev => {
      const patientTeeth = { ...(prev[patientId] || {}) };
      patientTeeth[toothNum] = {
        number: toothNum,
        condition,
        surfaces
      };
      return { ...prev, [patientId]: patientTeeth };
    });

    try {
      await fetch(`${API_BASE}/teeth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, toothNum, condition, surfaces })
      });
    } catch (e) {
      console.log('Local teeth update only', e);
    }
  };

  const addTreatmentPlan = (plan: Omit<TreatmentPlan, 'id' | 'createdAt'>) => {
    const newPlan: TreatmentPlan = {
      ...plan,
      id: `TP-${100 + treatmentPlans.length + 1}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTreatmentPlans(prev => [newPlan, ...prev]);
  };

  const updateTreatmentItemStatus = (planId: string, itemId: string, status: 'Planned' | 'In Progress' | 'Completed') => {
    setTreatmentPlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        items: p.items.map(item => item.id === itemId ? { ...item, status } : item)
      };
    }));
  };

  const addPrescription = (rx: Omit<Prescription, 'id' | 'date'>) => {
    const newRx: Prescription = {
      ...rx,
      id: `RX-${100 + prescriptions.length + 1}`,
      date: new Date().toISOString().split('T')[0]
    };
    setPrescriptions(prev => [newRx, ...prev]);
  };

  const dispenseStock = (itemId: string, quantity: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, stock: Math.max(0, item.stock - quantity) };
    }));
  };

  const addInvoice = (inv: Omit<Invoice, 'id' | 'date'>) => {
    const newInv: Invoice = {
      ...inv,
      id: `INV-${9000 + invoices.length + 1}`,
      date: new Date().toISOString().split('T')[0]
    };
    setInvoices(prev => [newInv, ...prev]);
  };

  const recordPayment = async (invoiceId: string, amount: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paid + amount;
      const newBalance = Math.max(0, inv.total - newPaid);
      return {
        ...inv,
        paid: newPaid,
        balance: newBalance,
        status: newBalance === 0 ? 'Paid' : 'Partial'
      };
    }));

    try {
      await fetch(`${API_BASE}/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, paymentMode: 'UPI QR' })
      });
    } catch (e) {
      console.log('Local payment record only', e);
    }
  };

  const resetAllData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await fetch(`${API_BASE}/reset`, { method: 'POST' });
    } catch (e) {
      console.log('Error clearing storage:', e);
    }
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setQueue(INITIAL_QUEUE);
    setTeethMap(INITIAL_TEETH_MAP);
    setTreatmentPlans(INITIAL_TREATMENTS);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setInventory(INITIAL_INVENTORY);
    setInvoices(INITIAL_INVOICES);
    setLabOrders(INITIAL_LAB_ORDERS);
    setRole('patient');
    setSelectedPatientId('TKR-P-1001');
  };

  return (
    <DentalStoreContext.Provider value={{
      role,
      setRole,
      selectedPatientId,
      setSelectedPatientId,
      patients,
      doctors,
      appointments,
      queue,
      teethMap,
      treatmentPlans,
      prescriptions,
      inventory,
      invoices,
      labOrders,
      isServerConnected,
      addPatient,
      addAppointment,
      updateAppointmentStatus,
      addQueueToken,
      updateQueueStatus,
      callQueuePatient,
      setToothCondition,
      addTreatmentPlan,
      updateTreatmentItemStatus,
      addPrescription,
      dispenseStock,
      addInvoice,
      recordPayment,
      resetAllData,
      refreshFromServer
    }}>
      {children}
    </DentalStoreContext.Provider>
  );
};

export const useDentalStore = () => {
  const context = useContext(DentalStoreContext);
  if (!context) {
    throw new Error('useDentalStore must be used within a DentalStoreProvider');
  }
  return context;
};
