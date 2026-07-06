import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Download, Plus, Eye, Edit2, ShieldAlert,
  Calendar, FileText, Activity, AlertCircle, Sparkles, CheckCircle,
  Clock, User, Stethoscope, QrCode, ClipboardList, Pill, FileCode, Heart, Printer
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportPatientPDF, exportTablePDF, exportToExcel } from '../../utils/exportUtils';
import { QRCodeSVG } from 'qrcode.react';

const SVGQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#0f172a"
      level="M"
      style={{
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        padding: '6px',
        background: '#ffffff',
        display: 'inline-block'
      }}
    />
  );
};

const Patients: React.FC = () => {
  const [patientList, setPatientList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  // EMR details states
  const [patientAppointments, setPatientAppointments] = useState<any[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [patientLabs, setPatientLabs] = useState<any[]>([]);
  const [patientScans, setPatientScans] = useState<any[]>([]);
  const [patientBills, setPatientBills] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState('Male');
  const [newBlood, setNewBlood] = useState('O+');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [newAllergies, setNewAllergies] = useState('');
  const [newChronic, setNewChronic] = useState('');

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatientList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleViewDetails = async (patient: any) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
    setActiveTab('Overview');
    setLoadingDetails(true);
    try {
      const [apts, prescriptionsData, labsData, scansData, billsData] = await Promise.all([
        api.getAppointments(),
        api.getPrescriptions(),
        api.getLabTests(),
        api.getRadiologyScans(),
        api.getBills()
      ]);
      setPatientAppointments(apts.filter((a: any) => a.patientId === patient.id));
      setPatientPrescriptions(prescriptionsData.filter((p: any) => p.patientId === patient.id));
      setPatientLabs(labsData.filter((l: any) => l.patientId === patient.id));
      setPatientScans(scansData.filter((s: any) => s.patientId === patient.id));
      setPatientBills(billsData.filter((b: any) => b.patientId === patient.id));
    } catch (e) {
      console.error('Error fetching patient EMR details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMRN = `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient = {
      id: newMRN,
      name: newName,
      age: parseInt(newAge) || 30,
      gender: newGender,
      dob: '1990-01-01',
      blood: newBlood,
      phone: newPhone,
      email: newEmail,
      address: 'City Center, Chennai',
      insurance: newInsurance,
      emergency: 'Family Contact',
      emergencyPhone: '9000000000',
      allergies: newAllergies ? newAllergies.split(',').map(s => s.trim()) : [],
      chronic: newChronic ? newChronic.split(',').map(s => s.trim()) : [],
      regDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      lastVisit: new Date().toISOString().split('T')[0]
    };
    try {
      await api.createPatient(newPatient);
      loadPatients();
      setShowRegisterModal(false);
      // Reset Form
      setNewName('');
      setNewAge('');
      setNewPhone('');
      setNewEmail('');
      setNewInsurance('');
      setNewAllergies('');
      setNewChronic('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const list = patientList.map(p => ({
      MRN: p.id,
      Name: p.name,
      Age: p.age,
      Gender: p.gender,
      'Blood Group': p.blood,
      Phone: p.phone,
      Insurance: p.insurance || 'None',
      Status: p.status,
      'Registered Date': p.regDate,
    }));
    exportToExcel(list, 'Patients List', 'patients_list');
  };

  const handleExportPDF = () => {
    const headers = ['MRN', 'Name', 'Age/Gender', 'Blood Group', 'Phone', 'Insurance', 'Status'];
    const rows = patientList.map(p => [
      p.id,
      p.name,
      `${p.age} / ${p.gender}`,
      p.blood,
      p.phone,
      p.insurance || 'None',
      p.status
    ]);
    exportTablePDF('Hospital Register - Patients', headers, rows, 'patients_report');
  };

  const filtered = patientList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Construct chronological visit-wise history for selected patient details modal
  const visitsMap: { [date: string]: any } = {};
  if (selectedPatient) {
    patientAppointments.forEach(apt => {
      const d = apt.date;
      if (!visitsMap[d]) {
        visitsMap[d] = { date: d, doctors: new Set(), notes: [], type: 'Appointment', status: apt.status, token: apt.token };
      }
      if (apt.doctorName) visitsMap[d].doctors.add(apt.doctorName);
      if (apt.notes) visitsMap[d].notes.push(`Consultation Reason: ${apt.notes}`);
    });

    patientPrescriptions.forEach(p => {
      const d = p.date;
      if (!visitsMap[d]) {
        visitsMap[d] = { date: d, doctors: new Set(), notes: [], type: 'Prescription' };
      }
      if (p.doctorName) visitsMap[d].doctors.add(p.doctorName);
      if (p.diagnosis) visitsMap[d].notes.push(`Diagnosis: ${p.diagnosis}`);
      visitsMap[d].prescriptions = p.medicines || [];
    });

    patientLabs.forEach(l => {
      const d = l.ordered ? l.ordered.split(' ')[0] : l.collected?.split(' ')[0];
      if (d) {
        if (!visitsMap[d]) {
          visitsMap[d] = { date: d, doctors: new Set(), notes: [], type: 'Lab Investigation' };
        }
        if (!visitsMap[d].labs) visitsMap[d].labs = [];
        visitsMap[d].labs.push(l);
      }
    });

    patientScans.forEach(s => {
      const d = s.date;
      if (d) {
        if (!visitsMap[d]) {
          visitsMap[d] = { date: d, doctors: new Set(), notes: [], type: 'Radiology Scan' };
        }
        if (!visitsMap[d].scans) visitsMap[d].scans = [];
        visitsMap[d].scans.push(s);
      }
    });
  }
  const sortedVisits = Object.values(visitsMap).sort((a: any, b: any) => b.date.localeCompare(a.date));

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Patient Records Management</h1>
          <p className="page-subtitle">Register new patients, view digital health documents, and medical histories.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Excel Report
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            PDF Directory
          </button>
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            <Plus size={16} /> Register Patient
          </button>
        </div>
      </div>

      {/* Toolbar filter */}
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} />
          <input
            placeholder="Search by MRN or Name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Admitted">Admitted</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient Name</th>
                <th>Age / Gender</th>
                <th>Blood</th>
                <th>Phone Number</th>
                <th>Insurance Provider</th>
                <th>Status</th>
                <th>Last Visit</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(patient => (
                <tr key={patient.id}>
                  <td className="font-semibold text-accent">{patient.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{patient.name.split(' ').map((n: string) => n[0]).join('')}</div>
                      <span className="font-semibold text-primary">{patient.name}</span>
                    </div>
                  </td>
                  <td>{patient.age} Yrs / {patient.gender}</td>
                  <td>{patient.blood}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.insurance || <span className="text-muted">None</span>}</td>
                  <td>
                    <span className={`badge badge-${
                      patient.status === 'Active' ? 'success' :
                      patient.status === 'Admitted' ? 'primary' : 'danger'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td>{patient.lastVisit}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleViewDetails(patient)} title="View EMR Detail">
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => exportPatientPDF(patient)} title="Download EMR PDF">
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">New Patient Intake Registration</h2>
              <button className="btn-secondary" onClick={() => setShowRegisterModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="modal-body">
                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Full Patient Name</label>
                    <input className="form-control" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="form-control" type="number" required value={newAge} onChange={e => setNewAge(e.target.value)} placeholder="Age" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender</label>
                      <select className="form-control" value={newGender} onChange={e => setNewGender(e.target.value)}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select className="form-control" value={newBlood} onChange={e => setNewBlood(e.target.value)}>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>O+</option>
                      <option>O-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" required value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="e.g. 9876543210" />
                  </div>
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="e.g. email@domain.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Insurance Provider & ID</label>
                    <input className="form-control" value={newInsurance} onChange={e => setNewInsurance(e.target.value)} placeholder="Star Health - SH78900" />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Allergies (comma separated)</label>
                  <input className="form-control" value={newAllergies} onChange={e => setNewAllergies(e.target.value)} placeholder="e.g. Penicillin, Lactose" />
                </div>

                <div className="form-group">
                  <label className="form-label">Chronic Conditions (comma separated)</label>
                  <input className="form-control" value={newChronic} onChange={e => setNewChronic(e.target.value)} placeholder="e.g. Hypertension, Asthma" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Intake Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient Detail / EMR Viewer Modal */}
      {showDetailModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal modal-xl" style={{ maxWidth: '1200px', width: '95%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Electronic Health Record (EMR) Ledger — {selectedPatient.name}</h2>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', gap: 24, padding: 24, minHeight: '520px', flexDirection: 'row', flexWrap: 'wrap' }}>
              
              {/* Left Column - Demographics and History Tabs (70% width) */}
              <div style={{ flex: '1 1 700px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                {/* Patient Summary Strip */}
                <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary-glow)', padding: '16px' }}>
                  <div>
                    <div className="text-muted text-xs">PATIENT MRN</div>
                    <div className="font-bold text-accent">{selectedPatient.id}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">AGE & GENDER</div>
                    <div className="font-semibold text-white">{selectedPatient.age} Yrs / {selectedPatient.gender}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">BLOOD GROUP</div>
                    <div className="font-bold text-primary">{selectedPatient.blood}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">INSURANCE</div>
                    <div className="font-semibold text-white" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{selectedPatient.insurance || 'Self Pay'}</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="tabs" style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', gap: 8 }}>
                  {['Overview', 'Visit History', 'Prescriptions', 'Billing'].map(tab => (
                    <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', padding: '10px 16px', color: activeTab === tab ? 'var(--color-accent)' : 'var(--color-text-secondary)', borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : 'none', cursor: 'pointer', fontWeight: activeTab === tab ? '600' : 'normal' }}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, minHeight: '300px' }}>
                  {loadingDetails ? (
                    <div className="flex-center" style={{ padding: 40, flexDirection: 'column', gap: 12 }}>
                      <Activity className="text-accent animated-pulse" size={32} />
                      <span className="text-muted text-sm">Querying EMR databases...</span>
                    </div>
                  ) : (
                    <>
                      {activeTab === 'Overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="card">
                              <h3 className="card-title text-danger mb-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <AlertCircle size={16} /> Allergies & Alerts
                              </h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {selectedPatient.allergies?.length ? selectedPatient.allergies.map((a: string) => (
                                  <span key={a} className="badge badge-danger">{a}</span>
                                )) : <span className="text-muted text-sm">No known food or drug allergies</span>}
                              </div>
                            </div>
                            <div className="card">
                              <h3 className="card-title text-warning mb-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Activity size={16} /> Chronic Conditions
                              </h3>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {selectedPatient.chronic?.length ? selectedPatient.chronic.map((c: string) => (
                                  <span key={c} className="badge badge-warning">{c}</span>
                                )) : <span className="text-muted text-sm">No chronic conditions registered</span>}
                              </div>
                            </div>
                          </div>

                          <div className="card">
                            <h3 className="card-title text-accent mb-sm">Demographics & Emergency Info</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '13px' }}>
                              <div>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Email: </span><span className="text-white">{selectedPatient.email || 'N/A'}</span></p>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Phone: </span><span className="text-white">{selectedPatient.phone}</span></p>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Home Address: </span><span className="text-white">{selectedPatient.address}</span></p>
                              </div>
                              <div>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Emergency Contact: </span><span className="text-white font-semibold">{selectedPatient.emergency || 'None'}</span></p>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Emergency Phone: </span><span className="text-white">{selectedPatient.emergencyPhone || 'N/A'}</span></p>
                                <p style={{ margin: '4px 0' }}><span className="text-muted">Registration Date: </span><span className="text-white">{selectedPatient.regDate}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'Visit History' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          <h3 className="text-md font-bold text-white mb-xs flex-align" style={{ gap: 8 }}><Clock size={16} className="text-accent" /> Complete Patient Visit History</h3>
                          {sortedVisits.length === 0 ? (
                            <div className="text-center py-6 text-muted">No historical clinical visits cataloged.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                              {sortedVisits.map((v: any, idx: number) => (
                                <div key={idx} className="card-item" style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', background: 'var(--color-bg-secondary)' }}>
                                  <div className="flex-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '10px' }}>
                                    <div className="flex-align" style={{ gap: 8 }}>
                                      <span className="badge badge-primary" style={{ fontSize: '11px' }}>{v.date}</span>
                                      <span className="text-xs text-muted">Consultant: </span>
                                      <span className="text-xs font-semibold text-white">{Array.from(v.doctors).join(', ') || 'Attending Physician'}</span>
                                    </div>
                                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>{v.type}</span>
                                  </div>
                                  
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {v.notes.map((note: string, nIdx: number) => (
                                      <p key={nIdx} className="text-xs text-secondary" style={{ margin: 0 }}>• {note}</p>
                                    ))}

                                    {/* Prescriptions at this visit */}
                                    {v.prescriptions && v.prescriptions.length > 0 && (
                                      <div style={{ marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                        <div className="flex-align text-primary" style={{ gap: 4, fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                                          <Pill size={12} /> Prescribed Medicines (Rx)
                                        </div>
                                        <table className="table" style={{ width: '100%', fontSize: '11px' }}>
                                          <thead>
                                            <tr>
                                              <th>Drug</th>
                                              <th>Dosage</th>
                                              <th>Duration</th>
                                              <th>Instructions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {v.prescriptions.map((m: any, mIdx: number) => (
                                              <tr key={mIdx}>
                                                <td className="font-semibold text-white">{m.name}</td>
                                                <td className="text-accent font-bold">{m.dosage}</td>
                                                <td>{m.duration}</td>
                                                <td className="text-muted">{m.instructions}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}

                                    {/* Lab investigations ordered */}
                                    {v.labs && v.labs.length > 0 && (
                                      <div style={{ marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                        <div className="flex-align text-success" style={{ gap: 4, fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                                          <Activity size={12} /> Lab Investigations Ordered
                                        </div>
                                        {v.labs.map((lb: any, lIdx: number) => (
                                          <div key={lIdx} style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                            <strong>{lb.testName}</strong> - Status: <span className="text-accent">{lb.status}</span>
                                            {lb.result && typeof lb.result === 'object' && (
                                              <div style={{ display: 'flex', gap: 12, marginTop: 4, paddingLeft: 8, color: 'var(--color-text-muted)' }}>
                                                {Object.entries(lb.result).map(([k, val]: any) => (
                                                  <span key={k}>{k}: <strong className="text-white">{val}</strong></span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Radiology scans ordered */}
                                    {v.scans && v.scans.length > 0 && (
                                      <div style={{ marginTop: 8, padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                        <div className="flex-align text-warning" style={{ gap: 4, fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                                          <FileCode size={12} /> Radiology Scans Ordered
                                        </div>
                                        {v.scans.map((sc: any, sIdx: number) => (
                                          <div key={sIdx} style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                            <strong>{sc.type}</strong> - Status: <span className="text-accent">{sc.status}</span>
                                            {sc.finding && (
                                              <p style={{ margin: '2px 0 0 0', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Findings: {sc.finding}</p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'Prescriptions' && (
                        <div className="card">
                          <h3 className="card-title">Accumulated Prescription Records</h3>
                          {patientPrescriptions.length === 0 ? (
                            <p className="text-muted text-sm py-4">No prescriptions found.</p>
                          ) : (
                            <table className="table mt-sm">
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Diagnosis</th>
                                  <th>Medicines</th>
                                  <th>Physician</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {patientPrescriptions.map(p => (
                                  <tr key={p.id}>
                                    <td>{p.date}</td>
                                    <td>{p.diagnosis || 'General Treatment'}</td>
                                    <td>
                                      {p.medicines?.map((m: any) => `${m.name} (${m.dosage})`).join(', ')}
                                    </td>
                                    <td>{p.doctorName}</td>
                                    <td><span className="badge badge-success">{p.status || 'Prescribed'}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}

                      {activeTab === 'Billing' && (
                        <div className="card">
                          <h3 className="card-title">Billing Transactions Invoice Ledger</h3>
                          {patientBills.length === 0 ? (
                            <p className="text-muted text-sm py-4">No bills found.</p>
                          ) : (
                            <table className="table mt-sm">
                              <thead>
                                <tr>
                                  <th>Invoice ID</th>
                                  <th>Type</th>
                                  <th>Date</th>
                                  <th>Total Bill</th>
                                  <th>Paid Amount</th>
                                  <th>Outstanding</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {patientBills.map(b => (
                                  <tr key={b.id}>
                                    <td className="font-mono text-accent">{b.id}</td>
                                    <td>{b.type === 'IP' ? 'In-Patient (IPD)' : 'Out-Patient (OPD)'}</td>
                                    <td>{b.date}</td>
                                    <td>₹{b.total?.toLocaleString()}</td>
                                    <td className="text-success">₹{b.paid?.toLocaleString()}</td>
                                    <td className="text-danger">₹{b.balance?.toLocaleString()}</td>
                                    <td>
                                      <span className={`badge badge-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                                        {b.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Scan Frame and Portal Link (30% width) */}
              <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, textAlign: 'center', height: 'fit-content', gap: 16 }}>
                <div className="flex-align text-accent" style={{ gap: 6, fontWeight: 'bold', fontSize: '13px' }}>
                  <QrCode size={16} /> PATIENT EMR QR PASS
                </div>
                
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                  <SVGQRCode value={`${window.location.origin}/patient-record/${selectedPatient.id}`} size={180} />
                </div>
                
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#f8fafc', margin: '4px 0' }}>Scan to Verify Details</h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4, margin: '8px 0 0 0' }}>
                    Point a smartphone camera at this QR code to instantly verify EMR records, historical prescriptions, lab parameters, scans, and invoices.
                  </p>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', width: '100%', margin: '8px 0' }} />

                <Link to={`/patient-record/${selectedPatient.id}`} target="_blank" className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Eye size={14} /> Open Patient Portal
                </Link>
                <p className="text-xxs text-muted">HIPAA & NABH Encrypted Digital Ledger</p>
              </div>

            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => exportPatientPDF(selectedPatient)}>Export Full PDF</button>
              <button className="btn btn-primary" onClick={() => setShowDetailModal(false)}>Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
