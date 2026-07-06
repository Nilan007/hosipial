import express from 'express';
import {
  User, Patient, Appointment, Ward, Bed, Bill, LabTest,
  Prescription, DrugInventory, Staff, RadiologyScan, AuditLog,
  Surgery, InsuranceClaim, Ambulance
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

router.put('/staff/:id', async (req, res) => {
  try {
    const updated = await Staff.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error' });
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

export default router;
