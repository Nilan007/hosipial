import { useEffect, useState } from 'react';
import {
  Scan, Search, Camera, Play, Check, Eye, Download, FileText,
  Activity, AlertTriangle, Printer
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF } from '../../utils/exportUtils';

const Radiology: React.FC = () => {
  const [scans, setScans] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  
  // Reporting state
  const [findings, setFindings] = useState('');

  const loadRadiology = async () => {
    try {
      const data = await api.getRadiologyScans();
      setScans(data);
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
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateRadiologyScan(selectedScan.id, { status: 'Reported', finding: findings });
      loadRadiology();
      setSelectedScan(null);
      alert('Radiological diagnostic interpretation report saved to PACS server.');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Radiology Department (RIS)</h1>
          <p className="page-subtitle">Schedule MRI/CT scans, upload clinical imaging DICOM files, diagnostic reports writing.</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-purple">PACS System Online</span>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Scans list table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title mb-md">Scan Requests Queue</h3>
          <div className="table-container">
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
                {scans.map(scan => (
                  <tr key={scan.id}>
                    <td className="font-semibold text-accent">{scan.id}</td>
                    <td className="font-semibold text-primary">{scan.patientName}</td>
                    <td>{scan.type}</td>
                    <td><span className="badge badge-gray">{scan.modality}</span></td>
                    <td>{scan.date}</td>
                    <td>
                      <span className={`badge badge-${
                        scan.status === 'Reported' ? 'success' :
                        scan.status === 'Processing' ? 'purple' : 'warning'
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {scan.status === 'Scheduled' && (
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleStartScan(scan.id)} title="Acquire Scan Images">
                            <Camera size={12} />
                          </button>
                        )}
                        {scan.status === 'Processing' && (
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleWriteReport(scan)} title="Write Radiologist Report">
                            <FileText size={12} />
                          </button>
                        )}
                        {scan.status === 'Reported' && (
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => { setSelectedScan(scan); setFindings(scan.finding); }} title="View PACS DICOM Report">
                            <Eye size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Imaging Report Panel */}
        <div className="card">
          {selectedScan ? (
            <div>
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
                <h3 className="card-title text-accent">RIS Diagnostic: {selectedScan.id}</h3>
                <p className="text-secondary text-sm">Modality: {selectedScan.type}</p>
                <p className="text-muted text-xs">Patient: {selectedScan.patientName}</p>
              </div>

              {/* DICOM viewer simulation */}
              <div style={{
                background: '#000',
                height: 160,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 8,
                border: '1px solid var(--color-border)',
                marginBottom: 16
              }}>
                <Scan size={32} color="#60a5fa" />
                <span className="text-secondary text-xs">DICOM Viewer Mockup</span>
              </div>

              {selectedScan.status === 'Reported' ? (
                <div>
                  <div className="print-letterhead" style={{ display: 'block', border: '1px solid #cbd5e1', padding: 16, background: '#ffffff', borderRadius: 8, color: '#000000' }}>
                    <div className="print-letterhead-header">
                      <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary-light)' }}>MEDICORE IMAGING SERVICES</h2>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>PACS Radiology & Diagnostic Center</p>
                      </div>
                      <div className="print-hospital-details">
                        <p>100, OMR IT Highway, Chennai</p>
                        <p>Phone: +91 44 4890 3000</p>
                      </div>
                    </div>
                    <div className="print-doc-title" style={{ fontSize: '14px', margin: '10px 0' }}>RIS DIAGNOSTIC INTERPRETATION REPORT</div>

                    <div className="print-grid-2" style={{ gap: '8px', padding: '8px', marginBottom: '12px' }}>
                      <div className="print-grid-item">
                        <div className="print-grid-label">PATIENT NAME</div>
                        <div className="font-bold text-primary">{selectedScan.patientName}</div>
                      </div>
                      <div className="print-grid-item">
                        <div className="print-grid-label">SCAN ID / MODALITY</div>
                        <div>{selectedScan.id} | {selectedScan.modality}</div>
                      </div>
                      <div className="print-grid-item">
                        <div className="print-grid-label">SCAN PARAMETER</div>
                        <div className="font-semibold">{selectedScan.type}</div>
                      </div>
                      <div className="print-grid-item">
                        <div className="print-grid-label">ACQUIRED DATE</div>
                        <div>{selectedScan.date}</div>
                      </div>
                    </div>

                    <div className="print-section-title">FINDINGS & OBSERVATIONS</div>
                    <p className="text-xs text-primary" style={{ background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 4, minHeight: '80px' }}>
                      {selectedScan.finding}
                    </p>

                    <div className="print-signature-row" style={{ marginTop: '24px' }}>
                      <div className="print-signature-block">
                        <div className="print-signature-line" />
                        <p style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Acquired By (Tech)</p>
                      </div>
                      <div className="print-signature-block">
                        <div className="print-signature-line" />
                        <p style={{ fontSize: '9px', color: 'var(--color-text-muted)' }}>Reporting Radiologist MD</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-secondary w-full" onClick={() => setSelectedScan(null)}>Close View</button>
                    <button className="btn btn-primary w-full" onClick={() => window.print()} style={{ justifyContent: 'center' }}>
                      <Printer size={14} style={{ marginRight: 6 }} /> Print Report
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveReport}>
                  <div className="form-group mb-md">
                    <label className="form-label">Findings & Interpretations</label>
                    <textarea
                      className="form-control"
                      style={{ height: 100 }}
                      value={findings}
                      onChange={e => setFindings(e.target.value)}
                      placeholder="Type details of imaging scan..."
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setSelectedScan(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Save Report</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <Scan size={36} className="text-muted mb-md" />
              <div className="empty-state-title">DICOM Imaging Center</div>
              <p className="text-secondary text-xs">Select any scan case from the list on the left to read CT/MRI scan records, compile findings, or download patient scan results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Radiology;
