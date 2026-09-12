import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  StatusBar, 
  SafeAreaView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useDentalStore } from '../context/DentalStoreContext';
import { Odontogram } from '../components/Odontogram';
import { Appointment, Invoice, Patient } from '../types';
import { PatientLoginScreen } from './PatientLoginScreen';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

type PatientTab = 'home' | 'teeth' | 'appointments' | 'prescriptions' | 'billing' | 'profile';

interface PatientPortalAppProps {
  onSwitchToStaff: () => void;
}

const ORAL_HEALTH_TIPS = [
  { icon: 'sparkles', title: 'Brushing Technique', desc: 'Brush twice daily using 45-degree circular motions along the gumline.' },
  { icon: 'water', title: 'Floss Daily', desc: 'Flossing cleans the 35% of tooth surfaces that standard brushing misses.' },
  { icon: 'shield-checkmark', title: 'Post-Op Care', desc: 'Avoid vigorous rinsing or hot beverages for 24 hours after crown or tooth treatments.' }
];

import { useAuth, AuthContainer } from '../auth';

export const PatientPortalApp: React.FC<PatientPortalAppProps> = () => {
  const { 
    patients, 
    selectedPatientId, 
    setSelectedPatientId, 
    appointments, 
    addAppointment, 
    prescriptions, 
    invoices, 
    teethMap, 
    queue, 
    recordPayment 
  } = useDentalStore();

  const { user, authState, isLoading: isAuthLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<PatientTab>('home');
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Handle Logout
  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Sign out of your TKR Dental patient account?')) {
        await logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]);
    }
  };

  // Booking form states
  const [bookDate, setBookDate] = useState('2026-09-12');
  const [bookTime, setBookTime] = useState('11:00 AM');
  const [bookType, setBookType] = useState('Routine Scaling & Checkup');
  const [bookNotes, setBookNotes] = useState('');

  // Show loading spinner while loading stored session
  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3196F5" />
      </View>
    );
  }

  // If not authenticated, render the production-ready Auth and Onboarding system
  if (authState !== 'AUTHENTICATED' || !user) {
    return <AuthContainer appName="TKR DENTAL CARE" />;
  }

  // Derive current patient from authenticated user
  const cleanAuthPhone = (user.phoneNumber || '').replace(/\D/g, '').slice(-10);
  const matchedPatient = patients.find(
    (p) => (p.phone || '').replace(/\D/g, '').slice(-10) === cleanAuthPhone
  );

  const currentPatient: Patient = matchedPatient || {
    id: user.id || 'TKR-P-NEW',
    name: user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'Valued Patient',
    age: 28,
    gender: 'Other',
    phone: `${user.countryCode} ${user.phoneNumber}`,
    email: user.email,
    bloodGroup: 'O+',
    address: user.location || 'Tirupathur, Tamil Nadu',
    emergencyContact: `Reception Helpline: +91 98765 43210`,
    medicalHistory: user.preferences?.length ? user.preferences : ['Registered via Patient Portal'],
    allergies: ['No known allergies recorded'],
    assignedDoctorId: 'DOC-1',
    registrationDate: new Date().toISOString().split('T')[0],
    balanceDue: 0,
    totalVisits: 1,
    vitals: { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.4 F', sugar: '98 mg/dL' },
    notes: 'Authenticated via new customer onboarding system.'
  };
  const myAppointments = appointments.filter(a => a.patientId === currentPatient.id);
  const nextAppointment = myAppointments.find(a => a.status !== 'Completed' && a.status !== 'Cancelled');
  const myPrescriptions = prescriptions.filter(rx => rx.patientId === currentPatient.id);
  const myInvoices = invoices.filter(inv => inv.patientId === currentPatient.id);
  const patientTeeth = (currentPatient ? teethMap[currentPatient.id] : {}) || {};
  const teethList = Object.values(patientTeeth);
  const activeQueueToken = queue.find(q => q.patientId === currentPatient.id && q.status !== 'completed');

  const totalOutstanding = myInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleCreateBooking = () => {
    if (!currentPatient) return;
    addAppointment({
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      date: bookDate,
      time: bookTime,
      type: bookType,
      status: 'Scheduled',
      chair: 'Chair 1',
      notes: bookNotes.trim() || 'Booked by patient via Patient Portal mobile app.'
    });

    setBookingModalVisible(false);
    setBookNotes('');
    Alert.alert('Appointment Requested', `Your visit for ${bookDate} at ${bookTime} has been booked! Our reception team will confirm shortly.`);
  };

  const handleOpenPay = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPayModalVisible(true);
  };

  const handleConfirmPay = () => {
    if (!selectedInvoice) return;
    recordPayment(selectedInvoice.id, selectedInvoice.balance);
    setPayModalVisible(false);
    Alert.alert('Payment Successful', `Thank you! Payment of ₹${selectedInvoice.balance.toLocaleString()} received via UPI QR.`);
  };

  // 1. HOME TAB
  const renderHomeTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      {/* Patient Greeting Card */}
      <View style={styles.greetingCard}>
        <View style={styles.greetingTextCol}>
          <Text style={styles.greetingHello}>Welcome back,</Text>
          <Text style={styles.greetingName}>{currentPatient.name}</Text>
          <Text style={styles.greetingId}>Patient ID: {currentPatient.id} • Blood: {currentPatient.bloodGroup}</Text>
        </View>

        {/* Verified Patient Pill (Replaces Switch Profile) */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.verifiedBadgeText}>Verified</Text>
        </View>
      </View>

      {/* Live Reception Queue Banner (if active) */}
      {activeQueueToken && (
        <View style={styles.queueBanner}>
          <View style={styles.queueBannerTop}>
            <View style={styles.liveQueueDot} />
            <Text style={styles.queueBannerTitle}>LIVE RECEPTION QUEUE TOKEN</Text>
          </View>
          <View style={styles.queueBannerRow}>
            <View style={styles.tokenPill}>
              <Text style={styles.tokenPillText}>{activeQueueToken.token}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.queueRoomText}>{activeQueueToken.room}</Text>
              <Text style={styles.queueStatusText}>
                Status: {activeQueueToken.status === 'called' ? '📢 NOW CALLING YOU' : '⏳ Waiting in Reception'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Action Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickItem} onPress={() => setBookingModalVisible(true)}>
          <View style={[styles.quickIcon, { backgroundColor: '#e0f2fe' }]}>
            <Ionicons name="calendar-outline" size={20} color="#0284c7" />
          </View>
          <Text style={styles.quickLabel}>Book Visit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('teeth')}>
          <View style={[styles.quickIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="fitness-outline" size={20} color="#d97706" />
          </View>
          <Text style={styles.quickLabel}>My Teeth</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('prescriptions')}>
          <View style={[styles.quickIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="medical-outline" size={20} color="#16a34a" />
          </View>
          <Text style={styles.quickLabel}>My Rx</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickItem} onPress={() => setActiveTab('billing')}>
          <View style={[styles.quickIcon, { backgroundColor: '#ede9fe' }]}>
            <Ionicons name="card-outline" size={20} color="#7c3aed" />
          </View>
          <Text style={styles.quickLabel}>Pay Bills</Text>
        </TouchableOpacity>
      </View>

      {/* Next Appointment Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Next Appointment</Text>
          <TouchableOpacity onPress={() => setActiveTab('appointments')}>
            <Text style={styles.cardLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {nextAppointment ? (
          <View style={styles.nextAptBox}>
            <View style={styles.nextAptDateBadge}>
              <Text style={styles.aptDateDay}>{nextAppointment.date.split('-')[2]}</Text>
              <Text style={styles.aptDateMonth}>SEP</Text>
            </View>

            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={styles.nextAptProcedure}>{nextAppointment.type}</Text>
              <Text style={styles.nextAptTime}>⏰ {nextAppointment.time} • {nextAppointment.chair}</Text>
              <Text style={styles.nextAptDoctor}>👩‍⚕️ {nextAppointment.doctorName}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noAptBox}>
            <Text style={styles.noAptText}>No upcoming appointments scheduled.</Text>
            <TouchableOpacity style={styles.bookNowSmallBtn} onPress={() => setBookingModalVisible(true)}>
              <Text style={styles.bookNowSmallBtnText}>Book Next Visit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Outstanding Balance Banner */}
      {totalOutstanding > 0 && (
        <View style={styles.balanceBanner}>
          <View>
            <Text style={styles.balanceLabel}>Pending Dental Invoices</Text>
            <Text style={styles.balanceAmount}>₹{totalOutstanding.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.payBannerBtn} onPress={() => setActiveTab('billing')}>
            <Text style={styles.payBannerBtnText}>Pay Online</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Primary Dental Surgeon Profile */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Chief Dental Surgeon</Text>
        <View style={styles.doctorProfileRow}>
          <View style={styles.doctorAvatar}>
            <Text style={{ fontSize: 24 }}>👩‍⚕️</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.doctorName}>Dr. E. Rajalakshmi, BDS, MDS</Text>
            <Text style={styles.doctorSpecialty}>Chief Dental Surgeon & Implantologist</Text>
            <Text style={styles.doctorExp}>⭐ 4.98 (450+ Reviews) • 15 Yrs Experience</Text>
          </View>
        </View>
      </View>

      {/* Oral Health Tips */}
      <Text style={styles.sectionHeader}>DAILY SMILE CARE TIPS</Text>
      {ORAL_HEALTH_TIPS.map((tip, idx) => (
        <View key={idx} style={styles.tipCard}>
          <Ionicons name={tip.icon as any} size={18} color="#0284c7" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipDesc}>{tip.desc}</Text>
          </View>
        </View>
      ))}

      {/* Emergency Contact */}
      <View style={styles.emergencyBox}>
        <Ionicons name="call-outline" size={18} color="#dc2626" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.emergencyTitle}>Dental Emergency Helpline</Text>
          <Text style={styles.emergencyPhone}>+91 98765 43219 / +91 98765 43210</Text>
        </View>
      </View>
    </ScrollView>
  );

  // 2. TEETH TAB (ODONTOGRAM)
  const renderTeethTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your 32-Tooth Dental Odontogram</Text>
        <Text style={styles.cardSub}>
          Interactive anatomical chart reflecting dental treatments, restorations, and health:
        </Text>
        <Odontogram teethData={patientTeeth} readOnly />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Treated & Diagnosed Teeth ({teethList.length})</Text>
        {teethList.length === 0 ? (
          <Text style={styles.emptyNotice}>All charted teeth are healthy with no pathology.</Text>
        ) : (
          teethList.map(t => (
            <View key={t.number} style={styles.toothRecordRow}>
              <View style={styles.toothPill}>
                <Text style={styles.toothPillText}>#{t.number}</Text>
              </View>
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={styles.toothCondName}>{t.condition.toUpperCase()}</Text>
                <Text style={styles.toothCondDesc}>{t.notes || 'Routine anatomical monitoring'}</Text>
              </View>
              <Ionicons name="checkmark-circle-outline" size={18} color="#16a34a" />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  // 3. APPOINTMENTS TAB
  const renderAppointmentsTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <View style={styles.actionHeaderRow}>
        <Text style={styles.sectionHeader}>MY CLINIC VISITS ({myAppointments.length})</Text>
        <TouchableOpacity style={styles.primaryActionBtn} onPress={() => setBookingModalVisible(true)}>
          <Ionicons name="add" size={15} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.primaryActionBtnText}>Book Visit</Text>
        </TouchableOpacity>
      </View>

      {myAppointments.map(apt => (
        <View key={apt.id} style={styles.aptCard}>
          <View style={styles.aptCardTop}>
            <View>
              <Text style={styles.aptCardType}>{apt.type}</Text>
              <Text style={styles.aptCardDate}>📅 {apt.date} at {apt.time}</Text>
            </View>
            <View style={[styles.statusBadge, apt.status === 'Completed' ? styles.statusCompleted : styles.statusConfirmed]}>
              <Text style={[styles.statusBadgeText, apt.status === 'Completed' ? styles.statusCompletedText : styles.statusConfirmedText]}>
                {apt.status}
              </Text>
            </View>
          </View>
          <Text style={styles.aptCardDoctor}>Doctor: {apt.doctorName} • {apt.chair}</Text>
          {apt.notes ? <Text style={styles.aptCardNotes}>"{apt.notes}"</Text> : null}
        </View>
      ))}
    </ScrollView>
  );

  // 4. PRESCRIPTIONS TAB
  const renderPrescriptionsTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionHeader}>MY DIGITAL PRESCRIPTIONS ({myPrescriptions.length})</Text>
      {myPrescriptions.length === 0 ? (
        <View style={styles.emptyNoticeBox}>
          <Ionicons name="medical-outline" size={36} color="#94a3b8" />
          <Text style={styles.emptyNoticeTitle}>No Active Prescriptions</Text>
        </View>
      ) : (
        myPrescriptions.map(rx => (
          <View key={rx.id} style={styles.rxCard}>
            <View style={styles.rxHeader}>
              <View>
                <Text style={styles.rxClinicTitle}>TKR DENTAL CARE</Text>
                <Text style={styles.rxDoctor}>{rx.doctorName}</Text>
              </View>
              <Text style={styles.rxDate}>{rx.date}</Text>
            </View>

            <View style={styles.rxMedsList}>
              {rx.medications.map((m, idx) => (
                <View key={idx} style={styles.rxMedRow}>
                  <View style={styles.medIndexCircle}>
                    <Text style={styles.medIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, paddingLeft: 8 }}>
                    <Text style={styles.rxMedName}>{m.name}</Text>
                    <Text style={styles.rxMedDose}>{m.dosage} • {m.frequency} • {m.duration}</Text>
                    <Text style={styles.rxMedInst}>{m.instructions}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.rxDirections}>
              <Text style={styles.rxDirectionsTitle}>Special Directions:</Text>
              <Text style={styles.rxDirectionsBody}>{rx.instructions}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // 5. BILLING TAB
  const renderBillingTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.sectionHeader}>DENTAL INVOICES & PAYMENTS ({myInvoices.length})</Text>
      {myInvoices.map(inv => (
        <View key={inv.id} style={styles.invoiceCard}>
          <View style={styles.invHeader}>
            <View>
              <Text style={styles.invId}>{inv.id}</Text>
              <Text style={styles.invDate}>{inv.date}</Text>
            </View>
            <View style={[styles.badge, inv.status === 'Paid' ? styles.badgePaid : styles.badgeUnpaid]}>
              <Text style={[styles.badgeText, inv.status === 'Paid' ? styles.badgeTextPaid : styles.badgeTextUnpaid]}>
                {inv.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.invItems}>
            {inv.items.map((it, idx) => (
              <View key={idx} style={styles.invItemRow}>
                <Text style={styles.invItemDesc}>{it.description}</Text>
                <Text style={styles.invItemAmount}>₹{it.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.invTotals}>
            <View style={styles.invTotalRow}>
              <Text style={styles.totalLabel}>Total Fee:</Text>
              <Text style={styles.totalVal}>₹{inv.total.toLocaleString()}</Text>
            </View>
            <View style={styles.invTotalRow}>
              <Text style={styles.totalLabel}>Paid Amount:</Text>
              <Text style={[styles.totalVal, { color: '#16a34a' }]}>₹{inv.paid.toLocaleString()}</Text>
            </View>
            {inv.balance > 0 && (
              <View style={styles.invTotalRow}>
                <Text style={styles.totalLabel}>Balance Due:</Text>
                <Text style={[styles.totalVal, { color: '#dc2626' }]}>₹{inv.balance.toLocaleString()}</Text>
              </View>
            )}
          </View>

          {inv.balance > 0 && (
            <TouchableOpacity style={styles.payNowBtn} onPress={() => handleOpenPay(inv)}>
              <Ionicons name="qr-code-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.payNowBtnText}>Pay Online via UPI QR (₹{inv.balance})</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  // 6. PROFILE TAB
  const renderProfileTab = () => (
    <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatarLarge}>
          <Text style={{ fontSize: 34 }}>👤</Text>
        </View>
        <Text style={styles.profileName}>{currentPatient.name}</Text>
        <Text style={styles.profileMeta}>Patient ID: {currentPatient.id}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vitals & Health Snapshot</Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>BLOOD PRESSURE</Text>
            <Text style={styles.vitalValue}>{currentPatient.vitals.bp}</Text>
          </View>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>PULSE RATE</Text>
            <Text style={styles.vitalValue}>{currentPatient.vitals.pulse}</Text>
          </View>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>BLOOD SUGAR</Text>
            <Text style={styles.vitalValue}>{currentPatient.vitals.sugar}</Text>
          </View>
          <View style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>BLOOD GROUP</Text>
            <Text style={styles.vitalValue}>{currentPatient.bloodGroup}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical History & Allergies</Text>
        <Text style={styles.subHeading}>Known Drug Allergies:</Text>
        {currentPatient.allergies.map((a, i) => (
          <View key={i} style={styles.allergyPill}>
            <Ionicons name="warning-outline" size={13} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.allergyText}>{a}</Text>
          </View>
        ))}

        <Text style={[styles.subHeading, { marginTop: 10 }]}>Systemic Conditions:</Text>
        {currentPatient.medicalHistory.map((m, i) => (
          <View key={i} style={styles.medPill}>
            <Text style={styles.medPillText}>• {m}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Details</Text>
        <Text style={styles.contactLine}>📞 Phone: {currentPatient.phone}</Text>
        <Text style={styles.contactLine}>✉️ Email: {currentPatient.email}</Text>
        <Text style={styles.contactLine}>🏠 Address: {currentPatient.address}</Text>
        <Text style={styles.contactLine}>🚨 Emergency: {currentPatient.emergencyContact}</Text>
      </View>

      {/* Account & Sign Out Section */}
      <View style={[styles.card, { marginTop: 4, marginBottom: 20 }]}>
        <Text style={styles.cardTitle}>Account & Session</Text>
        <Text style={styles.contactLine}>📱 Verified Mobile: {currentPatient.phone}</Text>
        <TouchableOpacity style={styles.profileLogoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color="#ef4444" style={{ marginRight: 6 }} />
          <Text style={styles.profileLogoutText}>Sign Out of Patient Portal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0284c7" />

      {/* Patient Portal Header */}
      <View style={styles.portalHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.headerLogoBadge}>
            <Text style={{ fontSize: 16 }}>🦷</Text>
          </View>
          <View>
            <Text style={styles.portalTitle}>TKR Patient Portal</Text>
            <Text style={styles.portalSub}>Digital Dental Care • {currentPatient.name}</Text>
          </View>
        </View>

        {/* Clean Sign Out Button (Replaces Switch Patient) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Main Screen Body */}
      <View style={styles.body}>
        {activeTab === 'home' && renderHomeTab()}
        {activeTab === 'teeth' && renderTeethTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'prescriptions' && renderPrescriptionsTab()}
        {activeTab === 'billing' && renderBillingTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </View>

      {/* Patient Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'home' && styles.navBtnActive]} 
          onPress={() => setActiveTab('home')}
        >
          <Ionicons name="home-outline" size={18} color={activeTab === 'home' ? '#0284c7' : '#64748b'} />
          <Text style={[styles.navBtnText, activeTab === 'home' && styles.navBtnTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'teeth' && styles.navBtnActive]} 
          onPress={() => setActiveTab('teeth')}
        >
          <Ionicons name="fitness-outline" size={18} color={activeTab === 'teeth' ? '#0284c7' : '#64748b'} />
          <Text style={[styles.navBtnText, activeTab === 'teeth' && styles.navBtnTextActive]}>My Teeth</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'appointments' && styles.navBtnActive]} 
          onPress={() => setActiveTab('appointments')}
        >
          <Ionicons name="calendar-outline" size={18} color={activeTab === 'appointments' ? '#0284c7' : '#64748b'} />
          <Text style={[styles.navBtnText, activeTab === 'appointments' && styles.navBtnTextActive]}>Visits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'prescriptions' && styles.navBtnActive]} 
          onPress={() => setActiveTab('prescriptions')}
        >
          <Ionicons name="medical-outline" size={18} color={activeTab === 'prescriptions' ? '#0284c7' : '#64748b'} />
          <Text style={[styles.navBtnText, activeTab === 'prescriptions' && styles.navBtnTextActive]}>Rx</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'billing' && styles.navBtnActive]} 
          onPress={() => setActiveTab('billing')}
        >
          <View>
            <Ionicons name="card-outline" size={18} color={activeTab === 'billing' ? '#0284c7' : '#64748b'} />
            {totalOutstanding > 0 && <View style={styles.badgeDot} />}
          </View>
          <Text style={[styles.navBtnText, activeTab === 'billing' && styles.navBtnTextActive]}>Billing</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navBtn, activeTab === 'profile' && styles.navBtnActive]} 
          onPress={() => setActiveTab('profile')}
        >
          <Ionicons name="person-outline" size={18} color={activeTab === 'profile' ? '#0284c7' : '#64748b'} />
          <Text style={[styles.navBtnText, activeTab === 'profile' && styles.navBtnTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Book Appointment Modal */}
      <Modal visible={bookingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Dental Appointment</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.label}>Select Date</Text>
              <TextInput style={styles.input} value={bookDate} onChangeText={setBookDate} placeholder="YYYY-MM-DD" />

              <Text style={styles.label}>Preferred Time Slot</Text>
              <View style={styles.slotsRow}>
                {['10:00 AM', '11:00 AM', '11:45 AM', '02:30 PM', '04:00 PM', '06:00 PM'].map(slot => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, bookTime === slot && styles.slotChipActive]}
                    onPress={() => setBookTime(slot)}
                  >
                    <Text style={[styles.slotChipText, bookTime === slot && styles.slotChipTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Treatment Reason</Text>
              <TextInput style={styles.input} value={bookType} onChangeText={setBookType} />

              <Text style={styles.label}>Symptoms or Notes (Optional)</Text>
              <TextInput 
                style={styles.input} 
                value={bookNotes} 
                onChangeText={setBookNotes} 
                placeholder="e.g. Toothache on upper right molar..." 
              />
            </ScrollView>

            <TouchableOpacity style={styles.confirmBookingBtn} onPress={handleCreateBooking}>
              <Text style={styles.confirmBookingBtnText}>Confirm Appointment Request</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pay Online UPI QR Modal */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Scan & Pay via UPI</Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedInvoice && (
              <View style={styles.qrCard}>
                <Ionicons name="qr-code-outline" size={90} color="#0284c7" />
                <Text style={styles.qrAmount}>Amount to Pay: ₹{selectedInvoice.balance.toLocaleString()}</Text>
                <Text style={styles.qrSub}>Scan using Google Pay, PhonePe, Paytm or BHIM</Text>
                <Text style={styles.qrUpiId}>UPI ID: tkrdental@okaxis</Text>
              </View>
            )}

            <TouchableOpacity style={styles.confirmPaymentBtn} onPress={handleConfirmPay}>
              <Text style={styles.confirmPaymentBtnText}>I Have Made the Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0284c7',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  portalHeader: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerLogoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  portalTitle: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  portalSub: {
    fontFamily: APP_FONT,
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '400'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  logoutBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500'
  },
  body: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 36
  },
  greetingCard: {
    backgroundColor: '#0284c7',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  greetingTextCol: {
    flex: 1
  },
  greetingHello: {
    fontFamily: APP_FONT,
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '400'
  },
  greetingName: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 1
  },
  greetingId: {
    fontFamily: APP_FONT,
    color: '#bae6fd',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 2
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14
  },
  verifiedBadgeText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#059669'
  },
  queueBanner: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  queueBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6
  },
  liveQueueDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6
  },
  queueBannerTitle: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#0284c7',
    letterSpacing: 0.3
  },
  queueBannerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tokenPill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tokenPillText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13
  },
  queueRoomText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a'
  },
  queueStatusText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '400',
    color: '#2563eb',
    marginTop: 1
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  quickItem: {
    width: '23%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  quickLabel: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#334155'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontFamily: APP_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  cardSub: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6
  },
  cardLink: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0284c7'
  },
  nextAptBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8
  },
  nextAptDateBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center'
  },
  aptDateDay: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  aptDateMonth: {
    fontFamily: APP_FONT,
    color: '#e0f2fe',
    fontSize: 9,
    fontWeight: '500'
  },
  nextAptProcedure: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a'
  },
  nextAptTime: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  nextAptDoctor: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0284c7',
    marginTop: 1
  },
  noAptBox: {
    paddingVertical: 12,
    alignItems: 'center'
  },
  noAptText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8
  },
  bookNowSmallBtn: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  bookNowSmallBtnText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0284c7'
  },
  balanceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  balanceLabel: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#991b1b'
  },
  balanceAmount: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626'
  },
  payBannerBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  payBannerBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500'
  },
  doctorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  doctorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center'
  },
  doctorName: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a'
  },
  doctorSpecialty: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0284c7',
    marginTop: 1
  },
  doctorExp: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  sectionHeader: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.3,
    marginTop: 10,
    marginBottom: 6
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 6
  },
  tipTitle: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a'
  },
  tipDesc: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15
  },
  emergencyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 10,
    padding: 10,
    marginTop: 8
  },
  emergencyTitle: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#9f1239'
  },
  emergencyPhone: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#be123c',
    marginTop: 1
  },
  emptyNotice: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#64748b',
    paddingVertical: 10
  },
  toothRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  toothPill: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  toothPillText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7'
  },
  toothCondName: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0f172a'
  },
  toothCondDesc: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b'
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  primaryActionBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500'
  },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8
  },
  aptCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  aptCardType: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a'
  },
  aptCardDate: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusCompleted: {
    backgroundColor: '#dcfce7'
  },
  statusConfirmed: {
    backgroundColor: '#e0f2fe'
  },
  statusBadgeText: {
    fontFamily: APP_FONT,
    fontSize: 9,
    fontWeight: '500'
  },
  statusCompletedText: {
    color: '#16a34a'
  },
  statusConfirmedText: {
    color: '#0284c7'
  },
  aptCardDoctor: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#475569',
    marginTop: 4
  },
  aptCardNotes: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#64748b',
    marginTop: 2
  },
  emptyNoticeBox: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emptyNoticeTitle: {
    fontFamily: APP_FONT,
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 8
  },
  rxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8
  },
  rxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 6,
    marginBottom: 6
  },
  rxClinicTitle: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '600',
    color: '#0284c7'
  },
  rxDoctor: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b'
  },
  rxDate: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#94a3b8'
  },
  rxMedsList: {
    marginVertical: 4
  },
  rxMedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6
  },
  medIndexCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1
  },
  medIndexText: {
    fontFamily: APP_FONT,
    fontSize: 9,
    fontWeight: '600',
    color: '#64748b'
  },
  rxMedName: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '500',
    color: '#0f172a'
  },
  rxMedDose: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#0284c7'
  },
  rxMedInst: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b'
  },
  rxDirections: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginTop: 4
  },
  rxDirectionsTitle: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '500',
    color: '#475569'
  },
  rxDirectionsBody: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b',
    marginTop: 1
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8
  },
  invHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  invId: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a'
  },
  invDate: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#94a3b8'
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  badgePaid: {
    backgroundColor: '#dcfce7'
  },
  badgeUnpaid: {
    backgroundColor: '#fee2e2'
  },
  badgeText: {
    fontFamily: APP_FONT,
    fontSize: 9,
    fontWeight: '600'
  },
  badgeTextPaid: {
    color: '#16a34a'
  },
  badgeTextUnpaid: {
    color: '#dc2626'
  },
  invItems: {
    paddingVertical: 4
  },
  invItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  invItemDesc: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#334155'
  },
  invItemAmount: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0f172a'
  },
  invTotals: {
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 6,
    marginVertical: 4
  },
  invTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1
  },
  totalLabel: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b'
  },
  totalVal: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0f172a'
  },
  payNowBtn: {
    flexDirection: 'row',
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6
  },
  payNowBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500'
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  profileAvatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  profileName: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a'
  },
  profileMeta: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0284c7',
    marginTop: 1
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6
  },
  vitalBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6
  },
  vitalLabel: {
    fontFamily: APP_FONT,
    fontSize: 9,
    fontWeight: '500',
    color: '#64748b'
  },
  vitalValue: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 1
  },
  subHeading: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#475569',
    marginTop: 4,
    marginBottom: 3
  },
  allergyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 6,
    borderRadius: 6,
    marginBottom: 4
  },
  allergyText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#dc2626'
  },
  medPill: {
    paddingVertical: 1
  },
  medPillText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#475569'
  },
  contactLine: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#334155',
    marginVertical: 2
  },
  profileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8
  },
  profileLogoutText: {
    fontFamily: APP_FONT,
    fontSize: 12,
    fontWeight: '500',
    color: '#ef4444'
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 6
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBtnActive: {},
  navBtnText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b',
    marginTop: 2
  },
  navBtnTextActive: {
    color: '#0284c7',
    fontWeight: '500'
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 420
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: {
    fontFamily: APP_FONT,
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a'
  },
  label: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 3,
    marginTop: 6
  },
  input: {
    fontFamily: APP_FONT,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#0f172a'
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4
  },
  slotChip: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
    marginRight: 4,
    marginBottom: 4
  },
  slotChipActive: {
    backgroundColor: '#0284c7'
  },
  slotChipText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#475569'
  },
  slotChipTextActive: {
    color: '#ffffff',
    fontWeight: '500'
  },
  confirmBookingBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  confirmBookingBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  qrCard: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    marginVertical: 8
  },
  qrAmount: {
    fontFamily: APP_FONT,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 8
  },
  qrSub: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b',
    marginTop: 3
  },
  qrUpiId: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '500',
    marginTop: 2
  },
  confirmPaymentBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  confirmPaymentBtnText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  }
});
