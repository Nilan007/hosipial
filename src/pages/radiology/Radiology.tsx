import { useEffect, useState } from 'react';
import {
  Scan, Search, Camera, Play, Check, Eye, Download, FileText,
  Activity, AlertTriangle, Printer, Sparkles, Building, X, Film, Crown
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF } from '../../utils/exportUtils';

const Radiology: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [outsideLabsList, setOutsideLabsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Outside Referral Form states
  const [showOutsideReferralModal, setShowOutsideReferralModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('');
  const [scanType, setScanType] = useState('Contrast MRI Brain');
  const [totalAmount, setTotalAmount] = useState(8000);
  const [referralDate, setReferralDate] = useState(new Date().toISOString().split('T')[0]);

  // Reporting state
  const [findings, setFindings] = useState('');

  const getPatientSubscription = (patientId: string) => {
    const p = patientsList.find(pat => pat.id === patientId);
    return p?.fasttrackSubscription?.status === 'Active';
  };

  const loadRadiology = async () => {
    try {
      const [scansData, patsData, labsData] = await Promise.all([
        api.getRadiologyScans(),
        api.getPatients(),
        api.getOutsideLabs()
      ]);
      setScans(scansData);
      setPatientsList(patsData);
      setOutsideLabsList(labsData);
      if (patsData.length > 0) {
        setSelectedPatientId(patsData[0].id);
      }
      if (labsData.length > 0) {
        setSelectedLabId(labsData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRadiology();
  }, []);

  const handleStartScan = async (id: string) => {
    try {
      await api.updateRadiologyScan(id, { status: 'Processing' });
      loadRadiology();
    } catch (e) {
      console.error(e);
    }
  };

  const handleWriteReport = (scan: any) => {
    setSelectedScan(scan);
    setFindings(scan.finding || '');
    setShowReportModal(true);
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateRadiologyScan(selectedScan.id, { status: 'Reported', finding: findings });
      loadRadiology();
      setSelectedScan(null);
      setShowReportModal(false);
      alert('Radiological diagnostic interpretation report saved to PACS server.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = scans.filter(s =>
    s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedScans = [...filtered].sort((a, b) => {
    const aIsVip = getPatientSubscription(a.patientId);
    const bIsVip = getPatientSubscription(b.patientId);
    return aIsVip && !bIsVip ? -1 : !aIsVip && bIsVip ? 1 : 0;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--color-primary-glow)'
            }}>
              <Scan size={18} color="white" />
            </span>
            <span className="gradient-text">Radiology Department (RIS)</span>
          </h1>
          <p className="page-subtitle">Schedule MRI/CT scans, upload clinical imaging DICOM files, diagnostic reports writing.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-bar" style={{ width: 250 }}>
            <Search size={14} color="var(--color-text-muted)" />
            <input
              placeholder="Search scan requests..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={() => setShowOutsideReferralModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Building size={14} /> Refer to Outside Lab
          </button>
          <span className="badge badge-purple">PACS System Online</span>
        </div>
      </div>

      {/* Scans List Table - Full Width */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(135deg, #fff 0%, var(--color-bg-tertiary) 100%)'
        }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Scan Requests Queue</h3>
            <p className="card-subtitle" style={{ margin: 0 }}>Clinical worklist of imaging examinations pending technology scan or reporting.</p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Active cases: <strong>{sortedScans.length}</strong>
          </span>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Patient Name</th>
                <th>Scan Parameter</th>
                <th>Modality</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedScans.map(scan => {
                const isVip = getPatientSubscription(scan.patientId);
                return (
                  <tr key={scan.id} style={isVip ? { borderLeft: '4px solid var(--color-purple)', background: 'rgba(139, 92, 246, 0.02)' } : undefined}>
                    <td className="font-semibold text-accent" style={{ fontFamily: 'monospace' }}>{scan.id}</td>
                    <td>
                      <div className="flex-align" style={{ gap: 6 }}>
                        <span className="font-semibold text-primary">{scan.patientName}</span>
                        {isVip && (
                          <span className="badge badge-purple" style={{ padding: '2px 6px', fontSize: '9px' }} title="VIP Fasttrack Patient">
                            <Sparkles size={8} style={{ marginRight: 2 }} /> VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-primary">{scan.type}</td>
                    <td><span className="badge badge-gray">{scan.modality}</span></td>
                    <td>{scan.date}</td>
                    <td>
                      <span className={`badge badge-${
                        scan.status === 'Reported' ? 'success' :
                        scan.status === 'Processing' ? 'purple' : 'warning'
                      }`}>
                        ● {scan.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {scan.status === 'Scheduled' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStartScan(scan.id)}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                            title="Acquire Scan Images"
                          >
                            <Camera size={11} /> Acquire Scan
                          </button>
                        )}
                        {scan.status === 'Processing' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleWriteReport(scan)}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                            title="Write Radiologist Report"
                          >
                            <FileText size={11} /> Write Report
                          </button>
                        )}
                        {scan.status === 'Reported' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedScan(scan);
                              setFindings(scan.finding);
                              setShowReportModal(true);
                            }}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                            title="View PACS DICOM Report"
                          >
                            <Eye size={11} /> View Report
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedScans.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(220,20,60,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <Scan size={24} color="var(--color-primary)" />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        No Scan Requests Found
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        No radiological scan request orders match the selected search parameters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          DICOM VIEW & REPORT WRITING MODAL
      ═══════════════════════════════════════════════ */}
      {showReportModal && selectedScan && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowReportModal(false); }}>
          <div className="modal modal-md" style={{ maxWidth: 680, borderRadius: 20, overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '20px 24px 18px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(255,255,255,0.30)'
                  }}>
                    <Film size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      {selectedScan.status === 'Reported' ? 'PACS Diagnostic Interpretation' : 'Write Imaging Findings'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      Scan Case Ref: {selectedScan.id} · Modality: {selectedScan.modality}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', flexShrink: 0
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: 24 }}>
              {/* DICOM viewer simulation */}
              <div style={{
                background: '#0a0a0c',
                height: 180,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                border: '1.5px dashed rgba(255,255,255,0.15)',
                marginBottom: 20
              }}>
                <Scan size={36} color="var(--color-primary-light)" style={{ animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af' }}>DICOM PACS LIVE IMAGING STREAM</span>
                <span style={{ fontSize: 10, color: '#6b7280' }}>ID: {selectedScan.id} · Slice: 48/96 · Orthogonal View</span>
              </div>

              {selectedScan.status === 'Reported' ? (
                <div>
                  <div className="print-letterhead" style={{ display: 'block', border: '1px solid #cbd5e1', padding: 20, background: '#ffffff', borderRadius: 12, color: '#000000', marginBottom: 20 }}>
                    <div className="print-letterhead-header" style={{ borderBottom: '2px solid var(--color-primary-light)', paddingBottom: 10, marginBottom: 14 }}>
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--color-primary-light)', margin: 0 }}>MEDICORE IMAGING SERVICES</h2>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>PACS Radiology &amp; Diagnostic Center</p>
                      </div>
                      <div className="print-hospital-details" style={{ textAlign: 'right', fontSize: 10 }}>
                        <p style={{ margin: 0 }}>100, OMR IT Highway, Chennai</p>
                        <p style={{ margin: 0 }}>Phone: +91 44 4890 3000</p>
                      </div>
                    </div>
                    <div className="print-doc-title" style={{ fontSize: '14px', margin: '10px 0', fontWeight: 800, textAlign: 'center', color: '#111' }}>RIS DIAGNOSTIC INTERPRETATION REPORT</div>

                    <div className="print-grid-2" style={{ gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: 8, marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      <div>
                        <span style={{ fontSize: 9, color: '#64748b', display: 'block' }}>PATIENT NAME</span>
                        <strong style={{ fontSize: 12, color: '#0f172a' }}>{selectedScan.patientName}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 9, color: '#64748b', display: 'block' }}>SCAN ID / MODALITY</span>
                        <strong style={{ fontSize: 12, color: '#0f172a' }}>{selectedScan.id} | {selectedScan.modality}</strong>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 9, color: '#64748b', display: 'block' }}>SCAN PARAMETER</span>
                        <strong style={{ fontSize: 12, color: '#0f172a' }}>{selectedScan.type}</strong>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{ fontSize: 9, color: '#64748b', display: 'block' }}>ACQUIRED DATE</span>
                        <strong style={{ fontSize: 12, color: '#0f172a' }}>{selectedScan.date}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: 4, marginBottom: 8, color: 'var(--color-primary-light)' }}>FINDINGS &amp; OBSERVATIONS</div>
                    <p style={{ fontSize: 12, color: '#334155', lineHeight: 1.6, margin: 0, minHeight: '80px', whiteSpace: 'pre-line' }}>
                      {selectedScan.finding}
                    </p>

                    <div className="print-signature-row" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
                      <div className="print-signature-block" style={{ textAlign: 'center', width: '40%' }}>
                        <div className="print-signature-line" style={{ borderTop: '1px solid #94a3b8', margin: '20px auto 4px', width: '80%' }} />
                        <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>Acquired By (Tech)</p>
                      </div>
                      <div className="print-signature-block" style={{ textAlign: 'center', width: '40%' }}>
                        <div className="print-signature-line" style={{ borderTop: '1px solid #94a3b8', margin: '20px auto 4px', width: '80%' }} />
                        <p style={{ fontSize: '9px', color: '#64748b', margin: 0 }}>Reporting Radiologist MD</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary w-full" onClick={() => setShowReportModal(false)}>Close View</button>
                    <button className="btn btn-primary w-full" onClick={() => window.print()} style={{ justifyContent: 'center', gap: 6 }}>
                      <Printer size={14} /> Print Report
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveReport}>
                  <div className="form-group mb-lg">
                    <label className="form-label" style={{ fontWeight: 700 }}>Findings &amp; Interpretations</label>
                    <textarea
                      className="form-control"
                      style={{ height: 130 }}
                      required
                      value={findings}
                      onChange={e => setFindings(e.target.value)}
                      placeholder="Type diagnostic radiological observations (e.g. bones, tissue density, alignment, scan anomalies)..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowReportModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                      {submitting ? 'Saving Findings...' : 'Complete & Save PACS Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Outside Referral Logging Modal */}
      {showOutsideReferralModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowOutsideReferralModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 520, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '20px 24px 18px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(255,255,255,0.30)'
                  }}>
                    <Building size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      Refer to Outside Radiology Lab
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.80)', marginTop: 2 }}>
                      Partner commission management &amp; billing referral log
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowOutsideReferralModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: 'white', flexShrink: 0
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const pat = patientsList.find(p => p.id === selectedPatientId);
              const lab = outsideLabsList.find(l => l.id === selectedLabId);
              if (!pat || !lab) {
                alert('Please select patient and laboratory');
                return;
              }

              const commissionAmount = Math.round((totalAmount * lab.commissionRate) / 100);
              const referral = {
                id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
                patientId: pat.id,
                patientName: pat.name,
                labId: lab.id,
                labName: lab.name,
                scanType: scanType,
                date: referralDate,
                totalAmount: totalAmount,
                commissionRate: lab.commissionRate,
                commissionAmount: commissionAmount,
                billingStatus: 'Pending',
                invoiceId: ''
              };

              try {
                await api.createOutsideReferral(referral);
                alert(`Referral logged successfully! Commission of ₹${commissionAmount} calculated (Rate: ${lab.commissionRate}%).`);
                setShowOutsideReferralModal(false);
                setScanType('Contrast MRI Brain');
                setTotalAmount(8000);
              } catch (err) {
                console.error(err);
                alert('Error logging outside referral');
              }
            }}>
              <div className="modal-body" style={{ padding: 24 }}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Select Patient Profile</label>
                  <select className="form-control" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)} required>
                    {patientsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Select Partner Outside Lab</label>
                  <select className="form-control" value={selectedLabId} onChange={e => setSelectedLabId(e.target.value)} required>
                    {outsideLabsList.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.commissionRate}% commission)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Scan Description / Modality</label>
                  <input className="form-control" required value={scanType} onChange={e => setScanType(e.target.value)} placeholder="e.g. MRI Spine with Contrast, CT Chest" />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Total Charged by Lab (₹)</label>
                    <input className="form-control" type="number" required value={totalAmount} onChange={e => setTotalAmount(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Referral Date</label>
                    <input className="form-control" type="date" required value={referralDate} onChange={e => setReferralDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: 10, padding: '0 24px 24px', background: 'none', border: 'none' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowOutsideReferralModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>Log Commission Referral</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Radiology;
