import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve('db_fallback.json');

let localDb = {};
if (fs.existsSync(DB_FILE)) {
  try {
    localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    localDb = {};
  }
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), 'utf8');
}

// Seed helper if empty
export function seedLocalDatabaseIfEmpty() {
  console.log('[Fallback DB] Checking and seeding local offline database...');
  
  // Seed Users
  if (!localDb.users || localDb.users.length === 0) {
    localDb.users = [
      { id: 'U001', username: 'admin', password: 'hospital@2026', role: 'Administrator', name: 'Dr. Admin Kumar', dept: 'Administration', avatar: '🛡️', isAdmin: true, isActive: true, permissions: ['*'] },
      { id: 'U002', username: 'doctor', password: 'doctor123', role: 'Doctor', name: 'Dr. Anand Krishnamurthy', dept: 'Cardiology', avatar: 'AK', doctorId: 'DOC-001' },
      { id: 'U003', username: 'nurse', password: 'nurse123', role: 'Nurse', name: 'Geetha Selvaraj', dept: 'General Ward', avatar: 'GS', staffId: 'STF-002' }
    ];
  }

  // Seed Patients
  if (!localDb.patients || localDb.patients.length === 0) {
    localDb.patients = [
      { id: 'MRN-10001', name: 'Rajesh Kumar', age: 45, gender: 'Male', dob: '1979-03-15', blood: 'B+', phone: '9876543210', email: 'rajesh.k@gmail.com', address: '12, Gandhi Nagar, Chennai', insurance: 'Star Health - SH78934', emergency: 'Priya Kumar', emergencyPhone: '9876543211', allergies: ['Penicillin'], chronic: ['Hypertension', 'Diabetes Type 2'], regDate: '2024-01-10', status: 'Active', lastVisit: '2026-06-28', fasttrackSubscription: { status: 'Active', planName: 'VIP Fasttrack Pass', pricePaid: 999, startDate: '2026-07-01', endDate: '2026-08-01', priorityTier: 'High', autoRenew: true } },
      { id: 'MRN-10002', name: 'Priya Sharma', age: 32, gender: 'Female', dob: '1992-07-22', blood: 'O+', phone: '9123456789', email: 'priya.s@gmail.com', address: '45, Anna Nagar, Chennai', insurance: 'HDFC Ergo - HE45621', emergency: 'Vikram Sharma', emergencyPhone: '9123456780', allergies: ['Sulfa'], chronic: ['Asthma'], regDate: '2024-02-18', status: 'Active', lastVisit: '2026-07-01', fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false } }
    ];
  }

  // Seed Appointments
  if (!localDb.appointments || localDb.appointments.length === 0) {
    localDb.appointments = [
      { id: 'APT-5001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', doctorName: 'Dr. Anand K.', dept: 'Cardiology', date: '2026-07-07', time: '09:00', type: 'Online', status: 'Confirmed', token: 'T-001', notes: 'Follow-up for ECG' },
      { id: 'APT-5002', patientId: 'MRN-10002', patientName: 'Priya Sharma', doctorId: 'DOC-004', doctorName: 'Dr. Lakshmi Priya', dept: 'Gynecology', date: '2026-07-07', time: '11:00', type: 'Walk-in', status: 'Waiting', token: 'T-002', notes: 'Antenatal check-up' }
    ];
  }

  // Seed Wards
  if (!localDb.wards || localDb.wards.length === 0) {
    localDb.wards = [
      { id: 'W-001', name: 'General Ward - Male', beds: 30, occupied: 22, type: 'General' },
      { id: 'W-002', name: 'General Ward - Female', beds: 30, occupied: 18, type: 'General' },
      { id: 'W-003', name: 'ICU', beds: 10, occupied: 8, type: 'ICU' }
    ];
  }

  // Seed Beds
  if (!localDb.beds || localDb.beds.length === 0) {
    localDb.beds = [
      { id: 'B-001', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1A', type: 'General', status: 'Occupied', patientId: 'MRN-10003', patientName: 'Mohammed Ali', admitDate: '2026-07-02', rate: 1200 },
      { id: 'B-002', wardId: 'W-001', wardName: 'General Ward - Male', roomNo: '101', bedNo: '1B', type: 'General', status: 'Vacant', patientId: null, patientName: null, admitDate: null, rate: 1200 }
    ];
  }

  // Seed Bills
  if (!localDb.bills || localDb.bills.length === 0) {
    localDb.bills = [
      { id: 'INV-2001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', date: '2026-07-05', type: 'IP', items: [{desc: 'Room Charge (3 days)', qty: 3, rate: 5000, amount: 15000}], subtotal: 15000, gst: 1350, discount: 0, total: 16350, paid: 10000, balance: 6350, status: 'Partial', payment: 'Cash' }
    ];
  }

  // Seed LabTests
  if (!localDb.labtests || localDb.labtests.length === 0) {
    localDb.labtests = [
      { id: 'LAB-3001', patientId: 'MRN-10001', patientName: 'Rajesh Kumar', doctorId: 'DOC-001', testName: 'Complete Blood Count (CBC)', category: 'Hematology', ordered: '2026-07-05 09:30', collected: '2026-07-05 10:00', status: 'Completed', result: { Hemoglobin: '13.2 g/dL' }, criticalValues: false, cost: 600 }
    ];
  }

  // Seed DrugInventory
  if (!localDb.druginventories || localDb.druginventories.length === 0) {
    localDb.druginventories = [
      { id: 'DRG-001', name: 'Paracetamol 500mg', category: 'Analgesic', form: 'Tablet', manufacturer: 'Sun Pharma', batch: 'B2024-001', expiry: '2026-12-31', stock: 5000, minStock: 500, mrp: 3.50, purchaseRate: 1.80, unit: 'Tablet', location: 'R-A-01', lowStock: false, controlled: false }
    ];
  }

  // Seed Staff
  if (!localDb.staffs || localDb.staffs.length === 0) {
    localDb.staffs = [
      { id: 'STF-001', name: 'Anil Ramachandran', role: 'Nurse', dept: 'ICU', phone: '9700000001', email: 'anil.r@medicore.com', shift: 'Morning', attendance: 'Present', salary: 35000, joinDate: '2021-06-01', status: 'Active' },
      { id: 'STF-002', name: 'Geetha Selvaraj', role: 'Nurse', dept: 'General Ward', phone: '9700000002', email: 'geetha.s@medicore.com', shift: 'Evening', attendance: 'Present', salary: 32000, joinDate: '2020-09-15', status: 'Active' }
    ];
  }

  // Seed Ambulances
  if (!localDb.ambulances || localDb.ambulances.length === 0) {
    localDb.ambulances = [
      { id: 'AMB-001', regNo: 'TN-01-AB-1234', type: 'Advanced Life Support', driver: 'Murugan S', phone: '9600000001', status: 'Available', lat: 13.0827, lng: 80.2707 }
    ];
  }

  // Seed Assets
  if (!localDb.assets || localDb.assets.length === 0) {
    localDb.assets = [
      { id: 'AST-RAD-101', name: 'General Electric MRI 3T Scanner', category: 'Radiology Equipment', department: 'Radiology', responsiblePerson: 'Dr. Anand K.', serialNumber: 'GE-3T-88921A', worth: 18000000, status: 'Operational', purchaseDate: '2025-01-15', lastServiceDate: '2026-06-10', nextServiceDate: '2026-12-10', maintenanceNotes: 'System calibrated. Vacuum levels verified within spec.' }
    ];
  }

  // Seed Diet
  if (!localDb.dietplans || localDb.dietplans.length === 0) {
    localDb.dietplans = [
      { id: 'DIET-001', patientId: 'PT-001', patientName: 'Ramesh Kumar', nutritionist: 'Ms. Priya Iyer', dietType: 'Diabetic', calories: 1600, breakfast: 'Oats porridge, Green tea', lunch: 'Brown rice, Dal, Sabzi', dinner: 'Chapati, Grilled chicken', restrictions: 'No sugar', startDate: '2026-07-10', endDate: '2026-08-10', status: 'Active', ward: 'General Ward', bedNo: 'G-12' },
      { id: 'DIET-002', patientId: 'PT-002', patientName: 'Lalitha Devi', nutritionist: 'Ms. Priya Iyer', dietType: 'Cardiac', calories: 1800, breakfast: 'Idli, low fat sambar', lunch: 'Red rice, fish curry', dinner: 'Chapati, Dal', restrictions: 'Low sodium', startDate: '2026-07-12', endDate: '2026-08-12', status: 'Active', ward: 'ICU Step Down', bedNo: 'ICU-3' }
    ];
  }

  // Seed Housekeeping
  if (!localDb.housekeepingtasks || localDb.housekeepingtasks.length === 0) {
    localDb.housekeepingtasks = [
      { id: 'HK-101', roomNo: '102', ward: 'General Ward', floor: '1st Floor', taskType: 'Cleaning', assignedTo: 'Ramesh V.', supervisedBy: 'Rajan P.', priority: 'Normal', status: 'Pending', scheduledTime: '10:00', shift: 'Morning', notes: 'Routine patient room wash' },
      { id: 'HK-102', roomNo: 'ICU-3', ward: 'ICU', floor: '2nd Floor', taskType: 'Linen Change', assignedTo: 'Sumathi K.', supervisedBy: 'Rajan P.', priority: 'Urgent', status: 'In Progress', scheduledTime: '11:30', shift: 'Morning', notes: 'Bed sheet change post rounds' }
    ];
  }

  // Seed Medical Records
  if (!localDb.medicalrecords || localDb.medicalrecords.length === 0) {
    localDb.medicalrecords = [
      { id: 'MRD-101', patientId: 'PT-001', patientName: 'Ramesh Kumar', mrn: 'MRN-10001', doctorId: 'DOC-001', doctorName: 'Dr. Anand K.', recordType: 'Discharge Summary', date: '2026-07-10', department: 'Cardiology', diagnosis: 'Coronary Artery Disease', content: 'Patient admitted with stable angina. Medical management optimized. Discharged in stable condition.', tags: ['Cardiac'], confidential: false, status: 'Active' }
    ];
  }

  // Seed CRM
  if (!localDb.crmentries || localDb.crmentries.length === 0) {
    localDb.crmentries = [
      { id: 'CRM-101', patientId: 'PT-001', patientName: 'Ramesh Kumar', phone: '9876543210', type: 'Follow-up', urgency: 'Normal', status: 'Open', assignedTo: 'Outreach Team', department: 'Cardiology', subject: '2-Week Checkup Call', description: 'Check patient recovery status post discharge.', source: 'Phone' }
    ];
  }

  // Seed Compliance
  if (!localDb.complianceitems || localDb.complianceitems.length === 0) {
    localDb.complianceitems = [
      { id: 'CMP-101', title: 'Fire Safety Clearance NOC', category: 'Fire Safety', description: 'Annual fire marshal facility inspection and clearance', responsibleOfficer: 'Safety Manager Hari', department: 'Facilities', dueDate: '2026-10-31', lastAuditDate: '2025-10-15', status: 'Compliant', certificateNo: 'FS-NOC-2026-88', issuedBy: 'State Fire Services', validFrom: '2025-11-01', validUntil: '2026-10-31', actionRequired: 'Renew 30 days prior' }
    ];
  }

  // Seed Financial Transactions
  if (!localDb.financialtransactions || localDb.financialtransactions.length === 0) {
    localDb.financialtransactions = [
      { id: 'TXN-001', date: '2026-07-01', category: 'Patient Consultation', description: 'Consultation Fees - Dr. Anand', type: 'Income', amount: 15000, status: 'Settled', paymentMethod: 'Card', bankAccount: 'HDFC Main', partyName: 'Rajesh Kumar' },
      { id: 'TXN-002', date: '2026-07-03', category: 'Pharmacy Sales', description: 'Outpatient medicine sales summary', type: 'Income', amount: 28500, status: 'Settled', paymentMethod: 'UPI', bankAccount: 'SBI Operations', partyName: 'Walk-in Pharmacy' },
      { id: 'TXN-003', date: '2026-07-05', category: 'Staff Salary & Bonus', description: 'Executive and nurse salary disbursements', type: 'Expense', amount: 145000, status: 'Settled', paymentMethod: 'Bank Transfer', bankAccount: 'SBI Operations', partyName: 'MediCore Staff' },
      { id: 'TXN-004', date: '2026-07-06', category: 'Inventory Supply Purchase', description: 'Purchase of disposable syringes & IV sets', type: 'Expense', amount: 32000, status: 'Settled', paymentMethod: 'Bank Transfer', bankAccount: 'HDFC Main', partyName: 'MediStore Suppliers' },
      { id: 'TXN-005', date: '2026-07-10', category: 'Hospital Rent', description: 'Monthly facility building lease payment', type: 'Expense', amount: 80000, status: 'Settled', paymentMethod: 'Cheque', bankAccount: 'HDFC Main', partyName: 'City Realtors Ltd' },
      { id: 'TXN-006', date: '2026-07-12', category: 'Patient Consultation', description: 'IPD ward consultation charge', type: 'Income', amount: 12000, status: 'Pending', dueDate: '2026-07-27', partyName: 'Mohammed Ali' },
      { id: 'TXN-007', date: '2026-07-13', category: 'Inventory Supply Purchase', description: 'Cardiac monitors supply invoice due', type: 'Expense', amount: 45000, status: 'Pending', dueDate: '2026-07-30', partyName: 'Biotronik India' },
      { id: 'TXN-008', date: '2026-07-14', category: 'Laboratory/LIMS Fees', description: 'Diagnostic lab tests collection', type: 'Income', amount: 8400, status: 'Settled', paymentMethod: 'Cash', bankAccount: 'Petty Cash Drawer', partyName: 'Priya Sharma' }
    ];
  }

  saveDb();
  console.log('[Fallback DB] Seeding completed.');
}

