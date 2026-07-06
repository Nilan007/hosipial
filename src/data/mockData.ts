// =====================================================
// MOCK DATA — Hospital Management System
// =====================================================

export const HOSPITAL = {
  name: 'MediCore Multi-Specialty Hospital',
  shortName: 'MediCore HMS',
  tagline: 'Excellence in Healthcare',
  address: '42, Healthcare Avenue, Medical District, Chennai - 600 001, Tamil Nadu',
  phone: '+91-44-4567-8900',
  email: 'care@medicore-hospital.com',
  website: 'www.medicore-hospital.com',
  gstin: '33AABCM1234R1Z5',
  regNo: 'TN-MED-2010-00452',
  logo: 'MC',
};

// =====================================================
// PATIENTS
// =====================================================
export const patients = [
  { id: 'MRN-10001', name: 'Rajesh Kumar', age: 45, gender: 'Male', dob: '1979-03-15', blood: 'B+', phone: '9876543210', email: 'rajesh.k@gmail.com', address: '12, Gandhi Nagar, Chennai', insurance: 'Star Health - SH78934', emergency: 'Priya Kumar', emergencyPhone: '9876543211', allergies: ['Penicillin'], chronic: ['Hypertension', 'Diabetes Type 2'], regDate: '2024-01-10', status: 'Active', lastVisit: '2026-06-28' },
  { id: 'MRN-10002', name: 'Priya Sharma', age: 32, gender: 'Female', dob: '1992-07-22', blood: 'O+', phone: '9123456789', email: 'priya.s@gmail.com', address: '45, Anna Nagar, Chennai', insurance: 'HDFC Ergo - HE45621', emergency: 'Vikram Sharma', emergencyPhone: '9123456780', allergies: ['Sulfa'], chronic: ['Asthma'], regDate: '2024-02-18', status: 'Active', lastVisit: '2026-07-01' },
  { id: 'MRN-10003', name: 'Mohammed Ali', age: 58, gender: 'Male', dob: '1966-11-05', blood: 'A-', phone: '9345678901', email: 'mali@yahoo.com', address: '7, T.Nagar, Chennai', insurance: 'New India Assurance', emergency: 'Fatima Ali', emergencyPhone: '9345678902', allergies: [], chronic: ['COPD', 'Heart Disease'], regDate: '2023-11-20', status: 'Admitted', lastVisit: '2026-07-04' },
  { id: 'MRN-10004', name: 'Lakshmi Devi', age: 67, gender: 'Female', dob: '1957-05-30', blood: 'AB+', phone: '9567890123', email: 'lakshmi.d@gmail.com', address: '33, Velachery, Chennai', insurance: 'United India', emergency: 'Suresh Devi', emergencyPhone: '9567890124', allergies: ['Aspirin', 'Ibuprofen'], chronic: ['Arthritis', 'Osteoporosis'], regDate: '2023-08-05', status: 'Active', lastVisit: '2026-06-15' },
  { id: 'MRN-10005', name: 'Arun Patel', age: 28, gender: 'Male', dob: '1996-12-12', blood: 'O-', phone: '9789012345', email: 'arun.p@gmail.com', address: '8, Adyar, Chennai', insurance: 'Bajaj Allianz', emergency: 'Meena Patel', emergencyPhone: '9789012346', allergies: [], chronic: [], regDate: '2025-01-08', status: 'Active', lastVisit: '2026-07-02' },
  { id: 'MRN-10006', name: 'Kavitha Nair', age: 41, gender: 'Female', dob: '1983-08-25', blood: 'B-', phone: '9890123456', email: 'kavitha.n@gmail.com', address: '22, Porur, Chennai', insurance: 'Max Bupa', emergency: 'Nair Suresh', emergencyPhone: '9890123457', allergies: ['Latex'], chronic: ['Hypothyroidism'], regDate: '2024-05-12', status: 'Active', lastVisit: '2026-06-20' },
  { id: 'MRN-10007', name: 'Senthil Murugan', age: 52, gender: 'Male', dob: '1972-02-18', blood: 'A+', phone: '9012345678', email: 'senthil.m@gmail.com', address: '15, Tambaram, Chennai', insurance: 'Oriental Insurance', emergency: 'Geetha Murugan', emergencyPhone: '9012345679', allergies: ['Morphine'], chronic: ['Diabetes Type 1', 'CKD'], regDate: '2023-06-30', status: 'Critical', lastVisit: '2026-07-05' },
  { id: 'MRN-10008', name: 'Deepa Krishnan', age: 35, gender: 'Female', dob: '1989-04-10', blood: 'AB-', phone: '9134567890', email: 'deepa.k@gmail.com', address: '9, Chromepet, Chennai', insurance: 'Religare Health', emergency: 'Arjun Krishnan', emergencyPhone: '9134567891', allergies: [], chronic: ['Migraine'], regDate: '2024-09-22', status: 'Active', lastVisit: '2026-07-03' },
  { id: 'MRN-10009', name: 'Ravi Sundaram', age: 63, gender: 'Male', dob: '1961-09-07', blood: 'O+', phone: '9256789012', email: 'ravi.s@gmail.com', address: '28, Sholinganallur, Chennai', insurance: 'LIC Health Plus', emergency: 'Vani Sundaram', emergencyPhone: '9256789013', allergies: ['Codeine'], chronic: ['Parkinson\'s', 'Hypertension'], regDate: '2022-12-15', status: 'Admitted', lastVisit: '2026-07-04' },
  { id: 'MRN-10010', name: 'Anitha Ramesh', age: 29, gender: 'Female', dob: '1995-06-20', blood: 'B+', phone: '9378901234', email: 'anitha.r@gmail.com', address: '4, Kodambakkam, Chennai', insurance: 'ICICI Lombard', emergency: 'Ramesh Kumar', emergencyPhone: '9378901235', allergies: [], chronic: [], regDate: '2025-03-01', status: 'Active', lastVisit: '2026-06-30' },
  { id: 'MRN-10011', name: 'Vijay Anand', age: 37, gender: 'Male', dob: '1987-01-15', blood: 'A+', phone: '9400112233', email: 'vijay.a@gmail.com', address: '6, Nungambakkam, Chennai', insurance: 'Star Health', emergency: 'Rekha Anand', emergencyPhone: '9400112234', allergies: ['Cephalosporins'], chronic: ['Epilepsy'], regDate: '2024-11-10', status: 'Active', lastVisit: '2026-07-01' },
  { id: 'MRN-10012', name: 'Saranya Pillai', age: 26, gender: 'Female', dob: '1998-10-30', blood: 'O+', phone: '9511223344', email: 'saranya.p@gmail.com', address: '17, Perambur, Chennai', insurance: 'National Insurance', emergency: 'Pillai Raja', emergencyPhone: '9511223345', allergies: [], chronic: [], regDate: '2025-06-15', status: 'Active', lastVisit: '2026-07-05' },
];

