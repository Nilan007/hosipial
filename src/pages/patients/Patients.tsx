import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Download, Plus, Eye, Edit2, ShieldAlert,
  Calendar, FileText, Activity, AlertCircle, Sparkles, CheckCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportPatientPDF, exportTablePDF, exportToExcel } from '../../utils/exportUtils';

const SVGQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  const getPixel = (x: number, y: number) => {
    if (x < 4 && y < 4) return (x === 0 || x === 3 || y === 0 || y === 3) || (x === 1 && y === 1) || (x === 2 && y === 2);
    if (x > 10 && y < 4) {
      const rx = x - 11;
      return (rx === 0 || rx === 3 || y === 0 || y === 3) || (rx === 1 && y === 1) || (rx === 2 && y === 2);
    }
    if (x < 4 && y > 10) {
      const ry = y - 11;
      return (x === 0 || x === 3 || ry === 0 || ry === 3) || (x === 1 && ry === 1) || (x === 2 && ry === 2);
    }
    if (x === 11 && y === 11) return true;
    let val = 0;
    for (let i = 0; i < value.length; i++) {
      val += value.charCodeAt(i) * (x + 1) * (y + 2);
    }
    return (val % 3 === 0 || val % 7 === 0);
  };

  const rects = [];
  for (let y = 0; y < 15; y++) {
    for (let x = 0; x < 15; x++) {
      if (getPixel(x, y)) {
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 15 15" style={{ color: '#0f172a', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
      <rect width={15} height={15} fill="#ffffff" />
      {rects}
    </svg>
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
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => { setSelectedPatient(patient); setShowDetailModal(true); }} title="View EMR Detail">
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
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Electronic Health Record (EMR) — {selectedPatient.name}</h2>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Patient Basic Card */}
              <div className="card" style={{ display: 'flex', gap: 20, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary-glow)', alignItems: 'center' }}>
                <div className="avatar avatar-lg">{selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 'auto', order: 2 }}>
                  <div className="text-right">
                    <span className="text-muted text-xs block">PATIENT QR FILE</span>
                    <span className="text-secondary text-xs block">Scan or click to open</span>
                  </div>
                  <Link to={`/patient-record/${selectedPatient.id}`} target="_blank" className="qr-link" title="Open EMR Patient Portal" style={{ color: 'inherit', display: 'inline-block' }}>
                    <SVGQRCode value={`${window.location.origin}/patient-record/${selectedPatient.id}`} size={56} />
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, flex: 1 }}>
                  <div>
                    <div className="text-muted text-xs">PATIENT MRN</div>
                    <div className="font-bold text-accent">{selectedPatient.id}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">AGE & GENDER</div>
                    <div className="font-semibold">{selectedPatient.age} Years / {selectedPatient.gender}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">BLOOD GROUP</div>
                    <div className="font-semibold text-primary">{selectedPatient.blood}</div>
                  </div>
                  <div>
                    <div className="text-muted text-xs">INSURANCE</div>
                    <div className="font-semibold">{selectedPatient.insurance || 'No Policy Listed'}</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                {['Overview', 'Vitals', 'Clinical Notes', 'Prescriptions', 'Documents'].map(tab => (
                  <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'Overview' && (
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
                      )) : <span className="text-muted text-sm">No recorded chronic ailments</span>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Vitals' && (
                <div className="card">
                  <h3 className="card-title">Vital Signs Trend</h3>
                  <table className="table mt-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>BP (mmHg)</th>
                        <th>Pulse (bpm)</th>
                        <th>Temp (°F)</th>
                        <th>SpO2 (%)</th>
                        <th>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>2026-06-28</td>
                        <td>128/82</td>
                        <td>74</td>
                        <td>98.4</td>
                        <td>99%</td>
                        <td>72 kg</td>
                      </tr>
                      <tr>
                        <td>2026-05-14</td>
                        <td>132/86 ⚠</td>
                        <td>78</td>
                        <td>98.6</td>
                        <td>98%</td>
                        <td>73 kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'Clinical Notes' && (
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-icon bg-primary" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary-light)' }}>
                      <FileText size={14} />
                    </div>
                    <div className="timeline-content">
                      <div className="flex justify-between">
                        <span className="font-semibold text-primary">Dr. Anand Krishnamurthy (Cardiology)</span>
                        <span className="text-xs text-muted">2026-06-28</span>
                      </div>
                      <p className="text-sm mt-xs">Patient presents for routine cardiology follow-up. BP is well controlled on Amlodipine 5mg. Denies chest pains or shortness of breath. Recommended to continue current lipid and hypertensive drugs. Review in 3 months.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Prescriptions' && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Prescribed Drug</th>
                      <th>Dosage</th>
                      <th>Duration</th>
                      <th>Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>2026-06-28</td>
                      <td className="font-semibold text-primary">Amlodipine 5mg</td>
                      <td>1-0-0 (Morning)</td>
                      <td>30 Days</td>
                      <td>Dr. Anand K.</td>
                    </tr>
                    <tr>
                      <td>2026-06-28</td>
                      <td className="font-semibold text-primary">Atorvastatin 10mg</td>
                      <td>0-0-1 (Night)</td>
                      <td>30 Days</td>
                      <td>Dr. Anand K.</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeTab === 'Documents' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {['Government ID Card', 'Health Insurance Card', 'ECG Report Chart'].map(docName => (
                    <div key={docName} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '16px' }}>
                      <FileText size={24} className="text-accent" />
                      <div className="font-semibold text-xs">{docName}</div>
                      <button className="btn btn-secondary btn-sm mt-sm">Download</button>
                    </div>
                  ))}
                </div>
              )}
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