export function enableMongooseFallback(mongoose) {
  const originalModel = mongoose.model;

  mongoose.model = function(name, schema, collection) {
    const Model = originalModel.call(mongoose, name, schema, collection);
    const collName = Model.collection.name;

    if (!localDb[collName]) {
      localDb[collName] = [];
    }

    // Intercept find
    const origFind = Model.find;
    Model.find = function(query, projection, options) {
      if (mongoose.connection.readyState === 1) {
        return origFind.apply(Model, arguments);
      }
      const docs = localDb[collName] || [];
      let filtered = [...docs];
      if (query && typeof query === 'object') {
        filtered = filtered.filter(doc => {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return false;
            }
          }
          return true;
        });
      }
      
      const mockQuery = {
        then: function(cb) { return Promise.resolve(filtered).then(cb); },
        catch: function(cb) { return Promise.resolve(filtered).catch(cb); },
        sort: function() { return this; },
        limit: function() { return this; },
        select: function() { return this; }
      };
      return mockQuery;
    };

    // Intercept findOne
    const origFindOne = Model.findOne;
    Model.findOne = function(query, projection, options) {
      if (mongoose.connection.readyState === 1) {
        return origFindOne.apply(Model, arguments);
      }
      const docs = localDb[collName] || [];
      const found = docs.find(doc => {
        if (query && typeof query === 'object') {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      }) || null;

      const mockQuery = {
        then: function(cb) { return Promise.resolve(found).then(cb); },
        catch: function(cb) { return Promise.resolve(found).catch(cb); },
        sort: function() { return this; },
        limit: function() { return this; },
        select: function() { return this; }
      };
      return mockQuery;
    };

    // Intercept findOneAndUpdate
    const origFindOneUpdate = Model.findOneAndUpdate;
    Model.findOneAndUpdate = function(query, update, options) {
      if (mongoose.connection.readyState === 1) {
        return origFindOneUpdate.apply(Model, arguments);
      }
      const docs = localDb[collName] || [];
      const idx = docs.findIndex(doc => {
        if (query && typeof query === 'object') {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      });

      let updatedDoc = null;
      if (idx !== -1) {
        const target = docs[idx];
        const upObj = update && update.$set ? update.$set : update;
        docs[idx] = { ...target, ...upObj };
        updatedDoc = docs[idx];
        saveDb();
      }
      return Promise.resolve(updatedDoc);
    };

    // Intercept countDocuments
    const origCount = Model.countDocuments;
    Model.countDocuments = function(query, options) {
      if (mongoose.connection.readyState === 1) {
        return origCount.apply(Model, arguments);
      }
      const docs = localDb[collName] || [];
      let filtered = [...docs];
      if (query && typeof query === 'object') {
        filtered = filtered.filter(doc => {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return false;
            }
          }
          return true;
        });
      }
      return Promise.resolve(filtered.length);
    };

    // Intercept save
    const origSave = Model.prototype.save;
    Model.prototype.save = function(options) {
      if (mongoose.connection.readyState === 1) {
        return origSave.apply(this, arguments);
      }
      const doc = this.toObject ? this.toObject() : this;
      if (!doc._id) {
        doc._id = 'mock_' + Math.random().toString(36).substring(2, 11);
      }
      if (!doc.createdAt) {
        doc.createdAt = new Date().toISOString();
      }

      const idx = localDb[collName].findIndex(d => d.id === doc.id || (doc._id && d._id === doc._id));
      if (idx !== -1) {
        localDb[collName][idx] = { ...localDb[collName][idx], ...doc };
      } else {
        localDb[collName].push(doc);
      }
      saveDb();
      return Promise.resolve(this);
    };

    // Intercept deleteOne
    const origDeleteOne = Model.deleteOne;
    Model.deleteOne = function(query, options) {
      if (mongoose.connection.readyState === 1) {
        return origDeleteOne.apply(Model, arguments);
      }
      const docs = localDb[collName] || [];
      const idx = docs.findIndex(doc => {
        if (query && typeof query === 'object') {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return false;
            }
          }
        }
        return true;
      });
      if (idx !== -1) {
        docs.splice(idx, 1);
        saveDb();
      }
      return Promise.resolve({ deletedCount: idx !== -1 ? 1 : 0 });
    };

    // Intercept deleteMany
    const origDeleteMany = Model.deleteMany;
    Model.deleteMany = function(query, options) {
      if (mongoose.connection.readyState === 1) {
        return origDeleteMany.apply(Model, arguments);
      }
      let docs = localDb[collName] || [];
      const initialLen = docs.length;
      if (query && typeof query === 'object') {
        docs = docs.filter(doc => {
          for (let key in query) {
            if (query[key] !== undefined && doc[key] !== query[key]) {
              return true;
            }
          }
          return false;
        });
        localDb[collName] = docs;
        saveDb();
      } else {
        localDb[collName] = [];
        saveDb();
      }
      return Promise.resolve({ deletedCount: initialLen - docs.length });
    };

    return Model;
  };
}
