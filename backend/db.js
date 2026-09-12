const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data', 'dental_db.json');

const INITIAL_DATA = {
  clinicProfile: {
    name: 'TKR DENTAL CARE',
    fullName: 'TKR DENTAL CARE & Implant Centre',
    tagline: 'Healthy Smiles, Happier Lives',
    motto: 'Digital Dental Care | Efficient Management | Better Patient Experience',
    phone: '+91 98765 43210',
    emergencyPhone: '+91 98765 43219',
    email: 'care@tkrdental.com',
    website: 'https://www.tkrdental.com',
    address: 'TKR DENTAL CARE, FHW8+CWM, Tirupathur, Tamil Nadu 635601',
    city: 'Tirupathur',
    state: 'Tamil Nadu',
    pincode: '635601',
    registrationNo: 'TN-MED-DEN-2018-0941',
    timings: 'Mon - Sat: 9:00 AM - 8:30 PM | Sunday: 9:30 AM - 2:00 PM',
    chairs: 6
  },
  doctors: [
    {
      id: 'DOC-1',
      name: 'Dr. E. Rajalakshmi',
      qualification: 'BDS, MDS (Chief Dental Surgeon & Implantologist)',
      experience: '15 Years',
      room: 'Main Consultation Operatory 1',
      specialty: 'Chief Dental Surgeon & Implant Specialist',
      phone: '+91 98765 43210',
      email: 'dr.rajalakshmi@tkrdental.com',
      avatar: '👩‍⚕️',
      rating: 4.98,
      reviewsCount: 450,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      slots: ['09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:30 PM']
    },
    {
      id: 'DOC-2',
      name: 'Dr. S. Karthikeyan',
      qualification: 'BDS, MDS (Orthodontist)',
      experience: '9 Years',
      room: 'Aligner & Braces Suite (Room 2)',
      specialty: 'Orthodontics & Dentofacial Orthopedics',
      phone: '+91 98765 43212',
      email: 'dr.karthik@tkrdental.com',
      avatar: '👨‍⚕️',
      rating: 4.92,
      reviewsCount: 280,
      availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
      slots: ['10:00 AM', '11:30 AM', '02:30 PM', '04:30 PM', '06:00 PM']
    }
  ],
  patients: [
    {
      id: 'TKR-P-1001',
      name: 'Rahul Verma',
      age: 34,
      gender: 'Male',
      dob: '1992-04-12',
      phone: '+91 98450 11223',
      email: 'rahul.verma@example.com',
      bloodGroup: 'B+',
      address: 'Flat 304, Green Glen Residency, Bellandur, Bengaluru',
      emergencyContact: 'Sunita Verma (Wife) - +91 98450 11224',
      medicalHistory: ['Hypertension (Stage 1 - on Telmisartan 40mg)', 'Mild Dental Anxiety'],
      allergies: ['Penicillin', 'Sulfa Drugs'],
      assignedDoctorId: 'DOC-1',
      registrationDate: '2026-08-15',
      balanceDue: 0,
      totalVisits: 4,
      vitals: { bp: '128/82 mmHg', pulse: '74 bpm', spo2: '99%', temp: '98.4 F', sugar: '108 mg/dL' },
      notes: 'Zirconia crown on #19 completed. Follow-up in 1 week for bite comfort check.'
    },
    {
      id: 'TKR-P-1002',
      name: 'Ananya Deshmukh',
      age: 28,
      gender: 'Female',
      dob: '1998-09-24',
      phone: '+91 97312 33445',
      email: 'ananya.d@example.com',
      bloodGroup: 'O+',
      address: '45/2 Koramangala 4th Block, Bengaluru',
      emergencyContact: 'Vikram Deshmukh (Brother) - +91 97312 33446',
      medicalHistory: ['No systemic medical conditions reported'],
      allergies: ['Latex sensitivity'],
      assignedDoctorId: 'DOC-1',
      registrationDate: '2026-08-20',
      balanceDue: 0,
      totalVisits: 3,
      vitals: { bp: '118/76 mmHg', pulse: '70 bpm', spo2: '99%', temp: '98.2 F', sugar: '94 mg/dL' },
      notes: 'Clear aligners tray #4 delivered. Review progress next month.'
    },
    {
      id: 'TKR-P-1003',
      name: 'K. Venkatesan',
      age: 52,
      gender: 'Male',
      dob: '1974-01-10',
      phone: '+91 94440 55667',
      email: 'k.venkatesan@example.com',
      bloodGroup: 'A+',
      address: '12 Temple Street, Tirupathur, TN',
      emergencyContact: 'Lakshmi Venkatesan (Wife) - +91 94440 55668',
      medicalHistory: ['Type 2 Diabetes (HbA1c 7.1%)', 'Dyslipidemia'],
      allergies: ['No known drug allergies (NKDA)'],
      assignedDoctorId: 'DOC-1',
      registrationDate: '2026-08-22',
      balanceDue: 2300,
      totalVisits: 2,
      vitals: { bp: '134/86 mmHg', pulse: '78 bpm', spo2: '98%', temp: '98.6 F', sugar: '142 mg/dL' },
      notes: 'Severe pain lower right molar (#46). RCT Step 1 done.'
    },
    {
      id: 'TKR-P-1004',
      name: 'Priya Sharma',
      age: 23,
      gender: 'Female',
      dob: '2003-05-18',
      phone: '+91 98860 77889',
      email: 'priya.sharma@example.com',
      bloodGroup: 'AB+',
      address: '88 MG Road, Vaniyambadi, TN',
      emergencyContact: 'Rakesh Sharma (Father) - +91 98860 77880',
      medicalHistory: ['Asthma (uses Salbutamol inhaler PRN)'],
      allergies: ['Aspirin / NSAIDs'],
      assignedDoctorId: 'DOC-2',
      registrationDate: '2026-09-01',
      balanceDue: 5000,
      totalVisits: 1,
      vitals: { bp: '112/74 mmHg', pulse: '72 bpm', spo2: '99%', temp: '98.0 F', sugar: '90 mg/dL' },
      notes: 'Orthodontic assessment for anterior crowding. Ceramic braces proposed.'
    },
    {
      id: 'TKR-P-1005',
      name: 'Mohammed Farhan',
      age: 41,
      gender: 'Male',
      dob: '1985-11-30',
      phone: '+91 96200 88990',
      email: 'farhan.m@example.com',
      bloodGroup: 'O-',
      address: '10 Mosque Road, Ambur, TN',
      emergencyContact: 'Ayesha Farhan (Wife) - +91 96200 88991',
      medicalHistory: ['None'],
      allergies: ['No known drug allergies (NKDA)'],
      assignedDoctorId: 'DOC-1',
      registrationDate: '2026-09-05',
      balanceDue: 0,
      totalVisits: 1,
      vitals: { bp: '122/80 mmHg', pulse: '76 bpm', spo2: '99%', temp: '98.4 F', sugar: '102 mg/dL' },
      notes: 'Routine ultrasonic dental scaling and fluoride polish completed.'
    }
  ],
  appointments: [
    {
      id: 'APT-101',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      date: '2026-09-10',
      time: '10:00 AM',
      type: 'Crown Seating / Post-Op Review',
      status: 'Checked In',
      chair: 'Chair 1',
      notes: 'Check occlusion & bite comfort on #19 Zirconia crown.'
    },
    {
      id: 'APT-102',
      patientId: 'TKR-P-1002',
      patientName: 'Ananya Deshmukh',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      date: '2026-09-10',
      time: '11:00 AM',
      type: 'Clear Aligner Tracking',
      status: 'Scheduled',
      chair: 'Chair 2',
      notes: 'Tray #4 compliance check & attachment review.'
    },
    {
      id: 'APT-103',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      date: '2026-09-10',
      time: '11:45 AM',
      type: 'Root Canal Treatment (RCT)',
      status: 'Scheduled',
      chair: 'Chair 1',
      notes: 'Access opening & biomechanical preparation on #46.'
    },
    {
      id: 'APT-104',
      patientId: 'TKR-P-1004',
      patientName: 'Priya Sharma',
      doctorId: 'DOC-2',
      doctorName: 'Dr. S. Karthikeyan',
      date: '2026-09-10',
      time: '02:30 PM',
      type: 'Orthodontic Braces Consultation',
      status: 'Scheduled',
      chair: 'Chair 3',
      notes: 'Diagnostic cephalometric and photographic analysis.'
    }
  ],
  queue: [
    {
      id: 'Q-1',
      token: 'TKR-Q-101',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      arrivalTime: '09:45 AM',
      status: 'called',
      room: 'Consultation Operatory 1',
      priority: 'Normal'
    },
    {
      id: 'Q-2',
      token: 'TKR-Q-102',
      patientId: 'TKR-P-1002',
      patientName: 'Ananya Deshmukh',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      arrivalTime: '10:15 AM',
      status: 'waiting',
      room: 'Consultation Operatory 1',
      priority: 'Normal'
    },
    {
      id: 'Q-3',
      token: 'TKR-Q-103',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      doctorId: 'DOC-1',
      doctorName: 'Dr. E. Rajalakshmi',
      arrivalTime: '10:30 AM',
      status: 'waiting',
      room: 'Consultation Operatory 1',
      priority: 'Urgent'
    },
    {
      id: 'Q-4',
      token: 'TKR-Q-104',
      patientId: 'TKR-P-1004',
      patientName: 'Priya Sharma',
      doctorId: 'DOC-2',
      doctorName: 'Dr. S. Karthikeyan',
      arrivalTime: '10:50 AM',
      status: 'waiting',
      room: 'Aligner Suite (Room 2)',
      priority: 'Normal'
    }
  ],
  teethMap: {
    'TKR-P-1001': {
      19: { number: 19, condition: 'crown', surfaces: ['O', 'B', 'L', 'M', 'D'], notes: 'Zirconia crown cemented with resin cement' },
      14: { number: 14, condition: 'filling', surfaces: ['O'], notes: 'Class I composite restoration intact' },
      3: { number: 3, condition: 'caries', surfaces: ['O'], notes: 'Early pit and fissure caries detected' }
    },
    'TKR-P-1002': {
      11: { number: 11, condition: 'healthy', surfaces: ['B'], notes: 'Aligner attachment button #1' },
      21: { number: 21, condition: 'healthy', surfaces: ['B'], notes: 'Aligner attachment button #2' }
    },
    'TKR-P-1003': {
      46: { number: 46, condition: 'rct', surfaces: ['O'], notes: 'Deep pulpal involvement, rotary RCT in progress' },
      47: { number: 47, condition: 'caries', surfaces: ['M', 'O'], notes: 'Mesio-occlusal cavity' },
      36: { number: 36, condition: 'missing', surfaces: [], notes: 'Extracted 5 years ago, implant planned' }
    },
    'TKR-P-1004': {
      12: { number: 12, condition: 'caries', surfaces: ['M'], notes: 'Interproximal caries' },
      22: { number: 22, condition: 'filling', surfaces: ['D'], notes: 'Old GIC restoration' }
    },
    'TKR-P-1005': {
      16: { number: 16, condition: 'filling', surfaces: ['O'], notes: 'Silver amalgam filling from 2020' }
    }
  },
  treatmentPlans: [
    {
      id: 'TP-101',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      title: 'Crown Restoration & Preventive Care',
      status: 'Active',
      createdAt: '2026-08-25',
      items: [
        { id: 'TPI-1', tooth: '#19', procedure: 'Zirconia Crown Placement', cost: 12000, status: 'Completed' },
        { id: 'TPI-2', tooth: '#3', procedure: 'Class I Composite Restoration', cost: 1800, status: 'Planned' },
        { id: 'TPI-3', tooth: 'Full Mouth', procedure: 'Ultrasonic Scaling & Polishing', cost: 1500, status: 'Completed' }
      ],
      totalCost: 15300
    },
    {
      id: 'TP-102',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      title: 'Lower Right Quadrant Rehabilitation',
      status: 'Active',
      createdAt: '2026-09-02',
      items: [
        { id: 'TPI-4', tooth: '#46', procedure: 'Molar Root Canal Treatment (Rotary)', cost: 6500, status: 'In Progress' },
        { id: 'TPI-5', tooth: '#46', procedure: 'PFM Crown with Post & Core', cost: 7000, status: 'Planned' },
        { id: 'TPI-6', tooth: '#47', procedure: 'MO Composite Filling', cost: 2000, status: 'Planned' }
      ],
      totalCost: 15500
    },
    {
      id: 'TP-103',
      patientId: 'TKR-P-1004',
      patientName: 'Priya Sharma',
      title: 'Comprehensive Orthodontic Alignment',
      status: 'Active',
      createdAt: '2026-09-05',
      items: [
        { id: 'TPI-7', tooth: 'Both Arches', procedure: 'Ceramic Self-Ligating Braces', cost: 45000, status: 'Planned' },
        { id: 'TPI-8', tooth: '#12', procedure: 'Composite Aesthetic Restoration', cost: 2200, status: 'Planned' }
      ],
      totalCost: 47200
    }
  ],
  prescriptions: [
    {
      id: 'RX-101',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      doctorName: 'Dr. E. Rajalakshmi',
      date: '2026-09-02',
      medications: [
        { name: 'Ibuprofen 400mg', dosage: '1 Tablet', frequency: 'Twice daily (after food)', duration: '3 Days', instructions: 'Take when needed for dental pain' },
        { name: 'Chlorhexidine 0.2% Mouthwash', dosage: '10 ml rinse', frequency: 'Twice daily', duration: '5 Days', instructions: 'Rinse for 60 seconds after brushing' }
      ],
      instructions: 'Avoid hard or sticky foods on left side for 24 hours.'
    },
    {
      id: 'RX-102',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      doctorName: 'Dr. E. Rajalakshmi',
      date: '2026-09-09',
      medications: [
        { name: 'Amoxicillin + Clavulanate 625mg', dosage: '1 Tablet', frequency: 'Twice daily (after food)', duration: '5 Days', instructions: 'Complete full antibiotic course' },
        { name: 'Aceclofenac + Paracetamol 100/325mg', dosage: '1 Tablet', frequency: 'Twice daily', duration: '3 Days', instructions: 'Take for pain and swelling reduction' }
      ],
      instructions: 'Report immediately if swelling or fever increases.'
    }
  ],
  inventory: [
    { id: 'INV-1', name: 'Zirconia Crown Blanks (98mm)', category: 'Prosthodontics', stock: 18, unit: 'Pieces', minStock: 5, batch: 'ZR-2026-09', expiry: '2028-12-31', unitPrice: 3500 },
    { id: 'INV-2', name: 'Composite Resin Syringes (A2)', category: 'Restorative', stock: 12, unit: 'Syringes', minStock: 4, batch: 'CR-904', expiry: '2027-06-30', unitPrice: 1200 },
    { id: 'INV-3', name: 'Lignocaine 2% with Adrenaline 1:80000', category: 'Anesthesia', stock: 45, unit: 'Ampoules', minStock: 20, batch: 'LA-551', expiry: '2027-01-15', unitPrice: 45 },
    { id: 'INV-4', name: 'Amoxicillin + Clavulanate 625mg', category: 'Pharmacy', stock: 30, unit: 'Strips', minStock: 10, batch: 'AM-302', expiry: '2026-11-20', unitPrice: 180 },
    { id: 'INV-5', name: 'Chlorhexidine Mouthwash 200ml', category: 'Pharmacy', stock: 6, unit: 'Bottles', minStock: 10, batch: 'CHX-101', expiry: '2026-10-05', unitPrice: 140 },
    { id: 'INV-6', name: 'Rotary Endo NiTi Files (Assorted 25mm)', category: 'Restorative', stock: 15, unit: 'Packs', minStock: 5, batch: 'EF-801', expiry: '2028-04-15', unitPrice: 950 }
  ],
  invoices: [
    {
      id: 'INV-9001',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      date: '2026-09-02',
      items: [
        { description: 'Zirconia Crown Placement (#19)', tooth: '#19', quantity: 1, rate: 12000, amount: 12000 },
        { description: 'Ultrasonic Scaling & Polishing', tooth: 'Full Mouth', quantity: 1, rate: 1500, amount: 1500 }
      ],
      subtotal: 13500,
      discount: 500,
      total: 13000,
      paid: 13000,
      balance: 0,
      paymentMode: 'UPI QR',
      status: 'Paid'
    },
    {
      id: 'INV-9002',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      date: '2026-09-09',
      items: [
        { description: 'Consultation & Digital RVG X-Ray', tooth: '#46', quantity: 1, rate: 800, amount: 800 },
        { description: 'Molar RCT Step 1 (Biomechanical Prep)', tooth: '#46', quantity: 1, rate: 3500, amount: 3500 }
      ],
      subtotal: 4300,
      discount: 0,
      total: 4300,
      paid: 2000,
      balance: 2300,
      paymentMode: 'Cash',
      status: 'Partial'
    },
    {
      id: 'INV-9003',
      patientId: 'TKR-P-1004',
      patientName: 'Priya Sharma',
      date: '2026-09-05',
      items: [
        { description: 'Orthodontic Diagnostic Workup & Ceph Analysis', tooth: 'Bimaxillary', quantity: 1, rate: 5000, amount: 5000 }
      ],
      subtotal: 5000,
      discount: 0,
      total: 5000,
      paid: 0,
      balance: 5000,
      paymentMode: 'Card',
      status: 'Unpaid'
    }
  ],
  labOrders: [
    {
      id: 'LAB-101',
      patientId: 'TKR-P-1001',
      patientName: 'Rahul Verma',
      labName: 'DentCare Dental Lab',
      item: 'Monolithic Zirconia Crown',
      toothNumber: '#19',
      shade: 'A2 (VITA 3D Master)',
      sentDate: '2026-08-26',
      expectedDate: '2026-09-01',
      status: 'Fitted',
      cost: 4500
    },
    {
      id: 'LAB-102',
      patientId: 'TKR-P-1003',
      patientName: 'K. Venkatesan',
      labName: 'Apex Precision Lab',
      item: 'PFM Crown with Collarless Metal Margin',
      toothNumber: '#46',
      shade: 'A3 (VITA)',
      sentDate: '2026-09-09',
      expectedDate: '2026-09-14',
      status: 'Sent',
      cost: 2800
    },
    {
      id: 'LAB-103',
      patientId: 'TKR-P-1002',
      patientName: 'Ananya Deshmukh',
      labName: 'Modern ClearAligners Lab',
      item: 'Set of 12 Upper & Lower Aligners',
      toothNumber: 'Both Arches',
      shade: 'Clear Transparent',
      sentDate: '2026-08-10',
      expectedDate: '2026-08-20',
      status: 'Received',
      cost: 18000
    }
  ]
};

function initDb() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, returning initial data', err);
    return INITIAL_DATA;
  }
}

function writeDb(data) {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readDb,
  writeDb,
  initDb,
  INITIAL_DATA
};
