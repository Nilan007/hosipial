import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
  name: String,
  dept: String,
  avatar: String,
  doctorId: String,
  staffId: String
});

const PatientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: Number,
  gender: String,
  dob: String,
  blood: String,
  phone: String,
  email: String,
  address: String,
  insurance: String,
  emergency: String,
  emergencyPhone: String,
  allergies: [String],
  chronic: [String],
  regDate: String,
  status: String,
  lastVisit: String,
  fasttrackSubscription: {
    status: { type: String, default: 'Inactive' },
    planName: { type: String, default: '' },
    pricePaid: { type: Number, default: 0 },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    priorityTier: { type: String, default: 'Normal' },
    autoRenew: { type: Boolean, default: false }
  }
});

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  doctorId: String,
  doctorName: String,
  dept: String,
  date: String,
  time: String,
  type: String,
  status: String,
  token: String,
  notes: String
});

const WardSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  beds: Number,
  occupied: Number,
  type: String
});

const BedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  wardId: String,
  wardName: String,
  roomNo: String,
  bedNo: String,
  type: String,
  status: String,
  patientId: String,
  patientName: String,
  admitDate: String,
  rate: Number
});

const BillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  date: String,
  type: String,
  items: [{
    desc: String,
    qty: Number,
    rate: Number,
    amount: Number
  }],
  subtotal: Number,
  gst: Number,
  discount: Number,
  total: Number,
  paid: Number,
  balance: Number,
  status: String,
  payment: String
});

const LabTestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  doctorId: String,
  testName: String,
  category: String,
  ordered: String,
  collected: String,
  status: String,
  result: mongoose.Schema.Types.Mixed,
  criticalValues: Boolean,
  cost: Number
});

const PrescriptionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  doctorId: String,
  doctorName: String,
  date: String,
  diagnosis: String,
  medicines: [{
    name: String,
    dosage: String,
    duration: String,
    instructions: String
  }],
  status: String,
  pharmacy: String
});

const DrugInventorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  category: String,
  form: String,
  manufacturer: String,
  batch: String,
  expiry: String,
  stock: Number,
  minStock: Number,
  mrp: Number,
  purchaseRate: Number,
  unit: String,
  location: String,
  lowStock: Boolean,
  controlled: Boolean
});

const StaffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  role: String,
  dept: String,
  phone: String,
  email: String,
  shift: String,
  attendance: String,
  salary: Number,
  joinDate: String,
  status: String,
  details: mongoose.Schema.Types.Mixed // holds detailed qualifications, bank info, tax options, etc.
});

const RadiologyScanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  doctorId: String,
  type: String,
  modality: String,
  date: String,
  time: String,
  status: String,
  radiologist: String,
  finding: String,
  cost: Number
});

const AuditLogSchema = new mongoose.Schema({
  time: String,
  user: String,
  ip: String,
  module: String,
  action: String,
  severity: String
});

const SurgerySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  surgeonId: String,
  surgeon: String,
  procedure: String,
  date: String,
  time: String,
  duration: String,
  theatre: String,
  anesthetist: String,
  status: String,
  outcome: String
});

const InsuranceClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  insurer: String,
  tpa: String,
  claimType: String,
  admitDate: String,
  claimAmount: Number,
  approved: Number,
  rejected: Number,
  status: String,
  submitted: String,
  settled: String
});

const AmbulanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  regNo: String,
  type: String,
  driver: String,
  phone: String,
  status: String,
  lat: Number,
  lng: Number
});

export const User = mongoose.model('User', UserSchema);
export const Patient = mongoose.model('Patient', PatientSchema);
export const Appointment = mongoose.model('Appointment', AppointmentSchema);
export const Ward = mongoose.model('Ward', WardSchema);
export const Bed = mongoose.model('Bed', BedSchema);
export const Bill = mongoose.model('Bill', BillSchema);
export const LabTest = mongoose.model('LabTest', LabTestSchema);
export const Prescription = mongoose.model('Prescription', PrescriptionSchema);
export const DrugInventory = mongoose.model('DrugInventory', DrugInventorySchema);
export const Staff = mongoose.model('Staff', StaffSchema);
export const RadiologyScan = mongoose.model('RadiologyScan', RadiologyScanSchema);
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export const Surgery = mongoose.model('Surgery', SurgerySchema);
export const InsuranceClaim = mongoose.model('InsuranceClaim', InsuranceClaimSchema);
export const Ambulance = mongoose.model('Ambulance', AmbulanceSchema);

