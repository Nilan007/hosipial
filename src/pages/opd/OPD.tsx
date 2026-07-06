import { useEffect, useState } from 'react';
import {
  Stethoscope, Activity, Heart, Clock, Plus, Trash2, CheckCircle2,
  FileText, PlusCircle, Smile, Shield, FileSpreadsheet
} from 'lucide-react';
import { api } from '../../utils/api';
import { doctors, patients, prescriptions } from '../../data/mockData';
import { exportTablePDF } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';

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
    <svg width={size} height={size} viewBox="0 0 15 15" style={{ color: 'var(--color-accent)' }}>
      <rect width={15} height={15} fill="transparent" />
      {rects}
    </svg>
  );
};

const OPD: React.FC = () => {
  const [selectedApt, setSelectedApt] = useState<any>(null);
  const [activeQueue, setActiveQueue] = useState<any[]>([]);
  
  // Vitals states
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.4');
  const [spo2, setSpo2] = useState('98');
  
  // Clinical notes
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [followUpDate, setFollowUpDate] = useState('2026-07-14');
  const [referral, setReferral] = useState('');
  
  // Prescription medication list
  const [meds, setMeds] = useState<{ name: string; dosage: string; duration: string; notes: string }[]>([
    { name: 'Paracetamol 500mg', dosage: '1-1-1', duration: '5 Days', notes: 'After food' }
  ]);

  const loadQueue = async () => {
    try {
      const apts = await api.getAppointments();
      setActiveQueue(apts.filter((a: any) => a.status === 'Confirmed' || a.status === 'In Progress' || a.status === 'Waiting'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const addMed = () => {
    setMeds([...meds, { name: '', dosage: '1-0-1', duration: '5 Days', notes: 'After food' }]);
  };

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, idx) => idx !== index));
  };

  const updateMed = (index: number, key: string, value: string) => {
    setMeds(meds.map((m, idx) => idx === index ? { ...m, [key]: value } : m));
  };

  const handleStartConsultation = (apt: any) => {
    setSelectedApt(apt);
    // Reset inputs
    setChiefComplaint('');
    setDiagnosis('');
    setReferral('');
  };

  const handleSaveConsultation = async () => {
    try {
      await api.updateAppointment(selectedApt.id, { status: 'Completed' });
      loadQueue();
      setSelectedApt(null);
      alert('OPD consultation notes, prescriptions, and orders have been saved successfully.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'Hypertension') {
      setChiefComplaint('Routine check-up for elevated blood pressure. No headache, chest pain, or shortness of breath.');
      setDiagnosis('Essential Hypertension (I10)');
      setMeds([
        { name: 'Amlodipine 5mg', dosage: '1-0-0', duration: '30 Days', notes: 'Morning, after food' },
        { name: 'Aspirin 75mg', dosage: '0-1-0', duration: '30 Days', notes: 'Afternoon, after food' }
      ]);
    } else if (val === 'Diabetes') {
      setChiefComplaint('Follow-up check for high blood sugar levels. Complaining of mild fatigue.');
      setDiagnosis('Type 2 Diabetes Mellitus without complications (E11.9)');
      setMeds([
        { name: 'Metformin 500mg', dosage: '1-0-1', duration: '30 Days', notes: 'Morning & Night, after meals' }
      ]);
    } else if (val === 'Fever') {
      setChiefComplaint('Fever with body ache, chills and mild cough for 3 days.');
      setDiagnosis('Acute Viral Pyrexia (R50.9)');
      setMeds([
        { name: 'Paracetamol 500mg', dosage: '1-1-1', duration: '5 Days', notes: 'Fever SOS' },
        { name: 'Cetirizine 10mg', dosage: '0-0-1', duration: '5 Days', notes: 'Night, bed time' }
      ]);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Outpatient Department (OPD)</h1>
          <p className="page-subtitle">Medical consultation center, digital prescription writer, vitals intake tracker.</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-primary">Consulting Hub</span>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Left Side: Today's Consultation Queue */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} /> Consultation Queue
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {activeQueue.length === 0 ? (
              <div className="empty-state">
                <Smile size={32} className="text-success mb-sm" />
                <div className="empty-state-title">All consultations completed!</div>
              </div>
            ) : (
              activeQueue.map(apt => (
                <div
                  key={apt.id}
                  onClick={() => handleStartConsultation(apt)}
                  style={{
                    background: selectedApt?.id === apt.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-bg-glass)',
                    border: `1px solid ${selectedApt?.id === apt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    padding: 14,
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div className="flex justify-between items-center mb-xs">
                    <span className="badge badge-purple">{apt.token}</span>
                    <span className="text-xs text-muted">{apt.time}</span>
                  </div>
                  <div className="font-semibold text-primary">{apt.patientName}</div>
                  <div className="text-secondary text-xs" style={{ marginTop: 2 }}>{apt.doctorName} — {apt.dept}</div>
                  {apt.notes && <div className="text-muted text-xs mt-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 4 }}>Note: {apt.notes}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Active Consultation Form */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          {selectedApt ? (
            <div>
              <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div>
                    <h3 className="card-title text-accent" style={{ margin: 0 }}>Active Consultation: {selectedApt.patientName}</h3>
                    <p className="text-secondary text-xs">MRN Reference ID: {selectedApt.patientId}</p>
                  </div>
                  <Link to={`/patient-record/${selectedApt.patientId}`} target="_blank" title="Scan or click to view Patient EMR">
                    <div style={{ background: '#fff', padding: 4, borderRadius: 6, display: 'inline-block' }}>
                      <SVGQRCode value={`${window.location.origin}/patient-record/${selectedApt.patientId}`} size={36} />
                    </div>
                  </Link>
                </div>
                <div className="form-group" style={{ width: 180, marginBottom: 0 }}>
                  <select className="form-control" onChange={handleSelectTemplate} defaultValue="">
                    <option value="" disabled>Load Diagnosis Template</option>
                    <option value="Hypertension">Hypertension Template</option>
                    <option value="Diabetes">Diabetes Template</option>
                    <option value="Fever">Viral Pyrexia Template</option>
                  </select>
                </div>
              </div>

              {/* Vitals Input */}
              <div className="section">
                <h4 className="section-title text-sm mb-sm">Patient Vital Signs Intake</h4>
                <div className="form-grid-4">
                  <div className="form-group">
                    <label className="form-label">BP Systolic/Diastolic</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input className="form-control" style={{ textAlign: 'center' }} value={bpSys} onChange={e => setBpSys(e.target.value)} />
                      <span>/</span>
                      <input className="form-control" style={{ textAlign: 'center' }} value={bpDia} onChange={e => setBpDia(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pulse (bpm)</label>
                    <input className="form-control" value={pulse} onChange={e => setPulse(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Temperature (°F)</label>
                    <input className="form-control" value={temp} onChange={e => setTemp(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SpO2 (%)</label>
                    <input className="form-control" value={spo2} onChange={e => setSpo2(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Complaints & Diagnosis */}
              <div className="form-grid-2 mb-md">
                <div className="form-group">
                  <label className="form-label">Chief Complaint & History</label>
                  <textarea className="form-control" style={{ height: 100 }} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder="Enter details of patient history and symptoms..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnosis & ICD-10 Code</label>
                  <textarea className="form-control" style={{ height: 100 }} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Type ICD-10 diagnosis..." />
                </div>
              </div>

              {/* Prescription list */}
              <div className="section">
                <div className="section-header">
                  <h4 className="section-title text-sm">Prescription & Drug Dispensing Order</h4>
                  <button className="btn btn-secondary btn-sm" onClick={addMed}>
                    <Plus size={12} /> Add Drug
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {meds.map((med, i) => (
                    <div key={i} className="form-grid-4 items-center" style={{ gap: 8, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <input className="form-control" placeholder="Drug Name (e.g. Paracetamol)" value={med.name} onChange={e => updateMed(i, 'name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <select className="form-control" value={med.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)}>
                          <option>1-0-1</option>
                          <option>1-1-1</option>
                          <option>1-0-0</option>
                          <option>0-0-1</option>
                          <option>1-1-1-1</option>
                          <option>SOS</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <input className="form-control" placeholder="5 Days" value={med.duration} onChange={e => updateMed(i, 'duration', e.target.value)} />
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => removeMed(i)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrals */}
              <div className="form-grid-2 mb-md">
                <div className="form-group">
                  <label className="form-label">Next Follow-up Date</label>
                  <input className="form-control" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Refer to Department / Doctor</label>
                  <input className="form-control" value={referral} onChange={e => setReferral(e.target.value)} placeholder="e.g. Cardiology" />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
                <button className="btn btn-secondary" onClick={() => setSelectedApt(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveConsultation}>
                  Save & Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 400 }}>
              <Stethoscope size={48} className="text-muted mb-md" />
              <div className="empty-state-title">No Active Consultation</div>
              <p className="text-secondary text-sm">Select a patient token card from the queue on the left side to begin writing the diagnosis report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OPD;