// =====================================================
// DOCTORS
// =====================================================
export const doctors = [
  { id: 'DOC-001', name: 'Dr. Anand Krishnamurthy', specialization: 'Cardiology', qualification: 'MD, DM (Cardiology)', experience: 18, phone: '9800000001', email: 'anand.k@medicore.com', schedule: 'Mon-Fri 9AM-1PM', consultFee: 800, status: 'Available', patients: 1240, rating: 4.9, dept: 'OPD', regNo: 'TN-MCI-12345' },
  { id: 'DOC-002', name: 'Dr. Meena Rajan', specialization: 'Neurology', qualification: 'MD, DM (Neurology)', experience: 14, phone: '9800000002', email: 'meena.r@medicore.com', schedule: 'Mon-Sat 10AM-2PM', consultFee: 900, status: 'Available', patients: 980, rating: 4.8, dept: 'OPD', regNo: 'TN-MCI-12346' },
  { id: 'DOC-003', name: 'Dr. Suresh Babu', specialization: 'Orthopedics', qualification: 'MS (Ortho)', experience: 22, phone: '9800000003', email: 'suresh.b@medicore.com', schedule: 'Tue-Sat 9AM-12PM', consultFee: 700, status: 'In OT', patients: 1560, rating: 4.9, dept: 'OT', regNo: 'TN-MCI-12347' },
  { id: 'DOC-004', name: 'Dr. Lakshmi Priya', specialization: 'Gynecology & Obstetrics', qualification: 'MD, DNB (OBG)', experience: 12, phone: '9800000004', email: 'lakshmi.p@medicore.com', schedule: 'Mon-Fri 11AM-3PM', consultFee: 600, status: 'Available', patients: 2100, rating: 4.7, dept: 'OPD', regNo: 'TN-MCI-12348' },
  { id: 'DOC-005', name: 'Dr. Ramesh Narayanan', specialization: 'General Medicine', qualification: 'MD (Internal Medicine)', experience: 25, phone: '9800000005', email: 'ramesh.n@medicore.com', schedule: 'Mon-Sat 8AM-1PM', consultFee: 500, status: 'Consulting', patients: 3200, rating: 4.8, dept: 'OPD', regNo: 'TN-MCI-12349' },
  { id: 'DOC-006', name: 'Dr. Priya Sathish', specialization: 'Pediatrics', qualification: 'MD (Pediatrics)', experience: 10, phone: '9800000006', email: 'priya.s@medicore.com', schedule: 'Mon-Fri 9AM-12PM', consultFee: 600, status: 'Available', patients: 1800, rating: 4.9, dept: 'OPD', regNo: 'TN-MCI-12350' },
  { id: 'DOC-007', name: 'Dr. Karthik Ramamoorthy', specialization: 'General Surgery', qualification: 'MS (General Surgery)', experience: 16, phone: '9800000007', email: 'karthik.r@medicore.com', schedule: 'Tue-Sat 10AM-1PM', consultFee: 750, status: 'Available', patients: 1120, rating: 4.7, dept: 'OT', regNo: 'TN-MCI-12351' },
  { id: 'DOC-008', name: 'Dr. Vanitha Selvam', specialization: 'Dermatology', qualification: 'MD (Dermatology)', experience: 8, phone: '9800000008', email: 'vanitha.s@medicore.com', schedule: 'Mon-Fri 11AM-2PM', consultFee: 550, status: 'Available', patients: 940, rating: 4.6, dept: 'OPD', regNo: 'TN-MCI-12352' },
  { id: 'DOC-009', name: 'Dr. Murugesan Palaniswamy', specialization: 'Radiology', qualification: 'MD (Radiology)', experience: 20, phone: '9800000009', email: 'murugesan.p@medicore.com', schedule: 'Mon-Sat 9AM-5PM', consultFee: 400, status: 'Available', patients: 2600, rating: 4.8, dept: 'Radiology', regNo: 'TN-MCI-12353' },
  { id: 'DOC-010', name: 'Dr. Sowmya Balakrishnan', specialization: 'Psychiatry', qualification: 'MD (Psychiatry)', experience: 11, phone: '9800000010', email: 'sowmya.b@medicore.com', schedule: 'Mon-Fri 10AM-1PM', consultFee: 700, status: 'Available', patients: 680, rating: 4.7, dept: 'OPD', regNo: 'TN-MCI-12354' },
  { id: 'DOC-011', name: 'Dr. Balasubramaniam Raja', specialization: 'Urology', qualification: 'MCh (Urology)', experience: 15, phone: '9800000011', email: 'bala.r@medicore.com', schedule: 'Mon-Fri 8AM-12PM', consultFee: 850, status: 'Consulting', patients: 870, rating: 4.8, dept: 'OPD', regNo: 'TN-MCI-12355' },
  { id: 'DOC-012', name: 'Dr. Nithya Gopalakrishnan', specialization: 'Endocrinology', qualification: 'MD, DM (Endocrinology)', experience: 9, phone: '9800000012', email: 'nithya.g@medicore.com', schedule: 'Tue-Sat 9AM-1PM', consultFee: 750, status: 'Available', patients: 760, rating: 4.9, dept: 'OPD', regNo: 'TN-MCI-12356' },
];