// Outside Lab Commission Management Models
const OutsideLabSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  commissionRate: { type: Number, required: true, default: 20 },
  billingCycle: { type: String, required: true, default: 'Monthly' },
  status: { type: String, default: 'Active' }
});

const OutsideReferralSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  labId: String,
  labName: String,
  scanType: String,
  date: String,
  totalAmount: Number,
  commissionRate: Number,
  commissionAmount: Number,
  billingStatus: { type: String, default: 'Pending' },
  invoiceId: String
});

const OutsideLabInvoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  labId: String,
  labName: String,
  startDate: String,
  endDate: String,
  referralCount: Number,
  totalBillingValue: Number,
  totalCommission: Number,
  billingCycle: String,
  dateGenerated: String,
  status: { type: String, default: 'Unpaid' },
  paymentDate: String
});

export const OutsideLab = mongoose.model('OutsideLab', OutsideLabSchema);
export const OutsideReferral = mongoose.model('OutsideReferral', OutsideReferralSchema);
export const OutsideLabInvoice = mongoose.model('OutsideLabInvoice', OutsideLabInvoiceSchema);

// Accounting & Ledger System
const FinancialTransactionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  category: { type: String, required: true }, // 'Patient Billing', 'Inventory Purchase', 'Salary', 'Rent', 'Utilities', 'Commission', etc.
  description: String,
  type: { type: String, required: true, enum: ['Income', 'Expense'] },
  amount: { type: Number, required: true },
  status: { type: String, default: 'Settled', enum: ['Settled', 'Pending'] }, // Settled (Completed) vs Pending (Receivable/Payable)
  dueDate: String,
  referenceId: String,
  partyName: { type: String, default: 'General' },
  paymentMethod: { type: String, default: 'Cash' },
  bankAccount: { type: String, default: 'Cash Drawer' }
});

export const FinancialTransaction = mongoose.model('FinancialTransaction', FinancialTransactionSchema);

// Vendor Management
const VendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: String,
  phone: String,
  email: String,
  address: String,
  taxId: String, // GST/PAN
  bankName: String,
  bankAccount: String,
  ifscCode: String,
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
});

export const Vendor = mongoose.model('Vendor', VendorSchema);

// Procurement & Logistics Hub
const ProcurementOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  itemName: { type: String }, // default fallback
  category: { type: String }, // default fallback
  vendor: { type: String, required: true },
  qty: { type: Number },
  totalCost: { type: Number, required: true },
  dateOrdered: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Paid & Received'] },
  
  // Advanced fields
  paymentTerms: { type: String, default: 'COD' },
  expectedDeliveryDate: { type: String },
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  items: [{
    itemName: String,
    category: String,
    qty: Number,
    unitCost: Number,
    subtotal: Number
  }]
});

export const ProcurementOrder = mongoose.model('ProcurementOrder', ProcurementOrderSchema);

// Asset & Machine Management
const AssetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  department: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  serialNumber: { type: String, required: true },
  worth: { type: Number, required: true },
  status: { type: String, default: 'Operational', enum: ['Operational', 'Under Maintenance', 'Calibrating', 'Out of Order'] },
  purchaseDate: String,
  lastServiceDate: String,
  nextServiceDate: String,
  maintenanceNotes: String
});

export const Asset = mongoose.model('Asset', AssetSchema);

// ─── RBAC: Extend User with module permissions ──────────────────────────────
const SystemUserSchema = new mongoose.Schema({
  id: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
  name: String,
  dept: String,
  avatar: { type: String, default: '👤' },
  doctorId: String,
  staffId: String,
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  permissions: [String], // list of allowed paths e.g. ['/dashboard', '/patients', ...]
  createdAt: { type: String, default: () => new Date().toISOString() },
  lastLogin: String
});
export const SystemUser = mongoose.model('SystemUser', SystemUserSchema);

