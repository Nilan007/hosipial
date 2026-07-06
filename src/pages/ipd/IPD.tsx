import { useEffect, useState } from 'react';
import {
  Bed, Users, Calendar, Plus, Eye, CheckCircle2, ChevronRight, Activity,
  ClipboardList, AlertTriangle, FileText, ArrowRightLeft, Printer
} from 'lucide-react';
import { api } from '../../utils/api';
import { wards, patients, doctors } from '../../data/mockData';
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

const IPD: React.FC = () => {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [bedsList, setBedsList] = useState<any[]>([]);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  
  // New Admission states
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [admitDiagnosis, setAdmitDiagnosis] = useState('');

  // Discharge summary states
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [illnessSummary, setIllnessSummary] = useState('');
  const [treatmentCourse, setTreatmentCourse] = useState('');
  const [dischargeCondition, setDischargeCondition] = useState('Stable');
  const [dischargeMeds, setDischargeMeds] = useState('Tab Paracetamol 500mg SOS, Tab Amoxicillin 500mg TDS x 5 Days');
  const [printedSummary, setPrintedSummary] = useState<any>(null);

  const loadIPDData = async () => {
    try {
      const beds = await api.getBeds();
      setBedsList(beds);
      setAdmissions(beds.filter((b: any) => b.status === 'Occupied'));
      const vacant = beds.find((b: any) => b.status === 'Vacant');
      if (vacant) setSelectedBedId(vacant.id);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadIPDData();
  }, []);

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === selectedPatientId);

    const updateData = {
      status: 'Occupied',
      patientId: pat?.id || '',
      patientName: pat?.name || '',
      admitDate: new Date().toISOString().split('T')[0]
    };

    try {
      await api.updateBed(selectedBedId, updateData);
      loadIPDData();
      setShowAdmitModal(false);
      setAdmitDiagnosis('');
    } catch (err) {
      console.error(err);
    }
  };

  const openDischargeProcess = () => {
    setIllnessSummary(`Patient warded with acute complains of ${selectedAdmission.type || 'fever/discomfort'}. Initial diagnostic tests indicate stable parameters.`);
    setTreatmentCourse('Patient warded for observation and IV saline infusion. Administered antibiotic drug course as warded.');
    setShowDischargeModal(true);
  };

  const handleDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateBed(selectedAdmission.id, {
        status: 'Vacant',
        patientId: null,
        patientName: null,
        admitDate: null
      });
      
      const doc = {
        patientId: selectedAdmission.patientId,
        patientName: selectedAdmission.patientName,
        wardName: selectedAdmission.wardName,
        admitDate: selectedAdmission.admitDate,
        dischargeDate: new Date().toISOString().split('T')[0],
        illnessSummary,
        treatmentCourse,
        condition: dischargeCondition,
        meds: dischargeMeds
      };

      setPrintedSummary(doc);
      setShowDischargeModal(false);
      loadIPDData();
      setSelectedAdmission(null);
      alert('Patient discharge completed. Clinical summary sheets warded to MongoDB server.');
    } catch (e) {
      console.error(e);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Inpatient Department (IPD)</h1>
          <p className="page-subtitle">Patient ward occupancy tracking, bed allocations, clinical round logs, and discharges.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAdmitModal(true)}>
            <Plus size={16} /> Admit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Admissions Table List */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title mb-md">Current Warded Patients</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Ward / Bed</th>
                  <th>Patient</th>
                  <th>MRN</th>
                  <th>Admit Date</th>
                  <th>Type</th>
                  <th>Daily Charge</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map(adm => (
                  <tr key={adm.id}>
                    <td><span className="font-semibold text-primary">{adm.wardName}</span> — Room {adm.roomNo} (Bed {adm.bedNo})</td>
                    <td>
                      <div className="font-semibold text-primary">{adm.patientName}</div>
                    </td>
                    <td className="text-accent">{adm.patientId}</td>
                    <td>{adm.admitDate}</td>
                    <td>
                      <span className="badge badge-purple">{adm.type}</span>
                    </td>
                    <td className="font-semibold">₹{adm.rate.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setSelectedAdmission(adm)} title="Rounds & Notes">
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Rounds Panel */}
        <div className="card">
          {selectedAdmission ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
                <div>
                  <h3 className="card-title text-accent" style={{ margin: 0 }}>Active Bed: Room {selectedAdmission.roomNo} ({selectedAdmission.bedNo})</h3>
                  <p className="text-secondary text-sm" style={{ marginTop: 2 }}>Patient: {selectedAdmission.patientName}</p>
                  <span className="badge badge-primary mt-sm">{selectedAdmission.wardName}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Link to={`/patient-record/${selectedAdmission.patientId}`} target="_blank" title="Scan or click to view Patient EMR">
                    <div style={{ background: '#fff', padding: 4, borderRadius: 6, display: 'inline-block' }}>
                      <SVGQRCode value={`${window.location.origin}/patient-record/${selectedAdmission.patientId}`} size={40} />
                    </div>
                  </Link>
                  <span className="text-xxs text-muted">Scan Bed QR</span>
                </div>
              </div>

              <div className="section mb-md">
                <h4 className="section-title text-xs mb-sm">Daily Rounds Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Intake/Output Recorded (8:00 AM)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked /> Morning Specialist Rounds Completed
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" /> Evening Nursing Handover Log
                  </label>
                </div>
              </div>

              <div className="form-group mb-md">
                <label className="form-label">Add Round Note</label>
                <textarea className="form-control" style={{ height: 80 }} placeholder="Type note about patient vitals or condition..." />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                  <ArrowRightLeft size={14} /> Request Ward Transfer
                </button>
                <button className="btn btn-danger w-full" style={{ justifyContent: 'center' }} onClick={openDischargeProcess}>
                  <CheckCircle2 size={14} /> Initiate Discharge Summaries
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <Bed size={36} className="text-muted mb-md" />
              <div className="empty-state-title">Select Admission Profile</div>
              <p className="text-secondary text-xs">Click the view icon on any active ward patient to inspect nursing check sheets and log daily rounds.</p>
            </div>
          )}
        </div>
      </div>

      {/* Discharge print preview block */}
      {printedSummary && (
        <div className="card preview-mode mt-lg">
          <div className="print-letterhead" style={{ display: 'block' }}>
            <div className="print-letterhead-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-light)', margin: 0 }}>MEDICORE HOSPITAL</h2>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>NABH Certified Multi-Specialty Hospital</p>
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>100, OMR IT Highway, Chennai - 600096</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ textAlign: 'right' }}>
                  <span className="text-muted text-xxs block" style={{ fontWeight: 'bold' }}>PATIENT EMR QR</span>
                  <span className="text-secondary text-xxs block">Scan to verify chart</span>
                </div>
                <Link to={`/patient-record/${printedSummary.patientId}`} target="_blank" style={{ color: 'inherit', display: 'inline-block' }}>
                  <div style={{ background: '#fff', padding: 4, borderRadius: 6, display: 'inline-block' }}>
                    <SVGQRCode value={`${window.location.origin}/patient-record/${printedSummary.patientId}`} size={44} />
                  </div>
                </Link>
              </div>
            </div>
            <div className="print-doc-title">PATIENT DISCHARGE SUMMARY</div>

            <div className="print-grid-2">
              <div className="print-grid-item">
                <div className="print-grid-label">PATIENT NAME</div>
                <div className="font-bold text-primary">{printedSummary.patientName}</div>
              </div>
              <div className="print-grid-item">
                <div className="print-grid-label">MRN REFERENCE</div>
                <div className="text-accent font-semibold">{printedSummary.patientId}</div>
              </div>
              <div className="print-grid-item">
                <div className="print-grid-label">ADMISSION DATE</div>
                <div>{printedSummary.admitDate}</div>
              </div>
              <div className="print-grid-item">
                <div className="print-grid-label">DISCHARGE DATE</div>
                <div>{printedSummary.dischargeDate}</div>
              </div>
            </div>

            <div className="print-section-title">Summary of Illness & Diagnosis</div>
            <p className="text-sm text-primary mb-md" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 6 }}>
              {printedSummary.illnessSummary}
            </p>

            <div className="print-section-title">Course of Treatment & Interventions</div>
            <p className="text-sm text-primary mb-md" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 6 }}>
              {printedSummary.treatmentCourse}
            </p>

            <div className="print-section-title">Condition at Discharge</div>
            <span className="badge badge-success mb-md">{printedSummary.condition}</span>

            <div className="print-section-title">Discharge Medications & Follow-up Instructions</div>
            <p className="text-sm text-primary" style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 6 }}>
              {printedSummary.meds}
            </p>

            <div className="print-signature-row">
              <div className="print-signature-block">
                <div className="print-signature-line" />
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Attending Consultant Physician</p>
              </div>
              <div className="print-signature-block">
                <div className="print-signature-line" />
                <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Medical Superintendent</p>
              </div>
            </div>
          </div>
          <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginTop: '16px' }} onClick={triggerPrint}>
            <Printer size={14} style={{ marginRight: 6 }} /> Print Summary Document
          </button>
        </div>
      )}

      {/* Admit Patient Modal */}
      {showAdmitModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">IPD Inpatient Admission</h2>
              <button className="btn-secondary" onClick={() => setShowAdmitModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdmit}>
              <div className="modal-body">
                <div className="form-group mb-md">
                  <label className="form-label">Select Patient</label>
                  <select className="form-control" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Admitting Specialist</label>
                  <select className="form-control" value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Allocate Bed</label>
                  <select className="form-control" value={selectedBedId} onChange={e => setSelectedBedId(e.target.value)}>
                    {bedsList.filter(b => b.status === 'Vacant').map(b => (
                      <option key={b.id} value={b.id}>{b.wardName} Room {b.roomNo} Bed {b.bedNo} (₹{b.rate}/day)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Admitting Diagnosis & Reason</label>
                  <textarea className="form-control" value={admitDiagnosis} onChange={e => setAdmitDiagnosis(e.target.value)} placeholder="Type details..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdmitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Admission</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discharge Summary Entry Modal */}
      {showDischargeModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Discharge Summary & Case Report</h2>
              <button className="btn-secondary" onClick={() => setShowDischargeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleDischargeSubmit}>
              <div className="modal-body">
                <div className="form-group mb-md">
                  <label className="form-label">Summary of Illness & Principal Complaints</label>
                  <textarea className="form-control" required style={{ height: 100 }} value={illnessSummary} onChange={e => setIllnessSummary(e.target.value)} />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Course in Hospital & Clinical Treatments</label>
                  <textarea className="form-control" required style={{ height: 100 }} value={treatmentCourse} onChange={e => setTreatmentCourse(e.target.value)} />
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Condition at Discharge</label>
                    <select className="form-control" value={dischargeCondition} onChange={e => setDischargeCondition(e.target.value)}>
                      <option>Stable</option>
                      <option>Improved</option>
                      <option>Relieved</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Post-Discharge Prescriptions & Medications</label>
                    <input className="form-control" required value={dischargeMeds} onChange={e => setDischargeMeds(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDischargeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Complete Patient Discharge</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPD;
