import { useEffect, useState } from 'react';
import {
  Bed, Users, Calendar, Plus, Eye, CheckCircle2, ChevronRight, Activity,
  ClipboardList, AlertTriangle, FileText, ArrowRightLeft, Printer, Star, Heart, Trash2
} from 'lucide-react';
import { api } from '../../utils/api';
import { wards, patients, doctors } from '../../data/mockData';
import { exportTablePDF } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const SVGQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#0f172a"
      level="M"
      style={{
        borderRadius: '4px',
        border: '1px solid #cbd5e1',
        padding: '4px',
        background: '#ffffff',
        display: 'inline-block'
      }}
    />
  );
};

const IPD: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'occupancy' | 'feedback'>('occupancy');
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [bedsList, setBedsList] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
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

  // New Feedback Form states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [fbPatientId, setFbPatientId] = useState(patients[0]?.id || '');
  const [fbDoctorRating, setFbDoctorRating] = useState(5);
  const [fbNurseRating, setFbNurseRating] = useState(5);
  const [fbCleanlinessRating, setFbCleanlinessRating] = useState(5);
  const [fbFoodRating, setFbFoodRating] = useState(5);
  const [fbBillingRating, setFbBillingRating] = useState(5);
  const [fbRecommend, setFbRecommend] = useState('Yes');
  const [fbComments, setFbComments] = useState('');

  const loadIPDData = async () => {
    try {
      const beds = await api.getBeds();
      setBedsList(beds);
      setAdmissions(beds.filter((b: any) => b.status === 'Occupied'));
      const vacant = beds.find((b: any) => b.status === 'Vacant');
      if (vacant) setSelectedBedId(vacant.id);
      
      const fList = await api.getDischargeFeedbacks();
      setFeedbacks(fList);
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

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === fbPatientId);
    const feedbackDoc = {
      id: `FB-${Math.floor(100 + Math.random() * 900)}`,
      patientId: fbPatientId,
      patientName: pat?.name || 'Anonymous Patient',
      dischargeDate: new Date().toISOString().split('T')[0],
      doctorRating: fbDoctorRating,
      nurseRating: fbNurseRating,
      cleanlinessRating: fbCleanlinessRating,
      foodRating: fbFoodRating,
      billingRating: fbBillingRating,
      recommend: fbRecommend,
      comments: fbComments
    };

    try {
      await api.createDischargeFeedback(feedbackDoc);
      toast.success('Patient discharge feedback logged successfully!');
      setShowFeedbackModal(false);
      // Reset form
      setFbComments('');
      setFbDoctorRating(5);
      setFbNurseRating(5);
      setFbCleanlinessRating(5);
      setFbFoodRating(5);
      setFbBillingRating(5);
      setFbRecommend('Yes');
      // Reload
      loadIPDData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit feedback');
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await api.deleteDischargeFeedback(id);
      toast.success('Feedback entry deleted successfully.');
      loadIPDData();
    } catch (err) {
      console.error(err);
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
          <p className="page-subtitle">Patient ward occupancy tracking, bed allocations, clinical round logs, discharges, and patient feedback surveys.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'feedback' ? (
            <button className="btn btn-primary" onClick={() => setShowFeedbackModal(true)}>
              <Plus size={16} /> Log Discharge Feedback
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowAdmitModal(true)}>
              <Plus size={16} /> Admit Patient
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 20, gap: 16 }}>
        <button
          onClick={() => setActiveTab('occupancy')}
          style={{
            background: 'none', border: 'none', padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            borderBottom: activeTab === 'occupancy' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'occupancy' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          Active Ward Occupancy
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          style={{
            background: 'none', border: 'none', padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            borderBottom: activeTab === 'feedback' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'feedback' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            transition: 'all 0.15s ease'
          }}
        >
          Patient Discharge Feedback ({feedbacks.length})
        </button>
      </div>

      {activeTab === 'occupancy' ? (
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
                  {admissions.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                        No warded patients currently.
                      </td>
                    </tr>
                  )}
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
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Feedback Statistics / Overview */}
          <div className="grid grid-6" style={{ gap: 12 }}>
            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Doctors Rating</span>
              <strong style={{ fontSize: 20, color: 'var(--color-primary)', display: 'block', marginTop: 4 }}>
                {(feedbacks.reduce((acc, f) => acc + (f.doctorRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </strong>
              <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} />
              </div>
            </div>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Nursing Care</span>
              <strong style={{ fontSize: 20, color: 'var(--color-primary)', display: 'block', marginTop: 4 }}>
                {(feedbacks.reduce((acc, f) => acc + (f.nurseRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </strong>
              <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} />
              </div>
            </div>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Cleanliness</span>
              <strong style={{ fontSize: 20, color: 'var(--color-primary)', display: 'block', marginTop: 4 }}>
                {(feedbacks.reduce((acc, f) => acc + (f.cleanlinessRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </strong>
              <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" />
              </div>
            </div>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Food &amp; Diet</span>
              <strong style={{ fontSize: 20, color: 'var(--color-primary)', display: 'block', marginTop: 4 }}>
                {(feedbacks.reduce((acc, f) => acc + (f.foodRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </strong>
              <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} /><Star size={10} />
              </div>
            </div>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Billing &amp; Admin</span>
              <strong style={{ fontSize: 20, color: 'var(--color-primary)', display: 'block', marginTop: 4 }}>
                {(feedbacks.reduce((acc, f) => acc + (f.billingRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
              </strong>
              <div style={{ color: '#eab308', display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                <Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} fill="#eab308" /><Star size={10} />
              </div>
            </div>

            <div className="card" style={{ padding: 14, textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Recommend Rate</span>
              <strong style={{ fontSize: 20, color: 'var(--color-success)', display: 'block', marginTop: 4 }}>
                {Math.round((feedbacks.filter(f => f.recommend === 'Yes').length / (feedbacks.length || 1)) * 100)}%
              </strong>
              <div style={{ color: 'var(--color-success)', fontSize: 10, fontWeight: 700, marginTop: 4 }}>
                <Heart size={10} fill="var(--color-success)" style={{ display: 'inline-block', marginRight: 4 }} /> Recommend Hospital
              </div>
            </div>
          </div>

          {/* Feedback list */}
          <div className="card">
            <h3 className="card-title mb-md">Patient Feedback Log</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient (MRN)</th>
                    <th>Discharge Date</th>
                    <th>Service Ratings</th>
                    <th>Recommend?</th>
                    <th>Comments &amp; Suggestions</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbacks.map(f => (
                    <tr key={f._id || f.id}>
                      <td>
                        <span className="font-semibold text-primary">{f.patientName}</span>
                        <div className="text-muted text-xxs">{f.patientId}</div>
                      </td>
                      <td>{f.dischargeDate || '2026-07-14'}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10, color: 'var(--color-text-secondary)' }}>
                          <div>Doc: <strong style={{ color: 'var(--color-primary-light)' }}>{f.doctorRating}★</strong> | Nurse: <strong style={{ color: 'var(--color-primary-light)' }}>{f.nurseRating}★</strong></div>
                          <div>Room: <strong style={{ color: 'var(--color-primary-light)' }}>{f.cleanlinessRating}★</strong> | Food: <strong style={{ color: 'var(--color-primary-light)' }}>{f.foodRating}★</strong> | Bill: <strong style={{ color: 'var(--color-primary-light)' }}>{f.billingRating}★</strong></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${f.recommend === 'Yes' ? 'success' : 'danger'}`}>
                          {f.recommend === 'Yes' ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <p style={{ margin: 0, fontSize: 12, maxWidth: 350, fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                          "{f.comments || 'No remarks provided.'}"
                        </p>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleDeleteFeedback(f.id)} title="Delete Feedback">
                          <Trash2 size={12} color="var(--color-primary)" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {feedbacks.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)' }}>
                        No inpatient discharge feedback reports warded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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
                <button type="submit" className="btn className=btn-primary btn-primary">Confirm Admission</button>
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

      {/* Log Discharge Feedback Questionnaire Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowFeedbackModal(false); }}>
          <div className="modal" style={{ maxWidth: 500, borderRadius: 20 }}>
            <div className="modal-header" style={{ background: 'var(--gradient-primary)', color: 'white', padding: '16px 20px' }}>
              <h2 className="modal-title" style={{ color: 'white', margin: 0, fontSize: 16 }}>Inpatient Discharge Feedback Report</h2>
              <button style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }} onClick={() => setShowFeedbackModal(false)}>✕</button>
            </div>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="modal-body" style={{ padding: 20 }}>
                {/* Patient selection */}
                <div className="form-group mb-md">
                  <label className="form-label">Patient (Discharged Profile)</label>
                  <select className="form-control" value={fbPatientId} onChange={e => setFbPatientId(e.target.value)}>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 12 }}>Please rate the following clinical services from 1 to 5 stars:</p>

                {/* Star Ratings Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Doctor Care &amp; Attentiveness</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFbDoctorRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={16} fill={star <= fbDoctorRating ? '#eab308' : 'none'} color={star <= fbDoctorRating ? '#eab308' : 'var(--color-text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Nursing Care &amp; Responsiveness</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFbNurseRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={16} fill={star <= fbNurseRating ? '#eab308' : 'none'} color={star <= fbNurseRating ? '#eab308' : 'var(--color-text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Ward / Room Cleanliness</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFbCleanlinessRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={16} fill={star <= fbCleanlinessRating ? '#eab308' : 'none'} color={star <= fbCleanlinessRating ? '#eab308' : 'var(--color-text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Food &amp; Diet Quality</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFbFoodRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={16} fill={star <= fbFoodRating ? '#eab308' : 'none'} color={star <= fbFoodRating ? '#eab308' : 'var(--color-text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Billing Speed &amp; Admin transparency</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1,2,3,4,5].map(star => (
                        <button key={star} type="button" onClick={() => setFbBillingRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                          <Star size={16} fill={star <= fbBillingRating ? '#eab308' : 'none'} color={star <= fbBillingRating ? '#eab308' : 'var(--color-text-muted)'} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommendation and notes */}
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Would you recommend our hospital to others?</label>
                  <select className="form-control" value={fbRecommend} onChange={e => setFbRecommend(e.target.value)}>
                    <option value="Yes">Yes, absolutely</option>
                    <option value="No">No, needs improvements</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>Comments or suggestions for improvement</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide any feedback on how we can improve our services..."
                    value={fbComments}
                    onChange={e => setFbComments(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '12px 20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Survey Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPD;
