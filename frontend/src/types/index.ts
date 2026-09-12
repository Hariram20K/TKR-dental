export type UserRole = 'dentist' | 'patient' | 'admin';

export interface Vitals {
  bp: string;
  pulse: string;
  spo2: string;
  temp: string;
  sugar: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob?: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  medicalHistory: string[];
  allergies: string[];
  assignedDoctorId: string;
  registrationDate: string;
  balanceDue: number;
  totalVisits: number;
  vitals: Vitals;
  notes: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  room: string;
  specialty: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  availableDays: string[];
  slots: string[];
}

export type AppointmentStatus = 'Scheduled' | 'Checked In' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  chair: string;
  notes: string;
}

export type QueueStatus = 'waiting' | 'called' | 'in-consultation' | 'completed';

export interface QueueItem {
  id: string;
  token: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  arrivalTime: string;
  status: QueueStatus;
  room: string;
  priority: 'Normal' | 'Urgent' | 'Senior';
}

export type ToothConditionType = 
  | 'healthy'
  | 'caries'
  | 'filling'
  | 'crown'
  | 'rct'
  | 'implant'
  | 'missing'
  | 'extraction';

export type ToothSurface = 'O' | 'M' | 'D' | 'B' | 'L'; // Occlusal, Mesial, Distal, Buccal, Lingual

export interface ToothCondition {
  number: number;
  condition: ToothConditionType;
  surfaces: ToothSurface[];
  notes?: string;
}

export interface TreatmentItem {
  id: string;
  tooth: string;
  procedure: string;
  cost: number;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  status: 'Active' | 'Completed';
  createdAt: string;
  items: TreatmentItem[];
  totalCost: number;
}

export interface PrescriptionMed {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: PrescriptionMed[];
  instructions: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  batch: string;
  expiry: string;
  unitPrice: number;
}

export interface InvoiceItem {
  description: string;
  tooth?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  balance: number;
  paymentMode: 'Cash' | 'Card' | 'UPI QR' | 'Insurance';
  status: 'Paid' | 'Partial' | 'Unpaid';
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  labName: string;
  item: string;
  toothNumber: string;
  shade: string;
  sentDate: string;
  expectedDate: string;
  status: 'Sent' | 'In Production' | 'Received' | 'Fitted';
  cost: number;
}