// =====================================================
// APPOINTMENTS
// =====================================================
export const appointments = [
  { id: 'APT-5001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Anand Krishnamurthy', dept: 'Cardiology', date: '2026-07-07', time: '09:00', type: 'Online', status: 'Confirmed', token: 'T-001', notes: 'Follow-up for ECG' },
  { id: 'APT-5002', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', doctorName: 'Dr. Lakshmi Priya', dept: 'Gynecology', date: '2026-07-07', time: '11:00', type: 'Walk-in', status: 'Waiting', token: 'T-002', notes: 'Antenatal check-up' },
  { id: 'APT-5003', patientId: 'MRN-10005', patientName: 'Arun Patel', doctorId: 'DOC-005', doctorName: 'Dr. Ramesh Narayanan', dept: 'General Medicine', date: '2026-07-07', time: '09:30', type: 'Online', status: 'In Progress', token: 'T-003', notes: 'Fever for 3 days' },
  { id: 'APT-5004', patientId: 'MRN-10006', patientName: 'Kavitha Nair', doctorId: 'DOC-002', doctorName: 'Dr. Meena Rajan', dept: 'Neurology', date: '2026-07-07', time: '10:00', type: 'Walk-in', status: 'Confirmed', token: 'T-004', notes: 'Headache and dizziness' },
  { id: 'APT-5005', patientId: 'MRN-10008', patientName: 'Deepa Krishnan', doctorId: 'DOC-002', doctorName: 'Dr. Meena Rajan', dept: 'Neurology', date: '2026-07-07', time: '10:30', type: 'Walk-in', status: 'Confirmed', token: 'T-005', notes: 'Migraine review' },
  { id: 'APT-5006', patientId: 'MRN-10010', patientName: 'Anitha Ramesh', doctorId: 'DOC-006', doctorName: 'Dr. Priya Sathish', dept: 'Pediatrics', date: '2026-07-07', time: '09:00', type: 'Online', status: 'Completed', token: 'T-006', notes: 'Vaccination appointment' },
  { id: 'APT-5007', patientId: 'MRN-10011', patientName: 'Vijay Anand', doctorId: 'DOC-002', doctorName: 'Dr. Meena Rajan', dept: 'Neurology', date: '2026-07-07', time: '12:00', type: 'Online', status: 'Confirmed', token: 'T-007', notes: 'Epilepsy medication review' },
  { id: 'APT-5008', patientId: 'MRN-10012', patientName: 'Saranya Pillai', doctorId: 'DOC-008', doctorName: 'Dr. Vanitha Selvam', dept: 'Dermatology', date: '2026-07-08', time: '11:00', type: 'Walk-in', status: 'Confirmed', token: 'T-008', notes: 'Skin rash evaluation' },
  { id: 'APT-5009', patientId: 'MRN-10004', patientName: 'Lakshmi Devi', doctorId: 'DOC-003', doctorName: 'Dr. Suresh Babu', dept: 'Orthopedics', date: '2026-07-08', time: '09:30', type: 'Walk-in', status: 'Confirmed', token: 'T-009', notes: 'Knee pain - post-surgical follow-up' },
  { id: 'APT-5010', patientId: 'MRN-10007', patientName: 'Senthil Murugan', doctorId: 'DOC-001', doctorName: 'Dr. Anand Krishnamurthy', dept: 'Cardiology', date: '2026-07-08', time: '10:00', type: 'Teleconsult', status: 'Scheduled', token: 'T-010', notes: 'ECG review - cardiac monitoring' },
];

// =====================================================
// BEDS
// =====================================================
export const wards = [
  { id: 'W-001', name: 'General Ward - Male', beds: 30, occupied: 22, type: 'General' },
  { id: 'W-002', name: 'General Ward - Female', beds: 30, occupied: 18, type: 'General' },
  { id: 'W-003', name: 'ICU', beds: 10, occupied: 8, type: 'ICU' },
  { id: 'W-004', name: 'NICU', beds: 8, occupied: 5, type: 'NICU' },
  { id: 'W-005', name: 'Cardiac Care Unit', beds: 12, occupied: 9, type: 'CCU' },
  { id: 'W-006', name: 'Private Suite', beds: 20, occupied: 14, type: 'Private' },
  { id: 'W-007', name: 'Semi-Private', beds: 24, occupied: 17, type: 'Semi-Private' },
  { id: 'W-008', name: 'Pediatric Ward', beds: 16, occupied: 10, type: 'Pediatric' },
  { id: 'W-009', name: 'Maternity Ward', beds: 14, occupied: 11, type: 'Maternity' },
  { id: 'W-010', name: 'Emergency Ward', beds: 20, occupied: 13, type: 'Emergency' },
];

export const beds = [
  { id: 'B-001', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1A', type: 'General', status: 'Occupied', patientId: 'MRN-10003', patientName: 'Mohammed Ali', admitDate: '2026-07-02', rate: 1200 },
  { id: 'B-002', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1B', type: 'General', status: 'Vacant', patientId: null, patientName: null, admitDate: null, rate: 1200 },
  { id: 'B-003', wardId: 'W-003', wardName: 'ICU', roomNo: 'ICU-1', bedNo: 'ICU-1', type: 'ICU', status: 'Occupied', patientId: 'MRN-10007', patientName: 'Senthil Murugan', admitDate: '2026-07-04', rate: 8000 },
  { id: 'B-004', wardId: 'W-005', wardName: 'Cardiac Care Unit', roomNo: 'CCU-1', bedNo: 'CCU-1', type: 'CCU', status: 'Occupied', patientId: 'MRN-10009', patientName: 'Ravi Sundaram', admitDate: '2026-07-03', rate: 6000 },
  { id: 'B-005', wardId: 'W-006', wardName: 'Private Suite', roomNo: '201', bedNo: 'P-1', type: 'Private', status: 'Vacant', patientId: null, patientName: null, admitDate: null, rate: 5000 },
  { id: 'B-006', wardId: 'W-006', wardName: 'Private Suite', roomNo: '202', bedNo: 'P-2', type: 'Private', status: 'Occupied', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', admitDate: '2026-07-05', rate: 5000 },
  { id: 'B-007', wardId: 'W-008', wardName: 'Pediatric Ward', roomNo: 'PED-1', bedNo: 'PED-1', type: 'Pediatric', status: 'Vacant', patientId: null, patientName: null, admitDate: null, rate: 2000 },
  { id: 'B-008', wardId: 'W-009', wardName: 'Maternity Ward', roomNo: 'MAT-1', bedNo: 'MAT-1', type: 'Maternity', status: 'Occupied', patientId: 'MRN-10002', patientName: 'Priya Sharma', admitDate: '2026-07-06', rate: 3000 },
];

// =====================================================
// BILLS
// =====================================================
export const bills = [
  { id: 'INV-2001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', date: '2026-07-05', type: 'IP', items: [{desc: 'Room Charge (3 days)', qty: 3, rate: 5000, amount: 15000},{desc: 'Consultation', qty: 1, rate: 800, amount: 800},{desc: 'Lab Tests', qty: 1, rate: 2400, amount: 2400}], subtotal: 18200, gst: 1638, discount: 0, total: 19838, paid: 10000, balance: 9838, status: 'Partial', payment: 'Cash' },
  { id: 'INV-2002', patientId: 'MRN-10002', patientName: 'Priya Sharma', date: '2026-07-06', type: 'OP', items: [{desc: 'Consultation - OBG', qty: 1, rate: 600, amount: 600},{desc: 'Ultrasound', qty: 1, rate: 1800, amount: 1800}], subtotal: 2400, gst: 216, discount: 200, total: 2416, paid: 2416, balance: 0, status: 'Paid', payment: 'Card' },
  { id: 'INV-2003', patientId: 'MRN-10003', patientName: 'Mohammed Ali', date: '2026-07-04', type: 'IP', items: [{desc: 'General Ward (4 days)', qty: 4, rate: 1200, amount: 4800},{desc: 'Consultation', qty: 2, rate: 500, amount: 1000},{desc: 'Medicines', qty: 1, rate: 3200, amount: 3200},{desc: 'Lab Tests', qty: 3, rate: 800, amount: 2400}], subtotal: 11400, gst: 1026, discount: 500, total: 11926, paid: 0, balance: 11926, status: 'Unpaid', payment: 'Insurance' },
  { id: 'INV-2004', patientId: 'MRN-10005', patientName: 'Arun Patel', date: '2026-07-03', type: 'OP', items: [{desc: 'Consultation', qty: 1, rate: 500, amount: 500},{desc: 'Blood Test CBC', qty: 1, rate: 600, amount: 600},{desc: 'Medicines', qty: 1, rate: 450, amount: 450}], subtotal: 1550, gst: 139.5, discount: 0, total: 1689.5, paid: 1689.5, balance: 0, status: 'Paid', payment: 'UPI' },
  { id: 'INV-2005', patientId: 'MRN-10007', patientName: 'Senthil Murugan', date: '2026-07-04', type: 'IP', items: [{desc: 'ICU Charges (2 days)', qty: 2, rate: 8000, amount: 16000},{desc: 'Specialist Consultation', qty: 3, rate: 800, amount: 2400},{desc: 'ICU Medicines', qty: 1, rate: 12000, amount: 12000},{desc: 'Lab Tests', qty: 5, rate: 1200, amount: 6000}], subtotal: 36400, gst: 3276, discount: 2000, total: 37676, paid: 20000, balance: 17676, status: 'Partial', payment: 'Insurance' },
];

// =====================================================
// LAB TESTS
// =====================================================
export const labTests = [
  { id: 'LAB-3001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', testName: 'Complete Blood Count (CBC)', category: 'Hematology', ordered: '2026-07-05 09:30', collected: '2026-07-05 10:00', status: 'Completed', result: { Hemoglobin: '13.2 g/dL (12-16)', WBC: '7800 /μL (4000-11000)', RBC: '4.5 M/μL (3.8-5.4)', Platelets: '2.1 L/μL (1.5-4.0)', HCT: '42% (37-47)' }, criticalValues: false, cost: 600 },
  { id: 'LAB-3002', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', testName: 'Lipid Profile', category: 'Biochemistry', ordered: '2026-07-05 09:30', collected: '2026-07-05 10:00', status: 'Completed', result: { 'Total Cholesterol': '218 mg/dL (< 200) ⚠', LDL: '142 mg/dL (< 100) ⚠', HDL: '42 mg/dL (> 40)', Triglycerides: '188 mg/dL (< 150) ⚠' }, criticalValues: true, cost: 900 },
  { id: 'LAB-3003', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', testName: 'HbA1c', category: 'Biochemistry', ordered: '2026-07-06 11:00', collected: '2026-07-06 11:30', status: 'Processing', result: {}, criticalValues: false, cost: 700 },
  { id: 'LAB-3004', patientId: 'MRN-10007', patientName: 'Senthil Murugan', doctorId: 'DOC-001', testName: 'Blood Culture', category: 'Microbiology', ordered: '2026-07-04 08:00', collected: '2026-07-04 08:30', status: 'Pending', result: {}, criticalValues: false, cost: 1200 },
  { id: 'LAB-3005', patientId: 'MRN-10003', patientName: 'Mohammed Ali', doctorId: 'DOC-005', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', ordered: '2026-07-03 10:00', collected: '2026-07-03 10:30', status: 'Completed', result: { SGOT: '28 U/L (10-40)', SGPT: '32 U/L (7-56)', 'Total Bilirubin': '0.8 mg/dL (0.2-1.2)', 'Direct Bilirubin': '0.3 mg/dL (< 0.3)', 'Alkaline Phosphatase': '78 U/L (44-147)' }, criticalValues: false, cost: 850 },
  { id: 'LAB-3006', patientId: 'MRN-10005', patientName: 'Arun Patel', doctorId: 'DOC-005', testName: 'Malaria Antigen', category: 'Microbiology', ordered: '2026-07-03 09:00', collected: '2026-07-03 09:15', status: 'Completed', result: { 'P.falciparum': 'Negative', 'P.vivax': 'Negative' }, criticalValues: false, cost: 500 },
];

// =====================================================
// PRESCRIPTIONS
// =====================================================
export const prescriptions = [
  { id: 'RX-4001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Anand Krishnamurthy', date: '2026-07-05', diagnosis: 'Hypertension with Dyslipidemia', medicines: [{ name: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 days', instructions: 'After food' }, { name: 'Atorvastatin 10mg', dosage: '0-0-1', duration: '30 days', instructions: 'At night' }, { name: 'Aspirin 75mg', dosage: '0-1-0', duration: '30 days', instructions: 'After food' }], status: 'Dispensed', pharmacy: 'PHM-001' },
  { id: 'RX-4002', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', doctorName: 'Dr. Lakshmi Priya', date: '2026-07-06', diagnosis: 'Pregnancy - 28 weeks - Iron Deficiency', medicines: [{ name: 'Ferrous Sulphate 200mg', dosage: '1-0-1', duration: '60 days', instructions: 'After food' }, { name: 'Folic Acid 5mg', dosage: '1-0-0', duration: '60 days', instructions: 'Morning' }, { name: 'Calcium + Vit D3', dosage: '0-0-1', duration: '60 days', instructions: 'After dinner' }], status: 'Pending', pharmacy: null },
  { id: 'RX-4003', patientId: 'MRN-10005', patientName: 'Arun Patel', doctorId: 'DOC-005', doctorName: 'Dr. Ramesh Narayanan', date: '2026-07-03', diagnosis: 'Viral Fever', medicines: [{ name: 'Paracetamol 500mg', dosage: '1-1-1', duration: '5 days', instructions: 'After food' }, { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 days', instructions: 'At night' }, { name: 'Vitamin C 500mg', dosage: '1-0-0', duration: '10 days', instructions: 'Morning' }], status: 'Dispensed', pharmacy: 'PHM-002' },
];

// =====================================================
// PHARMACY INVENTORY
// =====================================================
export const drugInventory = [
  { id: 'DRG-001', name: 'Paracetamol 500mg', category: 'Analgesic', form: 'Tablet', manufacturer: 'Sun Pharma', batch: 'B2024-001', expiry: '2026-12-31', stock: 5000, minStock: 500, mrp: 3.50, purchaseRate: 1.80, unit: 'Tablet', location: 'R-A-01' },
  { id: 'DRG-002', name: 'Amlodipine 5mg', category: 'Antihypertensive', form: 'Tablet', manufacturer: 'Cipla', batch: 'B2024-022', expiry: '2027-03-31', stock: 2000, minStock: 200, mrp: 8.50, purchaseRate: 3.20, unit: 'Tablet', location: 'R-B-02' },
  { id: 'DRG-003', name: 'Atorvastatin 10mg', category: 'Lipid Lowering', form: 'Tablet', manufacturer: 'Dr Reddy\'s', batch: 'B2024-045', expiry: '2027-06-30', stock: 1500, minStock: 150, mrp: 12.00, purchaseRate: 5.40, unit: 'Tablet', location: 'R-B-03' },
  { id: 'DRG-004', name: 'Amoxicillin 500mg', category: 'Antibiotic', form: 'Capsule', manufacturer: 'Abbott', batch: 'B2024-088', expiry: '2026-09-30', stock: 180, minStock: 200, mrp: 18.00, purchaseRate: 7.50, unit: 'Capsule', location: 'R-C-01', lowStock: true },
  { id: 'DRG-005', name: 'Normal Saline 500ml', category: 'IV Fluid', form: 'Infusion', manufacturer: 'Baxter', batch: 'B2024-100', expiry: '2026-08-15', stock: 300, minStock: 100, mrp: 65.00, purchaseRate: 38.00, unit: 'Bottle', location: 'IV-A-01' },
  { id: 'DRG-006', name: 'Insulin Glargine 100IU', category: 'Antidiabetic', form: 'Injection', manufacturer: 'Sanofi', batch: 'B2024-055', expiry: '2026-10-31', stock: 80, minStock: 50, mrp: 1200.00, purchaseRate: 820.00, unit: 'Vial', location: 'COLD-01' },
  { id: 'DRG-007', name: 'Ceftriaxone 1g', category: 'Antibiotic', form: 'Injection', manufacturer: 'Cipla', batch: 'B2024-071', expiry: '2027-01-31', stock: 250, minStock: 100, mrp: 95.00, purchaseRate: 48.00, unit: 'Vial', location: 'R-C-02' },
  { id: 'DRG-008', name: 'Metformin 500mg', category: 'Antidiabetic', form: 'Tablet', manufacturer: 'USV', batch: 'B2024-033', expiry: '2027-04-30', stock: 3000, minStock: 300, mrp: 4.50, purchaseRate: 1.60, unit: 'Tablet', location: 'R-D-01' },
  { id: 'DRG-009', name: 'Omeprazole 20mg', category: 'PPI', form: 'Capsule', manufacturer: 'Torrent', batch: 'B2024-067', expiry: '2027-02-28', stock: 2500, minStock: 250, mrp: 6.00, purchaseRate: 2.10, unit: 'Capsule', location: 'R-D-02' },
  { id: 'DRG-010', name: 'Morphine Sulphate 10mg', category: 'Opioid', form: 'Injection', manufacturer: 'Neon Labs', batch: 'B2024-090', expiry: '2026-11-30', stock: 45, minStock: 20, mrp: 48.00, purchaseRate: 28.00, unit: 'Ampoule', location: 'CTRL-01', controlled: true },
];

// =====================================================
// STAFF
// =====================================================
export const staff = [
  { id: 'STF-001', name: 'Anil Ramachandran', role: 'Nurse', dept: 'ICU', phone: '9700000001', email: 'anil.r@medicore.com', shift: 'Morning', attendance: 'Present', salary: 35000, joinDate: '2021-06-01', status: 'Active' },
  { id: 'STF-002', name: 'Geetha Selvaraj', role: 'Nurse', dept: 'General Ward', phone: '9700000002', email: 'geetha.s@medicore.com', shift: 'Evening', attendance: 'Present', salary: 32000, joinDate: '2020-09-15', status: 'Active' },
  { id: 'STF-003', name: 'Muthu Krishnan', role: 'Pharmacist', dept: 'Pharmacy', phone: '9700000003', email: 'muthu.k@medicore.com', shift: 'Morning', attendance: 'Leave', salary: 40000, joinDate: '2019-11-01', status: 'Active' },
  { id: 'STF-004', name: 'Padmavathi Raman', role: 'Lab Technician', dept: 'Laboratory', phone: '9700000004', email: 'padma.r@medicore.com', shift: 'Morning', attendance: 'Present', salary: 38000, joinDate: '2022-01-10', status: 'Active' },
  { id: 'STF-005', name: 'Siva Kumar', role: 'Receptionist', dept: 'OPD', phone: '9700000005', email: 'siva.k@medicore.com', shift: 'Morning', attendance: 'Present', salary: 28000, joinDate: '2023-03-20', status: 'Active' },
  { id: 'STF-006', name: 'Revathi Venkat', role: 'Nurse', dept: 'Maternity', phone: '9700000006', email: 'revathi.v@medicore.com', shift: 'Night', attendance: 'Present', salary: 33000, joinDate: '2021-08-01', status: 'Active' },
  { id: 'STF-007', name: 'Bharath Selvam', role: 'Housekeeping', dept: 'Facility', phone: '9700000007', email: 'bharath.s@medicore.com', shift: 'Morning', attendance: 'Present', salary: 22000, joinDate: '2022-06-15', status: 'Active' },
  { id: 'STF-008', name: 'Chitra Annamalai', role: 'Cashier', dept: 'Billing', phone: '9700000008', email: 'chitra.a@medicore.com', shift: 'Morning', attendance: 'Present', salary: 30000, joinDate: '2020-02-01', status: 'Active' },
];

// =====================================================
// RADIOLOGY
// =====================================================
export const radiologyScans = [
  { id: 'RAD-6001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', type: 'Echocardiogram', modality: 'Echo', date: '2026-07-05', time: '14:00', status: 'Reported', radiologist: 'Dr. Murugesan Palaniswamy', finding: 'Mild left ventricular hypertrophy. EF 55%. No regional wall motion abnormality.', cost: 2500 },
  { id: 'RAD-6002', patientId: 'MRN-10003', patientName: 'Mohammed Ali', doctorId: 'DOC-005', type: 'Chest X-Ray', modality: 'X-Ray', date: '2026-07-04', time: '11:00', status: 'Reported', radiologist: 'Dr. Murugesan Palaniswamy', finding: 'Hyperinflation of lungs. Flattened diaphragm. Consistent with COPD.', cost: 500 },
  { id: 'RAD-6003', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', type: 'Obstetric Ultrasound', modality: 'Ultrasound', date: '2026-07-06', time: '12:00', status: 'Reported', radiologist: 'Dr. Murugesan Palaniswamy', finding: 'Single live fetus, 28 weeks. Normal fetal biometry. Placenta posterior grade I. AFI normal.', cost: 1800 },
  { id: 'RAD-6004', patientId: 'MRN-10007', patientName: 'Senthil Murugan', doctorId: 'DOC-001', type: 'CT Coronary Angiography', modality: 'CT', date: '2026-07-05', time: '09:00', status: 'Processing', radiologist: 'Dr. Murugesan Palaniswamy', finding: '', cost: 8500 },
  { id: 'RAD-6005', patientId: 'MRN-10006', patientName: 'Kavitha Nair', doctorId: 'DOC-002', type: 'MRI Brain', modality: 'MRI', date: '2026-07-07', time: '10:00', status: 'Scheduled', radiologist: 'Dr. Murugesan Palaniswamy', finding: '', cost: 6500 },
];

// =====================================================
// BLOOD BANK
// =====================================================
export const bloodInventory = [
  { group: 'A+', units: 24, available: 20, reserved: 4 },
  { group: 'A-', units: 8, available: 6, reserved: 2 },
  { group: 'B+', units: 32, available: 28, reserved: 4 },
  { group: 'B-', units: 6, available: 5, reserved: 1 },
  { group: 'O+', units: 40, available: 35, reserved: 5 },
  { group: 'O-', units: 12, available: 10, reserved: 2 },
  { group: 'AB+', units: 15, available: 12, reserved: 3 },
  { group: 'AB-', units: 4, available: 4, reserved: 0 },
];

// =====================================================
// ANALYTICS DATA
// =====================================================
export const revenueData = [
  { month: 'Jan', opd: 850000, ipd: 2400000, pharmacy: 620000, lab: 380000, radiology: 290000, total: 4540000 },
  { month: 'Feb', opd: 920000, ipd: 2600000, pharmacy: 680000, lab: 420000, radiology: 310000, total: 4930000 },
  { month: 'Mar', opd: 1100000, ipd: 2900000, pharmacy: 750000, lab: 480000, radiology: 350000, total: 5580000 },
  { month: 'Apr', opd: 980000, ipd: 2700000, pharmacy: 700000, lab: 440000, radiology: 320000, total: 5140000 },
  { month: 'May', opd: 1050000, ipd: 3100000, pharmacy: 820000, lab: 510000, radiology: 380000, total: 5860000 },
  { month: 'Jun', opd: 1200000, ipd: 3400000, pharmacy: 890000, lab: 560000, radiology: 420000, total: 6470000 },
  { month: 'Jul', opd: 880000, ipd: 2800000, pharmacy: 740000, lab: 490000, radiology: 360000, total: 5270000 },
];

export const occupancyData = [
  { day: 'Mon', occupancy: 82 },
  { day: 'Tue', occupancy: 78 },
  { day: 'Wed', occupancy: 85 },
  { day: 'Thu', occupancy: 91 },
  { day: 'Fri', occupancy: 88 },
  { day: 'Sat', occupancy: 72 },
  { day: 'Sun', occupancy: 65 },
];

export const deptRevenueData = [
  { name: 'IPD', value: 41, color: '#3b82f6' },
  { name: 'OPD', value: 18, color: '#06b6d4' },
  { name: 'Pharmacy', value: 14, color: '#8b5cf6' },
  { name: 'Lab', value: 12, color: '#10b981' },
  { name: 'Radiology', value: 9, color: '#f59e0b' },
  { name: 'Others', value: 6, color: '#ef4444' },
];

// =====================================================
// OT SURGERIES
// =====================================================
export const surgeries = [
  { id: 'OT-7001', patientId: 'MRN-10004', patientName: 'Lakshmi Devi', surgeonId: 'DOC-003', surgeon: 'Dr. Suresh Babu', procedure: 'Total Knee Replacement', date: '2026-07-05', time: '09:00', duration: '3h 20m', theatre: 'OT-1', anesthetist: 'Dr. Krishnan', status: 'Completed', outcome: 'Successful' },
  { id: 'OT-7002', patientId: 'MRN-10007', patientName: 'Senthil Murugan', surgeonId: 'DOC-001', surgeon: 'Dr. Anand Krishnamurthy', procedure: 'Coronary Angioplasty', date: '2026-07-06', time: '11:00', duration: '2h 10m', theatre: 'Cath Lab', anesthetist: 'Dr. Vijayan', status: 'In Progress', outcome: '' },
  { id: 'OT-7003', patientId: 'MRN-10009', patientName: 'Ravi Sundaram', surgeonId: 'DOC-007', surgeon: 'Dr. Karthik Ramamoorthy', procedure: 'Appendectomy (Laparoscopic)', date: '2026-07-07', time: '08:00', duration: '', theatre: 'OT-2', anesthetist: 'Dr. Krishnan', status: 'Scheduled', outcome: '' },
];

// =====================================================
// INSURANCE CLAIMS
// =====================================================
export const insuranceClaims = [
  { id: 'CLM-8001', patientId: 'MRN-10003', patientName: 'Mohammed Ali', insurer: 'New India Assurance', tpa: 'Paramount TPA', claimType: 'Cashless', admitDate: '2026-07-02', claimAmount: 11926, approved: 10000, rejected: 1926, status: 'Partial Approved', submitted: '2026-07-03', settled: null },
  { id: 'CLM-8002', patientId: 'MRN-10007', patientName: 'Senthil Murugan', insurer: 'Oriental Insurance', tpa: 'Vidal TPA', claimType: 'Cashless', admitDate: '2026-07-04', claimAmount: 37676, approved: null, rejected: null, status: 'Pre-Auth Pending', submitted: '2026-07-04', settled: null },
  { id: 'CLM-8003', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', insurer: 'Star Health', tpa: 'Direct', claimType: 'Reimbursement', admitDate: '2026-07-05', claimAmount: 19838, approved: 18000, rejected: 1838, status: 'Approved', submitted: '2026-07-06', settled: '2026-07-08' },
];

// =====================================================
// AMBULANCES
// =====================================================
export const ambulances = [
  { id: 'AMB-001', regNo: 'TN-01-AB-1234', type: 'Advanced Life Support', driver: 'Murugan S', phone: '9600000001', status: 'Available', lat: 13.0827, lng: 80.2707 },
  { id: 'AMB-002', regNo: 'TN-01-AB-5678', type: 'Basic Life Support', driver: 'Selvam K', phone: '9600000002', status: 'On Call', lat: 13.0752, lng: 80.2562 },
  { id: 'AMB-003', regNo: 'TN-01-AB-9012', type: 'Patient Transport', driver: 'Arjun R', phone: '9600000003', status: 'Available', lat: 13.0900, lng: 80.2800 },
];

// =====================================================
// NOTIFICATIONS
// =====================================================
export const notifications = [
  { id: 1, type: 'critical', title: 'Critical Lab Value', message: 'Patient Senthil Murugan (MRN-10007) - Potassium 6.2 mEq/L (CRITICAL HIGH)', time: '2 min ago', read: false },
  { id: 2, type: 'appointment', title: 'New Appointment', message: 'Rajesh Kumar booked appointment with Dr. Anand for July 7th, 9:00 AM', time: '15 min ago', read: false },
  { id: 3, type: 'pharmacy', title: 'Low Stock Alert', message: 'Amoxicillin 500mg stock below minimum threshold (180 units remaining)', time: '1 hr ago', read: false },
  { id: 4, type: 'billing', title: 'Payment Received', message: 'INV-2002: ₹2,416 received from Priya Sharma via Card', time: '2 hr ago', read: true },
  { id: 5, type: 'surgery', title: 'Surgery Completed', message: 'OT-7001: Total Knee Replacement for Lakshmi Devi - Successful', time: '3 hr ago', read: true },
];

// =====================================================
// USER ROLES
// =====================================================
export const ROLES = {
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  NURSE: 'Nurse',
  RECEPTIONIST: 'Receptionist',
  PHARMACIST: 'Pharmacist',
  LAB_TECH: 'Lab Technician',
  RADIOLOGIST: 'Radiologist',
  CASHIER: 'Cashier',
  INSURANCE: 'Insurance Coordinator',
  HR: 'HR',
  STORE_MANAGER: 'Store Manager',
  MANAGEMENT: 'Management',
  PATIENT: 'Patient',
};

export const demoUsers = [
  { id: 'U001', username: 'admin', password: 'admin123', role: ROLES.ADMIN, name: 'Dr. Admin Kumar', dept: 'Administration', avatar: 'AK' },
  { id: 'U002', username: 'doctor', password: 'doctor123', role: ROLES.DOCTOR, name: 'Dr. Anand Krishnamurthy', dept: 'Cardiology', avatar: 'AK', doctorId: 'DOC-001' },
  { id: 'U003', username: 'nurse', password: 'nurse123', role: ROLES.NURSE, name: 'Geetha Selvaraj', dept: 'General Ward', avatar: 'GS', staffId: 'STF-002' },
  { id: 'U004', username: 'receptionist', password: 'recept123', role: ROLES.RECEPTIONIST, name: 'Siva Kumar', dept: 'OPD', avatar: 'SK', staffId: 'STF-005' },
  { id: 'U005', username: 'pharmacist', password: 'pharma123', role: ROLES.PHARMACIST, name: 'Muthu Krishnan', dept: 'Pharmacy', avatar: 'MK', staffId: 'STF-003' },
  { id: 'U006', username: 'labtech', password: 'lab123', role: ROLES.LAB_TECH, name: 'Padmavathi Raman', dept: 'Laboratory', avatar: 'PR', staffId: 'STF-004' },
  { id: 'U007', username: 'management', password: 'mgmt123', role: ROLES.MANAGEMENT, name: 'R. Subramaniam', dept: 'Executive', avatar: 'RS' },
  { id: 'U008', username: 'cashier', password: 'cash123', role: ROLES.CASHIER, name: 'Chitra Annamalai', dept: 'Billing', avatar: 'CA', staffId: 'STF-008' },
];
