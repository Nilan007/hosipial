import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, Stethoscope, Scissors, UserCheck, ShieldCheck, Heart,
  Ambulance, Droplets, UtensilsCrossed, Sparkles, Building2, Wrench,
  FileArchive, MessageSquare, BarChart3, Clock, AlertCircle, FileText, Check, Plus, Printer, Search
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

  // EMR state
  const [emrPatients, setEmrPatients] = useState<any[]>([]);
  const [emrSearch, setEmrSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeEmrTab, setActiveEmrTab] = useState('vitals');
  const [emrPrescriptions, setEmrPrescriptions] = useState<any[]>([]);
  const [emrLabTests, setEmrLabTests] = useState<any[]>([]);
  const [emrRadiologyScans, setEmrRadiologyScans] = useState<any[]>([]);
  const [emrBills, setEmrBills] = useState<any[]>([]);
  const [emrAppointments, setEmrAppointments] = useState<any[]>([]);

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

      // Load EMR Patients
      const p = await api.getPatients();
      setEmrPatients(p);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [path]);

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const [allPrescriptions, allLabs, allRadiology, allBills, allApts] = await Promise.all([
        api.getPrescriptions(),
        api.getLabTests(),
        api.getRadiologyScans(),
        api.getBills(),
        api.getAppointments()
      ]);

      setEmrPrescriptions(allPrescriptions.filter((x: any) => x.patientId === patient.id));
      setEmrLabTests(allLabs.filter((x: any) => x.patientId === patient.id || x.patientName === patient.name));
      setEmrRadiologyScans(allRadiology.filter((x: any) => x.patientId === patient.id || x.patientName === patient.name));
      setEmrBills(allBills.filter((x: any) => x.patientId === patient.id));
      setEmrAppointments(allApts.filter((x: any) => x.patientId === patient.id));
    } catch (err) {
      console.error("Error loading patient EMR details:", err);
    }
  };

  const handlePrintEMR = () => {
    if (!selectedPatient) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const vitals = selectedPatient.vitals || { bp: '120/80', pulse: '72 bpm', temp: '98.4 F', spo2: '98%' };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>EMR Summary - ${selectedPatient.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #0284c7; }
            .title { font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .patient-card div { font-size: 14px; }
            .patient-card strong { color: #475569; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-size: 13px; }
            th { background: #f1f5f9; color: #334155; font-weight: 600; }
            .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; }
            .badge-success { background: #dcfce7; color: #15803d; }
            .badge-warning { background: #fef9c3; color: #a16207; }
            .badge-danger { background: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 60px; border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">MEDICORE HMS</div>
              <div style="font-size: 12px; color: #64748b;">Clinical Care & EMR Registry</div>
            </div>
            <div style="text-align: right;">
              <div class="title">Electronic Health Record</div>
              <div style="font-size: 12px; color: #64748b;">MRN: ${selectedPatient.id}</div>
            </div>
          </div>
          
          <div class="patient-card">
            <div><strong>Patient Name:</strong> ${selectedPatient.name}</div>
            <div><strong>Age / Gender:</strong> ${selectedPatient.age} Yrs / ${selectedPatient.gender}</div>
            <div><strong>Blood Group:</strong> ${selectedPatient.blood || 'O+'}</div>
            <div><strong>Insurance Provider:</strong> ${selectedPatient.insurance || 'Self Pay'}</div>
            <div><strong>Chronic Conditions:</strong> ${selectedPatient.chronic?.join(', ') || 'None'}</div>
            <div><strong>Known Allergies:</strong> ${selectedPatient.allergies?.join(', ') || 'None'}</div>
            <div><strong>Emergency Contact:</strong> ${selectedPatient.emergency || 'N/A'} (${selectedPatient.emergencyPhone || 'N/A'})</div>
            <div><strong>Registered Date:</strong> ${selectedPatient.regDate || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Current Vital Signs</div>
            <table>
              <thead>
                <tr>
                  <th>Blood Pressure</th>
                  <th>Pulse Rate</th>
                  <th>Body Temperature</th>
                  <th>SpO2 Level</th>
                  <th>Last Recorded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${vitals.bp || '120/80 mmHg'}</td>
                  <td>${vitals.pulse || '72 bpm'}</td>
                  <td>${vitals.temp || '98.4 °F'}</td>
                  <td>${vitals.spo2 || '98%'}</td>
                  <td>${selectedPatient.lastVisit || 'Today'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Clinical Consultations & Chief Complaints</div>
            ${emrAppointments.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Reason / Chief Complaint</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${emrAppointments.map(apt => `
                    <tr>
                      <td>${apt.date} ${apt.time}</td>
                      <td>${apt.doctorName}</td>
                      <td>${apt.dept}</td>
                      <td>${apt.notes || 'Routine Checkup'}</td>
                      <td><span class="badge badge-success">${apt.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 13px; color: #64748b;">No recent outpatient consultations recorded.</p>'}
          </div>

          <div class="section">
            <div class="section-title">Active Prescriptions & Medication Chart</div>
            ${emrPrescriptions.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${emrPrescriptions.map(pres => pres.medicines?.map((m: any) => `
                    <tr>
                      <td>${new Date(pres.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td><strong>${m.name}</strong></td>
                      <td>${m.dosage}</td>
                      <td>${m.duration}</td>
                      <td>${m.instructions || 'After meals'}</td>
                    </tr>
                  `).join('') || '').join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 13px; color: #64748b;">No active prescriptions recorded.</p>'}
          </div>

          <div class="section">
            <div class="section-title">Diagnostic Lab Reports & Imaging</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="font-size: 14px;">Lab Investigations</strong>
                ${emrLabTests.length > 0 ? `
                  <table>
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Result</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${emrLabTests.map(test => `
                        <tr>
                          <td>${test.testName}</td>
                          <td><strong>${test.result || 'Pending'}</strong></td>
                          <td><span class="badge ${test.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${test.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p style="font-size: 12px; color: #64748b;">No laboratory reports.</p>'}
              </div>
              <div>
                <strong style="font-size: 14px;">Radiology Scans</strong>
                ${emrRadiologyScans.length > 0 ? `
                  <table>
                    <thead>
                      <tr>
                        <th>Scan Type</th>
                        <th>Findings</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${emrRadiologyScans.map(scan => `
                        <tr>
                          <td>${scan.scanType}</td>
                          <td>${scan.findings || 'Pending analysis'}</td>
                          <td><span class="badge ${scan.status === 'Reported' ? 'badge-success' : 'badge-warning'}">${scan.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p style="font-size: 12px; color: #64748b;">No radiology scans.</p>'}
              </div>
            </div>
          </div>

          <div class="footer">
            <div>Printed on: ${new Date().toLocaleString()}</div>
            <div>Authorized Medical Officer Signature: _______________________</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    const filteredPatients = emrPatients.filter(p =>
      p.name?.toLowerCase().includes(emrSearch.toLowerCase()) ||
      p.id?.toLowerCase().includes(emrSearch.toLowerCase())
    );

    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Electronic Medical Records (EMR/EHR)</h1>
            <p className="page-subtitle">Centralized archive of patient clinical logs, historical prescriptions, imaging records.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'stretch' }}>
          {/* Left panel: Patient list search and browse */}
          <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            <h3 className="card-title mb-xs">Patient Directory</h3>
            <p className="text-secondary text-xs mb-md">Select a patient to browse clinical archives.</p>
            
            <div className="search-bar mb-md" style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search by MRN or Name..."
                value={emrSearch}
                onChange={(e) => setEmrSearch(e.target.value)}
                className="input"
                style={{ paddingLeft: '36px', width: '100%' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedPatient?.id === patient.id ? 'var(--color-accent)' : '#cbd5e1',
                      background: selectedPatient?.id === patient.id ? 'rgba(2, 132, 199, 0.05)' : '#ffffff',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    className="hover:border-accent"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-semibold text-primary" style={{ fontSize: '14px' }}>{patient.name}</span>
                      <span className="badge badge-purple" style={{ fontSize: '10px' }}>{patient.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <span>{patient.age} Yrs | {patient.gender}</span>
                      <span>Blood: {patient.blood || 'O+'}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
                  No patients found
                </div>
              )}
            </div>
          </div>

          {/* Right panel: EMR details */}
          <div>
            {selectedPatient ? (
              <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h2 className="text-lg font-semibold text-primary">{selectedPatient.name}</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      MRN Number: <span className="font-mono font-bold text-accent">{selectedPatient.id}</span> | Status: <span className="badge badge-success">Active</span>
                    </p>
                  </div>
                  <button onClick={handlePrintEMR} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> Print EMR Report
                  </button>
                </div>

                {/* Patient Summary Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'rgba(2,132,199,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Age / Gender</span>
                    <strong className="text-primary">{selectedPatient.age} Years / {selectedPatient.gender}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Blood Group</span>
                    <strong className="text-primary">{selectedPatient.blood || 'O+'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Insurance</span>
                    <strong className="text-primary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{selectedPatient.insurance || 'Self Pay'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Reg Date</span>
                    <strong className="text-primary">{selectedPatient.regDate || '2026-01-01'}</strong>
                  </div>
                </div>

                {/* Interactive Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '16px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { id: 'vitals', label: 'Vitals & Alerts' },
                    { id: 'clinical', label: 'Clinical Timeline' },
                    { id: 'prescriptions', label: 'Medications' },
                    { id: 'labs', label: 'Lab Reports' },
                    { id: 'radiology', label: 'Imaging' },
                    { id: 'billing', label: 'Billing' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveEmrTab(tab.id)}
                      style={{
                        paddingBottom: '8px',
                        borderBottom: '2px solid',
                        borderColor: activeEmrTab === tab.id ? 'var(--color-accent)' : 'transparent',
                        color: activeEmrTab === tab.id ? 'var(--color-accent)' : '#64748b',
                        fontWeight: activeEmrTab === tab.id ? '600' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {activeEmrTab === 'vitals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Blood Pressure</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-accent)' }}>
                            {selectedPatient.vitals?.bp || '120/80 mmHg'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Pulse Rate</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-success)' }}>
                            {selectedPatient.vitals?.pulse || '72 bpm'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Temperature</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-warning)' }}>
                            {selectedPatient.vitals?.temp || '98.4 °F'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Oxygen SpO2</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#8b5cf6' }}>
                            {selectedPatient.vitals?.spo2 || '98%'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-danger)' }}>Known Allergies</h4>
                          {selectedPatient.allergies?.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '13px' }}>
                              {selectedPatient.allergies.map((alg: string, idx: number) => (
                                <li key={idx} style={{ marginTop: '4px' }}>{alg}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '13px', color: '#64748b' }}>No known allergies recorded.</p>
                          )}
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-warning)' }}>Chronic Conditions</h4>
                          {selectedPatient.chronic?.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '13px' }}>
                              {selectedPatient.chronic.map((chr: string, idx: number) => (
                                <li key={idx} style={{ marginTop: '4px' }}>{chr}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '13px', color: '#64748b' }}>No chronic conditions recorded.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEmrTab === 'clinical' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Consultation & Appointment Log</h4>
                      {emrAppointments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {emrAppointments.map((apt: any) => (
                            <div key={apt.id || apt._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', background: '#ffffff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong className="text-primary">{apt.doctorName} ({apt.dept})</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{apt.date} | {apt.time}</span>
                              </div>
                              <p style={{ fontSize: '13px', color: '#64748b' }}>Reason: {apt.notes || 'Routine consultation'}</p>
                              <div style={{ marginTop: '6px' }}>
                                <span className="badge badge-success">{apt.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No consultations logged.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'prescriptions' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Prescribed Medications</h4>
                      {emrPrescriptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {emrPrescriptions.map((pres: any) => (
                            <div key={pres.id || pres._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                                <strong className="text-accent">{pres.doctorName}</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{pres.date}</span>
                              </div>
                              <table className="table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th>Medicine Name</th>
                                    <th>Dosage</th>
                                    <th>Duration</th>
                                    <th>Instructions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pres.medicines?.map((med: any, idx: number) => (
                                    <tr key={idx}>
                                      <td className="font-semibold text-primary">{med.name}</td>
                                      <td>{med.dosage}</td>
                                      <td>{med.duration}</td>
                                      <td>{med.instructions}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No active prescriptions.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'labs' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Laboratory Investigations</h4>
                      {emrLabTests.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Test Name</th>
                              <th>Ordered Date</th>
                              <th>Result</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrLabTests.map((test: any) => (
                              <tr key={test.id || test._id}>
                                <td className="font-semibold text-primary">{test.testName}</td>
                                <td>{test.ordered || test.collected || 'N/A'}</td>
                                <td>
                                  <strong className="text-accent">
                                    {test.result && typeof test.result === 'object' ? (
                                      Object.entries(test.result).map(([k, v]: any) => `${k}: ${v}`).join(', ')
                                    ) : (
                                      test.result || 'Pending'
                                    )}
                                  </strong>
                                </td>
                                <td>
                                  <span className={`badge ${test.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                    {test.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No lab reports recorded.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'radiology' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Radiology Imaging PACS</h4>
                      {emrRadiologyScans.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Scan Type</th>
                              <th>Ordered Date</th>
                              <th>Findings / Reports</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrRadiologyScans.map((scan: any) => (
                              <tr key={scan.id || scan._id}>
                                <td className="font-semibold text-primary">{scan.type}</td>
                                <td>{scan.date}</td>
                                <td>{scan.finding || 'Pending PACS sync'}</td>
                                <td>
                                  <span className={`badge ${scan.status === 'Reported' ? 'badge-success' : 'badge-warning'}`}>
                                    {scan.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No radiology reports.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'billing' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Financial Billing Invoices</h4>
                      {emrBills.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Bill No</th>
                              <th>Type</th>
                              <th>Items Summary</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrBills.map((bill: any) => (
                              <tr key={bill.id || bill._id}>
                                <td className="font-mono text-xs">{bill.id}</td>
                                <td><span className="badge badge-purple">{bill.type || 'OP'}</span></td>
                                <td style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {bill.items?.map((item: any) => `${item.desc} (x${item.qty})`).join(', ')}
                                </td>
                                <td className="font-semibold text-primary">₹{bill.total?.toLocaleString()}</td>
                                <td>
                                  <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                                    {bill.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No billing history logged.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '500px' }}>
                <FileText size={64} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 className="empty-state-title" style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>Select a Patient</h3>
                <p className="text-secondary text-xs" style={{ maxWidth: '300px', marginTop: '6px' }}>
                  Please select a patient from the left directory to check vitals, prescription records, lab files, and billing history.
                </p>
              </div>
            )}
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
