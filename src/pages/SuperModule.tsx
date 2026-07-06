import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, Stethoscope, Scissors, UserCheck, ShieldCheck, Heart,
  Ambulance, Droplets, UtensilsCrossed, Sparkles, Building2, Wrench,
  FileArchive, MessageSquare, BarChart3, Clock, AlertCircle, FileText, Check, Plus, Printer
} from 'lucide-react';
import { api } from '../utils/api';
import { bloodInventory } from '../data/mockData';
import { exportTablePDF } from '../utils/exportUtils';

const SuperModule: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Local actions for interactive state
  const [localStaff, setLocalStaff] = useState<any[]>([]);
  const [localAmbulances, setLocalAmbulances] = useState<any[]>([]);
  const [localClaims, setLocalClaims] = useState<any[]>([]);
  const [localSurgeries, setLocalSurgeries] = useState<any[]>([]);
  const [selectedStaffPayslip, setSelectedStaffPayslip] = useState<any>(null);

  const loadData = async () => {
    try {
      const s = await api.getStaff();
      setLocalStaff(s);
      const a = await api.getAmbulances();
      setLocalAmbulances(a);
      const c = await api.getClaims();
      setLocalClaims(c);
      const surg = await api.getSurgeries();
      setLocalSurgeries(surg);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [path]);

  const handleToggleAttendance = async (id: string) => {
    const stf = localStaff.find(s => s.id === id);
    const newStatus = stf?.attendance === 'Present' ? 'Leave' : 'Present';
    try {
      await api.updateStaff(id, { attendance: newStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchAmbulance = async (id: string) => {
    const amb = localAmbulances.find(a => a.id === id);
    const newStatus = amb?.status === 'Available' ? 'On Call' : 'Available';
    try {
      await api.updateAmbulance(id, { status: newStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveClaim = async (id: string) => {
    const claim = localClaims.find(c => c.id === id);
    try {
      await api.updateClaim(id, { status: 'Approved', approved: claim?.claimAmount || 10000 });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSurgery = async (id: string) => {
    try {
      await api.updateSurgery(id, { status: 'Completed', outcome: 'Successful' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Rendering logic based on path
  if (path === '/emergency') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title text-danger">Emergency Department (ER)</h1>
            <p className="page-subtitle">Critical trauma care triage console, live emergency ambulance alerts.</p>
          </div>
          <span className="badge badge-danger">3 Critical Triage Alerts</span>
        </div>
        <div className="grid grid-3">
          <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
            <h3 className="card-title text-danger">Red Zone Triage</h3>
            <p className="text-secondary text-sm">Resuscitation & immediate life support cases.</p>
            <div className="timeline mt-md">
              <div className="timeline-item">
                <div className="timeline-icon bg-danger" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)' }}><AlertCircle size={14} /></div>
                <div className="timeline-content">
                  <div className="font-semibold text-primary">Senthil Murugan (Cardiogenic Shock)</div>
                  <span className="timeline-time">Admitted 20 mins ago | ICU-1</span>
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid var(--color-warning)', gridColumn: 'span 2' }}>
            <h3 className="card-title text-warning">Yellow Zone Admissions</h3>
            <table className="table mt-sm">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Age/Gender</th>
                  <th>Symptom/Diagnosis</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold text-primary">Arun Patel</td>
                  <td>28 / Male</td>
                  <td>Severe High Grade Pyrexia</td>
                  <td><span className="badge badge-warning">Admitting</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/emr') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Electronic Medical Records (EMR/EHR)</h1>
            <p className="page-subtitle">Centralized archive of patient clinical logs, historical prescriptions, imaging records.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">Digital Health Record Vault</h3>
          <p className="text-secondary text-sm mt-xs">Use the search bar above to fetch an active patient's warded health files or generate an EMR summary sheet.</p>
          <div className="empty-state">
            <FileText size={48} className="text-muted mb-md" />
            <div className="empty-state-title">Browse Patient EMR Files</div>
            <p className="text-secondary text-xs">Navigate to the <span className="text-accent font-semibold">Patients</span> directory to search individual files and download print-ready records.</p>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/nursing') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Nursing Care Management</h1>
            <p className="page-subtitle">Shift handover checklist logs, warded vitals recording, nursing care plans.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Shift Nursing Ward Allocation</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nurse Name</th>
                  <th>Department Unit</th>
                  <th>Assigned Ward</th>
                  <th>Current Shift</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {localStaff.filter(s => s.role === 'Nurse').map(nurse => (
                  <tr key={nurse.id}>
                    <td className="font-semibold text-primary">{nurse.name}</td>
                    <td>{nurse.dept}</td>
                    <td>General Ward B</td>
                    <td><span className="badge badge-purple">{nurse.shift}</span></td>
                    <td><span className="badge badge-success">On Duty</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/ot') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Operation Theatre (OT) Console</h1>
            <p className="page-subtitle">Surgical scheduler, intra-operative team allocation, surgical outcome summaries.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Surgery Schedules</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Patient Name</th>
                  <th>Surgical Procedure</th>
                  <th>Surgeon</th>
                  <th>OT Unit</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localSurgeries.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-accent">{s.id}</td>
                    <td className="font-semibold text-primary">{s.patientName}</td>
                    <td>{s.procedure}</td>
                    <td>{s.surgeon}</td>
                    <td>{s.theatre}</td>
                    <td>{s.duration || 'Scheduled'}</td>
                    <td>
                      <span className={`badge badge-${
                        s.status === 'Completed' ? 'success' :
                        s.status === 'In Progress' ? 'warning' : 'primary'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {s.status !== 'Completed' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleCompleteSurgery(s.id)}>
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/beds') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Room & Bed Management Dashboard</h1>
            <p className="page-subtitle">Admissions wing bed occupancy statistics, housekeeping cleaning status.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">Ward Occupancy Logs</h3>
          <div className="empty-state">
            <Building2 size={48} className="text-muted mb-md" />
            <div className="empty-state-title">Inspect Wards Detail</div>
            <p className="text-secondary text-xs">Navigate to the main <span className="text-accent font-semibold">IPD</span> tab to allocate beds or request ward transfers.</p>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/insurance') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Insurance & TPA Claims Console</h1>
            <p className="page-subtitle">Cashless pre-auth requests, corporate medical claims tracking.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Active Pre-Auth Claims</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Patient Name</th>
                  <th>Insurer / TPA</th>
                  <th>Claim Amt</th>
                  <th>Approved</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localClaims.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold text-accent">{c.id}</td>
                    <td className="font-semibold text-primary">{c.patientName}</td>
                    <td>{c.insurer} ({c.tpa})</td>
                    <td>₹{c.claimAmount}</td>
                    <td>{c.approved ? `₹${c.approved}` : 'Pending'}</td>
                    <td>
                      <span className={`badge badge-${
                        c.status === 'Approved' ? 'success' :
                        c.status === 'Partial Approved' ? 'warning' : 'primary'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {c.status !== 'Approved' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleApproveClaim(c.id)}>
                          Approve Cashless
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/doctors') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Doctor Profiles & Specializations</h1>
            <p className="page-subtitle">Consultant charge registry, specialist shifts, and availability schedules.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Specialist Registry</h3>
          <div className="empty-state">
            <Stethoscope size={48} className="text-muted mb-md" />
            <div className="empty-state-title">Specialist Profiles Directory</div>
            <p className="text-secondary text-xs">Doctor details can be monitored directly. Navigate to the main scheduling dashboard to book slots.</p>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/staff') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Human Resources (HR) & Staff Management</h1>
            <p className="page-subtitle">Shift attendances tracker, payroll status, leave requests console.</p>
          </div>
        </div>
        <div className="card">
          <div className="section-header">
            <h3 className="card-title">Employee Registry & Attendances</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Employee Name</th>
                  <th>Role / Designation</th>
                  <th>Shift Hour</th>
                  <th>Attendance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localStaff.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-accent">{s.id}</td>
                    <td className="font-semibold text-primary">{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.shift}</td>
                    <td>
                      <span className={`badge badge-${s.attendance === 'Present' ? 'success' : 'danger'}`}>
                        {s.attendance}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggleAttendance(s.id)}>
                          Toggle Attendance
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedStaffPayslip(s)}>
                          Payslip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/inventory') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Inventory & Procurement Hub</h1>
            <p className="page-subtitle">Medical supplies purchase orders, vendor invoices check list.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">Procurements & Asset Audits</h3>
          <div className="empty-state">
            <Wrench size={48} className="text-muted mb-md" />
            <div className="empty-state-title">Clinical Logistics Store</div>
            <p className="text-secondary text-xs">Review the safety thresholds under the <span className="text-accent font-semibold">Pharmacy</span> tab to inspect stock levels or raise vendor requests.</p>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/bloodbank') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Blood Bank Inventory Center</h1>
            <p className="page-subtitle">Whole blood units warded, group cross-matching status, collection tracking.</p>
          </div>
        </div>
        <div className="grid grid-4 mb-lg">
          {bloodInventory.map(b => (
            <div className="kpi-card" key={b.group}>
              <div className="kpi-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-light)' }}>
                <Droplets size={20} fill="currentColor" />
              </div>
              <div className="kpi-body">
                <div className="kpi-label">Blood Group {b.group}</div>
                <div className="kpi-value">{b.available} Units</div>
                <div className="text-secondary text-xs">Reserved: {b.reserved} U</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (path === '/ambulance') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Ambulance Dispatch Hub</h1>
            <p className="page-subtitle">GPS vehicle location tracking, driver emergency dispatchers.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Emergency Ambulance Fleet</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>License Plate</th>
                  <th>Vehicle Type</th>
                  <th>Driver Name</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localAmbulances.map(amb => (
                  <tr key={amb.id}>
                    <td className="font-semibold text-accent">{amb.id}</td>
                    <td className="font-semibold text-primary">{amb.regNo}</td>
                    <td>{amb.type}</td>
                    <td>{amb.driver} ({amb.phone})</td>
                    <td>
                      <span className={`badge badge-${amb.status === 'Available' ? 'success' : 'warning'}`}>
                        {amb.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDispatchAmbulance(amb.id)}>
                        {amb.status === 'Available' ? 'Dispatch Driver' : 'Mark Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">MediCore Support Modules</h1>
        <p className="page-subtitle">Operational support databases.</p>
      </div>
      <div className="card">
        <h3 className="card-title">Hospital Services</h3>
        <p className="text-secondary text-sm mt-xs">This panel integrates all minor support departments (Diet, Facility, CRM feedback, MRD logs, and Reports charts) within the central database system.</p>
        <div className="empty-state">
          <Sparkles size={48} className="text-accent mb-md" />
          <div className="empty-state-title">Services Interface Online</div>
          <p className="text-secondary text-xs">Standard compliance check points are logging activity continuously. Use the navigation sidebar to configure logs.</p>
        </div>
      </div>

      {/* Employee payroll payslip printing modal */}
      {selectedStaffPayslip && (
        <div className="modal-overlay">
          <div className="modal modal-lg preview-mode">
            <div className="modal-header">
              <h2 className="modal-title">Employee Payslip Console</h2>
              <button className="btn-secondary" onClick={() => setSelectedStaffPayslip(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc' }}>
              <div className="print-letterhead" style={{ display: 'block', border: '1px solid #cbd5e1', padding: 24, background: '#ffffff', borderRadius: 8 }}>
                <div className="print-letterhead-header">
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-light)' }}>MEDICORE HOSPITAL</h2>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Corporate HR Operations & Payroll Center</p>
                  </div>
                  <div className="print-hospital-details">
                    <p>100, OMR IT Highway, Chennai - 600096</p>
                    <p>Phone: +91 44 4890 3000 | Email: hr@medicore.org</p>
                  </div>
                </div>
                <div className="print-doc-title">SALARY SLIP — JULY 2026</div>

                <div className="print-grid-2">
                  <div className="print-grid-item">
                    <div className="print-grid-label">EMPLOYEE NAME</div>
                    <div className="font-bold text-primary">{selectedStaffPayslip.name}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">EMPLOYEE ID / DESIGNATION</div>
                    <div>{selectedStaffPayslip.id} | {selectedStaffPayslip.role}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">SHIFT HOURS</div>
                    <div>{selectedStaffPayslip.shift}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">ATTENDANCE STATUS</div>
                    <div className="font-semibold text-success">{selectedStaffPayslip.attendance}</div>
                  </div>
                </div>

                <div className="grid grid-2 mb-md" style={{ gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div>
                    <div className="font-bold text-xs text-secondary mb-sm uppercase">Earnings Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                      <div className="flex justify-between"><span>Basic Salary:</span><span className="font-semibold">₹45,000.00</span></div>
                      <div className="flex justify-between"><span>House Rent Allowance (HRA):</span><span className="font-semibold">₹15,000.00</span></div>
                      <div className="flex justify-between"><span>Conveyance Allowances:</span><span className="font-semibold">₹5,000.00</span></div>
                      <div className="flex justify-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, fontWeight: 'bold' }}>
                        <span>Total Earnings (A):</span><span>₹65,000.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-secondary mb-sm uppercase">Deductions Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                      <div className="flex justify-between"><span>Provident Fund (PF):</span><span className="font-semibold">₹3,500.00</span></div>
                      <div className="flex justify-between"><span>Professional Tax:</span><span className="font-semibold">₹200.00</span></div>
                      <div className="flex justify-between"><span>Medical Insurance contribution:</span><span className="font-semibold">₹1,300.00</span></div>
                      <div className="flex justify-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, fontWeight: 'bold' }}>
                        <span>Total Deductions (B):</span><span>₹5,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center" style={{ borderTop: '2px solid #0f172a', paddingTop: '12px', marginTop: '20px' }}>
                  <div className="font-bold text-primary" style={{ fontSize: '16px' }}>NET DISBURSED SALARY (A - B)</div>
                  <div className="font-extrabold text-accent" style={{ fontSize: '20px' }}>₹60,000.00</div>
                </div>

                <div className="print-signature-row" style={{ marginTop: '40px' }}>
                  <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Employee Signature</p>
                  </div>
                  <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>HR Administrator</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedStaffPayslip(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ justifyContent: 'center' }}>
                <Printer size={14} style={{ marginRight: 6 }} /> Print Payslip Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperModule;
