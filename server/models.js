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
  lastVisit: String
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
  status: String
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
