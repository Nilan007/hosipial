import express from 'express';
import {
  User, Patient, Appointment, Ward, Bed, Bill, LabTest,
  Prescription, DrugInventory, Staff, RadiologyScan, AuditLog,
  Surgery, InsuranceClaim, Ambulance,
  OutsideLab, OutsideReferral, OutsideLabInvoice,
  FinancialTransaction,
  ProcurementOrder,
  Vendor,
  Asset,
  SystemUser,
  DietPlan,
  HousekeepingTask,
  MedicalRecord,
  CRMEntry,
  ComplianceItem,
  DischargeFeedback
} from './models.js';

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        dept: user.dept,
        avatar: user.avatar,
        doctorId: user.doctorId,
        staffId: user.staffId
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// =====================================================
// DASHBOARD STATS
// =====================================================
router.get('/dashboard/stats', async (req, res) => {
  try {
    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const totalBeds = await Bed.countDocuments({});
    const occupiedBeds = await Bed.countDocuments({ status: 'Occupied' });
    const pendingLabs = await LabTest.countDocuments({ status: 'Pending' });
    const activeStaff = await Staff.countDocuments({ status: 'Active' });

    res.json({
      activePatients,
      totalBeds,
      occupiedBeds,
      pendingLabs,
      activeStaff
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// =====================================================
// PATIENTS
// =====================================================
router.get('/patients', async (req, res) => {
  try {
    const data = await Patient.find({}).sort({ regDate: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
});

router.post('/patients', async (req, res) => {
  try {
    const p = new Patient(req.body);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: 'Error creating patient' });
  }
});

router.put('/patients/:id', async (req, res) => {
  try {
    const updated = await Patient.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating patient' });
  }
});

// =====================================================
// APPOINTMENTS
// =====================================================
router.get('/appointments', async (req, res) => {
  try {
    const data = await Appointment.find({}).sort({ date: 1, time: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/appointments', async (req, res) => {
  try {
    const apt = new Appointment(req.body);
    await apt.save();
    res.json(apt);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/appointments/:id', async (req, res) => {
  try {
    const updated = await Appointment.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating' });
  }
});

// =====================================================
// WARD & BEDS (IPD)
// =====================================================
router.get('/ipd/beds', async (req, res) => {
  try {
    const data = await Bed.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/ipd/wards', async (req, res) => {
  try {
    const data = await Ward.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/ipd/beds/:id', async (req, res) => {
  try {
    const updated = await Bed.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// =====================================================
// BILLING & INVOICES
// =====================================================
router.get('/billing', async (req, res) => {
  try {
    const data = await Bill.find({}).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/billing', async (req, res) => {
  try {
    const invoice = new Bill(req.body);
    await invoice.save();

    // Map bill to financial accounting categories based on item descriptions
    let category = 'Patient Consultation';
    const firstItemDesc = (invoice.items && invoice.items[0] && invoice.items[0].desc || '').toLowerCase();
    
    if (firstItemDesc.includes('consultation') || firstItemDesc.includes('doctor') || firstItemDesc.includes('opd') || firstItemDesc.includes('visit')) {
      category = 'Patient Consultation';
    } else if (firstItemDesc.includes('medicine') || firstItemDesc.includes('pharmacy') || firstItemDesc.includes('drug') || firstItemDesc.includes('dispense')) {
      category = 'Pharmacy Sales';
    } else if (firstItemDesc.includes('x-ray') || firstItemDesc.includes('scan') || firstItemDesc.includes('radiology') || firstItemDesc.includes('ris') || firstItemDesc.includes('mri')) {
      category = 'Radiology/RIS Fees';
    } else if (firstItemDesc.includes('lab') || firstItemDesc.includes('report') || firstItemDesc.includes('test') || firstItemDesc.includes('blood') || firstItemDesc.includes('urine')) {
      category = 'Laboratory/LIMS Fees';
    } else if (firstItemDesc.includes('vip') || firstItemDesc.includes('fasttrack') || firstItemDesc.includes('membership')) {
      category = 'Patient Consultation';
    }

    // Automatically create a ledger transaction
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const isSettled = invoice.status === 'Paid' || invoice.balance === 0;

    const txn = new FinancialTransaction({
      id: txnId,
      date: invoice.date || new Date().toISOString().split('T')[0],
      category: category,
      description: `Patient Invoice: ${invoice.patientName} (Bill Ref: ${invoice.id})`,
      type: 'Income',
      amount: invoice.total || 0,
      status: isSettled ? 'Settled' : 'Pending',
      dueDate: isSettled ? undefined : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      referenceId: invoice.id
    });
    await txn.save();

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error creating invoice' });
  }
});

// =====================================================
// PHARMACY
// =====================================================
router.get('/pharmacy/inventory', async (req, res) => {
  try {
    const data = await DrugInventory.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/pharmacy/inventory', async (req, res) => {
  try {
    const d = new DrugInventory(req.body);
    await d.save();
    res.json(d);
  } catch (err) {
    res.status(500).json({ message: 'Error creating drug record' });
  }
});

router.get('/pharmacy/prescriptions', async (req, res) => {
  try {
    const data = await Prescription.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/pharmacy/prescriptions/:id', async (req, res) => {
  try {
    const data = await Prescription.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// =====================================================
// LABORATORY (LIMS)
// =====================================================
router.get('/laboratory', async (req, res) => {
  try {
    const data = await LabTest.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/laboratory/:id', async (req, res) => {
  try {
    const updated = await LabTest.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// =====================================================
// RADIOLOGY (RIS)
// =====================================================
router.get('/radiology', async (req, res) => {
  try {
    const data = await RadiologyScan.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/radiology/:id', async (req, res) => {
  try {
    const updated = await RadiologyScan.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// =====================================================
// STAFF & HR
// =====================================================
router.get('/staff', async (req, res) => {
  try {
    const data = await Staff.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const s = new Staff(req.body);
    await s.save();
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: 'Error creating employee' });
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const updated = await Staff.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    await Staff.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

router.post('/staff/disburse-payroll', async (req, res) => {
  try {
    const { month, totalAmount } = req.body;
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

    const txn = new FinancialTransaction({
      id: txnId,
      date: new Date().toISOString().split('T')[0],
      category: 'Staff Salary & Bonus',
      description: `Payroll Disbursement Run: Month ${month}`,
      type: 'Expense',
      amount: Number(totalAmount) || 0,
      status: 'Settled'
    });
    await txn.save();

    res.json({ success: true, transaction: txn });
  } catch (err) {
    res.status(500).json({ message: 'Error running payroll ledger disbursement' });
  }
});

// =====================================================
// COMPLIANCE AUDITS
// =====================================================
router.get('/compliance/audits', async (req, res) => {
  try {
    const data = await AuditLog.find({}).sort({ time: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/compliance/audits', async (req, res) => {
  try {
    const log = new AuditLog(req.body);
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Error logging' });
  }
});

// =====================================================
// ANCILLARY: SURGERIES, CLAIMS, AMBULANCES
// =====================================================
router.get('/surgeries', async (req, res) => {
  try {
    const data = await Surgery.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/surgeries/:id', async (req, res) => {
  try {
    const updated = await Surgery.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/claims', async (req, res) => {
  try {
    const data = await InsuranceClaim.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/claims/:id', async (req, res) => {
  try {
    const updated = await InsuranceClaim.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/ambulances', async (req, res) => {
  try {
    const data = await Ambulance.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/ambulances/:id', async (req, res) => {
  try {
    const updated = await Ambulance.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

// =====================================================
// OUTSIDE RADIOLOGY LABS (Commission Management)
// =====================================================
router.get('/outside-labs', async (req, res) => {
  try {
    const data = await OutsideLab.find({}).sort({ name: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching outside labs' });
  }
});

router.post('/outside-labs', async (req, res) => {
  try {
    const lab = new OutsideLab(req.body);
    await lab.save();
    res.json(lab);
  } catch (err) {
    res.status(500).json({ message: 'Error creating outside lab' });
  }
});

router.put('/outside-labs/:id', async (req, res) => {
  try {
    const updated = await OutsideLab.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating outside lab' });
  }
});

// =====================================================
// OUTSIDE REFERRALS
// =====================================================
router.get('/outside-referrals', async (req, res) => {
  try {
    const data = await OutsideReferral.find({}).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching outside referrals' });
  }
});

router.post('/outside-referrals', async (req, res) => {
  try {
    const referral = new OutsideReferral(req.body);
    await referral.save();
    res.json(referral);
  } catch (err) {
    res.status(500).json({ message: 'Error logging outside referral' });
  }
});

// =====================================================
// OUTSIDE LAB INVOICES
// =====================================================
router.get('/outside-invoices', async (req, res) => {
  try {
    const data = await OutsideLabInvoice.find({}).sort({ dateGenerated: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching outside invoices' });
  }
});

router.post('/outside-invoices/generate', async (req, res) => {
  try {
    const { labId, labName, startDate, endDate, billingCycle, referrals } = req.body;
    
    let totalBillingValue = 0;
    let totalCommission = 0;
    const referralIds = referrals.map(r => r.id);

    referrals.forEach(ref => {
      totalBillingValue += ref.totalAmount;
      totalCommission += ref.commissionAmount;
    });

    const invoiceId = `LINV-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoice = new OutsideLabInvoice({
      id: invoiceId,
      labId,
      labName,
      startDate,
      endDate,
      referralCount: referrals.length,
      totalBillingValue,
      totalCommission,
      billingCycle,
      dateGenerated: new Date().toISOString().split('T')[0],
      status: 'Unpaid'
    });

    await invoice.save();

    // Update all related referrals to 'Invoiced' and tag with invoiceId
    await OutsideReferral.updateMany(
      { id: { $in: referralIds } },
      { $set: { billingStatus: 'Invoiced', invoiceId: invoiceId } }
    );

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Error generating commission invoice' });
  }
});

router.put('/outside-invoices/:id/settle', async (req, res) => {
  try {
    const { paymentDate } = req.body;
    const updated = await OutsideLabInvoice.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Paid', paymentDate: paymentDate || new Date().toISOString().split('T')[0] },
      { new: true }
    );

    // Update referrals to 'Settled'
    await OutsideReferral.updateMany(
      { invoiceId: req.params.id },
      { $set: { billingStatus: 'Settled' } }
    );

    // Automatically create a ledger transaction
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const txn = new FinancialTransaction({
      id: txnId,
      date: paymentDate || new Date().toISOString().split('T')[0],
      category: 'Outside Lab Commission',
      description: `Commission Payout: ${updated.labName} (Inv: ${updated.id})`,
      type: 'Income',
      amount: updated.totalCommission || 0,
      status: 'Settled',
      referenceId: updated.id
    });
    await txn.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error settling invoice' });
  }
});

// =====================================================
// FINANCIAL ACCOUNTING
// =====================================================
router.get('/accounting/transactions', async (req, res) => {
  try {
    const data = await FinancialTransaction.find({}).sort({ date: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

router.post('/accounting/transactions', async (req, res) => {
  try {
    const txn = new FinancialTransaction(req.body);
    await txn.save();
    res.json(txn);
  } catch (err) {
    res.status(500).json({ message: 'Error creating transaction' });
  }
});

router.put('/accounting/transactions/:id', async (req, res) => {
  try {
    const updated = await FinancialTransaction.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating transaction' });
  }
});

router.delete('/accounting/transactions/:id', async (req, res) => {
  try {
    await FinancialTransaction.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting transaction' });
  }
});

// =====================================================
// PROCUREMENT & INVENTORY
// =====================================================
router.get('/procurements', async (req, res) => {
  try {
    const data = await ProcurementOrder.find({}).sort({ dateOrdered: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching procurements' });
  }
});

router.post('/procurements', async (req, res) => {
  try {
    const po = new ProcurementOrder(req.body);
    await po.save();
    res.json(po);
  } catch (err) {
    res.status(500).json({ message: 'Error creating procurement order' });
  }
});

router.put('/procurements/:id/pay', async (req, res) => {
  try {
    const updated = await ProcurementOrder.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Paid & Received' },
      { new: true }
    );

    // Automatically log ledger transaction
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const txn = new FinancialTransaction({
      id: txnId,
      date: new Date().toISOString().split('T')[0],
      category: 'Inventory Supply Purchase',
      description: `Vendor Paid: ${updated.vendor} (PO Ref: ${updated.id})`,
      type: 'Expense',
      amount: updated.totalCost || 0,
      status: 'Settled',
      referenceId: updated.id
    });
    await txn.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error paying vendor invoice' });
  }
});

router.delete('/procurements/:id', async (req, res) => {
  try {
    await ProcurementOrder.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting procurement order' });
  }
});

// =====================================================
// VENDOR PARTNERS
// =====================================================
router.get('/vendors', async (req, res) => {
  try {
    let list = await Vendor.find({});
    if (list.length === 0) {
      // Seed initial vendors
      const samples = [
        { id: 'VND-001', name: 'Becton Dickinson Pharma', contactPerson: 'Sanjay Rawat', phone: '9876543210', email: 'sanjay@bectonpharma.com', address: 'Plot 42, Sector 8, IMT Manesar, Gurugram', taxId: '07AAACB2192A1Z1', bankName: 'HDFC Bank', bankAccount: '5010023948574', ifscCode: 'HDFC0000042', status: 'Active' },
        { id: 'VND-002', name: 'Triveni Medical Logistics', contactPerson: 'Alok Sharma', phone: '9988776655', email: 'alok@trivenilogistics.in', address: 'Triveni Arcade, Gandhi Nagar, Bengaluru', taxId: '29AABCT8843Q2Z9', bankName: 'ICICI Bank', bankAccount: '000401294857', ifscCode: 'ICIC0000004', status: 'Active' },
        { id: 'VND-003', name: 'Apex Surgical Devices', contactPerson: 'Ritu Sen', phone: '9123456789', email: 'ritu@apexsurges.com', address: 'Phase 3, Industrial Area, Okhla, New Delhi', taxId: '07AAAAP4912J1Z8', bankName: 'SBI', bankAccount: '30491827461', ifscCode: 'SBIN0000600', status: 'Active' }
      ];
      await Vendor.insertMany(samples);
      list = await Vendor.find({});
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

router.post('/vendors', async (req, res) => {
  try {
    const v = new Vendor(req.body);
    await v.save();
    res.json(v);
  } catch (err) {
    res.status(500).json({ message: 'Error creating vendor partner' });
  }
});

router.put('/vendors/:id', async (req, res) => {
  try {
    const updated = await Vendor.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating vendor details' });
  }
});

router.delete('/vendors/:id', async (req, res) => {
  try {
    await Vendor.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting vendor partner' });
  }
});

// =====================================================
// ASSET & MACHINE MANAGEMENT
// =====================================================
router.get('/assets', async (req, res) => {
  try {
    let list = await Asset.find({});
    if (list.length === 0) {
      const sampleAssets = [
        { id: 'AST-MRI-101', name: 'GE Signa Explorer 1.5T MRI Scanner', category: 'Radiology Equipment', department: 'Radiology', responsiblePerson: 'Dr. Rajesh K. (Chief Radiologist)', serialNumber: 'SN-GESIG-92847', worth: 15000000, status: 'Operational', purchaseDate: '2025-01-15', lastServiceDate: '2026-06-10', nextServiceDate: '2026-12-10', maintenanceNotes: 'Liquid helium level checked, coils calibrated. System performing within standard baseline.' },
        { id: 'AST-CT-102', name: 'Siemens Somatom Go.Up CT Scanner', category: 'Radiology Equipment', department: 'Radiology', responsiblePerson: 'Dr. Rajesh K. (Chief Radiologist)', serialNumber: 'SN-SIECT-83749', worth: 8500000, status: 'Calibrating', purchaseDate: '2025-04-20', lastServiceDate: '2026-07-01', nextServiceDate: '2026-10-01', maintenanceNotes: 'Laser alignment calibration in progress. X-ray tube integrity verified at 94% efficiency.' },
        { id: 'AST-HEM-201', name: 'Sysmex XN-1000 Automated Hematology Analyzer', category: 'Laboratory Machinery', department: 'Pathology Lab', responsiblePerson: 'Dr. Varma (Lab Director)', serialNumber: 'SN-SYSXN-40192', worth: 2400000, status: 'Operational', purchaseDate: '2024-09-10', lastServiceDate: '2026-05-18', nextServiceDate: '2026-11-18', maintenanceNotes: 'Reagents flushed, optical sensor lens sanitized. Quality control run logged successfully.' },
        { id: 'AST-DEF-301', name: 'Zoll R Series Defibrillator Monitor', category: 'Emergency Lifesaving', department: 'Emergency Room (ER)', responsiblePerson: 'Sarah Jenkins (Head Nurse)', serialNumber: 'SN-ZOLLR-10928', worth: 450000, status: 'Under Maintenance', purchaseDate: '2024-11-05', lastServiceDate: '2026-04-12', nextServiceDate: '2026-07-10', maintenanceNotes: 'Battery module degradation detected. Awaiting delivery of replacement lithium-ion pack.' },
        { id: 'AST-VENT-401', name: 'Hamilton-C6 Intensive Care Ventilator', category: 'ICU Life Support', department: 'ICU', responsiblePerson: 'Dr. Roy (ICU Clinical Chief)', serialNumber: 'SN-HAMC6-77821', worth: 1800000, status: 'Operational', purchaseDate: '2025-02-18', lastServiceDate: '2026-06-25', nextServiceDate: '2026-12-25', maintenanceNotes: 'Oxygen sensor calibrated, breathing circuit pressure leaks audited. Clean certificate issued.' },
        { id: 'AST-USG-103', name: 'Philips Epiq Elite Ultrasound System', category: 'Imaging & Diagnostics', department: 'Radiology', responsiblePerson: 'Dr. K. Sharma (Sonologist)', serialNumber: 'SN-PHUSG-29834', worth: 3200000, status: 'Operational', purchaseDate: '2025-05-12', lastServiceDate: '2026-05-12', nextServiceDate: '2026-11-12', maintenanceNotes: 'Transducer elements verified. Software version 4.2 patch installed.' }
      ];
      await Asset.insertMany(sampleAssets);
      list = await Asset.find({});
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching assets' });
  }
});

router.post('/assets', async (req, res) => {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.json(asset);
  } catch (err) {
    res.status(500).json({ message: 'Error registering asset machinery' });
  }
});

router.put('/assets/:id', async (req, res) => {
  try {
    const updated = await Asset.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating asset machinery details' });
  }
});

router.delete('/assets/:id', async (req, res) => {
  try {
    await Asset.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting asset machinery profile' });
  }
});

// =====================================================
// SYSTEM USERS (RBAC)
// =====================================================
router.get('/users', async (req, res) => {
  try {
    const users = await SystemUser.find({}).sort({ createdAt: -1 });
    if (users.length === 0) {
      // Seed admin user
      await SystemUser.create({
        id: 'USR-ADMIN-001',
        username: 'admin',
        password: 'hospital@2026',
        role: 'Administrator',
        name: 'System Administrator',
        dept: 'Administration',
        avatar: '🛡️',
        isAdmin: true,
        isActive: true,
        permissions: ['*'] // Full access
      });
      return res.json(await SystemUser.find({}).sort({ createdAt: -1 }));
    }
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching system users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const u = new SystemUser(req.body);
    await u.save();
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: 'Error creating system user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const u = await SystemUser.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(u);
  } catch (err) {
    res.status(500).json({ message: 'Error updating system user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await SystemUser.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting system user' });
  }
});

// Login also checks SystemUser
router.post('/auth/syslogin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const u = await SystemUser.findOne({ username, password, isActive: true });
    if (u) {
      await SystemUser.findOneAndUpdate({ id: u.id }, { lastLogin: new Date().toISOString() });
      res.json(u);
    } else {
      res.status(401).json({ message: 'Invalid credentials or account inactive' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// =====================================================
// DIET & NUTRITION
// =====================================================
router.get('/diet', async (req, res) => {
  try {
    let data = await DietPlan.find({}).sort({ createdAt: -1 });
    if (data.length === 0) {
      await DietPlan.insertMany([
        { id: 'DIET-001', patientId: 'PT-001', patientName: 'Ramesh Kumar', nutritionist: 'Ms. Priya Iyer', dietType: 'Diabetic', calories: 1600, protein: 70, carbs: 180, fat: 45, breakfast: 'Oats porridge, 1 egg white, Green tea (no sugar)', lunch: 'Brown rice 150g, Dal tadka, Mixed vegetable sabzi, Salad', dinner: 'Chapati x2, Grilled chicken 100g, Cucumber raita', eveningSnack: 'Sprouts chaat, Buttermilk', morningSnack: 'Almonds 10 nos, Apple 1', fluids: '2.5L water, No sweetened beverages', restrictions: 'No sugar, No white rice, No fried foods', notes: 'Blood sugar monitoring twice daily', startDate: '2025-01-10', endDate: '2025-02-10', status: 'Active', ward: 'General Ward', bedNo: 'G-12' },
        { id: 'DIET-002', patientId: 'PT-002', patientName: 'Lalitha Devi', nutritionist: 'Ms. Priya Iyer', dietType: 'Cardiac', calories: 1800, protein: 65, carbs: 220, fat: 50, breakfast: 'Idli x3, Sambar, Coconut chutney (low fat)', lunch: 'Red rice 100g, Fish curry (steamed), Vegetables', dinner: 'Chapati x2, Dal, Sabzi', restrictions: 'No salt added at table, Low sodium, Avoid full-fat dairy', startDate: '2025-01-12', endDate: '2025-02-12', status: 'Active', ward: 'ICU Step Down', bedNo: 'ICU-3' }
      ]);
      data = await DietPlan.find({}).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching diet plans' });
  }
});

router.post('/diet', async (req, res) => {
  try {
    const d = new DietPlan(req.body);
    await d.save();
    res.json(d);
  } catch (err) {
    res.status(500).json({ message: 'Error creating diet plan' });
  }
});

router.put('/diet/:id', async (req, res) => {
  try {
    const d = await DietPlan.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(d);
  } catch (err) {
    res.status(500).json({ message: 'Error updating diet plan' });
  }
});

router.delete('/diet/:id', async (req, res) => {
  try {
    await DietPlan.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting diet plan' });
  }
});

// =====================================================
// HOUSEKEEPING
// =====================================================
router.get('/housekeeping', async (req, res) => {
  try {
    let data = await HousekeepingTask.find({}).sort({ createdAt: -1 });
    if (data.length === 0) {
      await HousekeepingTask.insertMany([
        { id: 'HK-001', roomNo: '101', ward: 'General Ward', floor: 'Ground', taskType: 'Cleaning', assignedTo: 'Suresh M.', supervisedBy: 'Rajan P.', priority: 'Normal', status: 'Completed', scheduledTime: '08:00', completedTime: '08:45', shift: 'Morning', notes: 'Daily morning clean' },
        { id: 'HK-002', roomNo: 'ICU-3', ward: 'ICU', floor: '2nd Floor', taskType: 'Terminal Cleaning', assignedTo: 'Kavitha R.', supervisedBy: 'Rajan P.', priority: 'Urgent', status: 'In Progress', scheduledTime: '10:00', shift: 'Morning', notes: 'Post-patient discharge deep clean' },
        { id: 'HK-003', roomNo: '201', ward: 'Private Ward', floor: '2nd Floor', taskType: 'Linen Change', assignedTo: 'Murugan S.', supervisedBy: 'Rajan P.', priority: 'High', status: 'Pending', scheduledTime: '11:00', shift: 'Morning', notes: 'Change all bed linen and pillow covers' },
        { id: 'HK-004', roomNo: 'OT-1', ward: 'Operation Theatre', floor: '3rd Floor', taskType: 'Sanitization', assignedTo: 'Lakshmi V.', supervisedBy: 'Rajan P.', priority: 'Urgent', status: 'Pending', scheduledTime: '14:00', shift: 'Afternoon', notes: 'Pre-OT sanitization protocol' }
      ]);
      data = await HousekeepingTask.find({}).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching housekeeping tasks' });
  }
});

router.post('/housekeeping', async (req, res) => {
  try {
    const t = new HousekeepingTask(req.body);
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Error creating housekeeping task' });
  }
});

router.put('/housekeeping/:id', async (req, res) => {
  try {
    const t = await HousekeepingTask.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: 'Error updating housekeeping task' });
  }
});

router.delete('/housekeeping/:id', async (req, res) => {
  try {
    await HousekeepingTask.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting housekeeping task' });
  }
});

// =====================================================
// MEDICAL RECORDS (MRD)
// =====================================================
router.get('/mrd', async (req, res) => {
  try {
    let data = await MedicalRecord.find({}).sort({ createdAt: -1 });
    if (data.length === 0) {
      await MedicalRecord.insertMany([
        { id: 'MRD-001', patientId: 'PT-001', patientName: 'Ramesh Kumar', mrn: 'MRN-2024-001', doctorId: 'DR-001', doctorName: 'Dr. Arun Sharma', recordType: 'Discharge Summary', date: '2025-01-15', department: 'Cardiology', diagnosis: 'Acute Myocardial Infarction — Managed, Stable Discharge', content: 'Patient admitted with STEMI. Underwent primary PCI. Discharged on dual antiplatelet therapy. Follow-up in 1 week.', tags: ['Cardiac', 'PCI', 'Discharge'], confidential: false, status: 'Active' },
        { id: 'MRD-002', patientId: 'PT-002', patientName: 'Lalitha Devi', mrn: 'MRN-2024-002', doctorId: 'DR-002', doctorName: 'Dr. Vijaya Lakshmi', recordType: 'Lab Report', date: '2025-01-14', department: 'Pathology', diagnosis: 'CBC, LFT, RFT Panel', content: 'Hemoglobin: 10.2 g/dL (low). WBC: 11,400 (mildly elevated). Platelets: 1,85,000. Creatinine: 1.4 mg/dL.', tags: ['Lab', 'CBC', 'Anemia'], confidential: false, status: 'Active' },
        { id: 'MRD-003', patientId: 'PT-003', patientName: 'Karthik Raja', mrn: 'MRN-2024-003', doctorId: 'DR-003', doctorName: 'Dr. Mohan Rao', recordType: 'OT Notes', date: '2025-01-13', department: 'Surgery', diagnosis: 'Appendicectomy — Laparoscopic', content: 'Procedure performed under GA. Trocar placed in umbilicus. Inflamed appendix identified and resected. No complications. Patient shifted to recovery.', tags: ['Surgery', 'OT', 'Laparoscopy'], confidential: true, status: 'Active' }
      ]);
      data = await MedicalRecord.find({}).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching medical records' });
  }
});

router.post('/mrd', async (req, res) => {
  try {
    const r = new MedicalRecord(req.body);
    await r.save();
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: 'Error creating medical record' });
  }
});

router.put('/mrd/:id', async (req, res) => {
  try {
    const r = await MedicalRecord.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: 'Error updating medical record' });
  }
});

// =====================================================
// CRM
// =====================================================
router.get('/crm', async (req, res) => {
  try {
    let data = await CRMEntry.find({}).sort({ createdAt: -1 });
    if (data.length === 0) {
      await CRMEntry.insertMany([
        { id: 'CRM-001', patientId: 'PT-001', patientName: 'Ramesh Kumar', phone: '9876543210', type: 'Follow-up', urgency: 'Normal', status: 'Open', assignedTo: 'Reception Team', department: 'Cardiology', subject: 'Post-discharge follow-up call', description: 'Patient discharged 3 days ago. Need to schedule 1-week cardiology review.', source: 'Phone' },
        { id: 'CRM-002', patientId: 'PT-004', patientName: 'Meena Bai', phone: '9876543211', type: 'Complaint', urgency: 'High', status: 'In Progress', assignedTo: 'Quality Manager', department: 'Billing', subject: 'Incorrect bill amount raised', description: 'Patient claims she was charged for lab tests that were not performed. Bill amount ₹8,200 disputed.', source: 'Walk-in' },
        { id: 'CRM-003', patientId: 'PT-005', patientName: 'Suresh Pillai', phone: '9876543212', type: 'Feedback', urgency: 'Low', status: 'Resolved', assignedTo: 'Nursing Head', department: 'IPD', subject: 'Positive feedback — nursing care', description: 'Patient highly appreciates the nursing staff in ICU Ward. Especially night shift nurses.', rating: 5, resolvedNotes: 'Thank you note sent to nursing team.', resolvedAt: '2025-01-12', source: 'WhatsApp' }
      ]);
      data = await CRMEntry.find({}).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching CRM entries' });
  }
});

router.post('/crm', async (req, res) => {
  try {
    const c = new CRMEntry(req.body);
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: 'Error creating CRM entry' });
  }
});

router.put('/crm/:id', async (req, res) => {
  try {
    const c = await CRMEntry.findOneAndUpdate({ id: req.params.id }, { ...req.body, updatedAt: new Date().toISOString() }, { new: true });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: 'Error updating CRM entry' });
  }
});

router.delete('/crm/:id', async (req, res) => {
  try {
    await CRMEntry.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting CRM entry' });
  }
});

// =====================================================
// COMPLIANCE
// =====================================================
router.get('/compliance', async (req, res) => {
  try {
    let data = await ComplianceItem.find({}).sort({ dueDate: 1 });
    if (data.length === 0) {
      await ComplianceItem.insertMany([
        { id: 'CMP-001', title: 'NABH Accreditation Renewal', category: 'NABH', description: 'National Accreditation Board for Hospitals & Healthcare Providers annual renewal', responsibleOfficer: 'Dr. Ramesh Admin', department: 'Administration', dueDate: '2025-06-30', lastAuditDate: '2024-06-30', nextAuditDate: '2025-06-01', status: 'Compliant', certificateNo: 'NABH-H-2024-1234', issuedBy: 'NABH India', validFrom: '2024-07-01', validUntil: '2025-06-30', notes: 'All standards met. Minor observations resolved.' },
        { id: 'CMP-002', title: 'Fire NOC Certificate', category: 'Fire Safety', description: 'Fire department No Objection Certificate for hospital premises', responsibleOfficer: 'Safety Officer Murugan', department: 'Facilities', dueDate: '2025-03-15', lastAuditDate: '2024-03-15', status: 'Due Soon', certificateNo: 'FIRE-2024-8821', validFrom: '2024-03-15', validUntil: '2025-03-15', notes: 'Renewal application to be submitted 30 days before expiry.' },
        { id: 'CMP-003', title: 'Biomedical Waste Authorization', category: 'Biomedical Waste', description: 'State Pollution Control Board BMW authorization for biomedical waste disposal', responsibleOfficer: 'Infection Control Nurse Geetha', department: 'Nursing', dueDate: '2025-02-28', lastAuditDate: '2024-02-28', status: 'Overdue', certificateNo: 'BMW-2024-7720', validFrom: '2024-02-28', validUntil: '2025-02-28', actionRequired: 'Renew immediately — submit Form 1 to SPCB' },
        { id: 'CMP-004', title: 'Drug License (Retail Pharmacy)', category: 'Drug License', description: 'State Drug Control Authority retail pharmacy license', responsibleOfficer: 'Chief Pharmacist Anand', department: 'Pharmacy', dueDate: '2025-12-31', status: 'Compliant', certificateNo: 'DL-TN-2024-33421', validFrom: '2024-01-01', validUntil: '2025-12-31' },
        { id: 'CMP-005', title: 'AERB Radiation Safety Clearance', category: 'AERB', description: 'Atomic Energy Regulatory Board clearance for CT Scanner and X-Ray units', responsibleOfficer: 'Dr. Radiology Head Kumar', department: 'Radiology', dueDate: '2025-09-30', status: 'Compliant', certificateNo: 'AERB-2024-RD-991', validFrom: '2024-10-01', validUntil: '2025-09-30' },
        { id: 'CMP-006', title: 'Labour Welfare Fund Compliance', category: 'Labour Law', description: 'Annual labour welfare fund contribution and ESI/PF compliance filing', responsibleOfficer: 'HR Manager Priya', department: 'HR', dueDate: '2025-04-30', status: 'Under Review', notes: 'ESI filing for Q3 pending. Documents under review by HR.' }
      ]);
      data = await ComplianceItem.find({}).sort({ dueDate: 1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching compliance items' });
  }
});

router.post('/compliance', async (req, res) => {
  try {
    const c = new ComplianceItem(req.body);
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: 'Error creating compliance item' });
  }
});

router.put('/compliance/:id', async (req, res) => {
  try {
    const c = await ComplianceItem.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: 'Error updating compliance item' });
  }
});

router.delete('/compliance/:id', async (req, res) => {
  try {
    await ComplianceItem.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting compliance item' });
  }
});

// ─── INPATIENT DISCHARGE FEEDBACK ROUTES ──────────────────────────────────
router.get('/discharge-feedback', async (req, res) => {
  try {
    let data = await DischargeFeedback.find({}).sort({ createdAt: -1 });
    if (data.length === 0) {
      await DischargeFeedback.insertMany([
        { id: 'FB-001', patientId: 'PT-001', patientName: 'Senthil Murugan', dischargeDate: '2026-07-14', doctorRating: 5, nurseRating: 4, cleanlinessRating: 5, foodRating: 4, billingRating: 5, recommend: 'Yes', comments: 'Superb care by Doctor Varma and the nursing staff. Discharge process was extremely quick and clear.' },
        { id: 'FB-002', patientId: 'PT-002', patientName: 'Arun Patel', dischargeDate: '2026-07-12', doctorRating: 4, nurseRating: 5, cleanlinessRating: 4, foodRating: 3, billingRating: 4, recommend: 'Yes', comments: 'Overall good treatment. Food taste could be slightly improved but nutrition was perfect.' },
        { id: 'FB-003', patientId: 'PT-003', patientName: 'Kavitha Nair', dischargeDate: '2026-07-10', doctorRating: 5, nurseRating: 5, cleanlinessRating: 5, foodRating: 5, billingRating: 3, recommend: 'Yes', comments: 'Highly satisfied with doctors and nurses. Insurance approval at billing took a bit longer than expected.' }
      ]);
      data = await DischargeFeedback.find({}).sort({ createdAt: -1 });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching discharge feedbacks' });
  }
});

router.post('/discharge-feedback', async (req, res) => {
  try {
    const f = new DischargeFeedback(req.body);
    await f.save();
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: 'Error creating discharge feedback' });
  }
});

router.delete('/discharge-feedback/:id', async (req, res) => {
  try {
    await DischargeFeedback.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting discharge feedback' });
  }
});

export default router;

