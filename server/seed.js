import mongoose from 'mongoose';
import {
  User, Patient, Appointment, Ward, Bed, Bill, LabTest,
  Prescription, DrugInventory, Staff, RadiologyScan, AuditLog,
  Surgery, InsuranceClaim, Ambulance,
  OutsideLab, OutsideReferral, OutsideLabInvoice
} from './models.js';

const MONGODB_URI = 'mongodb+srv://antig9992_db_user:JYWaeWx8TEr9dzw5@cluster0.qsz86jd.mongodb.net/hms?retryWrites=true&w=majority';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Cleaning database collections...');

    await User.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Ward.deleteMany({});
    await Bed.deleteMany({});
    await Bill.deleteMany({});
    await LabTest.deleteMany({});
    await Prescription.deleteMany({});
    await DrugInventory.deleteMany({});
    await Staff.deleteMany({});
    await RadiologyScan.deleteMany({});
    await AuditLog.deleteMany({});
    await Surgery.deleteMany({});
    await InsuranceClaim.deleteMany({});
    await Ambulance.deleteMany({});
    await OutsideLab.deleteMany({});
    await OutsideReferral.deleteMany({});
    await OutsideLabInvoice.deleteMany({});

    console.log('Collections cleared. Seeding datasets...');

    // Users
    const users = [
      { id: 'U001', username: 'admin', password: 'admin123', role: 'Administrator', name: 'Dr. Admin Kumar', dept: 'Administration', avatar: 'AK' },
      { id: 'U002', username: 'doctor', password: 'doctor123', role: 'Doctor', name: 'Dr. Anand Krishnamurthy', dept: 'Cardiology', avatar: 'AK', doctorId: 'DOC-001' },
      { id: 'U003', username: 'nurse', password: 'nurse123', role: 'Nurse', name: 'Geetha Selvaraj', dept: 'General Ward', avatar: 'GS', staffId: 'STF-002' },
      { id: 'U004', username: 'receptionist', password: 'recept123', role: 'Receptionist', name: 'Siva Kumar', dept: 'OPD', avatar: 'SK', staffId: 'STF-005' },
      { id: 'U005', username: 'pharmacist', password: 'pharma123', role: 'Pharmacist', name: 'Muthu Krishnan', dept: 'Pharmacy', avatar: 'MK', staffId: 'STF-003' },
      { id: 'U006', username: 'labtech', password: 'lab123', role: 'Lab Technician', name: 'Padmavathi Raman', dept: 'Laboratory', avatar: 'PR', staffId: 'STF-004' },
      { id: 'U007', username: 'management', password: 'mgmt123', role: 'Management', name: 'R. Subramaniam', dept: 'Executive', avatar: 'RS' },
      { id: 'U008', username: 'cashier', password: 'cash123', role: 'Cashier', name: 'Chitra Annamalai', dept: 'Billing', avatar: 'CA', staffId: 'STF-008' },
    ];
    await User.insertMany(users);

    // Patients
    const pats = [
      { id: 'MRN-10001', name: 'Rajesh Kumar', age: 45, gender: 'Male', dob: '1979-03-15', blood: 'B+', phone: '9876543210', email: 'rajesh.k@gmail.com', address: '12, Gandhi Nagar, Chennai', insurance: 'Star Health - SH78934', emergency: 'Priya Kumar', emergencyPhone: '9876543211', allergies: ['Penicillin'], chronic: ['Hypertension', 'Diabetes Type 2'], regDate: '2024-01-10', status: 'Active', lastVisit: '2026-06-28', fasttrackSubscription: { status: 'Active', planName: 'VIP Fasttrack Pass', pricePaid: 999, startDate: '2026-07-01', endDate: '2026-08-01', priorityTier: 'High', autoRenew: true } },
      { id: 'MRN-10002', name: 'Priya Sharma', age: 32, gender: 'Female', dob: '1992-07-22', blood: 'O+', phone: '9123456789', email: 'priya.s@gmail.com', address: '45, Anna Nagar, Chennai', insurance: 'HDFC Ergo - HE45621', emergency: 'Vikram Sharma', emergencyPhone: '9123456780', allergies: ['Sulfa'], chronic: ['Asthma'], regDate: '2024-02-18', status: 'Active', lastVisit: '2026-07-01', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } },
      { id: 'MRN-10003', name: 'Mohammed Ali', age: 58, gender: 'Male', dob: '1966-11-05', blood: 'A-', phone: '9345678901', email: 'mali@yahoo.com', address: '7, T.Nagar, Chennai', insurance: 'New India Assurance', emergency: 'Fatima Ali', emergencyPhone: '9345678902', allergies: [], chronic: ['COPD', 'Heart Disease'], regDate: '2023-11-20', status: 'Admitted', lastVisit: '2026-07-04', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } },
      { id: 'MRN-10004', name: 'Lakshmi Devi', age: 67, gender: 'Female', dob: '1957-05-30', blood: 'AB+', phone: '9567890123', email: 'lakshmi.d@gmail.com', address: '33, Velachery, Chennai', insurance: 'United India', emergency: 'Suresh Devi', emergencyPhone: '9567890124', allergies: ['Aspirin', 'Ibuprofen'], chronic: ['Arthritis', 'Osteoporosis'], regDate: '2023-08-05', status: 'Active', lastVisit: '2026-06-15', fasttrackSubscription: { status: 'Active', planName: 'VIP Fasttrack Pass', pricePaid: 999, startDate: '2026-07-05', endDate: '2026-08-05', priorityTier: 'High', autoRenew: false } },
      { id: 'MRN-10005', name: 'Arun Patel', age: 28, gender: 'Male', dob: '1996-12-12', blood: 'O-', phone: '9789012345', email: 'arun.p@gmail.com', address: '8, Adyar, Chennai', insurance: 'Bajaj Allianz', emergency: 'Meena Patel', emergencyPhone: '9789012346', allergies: [], chronic: [], regDate: '2025-01-08', status: 'Active', lastVisit: '2026-07-02', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } },
      { id: 'MRN-10006', name: 'Kavitha Nair', age: 41, gender: 'Female', dob: '1983-08-25', blood: 'B-', phone: '9890123456', email: 'kavitha.n@gmail.com', address: '22, Porur, Chennai', insurance: 'Max Bupa', emergency: 'Nair Suresh', emergencyPhone: '9890123457', allergies: ['Latex'], chronic: ['Hypothyroidism'], regDate: '2024-05-12', status: 'Active', lastVisit: '2026-06-20', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } },
      { id: 'MRN-10007', name: 'Senthil Murugan', age: 52, gender: 'Male', dob: '1972-02-18', blood: 'A+', phone: '9012345678', email: 'senthil.m@gmail.com', address: '15, Tambaram, Chennai', insurance: 'Oriental Insurance', emergency: 'Geetha Murugan', emergencyPhone: '9012345679', allergies: ['Morphine'], chronic: ['Diabetes Type 1', 'CKD'], regDate: '2023-06-30', status: 'Critical', lastVisit: '2026-07-05', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } },
    ];
    await Patient.insertMany(pats);

    // Appointments
    const apts = [
      { id: 'APT-5001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Anand K.', dept: 'Cardiology', date: '2026-07-07', time: '09:00', type: 'Online', status: 'Confirmed', token: 'T-001', notes: 'Follow-up for ECG' },
      { id: 'APT-5002', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', doctorName: 'Dr. Lakshmi Priya', dept: 'Gynecology', date: '2026-07-07', time: '11:00', type: 'Walk-in', status: 'Waiting', token: 'T-002', notes: 'Antenatal check-up' },
      { id: 'APT-5003', patientId: 'MRN-10005', patientName: 'Arun Patel', doctorId: 'DOC-005', doctorName: 'Dr. Ramesh Narayanan', dept: 'General Medicine', date: '2026-07-07', time: '09:30', type: 'Online', status: 'In Progress', token: 'T-003', notes: 'Fever for 3 days' },
      { id: 'APT-5004', patientId: 'MRN-10006', patientName: 'Kavitha Nair', doctorId: 'DOC-002', doctorName: 'Dr. Meena Rajan', dept: 'Neurology', date: '2026-07-07', time: '10:00', type: 'Walk-in', status: 'Confirmed', token: 'T-004', notes: 'Headache and dizziness' },
    ];
    await Appointment.insertMany(apts);

    // Wards
    const wrds = [
      { id: 'W-001', name: 'General Ward - Male', beds: 30, occupied: 22, type: 'General' },
      { id: 'W-002', name: 'General Ward - Female', beds: 30, occupied: 18, type: 'General' },
      { id: 'W-003', name: 'ICU', beds: 10, occupied: 8, type: 'ICU' },
      { id: 'W-006', name: 'Private Suite', beds: 20, occupied: 14, type: 'Private' },
    ];
    await Ward.insertMany(wrds);

    // Beds
    const bds = [
      { id: 'B-001', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1A', type: 'General', status: 'Occupied', patientId: 'MRN-10003', patientName: 'Mohammed Ali', admitDate: '2026-07-02', rate: 1200 },
      { id: 'B-002', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1B', type: 'General', status: 'Vacant', patientId: null, patientName: null, admitDate: null, rate: 1200 },
      { id: 'B-003', wardId: 'W-003', wardName: 'ICU', roomNo: 'ICU-1', bedNo: 'ICU-1', type: 'ICU', status: 'Occupied', patientId: 'MRN-10007', patientName: 'Senthil Murugan', admitDate: '2026-07-04', rate: 8000 },
    ];
    await Bed.insertMany(bds);

    // Bills
    const bls = [
      { id: 'INV-2001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', date: '2026-07-05', type: 'IP', items: [{desc: 'Room Charge (3 days)', qty: 3, rate: 5000, amount: 15000},{desc: 'Consultation', qty: 1, rate: 800, amount: 800}], subtotal: 15800, gst: 1422, discount: 0, total: 17222, paid: 10000, balance: 7222, status: 'Partial', payment: 'Cash' },
      { id: 'INV-2002', patientId: 'MRN-10002', patientName: 'Priya Sharma', date: '2026-07-06', type: 'OP', items: [{desc: 'Consultation - OBG', qty: 1, rate: 600, amount: 600}], subtotal: 600, gst: 54, discount: 54, total: 600, paid: 600, balance: 0, status: 'Paid', payment: 'Card' },
    ];
    await Bill.insertMany(bls);

    // Lab Tests
    const labs = [
      { id: 'LAB-3001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', testName: 'Complete Blood Count (CBC)', category: 'Hematology', ordered: '2026-07-05 09:30', collected: '2026-07-05 10:00', status: 'Completed', result: { Hemoglobin: '13.2 g/dL', WBC: '7800 /μL', Platelets: '2.1 L/μL' }, criticalValues: false, cost: 600 },
      { id: 'LAB-3002', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', testName: 'Lipid Profile', category: 'Biochemistry', ordered: '2026-07-05 09:30', collected: '2026-07-05 10:00', status: 'Completed', result: { 'Total Cholesterol': '218 mg/dL ⚠', LDL: '142 mg/dL ⚠' }, criticalValues: true, cost: 900 },
    ];
    await LabTest.insertMany(labs);

    // Prescriptions
    const rx = [
      { id: 'RX-4001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Anand K.', date: '2026-07-05', diagnosis: 'Hypertension', medicines: [{ name: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 days', instructions: 'After food' }], status: 'Dispensed', pharmacy: 'PHM-001' },
      { id: 'RX-4002', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', doctorName: 'Dr. Lakshmi Priya', date: '2026-07-06', diagnosis: 'Iron Deficiency', medicines: [{ name: 'Folic Acid 5mg', dosage: '1-0-0', duration: '60 days', instructions: 'Morning' }], status: 'Pending', pharmacy: null },
    ];
    await Prescription.insertMany(rx);

    // Drug inventory
    const drugsList = [
      { id: 'DRG-001', name: 'Paracetamol 500mg', category: 'Analgesic', form: 'Tablet', manufacturer: 'Sun Pharma', batch: 'B2024-001', expiry: '2026-12-31', stock: 5000, minStock: 500, mrp: 3.50, purchaseRate: 1.80, unit: 'Tablet', location: 'R-A-01', lowStock: false, controlled: false },
      { id: 'DRG-002', name: 'Amlodipine 5mg', category: 'Antihypertensive', form: 'Tablet', manufacturer: 'Cipla', batch: 'B2024-022', expiry: '2027-03-31', stock: 2000, minStock: 200, mrp: 8.50, purchaseRate: 3.20, unit: 'Tablet', location: 'R-B-02', lowStock: false, controlled: false },
      { id: 'DRG-004', name: 'Amoxicillin 500mg', category: 'Antibiotic', form: 'Capsule', manufacturer: 'Abbott', batch: 'B2024-088', expiry: '2026-09-30', stock: 180, minStock: 200, mrp: 18.00, purchaseRate: 7.50, unit: 'Capsule', location: 'R-C-01', lowStock: true, controlled: false },
    ];
    await DrugInventory.insertMany(drugsList);

    // Staff
    const stf = [
      { id: 'STF-001', name: 'Anil Ramachandran', role: 'Nurse', dept: 'ICU', phone: '9700000001', email: 'anil.r@medicore.com', shift: 'Morning', attendance: 'Present', salary: 35000, joinDate: '2021-06-01', status: 'Active' },
      { id: 'STF-002', name: 'Geetha Selvaraj', role: 'Nurse', dept: 'General Ward', phone: '9700000002', email: 'geetha.s@medicore.com', shift: 'Evening', attendance: 'Present', salary: 32000, joinDate: '2020-09-15', status: 'Active' },
      { id: 'STF-003', name: 'Muthu Krishnan', role: 'Pharmacist', dept: 'Pharmacy', phone: '9700000003', email: 'muthu.k@medicore.com', shift: 'Morning', attendance: 'Leave', salary: 40000, joinDate: '2019-11-01', status: 'Active' },
    ];
    await Staff.insertMany(stf);

    // Radiology
    const rad = [
      { id: 'RAD-6001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', type: 'Echocardiogram', modality: 'Echo', date: '2026-07-05', time: '14:00', status: 'Reported', radiologist: 'Dr. Murugesan P.', finding: 'EF 55%. Normal ventricular sizes.', cost: 2500 },
    ];
    await RadiologyScan.insertMany(rad);

    // Audit logs
    const audits = [
      { time: '2026-07-06 17:51:22', user: 'admin', ip: '192.168.1.45', module: 'Auth', action: 'User login success', severity: 'Info' },
      { time: '2026-07-06 17:48:10', user: 'doctor', ip: '192.168.1.102', module: 'EMR', action: 'Accessed Patient Record MRN-10007', severity: 'Warning' },
    ];
    await AuditLog.insertMany(audits);

    // Surgeries
    const surg = [
      { id: 'OT-7001', patientId: 'MRN-10004', patientName: 'Lakshmi Devi', surgeonId: 'DOC-003', surgeon: 'Dr. Suresh Babu', procedure: 'Total Knee Replacement', date: '2026-07-05', time: '09:00', duration: '3h 20m', theatre: 'OT-1', anesthetist: 'Dr. Krishnan', status: 'Completed', outcome: 'Successful' },
    ];
    await Surgery.insertMany(surg);

    // Claims
    const claims = [
      { id: 'CLM-8001', patientId: 'MRN-10003', patientName: 'Mohammed Ali', insurer: 'New India Assurance', tpa: 'Paramount TPA', claimType: 'Cashless', admitDate: '2026-07-02', claimAmount: 11926, approved: 10000, rejected: 1926, status: 'Partial Approved', submitted: '2026-07-03', settled: null },
    ];
    await InsuranceClaim.insertMany(claims);

    // Ambulances
    const amb = [
      { id: 'AMB-001', regNo: 'TN-01-AB-1234', type: 'Advanced Life Support', driver: 'Murugan S', phone: '9600000001', status: 'Available', lat: 13.0827, lng: 80.2707 },
      { id: 'AMB-002', regNo: 'TN-01-AB-5678', type: 'Basic Life Support', driver: 'Selvam K', phone: '9600000002', status: 'On Call', lat: 13.0752, lng: 80.2562 },
    ];
    await Ambulance.insertMany(amb);

    // Outside Radiology Labs Seeding
    const extLabs = [
      { id: 'LAB-EXT-001', name: 'Apex Imaging Center', contactPerson: 'Dr. R. K. Swamy', phone: '9840123450', email: 'contact@apeximaging.com', address: '15, Mount Road, Chennai', commissionRate: 20, billingCycle: 'Weekly', status: 'Active' },
      { id: 'LAB-EXT-002', name: 'Metro Radiology Lab', contactPerson: 'Sarah John', phone: '9840123451', email: 'info@metrorad.com', address: '88, Poonamallee High Road, Chennai', commissionRate: 15, billingCycle: '15 Days', status: 'Active' },
      { id: 'LAB-EXT-003', name: 'Precision Scan Hub', contactPerson: 'Ganesh Murthy', phone: '9840123452', email: 'billing@precisionscans.com', address: '204, OMR IT Expressway, Chennai', commissionRate: 30, billingCycle: 'Monthly', status: 'Active' }
    ];
    await OutsideLab.insertMany(extLabs);

    // Outside Referrals Seeding
    const extReferrals = [
      { id: 'REF-001', patientId: 'MRN-10002', patientName: 'Priya Sharma', labId: 'LAB-EXT-001', labName: 'Apex Imaging Center', scanType: 'Contrast MRI Spine', date: '2026-07-08', totalAmount: 8500, commissionRate: 20, commissionAmount: 1700, billingStatus: 'Pending', invoiceId: '' },
      { id: 'REF-002', patientId: 'MRN-10005', patientName: 'Arun Patel', labId: 'LAB-EXT-001', labName: 'Apex Imaging Center', scanType: 'CT Abdomen', date: '2026-07-09', totalAmount: 6000, commissionRate: 20, commissionAmount: 1200, billingStatus: 'Pending', invoiceId: '' },
      { id: 'REF-003', patientId: 'MRN-10006', patientName: 'Kavitha Nair', labId: 'LAB-EXT-002', labName: 'Metro Radiology Lab', scanType: 'HRCT Chest', date: '2026-07-02', totalAmount: 4500, commissionRate: 15, commissionAmount: 675, billingStatus: 'Invoiced', invoiceId: 'LINV-9001' },
      { id: 'REF-004', patientId: 'MRN-10008', patientName: 'Deepa Krishnan', labId: 'LAB-EXT-003', labName: 'Precision Scan Hub', scanType: 'PET Scan Whole Body', date: '2026-06-18', totalAmount: 22000, commissionRate: 30, commissionAmount: 6600, billingStatus: 'Settled', invoiceId: 'LINV-8001' }
    ];
    await OutsideReferral.insertMany(extReferrals);

    // Outside Lab Invoices Seeding
    const extInvoices = [
      { id: 'LINV-9001', labId: 'LAB-EXT-002', labName: 'Metro Radiology Lab', startDate: '2026-07-01', endDate: '2026-07-15', referralCount: 1, totalBillingValue: 4500, totalCommission: 675, billingCycle: '15 Days', dateGenerated: '2026-07-15', status: 'Unpaid' },
      { id: 'LINV-8001', labId: 'LAB-EXT-003', labName: 'Precision Scan Hub', startDate: '2026-06-01', endDate: '2026-06-30', referralCount: 1, totalBillingValue: 22000, totalCommission: 6600, billingCycle: 'Monthly', dateGenerated: '2026-06-30', status: 'Paid', paymentDate: '2026-07-02' }
    ];
    await OutsideLabInvoice.insertMany(extInvoices);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
