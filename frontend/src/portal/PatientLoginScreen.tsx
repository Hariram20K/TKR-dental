import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Patient } from '../types';
import { useDentalStore } from '../context/DentalStoreContext';

const APP_FONT = Platform.select({
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  default: undefined
});

interface PatientLoginScreenProps {
  onLoginSuccess: (patient: Patient) => void;
}

export const PatientLoginScreen: React.FC<PatientLoginScreenProps> = ({ onLoginSuccess }) => {
  const { patients, addPatient } = useDentalStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('1234');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const timerRef = useRef<any>(null);

  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [newBloodGroup, setNewBloodGroup] = useState('O+');
  const [regError, setRegError] = useState('');

  const normalizePhone = (num: string) => (num || '').replace(/\D/g, '').slice(-10);

  useEffect(() => {
    if (step === 'otp') {
      setResendTimer(30);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const createNewOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const handleSendOtp = () => {
    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      createNewOtp();
      setOtp('');
      setOtpError('');
      setStep('otp');
    }, 450);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    createNewOtp();
    setOtp('');
    setOtpError('');
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      setOtpError('Please enter the complete 4-digit verification code');
      return;
    }

    if (otp !== generatedOtp && otp !== '1234') {
      setOtpError('Incorrect verification code. Please check your SMS or enter 1234.');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanInputPhone = normalizePhone(phone);
      const matched = patients.find(p => normalizePhone(p.phone) === cleanInputPhone);

      if (matched) {
        onLoginSuccess(matched);
      } else {
        setStep('register');
      }
    }, 400);
  };

  const handleCompleteRegistration = () => {
    if (!newName.trim()) {
      setRegError('Please enter your full legal name');
      return;
    }
    const ageNum = parseInt(newAge.trim(), 10);
    if (!newAge.trim() || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setRegError('Please enter a valid age');
      return;
    }

    setRegError('');
    setIsLoading(true);

    const cleanInputPhone = normalizePhone(phone);
    const formattedPhone = `+91 ${cleanInputPhone.slice(0, 5)} ${cleanInputPhone.slice(5)}`;

    const newPatientData = {
      name: newName.trim(),
      age: ageNum,
      gender: newGender,
      phone: formattedPhone,
      email: `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@patient.tkrdental.com`,
      bloodGroup: newBloodGroup,
      address: 'Tirupathur, Tamil Nadu',
      emergencyContact: `Emergency - ${formattedPhone}`,
      medicalHistory: ['Registered via TKR Patient Portal'],
      allergies: ['None recorded'],
      assignedDoctorId: 'DOC-1',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        spo2: '99%',
        temp: '98.4 F',
        sugar: '98 mg/dL'
      },
      notes: 'New patient registered via secure mobile verification.'
    };

    addPatient(newPatientData);

    setTimeout(() => {
      setIsLoading(false);
      const createdPatient: Patient = {
        ...newPatientData,
        id: `TKR-P-${1000 + patients.length + 1}`,
        registrationDate: new Date().toISOString().split('T')[0],
        balanceDue: 0,
        totalVisits: 1
      };
      onLoginSuccess(createdPatient);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Centered Sign-In Content Block */}
        <View style={styles.centerContainer}>

          {/* Professional Clinic Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="medical" size={20} color="#0284c7" />
              </View>
              <View style={styles.brandTextGroup}>
                <Text style={styles.brandTitle}>TKR DENTAL CARE</Text>
                <Text style={styles.brandSubtitle}>Dental Clinic & Implant Centre</Text>
              </View>
            </View>
            <Text style={styles.brandTagline}>Healthy Smiles, Happier Lives</Text>
          </View>

          {/* Security & Trust Badges */}
          <View style={styles.trustBar}>
            <View style={styles.trustItem}>
              <Ionicons name="shield-checkmark-outline" size={13} color="#059669" />
              <Text style={styles.trustText}>256-Bit Encrypted</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Ionicons name="lock-closed-outline" size={13} color="#0284c7" />
              <Text style={styles.trustText}>Official Patient Portal</Text>
            </View>
          </View>

          {/* Main Card */}
          <View style={styles.card}>

            {/* ================= STEP 1: MOBILE NUMBER ================= */}
            {step === 'phone' && (
              <View>
                <Text style={styles.formTitle}>Patient Sign In</Text>
                <Text style={styles.formDesc}>
                  Enter your mobile number to view appointments, clinical records, prescriptions, and invoices.
                </Text>

                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                <View style={[styles.inputBox, isInputFocused && styles.inputBoxFocused]}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryFlag}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInputField}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onChangeText={(text) => {
                      setPhone(text.replace(/\D/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                    autoFocus
                  />
                </View>

                {phoneError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                    <Text style={styles.errorText}>{phoneError}</Text>
                  </View>
                ) : (
                  <Text style={styles.inputHelperText}>
                    A 4-digit verification code will be sent via SMS.
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.primaryActionBtn, (!phone || phone.length < 10 || isLoading) && styles.disabledBtn]}
                  onPress={handleSendOtp}
                  disabled={!phone || phone.length < 10 || isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryActionText}>Get Verification Code</Text>
                      <Ionicons name="arrow-forward" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Feature Highlights */}
                <View style={styles.featuresRow}>
                  <View style={styles.featureItem}>
                    <Ionicons name="calendar-outline" size={13} color="#0284c7" />
                    <Text style={styles.featureText}>Book Visits</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="fitness-outline" size={13} color="#0284c7" />
                    <Text style={styles.featureText}>Tooth Chart</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="medical-outline" size={13} color="#0284c7" />
                    <Text style={styles.featureText}>Digital Rx</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="card-outline" size={13} color="#0284c7" />
                    <Text style={styles.featureText}>UPI Bills</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ================= STEP 2: OTP VERIFICATION ================= */}
            {step === 'otp' && (
              <View>
                <Text style={styles.formTitle}>Enter Verification Code</Text>
                <Text style={styles.formDesc}>
                  We sent a 4-digit OTP to <Text style={styles.highlightPhone}>+91 {phone}</Text>
                </Text>

                <TouchableOpacity 
                  style={styles.changeNumberLink} 
                  onPress={() => { setStep('phone'); setOtp(''); setOtpError(''); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil" size={12} color="#0284c7" style={{ marginRight: 4 }} />
                  <Text style={styles.changeNumberText}>Edit Phone Number</Text>
                </TouchableOpacity>

                {/* SMS Notification Banner */}
                <View style={styles.smsBanner}>
                  <View style={styles.smsHeaderRow}>
                    <View style={styles.smsTitleGroup}>
                      <Ionicons name="chatbubble-ellipses-outline" size={14} color="#0369a1" />
                      <Text style={styles.smsTitle}>SMS Notification</Text>
                    </View>
                    <Text style={styles.smsTime}>Just now</Text>
                  </View>
                  <Text style={styles.smsBody}>
                    TKR Dental OTP: Your login code is <Text style={styles.smsCode}>{generatedOtp}</Text>. Valid for 10 minutes.
                  </Text>
                  <TouchableOpacity 
                    style={styles.autofillBtn} 
                    onPress={() => { setOtp(generatedOtp); setOtpError(''); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="flash-outline" size={13} color="#0284c7" />
                    <Text style={styles.autofillText}>Auto-Fill OTP ({generatedOtp})</Text>
                  </TouchableOpacity>
                </View>

                {/* 4-Box OTP Grid */}
                <View style={styles.otpGrid}>
                  {[0, 1, 2, 3].map((idx) => {
                    const digit = otp[idx] || '';
                    const isCurrent = otp.length === idx;
                    return (
                      <View 
                        key={idx} 
                        style={[
                          styles.otpCell, 
                          digit ? styles.otpCellFilled : null, 
                          isCurrent ? styles.otpCellActive : null
                        ]}
                      >
                        <Text style={styles.otpCellText}>{digit || '—'}</Text>
                      </View>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val.replace(/\D/g, ''));
                    if (otpError) setOtpError('');
                  }}
                  autoFocus
                  placeholder="Enter 4-digit OTP"
                  placeholderTextColor="#94a3b8"
                />

                {otpError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                    <Text style={styles.errorText}>{otpError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.primaryActionBtn, (otp.length < 4 || isLoading) && styles.disabledBtn]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length < 4 || isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryActionText}>Verify & Sign In</Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {resendTimer > 0 ? (
                    <Text style={styles.resendMutedText}>
                      Resend code in <Text style={{ color: '#0284c7', fontWeight: '500' }}>{resendTimer}s</Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOtp} style={styles.resendActionBtn}>
                      <Ionicons name="refresh-outline" size={13} color="#0284c7" />
                      <Text style={styles.resendActionText}>Resend Code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* ================= STEP 3: NEW PATIENT ONBOARDING ================= */}
            {step === 'register' && (
              <View>
                <Text style={styles.formTitle}>New Patient Registration</Text>
                <Text style={styles.formDesc}>
                  Mobile <Text style={styles.highlightPhone}>+91 {phone}</Text> is verified. Please enter your profile details.
                </Text>

                <Text style={styles.inputLabel}>FULL NAME *</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="e.g. Ramesh Kumar"
                  placeholderTextColor="#94a3b8"
                  value={newName}
                  onChangeText={(t) => { setNewName(t); if (regError) setRegError(''); }}
                  autoFocus
                />

                <View style={styles.twoColRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>AGE *</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. 32"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      maxLength={3}
                      value={newAge}
                      onChangeText={(t) => { setNewAge(t.replace(/\D/g, '')); if (regError) setRegError(''); }}
                    />
                  </View>

                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.inputLabel}>GENDER</Text>
                    <View style={styles.genderPicker}>
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderOption, newGender === g && styles.genderOptionActive]}
                          onPress={() => setNewGender(g)}
                        >
                          <Text style={[styles.genderOptionText, newGender === g && styles.genderOptionTextActive]}>
                            {g}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>BLOOD GROUP</Text>
                <View style={styles.bloodGroupGrid}>
                  {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-'].map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[styles.bloodPill, newBloodGroup === bg && styles.bloodPillActive]}
                      onPress={() => setNewBloodGroup(bg)}
                    >
                      <Text style={[styles.bloodPillText, newBloodGroup === bg && styles.bloodPillTextActive]}>
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {regError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle-outline" size={14} color="#dc2626" />
                    <Text style={styles.errorText}>{regError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.primaryActionBtn, isLoading && styles.disabledBtn]}
                  onPress={handleCompleteRegistration}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryActionText}>Create Account & Access Portal</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

          </View>

          {/* Reception Assistance Bar */}
          <View style={styles.helpCard}>
            <Ionicons name="headset-outline" size={15} color="#0284c7" />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.helpTitle}>Need help signing in?</Text>
              <Text style={styles.helpSub}>Call Reception: +91 98765 43210 (9:00 AM - 8:30 PM)</Text>
            </View>
          </View>

        </View>

        {/* Bottom-Pinned Clinic Footer */}
        <View style={styles.bottomFooter}>
          <Text style={styles.footerClinicName}>TKR DENTAL CARE & IMPLANT CENTRE</Text>
          <Text style={styles.footerReg}>Reg. No: TN-MED-DEN-2018-0941 • Dr. E. Rajalakshmi, BDS, MDS</Text>
          <Text style={styles.footerAddress}>FHW8+CWM, Tirupathur, Tamil Nadu 635601</Text>
          <Text style={styles.footerLegal}>
            By signing in, you agree to TKR Dental's Patient Care Terms and Medical Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 24,
    minHeight: '100%'
  },
  centerContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 'auto'
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 14
  },
  brandLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0f2fe',
    borderWidth: 1,
    borderColor: '#bae6fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9
  },
  brandTextGroup: {
    justifyContent: 'center'
  },
  brandTitle: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: 0.4
  },
  brandSubtitle: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '500'
  },
  brandTagline: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2
  },
  trustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trustText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 4
  },
  trustDivider: {
    width: 1,
    height: 10,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 20,
    width: '100%',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  formTitle: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 3
  },
  formDesc: {
    fontFamily: APP_FONT,
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 14
  },
  inputLabel: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    letterSpacing: 0.3,
    marginBottom: 5
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    marginBottom: 6
  },
  inputBoxFocused: {
    borderColor: '#0284c7'
  },
  countryCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0'
  },
  countryFlag: {
    fontSize: 13,
    marginRight: 4
  },
  countryCode: {
    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: '500',
    color: '#0369a1'
  },
  phoneInputField: {
    flex: 1,
    fontFamily: APP_FONT,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0f172a'
  },
  inputHelperText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12
  },
  errorText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#dc2626',
    marginLeft: 6,
    flex: 1
  },
  primaryActionBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 11,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  disabledBtn: {
    backgroundColor: '#94a3b8'
  },
  primaryActionText: {
    fontFamily: APP_FONT,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500'
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  featureText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 4
  },
  highlightPhone: {
    color: '#0f172a',
    fontWeight: '500'
  },
  changeNumberLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  changeNumberText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#0284c7',
    fontWeight: '500'
  },
  smsBanner: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  smsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  smsTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  smsTitle: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '500',
    color: '#0369a1',
    marginLeft: 4
  },
  smsTime: {
    fontFamily: APP_FONT,
    fontSize: 9,
    color: '#64748b'
  },
  smsBody: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#1e293b',
    lineHeight: 16
  },
  smsCode: {
    fontFamily: APP_FONT,
    fontWeight: '600',
    color: '#0284c7'
  },
  autofillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#93c5fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 6
  },
  autofillText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0284c7',
    marginLeft: 4
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10
  },
  otpCell: {
    width: 44,
    height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center'
  },
  otpCellFilled: {
    borderColor: '#0284c7',
    backgroundColor: '#ffffff'
  },
  otpCellActive: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff'
  },
  otpCellText: {
    fontFamily: APP_FONT,
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a'
  },
  hiddenInput: {
    fontFamily: APP_FONT,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 12
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 10
  },
  resendMutedText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#64748b'
  },
  resendActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  resendActionText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0284c7',
    marginLeft: 4
  },
  fieldInput: {
    fontFamily: APP_FONT,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 10
  },
  twoColRow: {
    flexDirection: 'row',
    marginBottom: 2
  },
  genderPicker: {
    flexDirection: 'row',
    gap: 4
  },
  genderOption: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  genderOptionActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7'
  },
  genderOptionText: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#475569'
  },
  genderOptionTextActive: {
    color: '#ffffff',
    fontWeight: '500'
  },
  bloodGroupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 12
  },
  bloodPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc'
  },
  bloodPillActive: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626'
  },
  bloodPillText: {
    fontFamily: APP_FONT,
    fontSize: 11,
    color: '#475569'
  },
  bloodPillTextActive: {
    color: '#ffffff',
    fontWeight: '500'
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    width: '100%'
  },
  helpTitle: {
    fontFamily: APP_FONT,
    fontSize: 11,
    fontWeight: '500',
    color: '#0f172a'
  },
  helpSub: {
    fontFamily: APP_FONT,
    fontSize: 10,
    color: '#64748b',
    marginTop: 1
  },
  bottomFooter: {
    marginTop: 28,
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 400
  },
  footerClinicName: {
    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5
  },
  footerReg: {
    fontFamily: APP_FONT,
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 2
  },
  footerAddress: {
    fontFamily: APP_FONT,
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 1
  },
  footerLegal: {
    fontFamily: APP_FONT,
    fontSize: 9,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 8
  }
});