// ─── DIET & NUTRITION ────────────────────────────────────────────────────────
const DietPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  patientName: { type: String, required: true },
  nutritionist: String,
  dietType: { type: String, default: 'General' }, // Diabetic, Cardiac, Renal, General, Post-Op, High Protein, Vegan, Soft Diet
  calories: { type: Number, default: 1800 },
  protein: Number,
  carbs: Number,
  fat: Number,
  allergies: [String],
  breakfast: String,
  lunch: String,
  dinner: String,
  eveningSnack: String,
  morningSnack: String,
  fluids: String,
  restrictions: String,
  notes: String,
  startDate: String,
  endDate: String,
  status: { type: String, default: 'Active', enum: ['Active', 'Completed', 'On Hold', 'Cancelled'] },
  ward: String,
  bedNo: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});
export const DietPlan = mongoose.model('DietPlan', DietPlanSchema);

// ─── HOUSEKEEPING ────────────────────────────────────────────────────────────
const HousekeepingTaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  roomNo: String,
  ward: String,
  floor: String,
  taskType: { type: String, default: 'Cleaning' }, // Cleaning, Sanitization, Linen Change, Waste Disposal, Deep Cleaning, Terminal Cleaning
  assignedTo: String,
  supervisedBy: String,
  priority: { type: String, default: 'Normal', enum: ['Urgent', 'High', 'Normal', 'Low'] },
  status: { type: String, default: 'Pending', enum: ['Pending', 'In Progress', 'Completed', 'Skipped'] },
  scheduledTime: String,
  completedTime: String,
  shift: { type: String, default: 'Morning' },
  notes: String,
  checklistItems: [String],
  createdAt: { type: String, default: () => new Date().toISOString() }
});
export const HousekeepingTask = mongoose.model('HousekeepingTask', HousekeepingTaskSchema);

// ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────
const MedicalRecordSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  mrn: String,
  doctorId: String,
  doctorName: String,
  recordType: { type: String, required: true }, // Discharge Summary, OT Notes, Lab Report, Radiology, Prescription, Certificate, Consent, Referral
  date: String,
  department: String,
  diagnosis: String,
  content: String,
  tags: [String],
  confidential: { type: Boolean, default: false },
  status: { type: String, default: 'Active' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});
export const MedicalRecord = mongoose.model('MedicalRecord', MedicalRecordSchema);

// ─── CRM ─────────────────────────────────────────────────────────────────────
const CRMEntrySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  phone: String,
  type: { type: String, default: 'Follow-up' }, // Follow-up, Complaint, Feedback, Enquiry, Appointment, Grievance
  urgency: { type: String, default: 'Normal', enum: ['Critical', 'High', 'Normal', 'Low'] },
  status: { type: String, default: 'Open', enum: ['Open', 'In Progress', 'Resolved', 'Closed'] },
  assignedTo: String,
  department: String,
  subject: String,
  description: String,
  rating: Number, // 1-5 star rating (for feedback)
  resolvedNotes: String,
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: String,
  resolvedAt: String,
  followUpDate: String,
  source: { type: String, default: 'Walk-in' } // Walk-in, Phone, Email, WhatsApp, Website
});
export const CRMEntry = mongoose.model('CRMEntry', CRMEntrySchema);

// ─── COMPLIANCE ──────────────────────────────────────────────────────────────
const ComplianceItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true }, // NABH, HIPAA, Fire Safety, Biomedical Waste, Drug License, Labour Law, AERB, Quality
  description: String,
  responsibleOfficer: String,
  department: String,
  dueDate: String,
  lastAuditDate: String,
  nextAuditDate: String,
  status: { type: String, default: 'Compliant', enum: ['Compliant', 'Due Soon', 'Overdue', 'Under Review', 'Non-Compliant'] },
  certificateNo: String,
  issuedBy: String,
  validFrom: String,
  validUntil: String,
  notes: String,
  actionRequired: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});
export const ComplianceItem = mongoose.model('ComplianceItem', ComplianceItemSchema);

// Inpatient Discharge Feedback Schema
const DischargeFeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientId: String,
  patientName: String,
  dischargeDate: String,
  doctorRating: Number,
  nurseRating: Number,
  cleanlinessRating: Number,
  foodRating: Number,
  billingRating: Number,
  recommend: String, // "Yes" / "No"
  comments: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});
export const DischargeFeedback = mongoose.model('DischargeFeedback', DischargeFeedbackSchema);

