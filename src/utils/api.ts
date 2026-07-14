const API_BASE = 'http://localhost:5050/api';

export const api = {
  // Stats
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return res.json();
  },

  // Patients
  getPatients: async () => {
    const res = await fetch(`${API_BASE}/patients`);
    return res.json();
  },
  createPatient: async (p: any) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    return res.json();
  },

  // Appointments
  getAppointments: async () => {
    const res = await fetch(`${API_BASE}/appointments`);
    return res.json();
  },
  createAppointment: async (apt: any) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apt)
    });
    return res.json();
  },
  updateAppointment: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // IPD Beds & Wards
  getBeds: async () => {
    const res = await fetch(`${API_BASE}/ipd/beds`);
    return res.json();
  },
  getWards: async () => {
    const res = await fetch(`${API_BASE}/ipd/wards`);
    return res.json();
  },
  updateBed: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/ipd/beds/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Billing
  getBills: async () => {
    const res = await fetch(`${API_BASE}/billing`);
    return res.json();
  },
  createBill: async (bill: any) => {
    const res = await fetch(`${API_BASE}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill)
    });
    return res.json();
  },

  // Pharmacy
  getDrugInventory: async () => {
    const res = await fetch(`${API_BASE}/pharmacy/inventory`);
    return res.json();
  },
  getPrescriptions: async () => {
    const res = await fetch(`${API_BASE}/pharmacy/prescriptions`);
    return res.json();
  },
  updatePrescription: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/pharmacy/prescriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Lab Tests
  getLabTests: async () => {
    const res = await fetch(`${API_BASE}/laboratory`);
    return res.json();
  },
  updateLabTest: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/laboratory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Radiology
  getRadiologyScans: async () => {
    const res = await fetch(`${API_BASE}/radiology`);
    return res.json();
  },
  updateRadiologyScan: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/radiology/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Staff
  getStaff: async () => {
    const res = await fetch(`${API_BASE}/staff`);
    return res.json();
  },
  createStaff: async (s: any) => {
    const res = await fetch(`${API_BASE}/staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(s)
    });
    return res.json();
  },
  updateStaff: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  deleteStaff: async (id: string) => {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Compliance Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/compliance/audits`);
    return res.json();
  },
  logAuditAction: async (log: any) => {
    const res = await fetch(`${API_BASE}/compliance/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    return res.json();
  },

  // Surgeries, Claims, Ambulances
  getSurgeries: async () => {
    const res = await fetch(`${API_BASE}/surgeries`);
    return res.json();
  },
  updateSurgery: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/surgeries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  getClaims: async () => {
    const res = await fetch(`${API_BASE}/claims`);
    return res.json();
  },
  updateClaim: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/claims/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  getAmbulances: async () => {
    const res = await fetch(`${API_BASE}/ambulances`);
    return res.json();
  },
  updateAmbulance: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/ambulances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Dynamic Patient Update (Subscription management)
  updatePatient: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Outside Radiology Labs CRUD
  getOutsideLabs: async () => {
    const res = await fetch(`${API_BASE}/outside-labs`);
    return res.json();
  },
  createOutsideLab: async (lab: any) => {
    const res = await fetch(`${API_BASE}/outside-labs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lab)
    });
    return res.json();
  },
  updateOutsideLab: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/outside-labs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Outside referrals log
  getOutsideReferrals: async () => {
    const res = await fetch(`${API_BASE}/outside-referrals`);
    return res.json();
  },
  createOutsideReferral: async (referral: any) => {
    const res = await fetch(`${API_BASE}/outside-referrals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referral)
    });
    return res.json();
  },

  // Outside lab commission invoices
  getOutsideInvoices: async () => {
    const res = await fetch(`${API_BASE}/outside-invoices`);
    return res.json();
  },
  generateOutsideInvoice: async (data: any) => {
    const res = await fetch(`${API_BASE}/outside-invoices/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  settleOutsideInvoice: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/outside-invoices/${id}/settle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Pharmacy Inventory Creation
  createDrugInventory: async (d: any) => {
    const res = await fetch(`${API_BASE}/pharmacy/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    return res.json();
  },

  // Financial Accounting API Mappings
  getTransactions: async () => {
    const res = await fetch(`${API_BASE}/accounting/transactions`);
    return res.json();
  },
  createTransaction: async (t: any) => {
    const res = await fetch(`${API_BASE}/accounting/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    return res.json();
  },
  updateTransaction: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/accounting/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },
  deleteTransaction: async (id: string) => {
    const res = await fetch(`${API_BASE}/accounting/transactions/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },
  disbursePayroll: async (data: any) => {
    const res = await fetch(`${API_BASE}/staff/disburse-payroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  
  // Procurements & Supplier Invoices
  getProcurements: async () => {
    const res = await fetch(`${API_BASE}/procurements`);
    return res.json();
  },
  createProcurement: async (data: any) => {
    const res = await fetch(`${API_BASE}/procurements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  payProcurement: async (id: string) => {
    const res = await fetch(`${API_BASE}/procurements/${id}/pay`, {
      method: 'PUT'
    });
    return res.json();
  },
  deleteProcurement: async (id: string) => {
    const res = await fetch(`${API_BASE}/procurements/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Vendor Management API Client
  getVendors: async () => {
    const res = await fetch(`${API_BASE}/vendors`);
    return res.json();
  },
  createVendor: async (data: any) => {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateVendor: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteVendor: async (id: string) => {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Asset Management API Client
  getAssets: async () => {
    const res = await fetch(`${API_BASE}/assets`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createAsset: async (data: any) => {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateAsset: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteAsset: async (id: string) => {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // ─── SYSTEM USERS (RBAC) ──────────────────────────────────────────
  getSystemUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createSystemUser: async (u: any) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    });
    return res.json();
  },
  updateSystemUser: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteSystemUser: async (id: string) => {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ─── DIET & NUTRITION ─────────────────────────────────────────────
  getDietPlans: async () => {
    const res = await fetch(`${API_BASE}/diet`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createDietPlan: async (d: any) => {
    const res = await fetch(`${API_BASE}/diet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    return res.json();
  },
  updateDietPlan: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/diet/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteDietPlan: async (id: string) => {
    const res = await fetch(`${API_BASE}/diet/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ─── HOUSEKEEPING ─────────────────────────────────────────────────
  getHousekeepingTasks: async () => {
    const res = await fetch(`${API_BASE}/housekeeping`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createHousekeepingTask: async (t: any) => {
    const res = await fetch(`${API_BASE}/housekeeping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(t)
    });
    return res.json();
  },
  updateHousekeepingTask: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/housekeeping/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteHousekeepingTask: async (id: string) => {
    const res = await fetch(`${API_BASE}/housekeeping/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ─── MEDICAL RECORDS ──────────────────────────────────────────────
  getMedicalRecords: async () => {
    const res = await fetch(`${API_BASE}/mrd`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createMedicalRecord: async (r: any) => {
    const res = await fetch(`${API_BASE}/mrd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    return res.json();
  },
  updateMedicalRecord: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/mrd/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ─── CRM ──────────────────────────────────────────────────────────
  getCRMEntries: async () => {
    const res = await fetch(`${API_BASE}/crm`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createCRMEntry: async (c: any) => {
    const res = await fetch(`${API_BASE}/crm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    });
    return res.json();
  },
  updateCRMEntry: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/crm/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteCRMEntry: async (id: string) => {
    const res = await fetch(`${API_BASE}/crm/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ─── COMPLIANCE ───────────────────────────────────────────────────
  getComplianceItems: async () => {
    const res = await fetch(`${API_BASE}/compliance`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createComplianceItem: async (c: any) => {
    const res = await fetch(`${API_BASE}/compliance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(c)
    });
    return res.json();
  },
  updateComplianceItem: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/compliance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteComplianceItem: async (id: string) => {
    const res = await fetch(`${API_BASE}/compliance/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // ─── INPATIENT DISCHARGE FEEDBACK API ──────────────────────────────────────
  getDischargeFeedbacks: async () => {
    const res = await fetch(`${API_BASE}/discharge-feedback`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  createDischargeFeedback: async (data: any) => {
    const res = await fetch(`${API_BASE}/discharge-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteDischargeFeedback: async (id: string) => {
    const res = await fetch(`${API_BASE}/discharge-feedback/${id}`, { method: 'DELETE' });
    return res.json();
  }
};


