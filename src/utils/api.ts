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
  updateStaff: async (id: string, updates: any) => {
    const res = await fetch(`${API_BASE}/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
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
  }
};
