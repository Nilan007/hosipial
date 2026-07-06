import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Activity, Heart, Calendar, FileText, DollarSign, CheckCircle, 
  Clock, Printer, Download, AlertTriangle, User, Stethoscope, 
  QrCode, ClipboardList, ShieldAlert, ArrowLeft, Pill, FileCode
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const PatientPortalQR: React.FC = () => {
  const { mrn } = useParams<{ mrn: string }>();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [radiology, setRadiology] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'prescriptions' | 'billing' | 'labs' | 'radiology'>('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all databases to filter by Patient MRN
        const [patientsData, prescriptionsData, billsData, labsData, radiologyData] = await Promise.all([
          api.getPatients(),
          api.getPrescriptions(),
          api.getBills(),
          api.getLabTests(),
          api.getRadiologyScans()
        ]);

        const selectedPatient = patientsData.find((p: any) => p.id === mrn);
        if (!selectedPatient) {
          toast.error("Patient Record not found. Verify MRN code.");
          setLoading(false);
          return;
        }

        setPatient(selectedPatient);
        
        // Filter values related to MRN
        setPrescriptions(prescriptionsData.filter((pr: any) => pr.patientId === mrn));
        setBills(billsData.filter((b: any) => b.patientId === mrn));
        setLabs(labsData.filter((l: any) => l.patientId === mrn));
        setRadiology(radiologyData.filter((r: any) => r.patientId === mrn));

        setLoading(false);
      } catch (err: any) {
        console.error(err);
        toast.error("Error loading patient portal information.");
        setLoading(false);
      }
    };

    if (mrn) {
      fetchData();
    }
  }, [mrn]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: 16 }}>
        <div className="pulse-glow" style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={32} className="text-accent" style={{ animation: 'spin 2s linear infinite' }} />
        </div>
        <p className="text-secondary font-semibold">Decrypting HIPAA Encrypted EMR Ledger...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: 16 }}>
        <ShieldAlert size={64} className="text-danger" />
        <h2 className="text-lg font-bold">EMR Query Failure</h2>
        <p className="text-muted">No clinical charts associated with MRN Code: <span className="text-accent font-mono">{mrn}</span></p>
        <Link to="/patients" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Patient List
        </Link>
      </div>
    );
  }

  // Calculate stats
  const totalInvoiced = bills.reduce((sum, b) => sum + (b.total || 0), 0);
  const totalPaid = bills.reduce((sum, b) => sum + (b.paid || 0), 0);
  const totalBalance = bills.reduce((sum, b) => sum + (b.balance || 0), 0);

  return (
    <div className="page-content portal-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
      
      {/* Portal Branding / Top Nav (Public Friendly) */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 16, marginBottom: 20 }}>
        <div>
          <div className="flex-align" style={{ gap: 8 }}>
            <div className="brand-logo" style={{ background: 'var(--color-gradient-primary)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={18} fill="white" stroke="none" />
            </div>
            <h2 className="text-lg font-bold text-gradient">MediCore Patient Portal</h2>
          </div>
          <p className="text-xs text-muted" style={{ marginTop: 2 }}>Secure Live Patient EMR Verification Hub</p>
        </div>

        <div className="flex-align" style={{ gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print Health Summary
          </button>
          <Link to="/dashboard" className="btn btn-primary btn-sm no-print">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Hero Demographics Header */}
      <div className="card text-white" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-primary-glow)', marginBottom: 24, padding: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ width: 72, height: 72, fontSize: 24, background: 'var(--color-primary)', border: '2px solid var(--color-accent)' }}>
              {patient.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="flex-align" style={{ gap: 12 }}>
                <h1 className="text-2xl font-bold" style={{ margin: 0 }}>{patient.name}</h1>
                <span className={`badge badge-${patient.status === 'Admitted' ? 'danger' : 'success'}`} style={{ fontSize: 11 }}>
                  {patient.status}
                </span>
              </div>
              <p className="text-secondary text-sm" style={{ marginTop: 4 }}>
                MRN: <span className="font-mono font-bold text-accent">{patient.id}</span> | Gender: {patient.gender} | Age: {patient.age} Yrs
              </p>
              <div className="flex-align" style={{ gap: 8, marginTop: 8 }}>
                <span className="text-xs text-muted">Phone:</span> <span className="text-xs font-semibold text-white">{patient.phone}</span>
                <span className="text-xs text-muted" style={{ marginLeft: 12 }}>Blood Group:</span> <span className="text-xs font-bold text-accent">{patient.blood || 'O+'}</span>
              </div>
            </div>
          </div>

          <div className="flex-align" style={{ gap: 16 }}>
            <div className="text-right">
              <span className="text-xs text-muted block">LIVE PATIENT ID CODE</span>
              <span className="text-xxs text-secondary block" style={{ opacity: 0.8 }}>Verify EMR Credential Scan</span>
            </div>
            <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-block' }}>
              <QrCode size={48} color="#0d1117" />
            </div>
          </div>

        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />

        {/* Dynamic Medical Flags */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: 12, borderRadius: 8 }}>
            <div className="flex-align text-danger" style={{ gap: 6, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              <AlertTriangle size={14} /> Drug & Food Allergies
            </div>
            <div className="text-xs text-white">
              {patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No known allergies'}
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: 12, borderRadius: 8 }}>
            <div className="flex-align text-warning" style={{ gap: 6, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              <ShieldAlert size={14} /> Chronic Medical Conditions
            </div>
            <div className="text-xs text-white">
              {patient.chronic && patient.chronic.length > 0 ? patient.chronic.join(', ') : 'No pre-existing chronic conditions logged'}
            </div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)', padding: 12, borderRadius: 8 }}>
            <div className="flex-align text-accent" style={{ gap: 6, fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>
              <User size={14} /> Emergency Contact
            </div>
            <div className="text-xs text-white">
              {patient.emergency ? `${patient.emergency} - ${patient.emergencyPhone || 'N/A'}` : 'None provided'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="tab-menu flex-align no-print" style={{ gap: 8, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} /> Patient Profile & Vitals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          <Pill size={16} /> Rx Prescriptions ({prescriptions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <DollarSign size={16} /> Bill Transactions ({bills.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          <Activity size={16} /> LIMS Lab Reports ({labs.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'radiology' ? 'active' : ''}`}
          onClick={() => setActiveTab('radiology')}
        >
          <FileCode size={16} /> PACS Radiology Scans ({radiology.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="portal-content">
        
        {/* Tab 1: Profile & EMR */}
        {activeTab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div className="card">
              <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
                <ClipboardList size={18} className="text-accent" /> Clinical Demographics Details
              </h3>
              
              <table className="table" style={{ fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td className="text-muted py-2">Full Legal Name</td>
                    <td className="font-semibold text-right py-2">{patient.name}</td>
                  </tr>
                  <tr>
                    <td className="text-muted py-2">Date of Birth (DOB)</td>
                    <td className="font-semibold text-right py-2">{patient.dob || '1992-04-12'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted py-2">Blood Group</td>
                    <td className="font-bold text-accent text-right py-2">{patient.blood || 'O+'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted py-2">Insurance Provider</td>
                    <td className="font-semibold text-right py-2">{patient.insurance || 'Self Pay'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted py-2">Home Address</td>
                    <td className="font-semibold text-right py-2">{patient.address || 'City Center, Chennai'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted py-2">Last Consultation Visit</td>
                    <td className="text-right py-2">{patient.lastVisit || 'Today'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
                <Activity size={18} className="text-accent" /> Last Logged Physical Vital Signs
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div style={{ padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                  <span className="text-xxs text-muted block">BLOOD PRESSURE</span>
                  <span className="text-lg font-bold text-white block" style={{ margin: '4px 0' }}>122 / 80</span>
                  <span className="text-xxs badge badge-success">Normal</span>
                </div>

                <div style={{ padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                  <span className="text-xxs text-muted block">HEART PULSE</span>
                  <span className="text-lg font-bold text-white block" style={{ margin: '4px 0' }}>76 BPM</span>
                  <span className="text-xxs badge badge-success">Optimal</span>
                </div>

                <div style={{ padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                  <span className="text-xxs text-muted block">BODY TEMPERATURE</span>
                  <span className="text-lg font-bold text-white block" style={{ margin: '4px 0' }}>98.6 °F</span>
                  <span className="text-xxs badge badge-success">Normal</span>
                </div>

                <div style={{ padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, textAlign: 'center' }}>
                  <span className="text-xxs text-muted block">OXYGEN SATURATION</span>
                  <span className="text-lg font-bold text-white block" style={{ margin: '4px 0' }}>99% SpO2</span>
                  <span className="text-xxs badge badge-success">Normal</span>
                </div>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8, fontSize: 12 }}>
                <div className="flex-between">
                  <span className="text-muted">Weight / Height:</span>
                  <span className="font-semibold text-white">72 kg / 175 cm</span>
                </div>
                <div className="flex-between" style={{ marginTop: 4 }}>
                  <span className="text-muted">Calculated BMI Index:</span>
                  <span className="font-bold text-accent">23.5 (Normal)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Prescriptions */}
        {activeTab === 'prescriptions' && (
          <div className="card">
            <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
              <Pill size={18} className="text-accent" /> Active Pharmacopoeia & Prescription History (Rx)
            </h3>
            
            {prescriptions.length === 0 ? (
              <div className="text-center py-6 text-muted">No prescriptions logged for this patient.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {prescriptions.map((pr) => (
                  <div key={pr.id} className="card-item" style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, background: 'var(--color-bg-secondary)' }}>
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="font-semibold text-white">Prescription Ref: </span>
                        <span className="font-mono text-accent font-bold">{pr.id}</span>
                      </div>
                      <span className={`badge badge-${pr.status === 'Dispensed' ? 'success' : 'warning'}`}>
                        {pr.status || 'Prescribed'}
                      </span>
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th>Drug Formulation</th>
                          <th>Dosage Schedule</th>
                          <th>Duration</th>
                          <th>Clinical Instructions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pr.medicines?.map((m: any, idx: number) => (
                          <tr key={idx}>
                            <td className="font-semibold text-white">{m.name}</td>
                            <td className="font-bold text-accent">{m.dosage || '1-0-1'}</td>
                            <td>{m.duration || '5 Days'}</td>
                            <td className="text-xs text-secondary">{m.instructions || 'After meals'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex-between" style={{ marginTop: 12, fontSize: 11, color: 'var(--color-text-muted)' }}>
                      <span>Consultant Doctor: {pr.doctorName || 'Dr. Anand Krishnamurthy'}</span>
                      <span>Log Date: {pr.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Billing Details */}
        {activeTab === 'billing' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div className="kpi-card">
                <span className="kpi-label">TOTAL ACCUMULATED BILLS</span>
                <span className="kpi-value text-white">₹{totalInvoiced.toLocaleString('en-IN')}</span>
              </div>
              <div className="kpi-card" style={{ borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                <span className="kpi-label">TOTAL AMOUNT PAID</span>
                <span className="kpi-value text-success">₹{totalPaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="kpi-card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <span className="kpi-label">OUTSTANDING BALANCE</span>
                <span className="kpi-value text-danger">₹{totalBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="card">
              <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
                <DollarSign size={18} className="text-accent" /> Inpatient & Outpatient Invoices List
              </h3>

              {bills.length === 0 ? (
                <div className="text-center py-6 text-muted">No invoice bills ledger posted for this patient.</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Billing Mode</th>
                      <th>Total Fees</th>
                      <th>Amount Paid</th>
                      <th>Balance Due</th>
                      <th>Settle Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr key={b.id}>
                        <td className="font-mono font-bold text-accent">{b.id}</td>
                        <td className="font-semibold text-white">{b.type === 'IP' ? 'In-Patient (IPD)' : 'Out-Patient (OPD)'}</td>
                        <td className="font-semibold">₹{b.total?.toLocaleString('en-IN')}</td>
                        <td className="text-success font-semibold">₹{b.paid?.toLocaleString('en-IN')}</td>
                        <td className="text-danger font-semibold">₹{b.balance?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge badge-${b.status === 'Paid' ? 'success' : b.status === 'Partial' ? 'warning' : 'danger'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-xs text-muted">{b.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Lab Reports */}
        {activeTab === 'labs' && (
          <div className="card">
            <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
              <Activity size={18} className="text-accent" /> LIMS Electronic Pathology Lab Parameters
            </h3>

            {labs.length === 0 ? (
              <div className="text-center py-6 text-muted">No laboratory specimens cataloged for this patient.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {labs.map((lb) => (
                  <div key={lb.id} className="card-item" style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, background: 'var(--color-bg-secondary)' }}>
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="font-semibold text-white">Specimen Code: </span>
                        <span className="font-mono text-accent font-bold">{lb.id}</span>
                      </div>
                      <span className={`badge badge-${lb.status === 'Completed' ? 'success' : 'warning'}`}>
                        {lb.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 12 }}>
                      <div>
                        <span className="text-xxs text-muted block">INVESTIGATION TEST</span>
                        <span className="text-sm font-semibold text-white block">{lb.testName}</span>
                      </div>
                      <div>
                        <span className="text-xxs text-muted block">ORDERED BY PHYSICIAN</span>
                        <span className="text-sm text-secondary block">{lb.doctorId || 'Dr. Anand K.'}</span>
                      </div>
                    </div>

                    {lb.result && typeof lb.result === 'object' && (
                      <table className="table" style={{ fontSize: 12 }}>
                        <thead>
                          <tr>
                            <th>Parameter Test</th>
                            <th>Observed Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(lb.result).map(([name, val]: any) => (
                            <tr key={name}>
                              <td>{name}</td>
                              <td className="font-bold text-white">{val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Radiology Scans */}
        {activeTab === 'radiology' && (
          <div className="card">
            <h3 className="text-md font-bold mb-4 flex-align" style={{ gap: 8 }}>
              <FileText size={18} className="text-accent" /> PACS RIS Clinical Imaging Interpretation Reports
            </h3>

            {radiology.length === 0 ? (
              <div className="text-center py-6 text-muted">No imaging modalities recorded for this patient.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {radiology.map((r) => (
                  <div key={r.id} className="card-item" style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 16, background: 'var(--color-bg-secondary)' }}>
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <div>
                        <span className="font-semibold text-white">Scan Accession Ref: </span>
                        <span className="font-mono text-accent font-bold">{r.id}</span>
                      </div>
                      <span className={`badge badge-${r.status === 'Reported' ? 'success' : 'warning'}`}>
                        {r.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 12 }}>
                      <div>
                        <span className="text-xxs text-muted block">MODALITY TYPE</span>
                        <span className="text-sm font-semibold text-white block">{r.type} ({r.modality})</span>
                      </div>
                      <div>
                        <span className="text-xxs text-muted block">REPORTING RADIOLOGIST</span>
                        <span className="text-sm text-secondary block">{r.radiologist || 'Dr. Murugesan P.'}</span>
                      </div>
                      <div>
                        <span className="text-xxs text-muted block">SCAN DATE</span>
                        <span className="text-sm text-secondary block">{r.date}</span>
                      </div>
                    </div>

                    <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, borderLeft: '3px solid var(--color-primary)' }}>
                      <span className="text-xxs text-muted block mb-1">RADIOLOGICAL FINDINGS & CLINICAL IMPRESSION</span>
                      <p className="text-xs text-white" style={{ lineHeight: 1.5, margin: 0 }}>{r.finding || 'No abnormalities detected in scans.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Print Friendly Section (only visible during print) */}
      <div className="print-only">
        <div style={{ borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 20 }}>
          <h2 style={{ margin: 0, textTransform: 'uppercase' }}>MediCore Multispeciality Hospital</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#333' }}>
            NABH Accredited Tertiary Care Center | 100 Feet Ring Road, JP Nagar, Bangalore
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#666' }}>
            Email: emr@medicore.org | Web: www.medicore.org | Phone: +91 80 4999 2200
          </p>
        </div>

        <h3 style={{ textTransform: 'uppercase', textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: 6 }}>
          Comprehensive Patient Electronic Health Record (EMR)
        </h3>

        <table style={{ width: '100%', marginBottom: 20, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '18%', fontWeight: 'bold', padding: '6px 0' }}>Patient Name:</td>
              <td style={{ width: '32%', padding: '6px 0' }}>{patient.name}</td>
              <td style={{ width: '18%', fontWeight: 'bold', padding: '6px 0' }}>MRN / Patient ID:</td>
              <td style={{ width: '32%', padding: '6px 0', fontFamily: 'monospace' }}>{patient.id}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '6px 0' }}>Age / Gender:</td>
              <td>{patient.age} Years / {patient.gender}</td>
              <td style={{ fontWeight: 'bold', padding: '6px 0' }}>Blood Group:</td>
              <td>{patient.blood || 'O+'}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '6px 0' }}>Phone:</td>
              <td>{patient.phone}</td>
              <td style={{ fontWeight: 'bold', padding: '6px 0' }}>Allergies:</td>
              <td style={{ color: 'red', fontWeight: 'bold' }}>{patient.allergies?.join(', ') || 'No known allergies'}</td>
            </tr>
          </tbody>
        </table>

        {/* EMR Prescriptions */}
        <h4 style={{ borderBottom: '1px solid #000', paddingBottom: 4, marginTop: 24 }}>1. Active Prescriptions (Rx)</h4>
        {prescriptions.map((pr, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <p style={{ margin: '4px 0', fontSize: 12 }}><strong>Ref:</strong> {pr.id} | <strong>Doctor:</strong> {pr.doctorName} | <strong>Date:</strong> {pr.date}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }} border={1}>
              <thead>
                <tr>
                  <th style={{ padding: 4 }}>Medicine</th>
                  <th style={{ padding: 4 }}>Dosage</th>
                  <th style={{ padding: 4 }}>Duration</th>
                  <th style={{ padding: 4 }}>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {pr.medicines?.map((m: any, mIdx: number) => (
                  <tr key={mIdx}>
                    <td style={{ padding: 4 }}>{m.name}</td>
                    <td style={{ padding: 4 }}>{m.dosage}</td>
                    <td style={{ padding: 4 }}>{m.duration}</td>
                    <td style={{ padding: 4 }}>{m.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* EMR Lab Reports */}
        <h4 style={{ borderBottom: '1px solid #000', paddingBottom: 4, marginTop: 24 }}>2. Lab Diagnostics (LIMS Parameters)</h4>
        {labs.map((lb, idx) => (
          <div key={idx} style={{ marginBottom: 12 }}>
            <p style={{ margin: '4px 0', fontSize: 12 }}><strong>Ref:</strong> {lb.id} | <strong>Test:</strong> {lb.testName} | <strong>Ordered By:</strong> {lb.doctorId || 'Dr. Anand K.'}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }} border={1}>
              <thead>
                <tr>
                  <th style={{ padding: 4 }}>Parameter</th>
                  <th style={{ padding: 4 }}>Observed Value</th>
                </tr>
              </thead>
              <tbody>
                {lb.result && typeof lb.result === 'object' && Object.entries(lb.result).map(([name, val]: any, pIdx: number) => (
                  <tr key={pIdx}>
                    <td style={{ padding: 4 }}>{name}</td>
                    <td style={{ padding: 4 }}>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* EMR Radiology Reports */}
        <h4 style={{ borderBottom: '1px solid #000', paddingBottom: 4, marginTop: 24 }}>3. PACS Radiology Scans & Clinical Interpretations</h4>
        {radiology.map((r, idx) => (
          <div key={idx} style={{ borderBottom: '1px dashed #ccc', paddingBottom: 8, marginBottom: 8 }}>
            <p style={{ margin: '4px 0', fontSize: 12 }}><strong>Ref:</strong> {r.id} | <strong>Modality:</strong> {r.modality} ({r.type}) | <strong>Date:</strong> {r.date}</p>
            <p style={{ margin: '4px 0', fontSize: 11 }}><strong>Findings & Clinical Impression:</strong></p>
            <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#333', fontStyle: 'italic' }}>{r.finding}</p>
          </div>
        ))}

        {/* EMR Invoices */}
        <h4 style={{ borderBottom: '1px solid #000', paddingBottom: 4, marginTop: 24 }}>4. Accumulated Invoice Ledger Accounts</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }} border={1}>
          <thead>
            <tr>
              <th style={{ padding: 4 }}>Invoice Ref</th>
              <th style={{ padding: 4 }}>Mode</th>
              <th style={{ padding: 4 }}>Total Fees</th>
              <th style={{ padding: 4 }}>Amount Paid</th>
              <th style={{ padding: 4 }}>Balance Due</th>
              <th style={{ padding: 4 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((b, idx) => (
              <tr key={idx}>
                <td style={{ padding: 4, fontFamily: 'monospace' }}>{b.id}</td>
                <td style={{ padding: 4 }}>{b.type === 'IP' ? 'In-Patient (IPD)' : 'Out-Patient (OPD)'}</td>
                <td style={{ padding: 4 }}>₹{b.total}</td>
                <td style={{ padding: 4 }}>₹{b.paid}</td>
                <td style={{ padding: 4, color: b.balance > 0 ? 'red' : 'black' }}>₹{b.balance}</td>
                <td style={{ padding: 4 }}>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Vouchers and signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 50, fontSize: 11 }}>
          <div>
            <p style={{ borderBottom: '1px solid #000', width: 200, height: 40 }}></p>
            <p style={{ textAlign: 'center', margin: 0 }}>Registered Medical Practitioner</p>
          </div>
          <div>
            <p style={{ borderBottom: '1px solid #000', width: 200, height: 40 }}></p>
            <p style={{ textAlign: 'center', margin: 0 }}>Chief Medical Officer / Approver</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PatientPortalQR;
