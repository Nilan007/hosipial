import { useEffect, useState } from 'react';
import {
  FlaskConical, Search, Clock, Award, ShieldAlert, Plus, Check, Play,
  Download, FileText, CheckCircle, Sparkles, X, Beaker
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF } from '../../utils/exportUtils';

const Laboratory: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Results input states
  const [resultVal, setResultVal] = useState<Record<string, string>>({});

  const getPatientSubscription = (patientId: string) => {
    const p = patientsList.find(pat => pat.id === patientId);
    return p?.fasttrackSubscription?.status === 'Active';
  };

  const loadLabTests = async () => {
    try {
      const [testsData, patsData] = await Promise.all([
        api.getLabTests(),
        api.getPatients()
      ]);
      setTests(testsData);
      setPatientsList(patsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLabTests();
  }, []);

  const handleStartProcess = async (id: string) => {
    try {
      await api.updateLabTest(id, { status: 'Processing' });
      loadLabTests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteTest = (test: any) => {
    setSelectedTest(test);
    const initialResults: Record<string, string> = {};
    if (test.testName.includes('CBC')) {
      initialResults['Hemoglobin (g/dL)'] = '13.5';
      initialResults['WBC (cells/mcL)'] = '7500';
      initialResults['Platelets (lakhs/mcL)'] = '2.2';
    } else if (test.testName.includes('Lipid')) {
      initialResults['Total Cholesterol (mg/dL)'] = '195';
      initialResults['HDL Cholesterol (mg/dL)'] = '45';
      initialResults['LDL Cholesterol (mg/dL)'] = '120';
      initialResults['Triglycerides (mg/dL)'] = '150';
    } else {
      initialResults['Glucose (mg/dL)'] = '98';
    }
    setResultVal(initialResults);
    setShowResultModal(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateLabTest(selectedTest.id, { status: 'Completed', result: resultVal });
      loadLabTests();
      setSelectedTest(null);
      setShowResultModal(false);
      alert('Lab results logged. Notifications automatically dispatched to the consulting doctor.');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResultChange = (key: string, value: string) => {
    setResultVal({ ...resultVal, [key]: value });
  };

  const handleExportPDF = () => {
    const headers = ['Order ID', 'Patient', 'Test Parameter', 'Department', 'Ordered Date', 'Status'];
    const rows = tests.map(t => [
      t.id,
      t.patientName,
      t.testName,
      t.category,
      t.ordered,
      t.status
    ]);
    exportTablePDF('LIMS Diagnostic Test Registry', headers, rows, 'lims_lab_report');
  };

  const filtered = tests.filter(t => {
    const matchesSearch = t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const sortedTests = [...filtered].sort((a, b) => {
    const aIsVip = getPatientSubscription(a.patientId);
    const bIsVip = getPatientSubscription(b.patientId);
    if (aIsVip && !bIsVip) return -1;
    if (!aIsVip && bIsVip) return 1;
    return 0;
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
              <FlaskConical size={18} color="white" />
            </span>
            <span className="gradient-text">Laboratory Information System (LIMS)</span>
          </h1>
          <p className="page-subtitle">Sample collections log, Diagnostic test results processing, critical value alerts.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <div className="search-bar" style={{ width: 260 }}>
            <Search size={14} color="var(--color-text-muted)" />
            <input
              placeholder="Search by ID, name, test..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <Download size={14} /> Export Directory
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        {['All', 'Pending', 'Processing', 'Completed'].map(t => {
          const count = tests.filter(test => t === 'All' || test.status === t).length;
          return (
            <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t} Orders <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Lab orders list table - Full Width */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient Name</th>
                <th>Test Parameter</th>
                <th>Department / Lab</th>
                <th>Order Date &amp; Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTests.map(t => {
                const isVip = getPatientSubscription(t.patientId);
                return (
                  <tr key={t.id} style={isVip ? { borderLeft: '4px solid var(--color-purple)', background: 'rgba(139, 92, 246, 0.02)' } : undefined}>
                    <td className="font-semibold text-accent" style={{ fontFamily: 'monospace' }}>{t.id}</td>
                    <td>
                      <div className="flex-align" style={{ gap: 6 }}>
                        <span className="font-semibold text-primary">{t.patientName}</span>
                        {isVip && (
                          <span className="badge badge-purple" style={{ padding: '2px 6px', fontSize: '9px' }} title="VIP Fasttrack Patient">
                            <Sparkles size={8} style={{ marginRight: 2 }} /> VIP
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="font-semibold text-primary">{t.testName}</td>
                    <td>{t.category}</td>
                    <td>{t.ordered}</td>
                    <td>
                      <span className={`badge badge-${
                        t.status === 'Completed' ? 'success' :
                        t.status === 'Processing' ? 'purple' : 'warning'
                      }`}>
                        ● {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {t.status === 'Pending' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStartProcess(t.id)}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                          >
                            <Play size={11} /> Collect Sample
                          </button>
                        )}
                        {t.status === 'Processing' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCompleteTest(t)}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                          >
                            <Check size={11} /> Enter Results
                          </button>
                        )}
                        {t.status === 'Completed' && t.result && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedTest(t);
                              setResultVal(t.result);
                              setShowResultModal(true);
                            }}
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                          >
                            <FileText size={11} /> View Results
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedTests.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(220,20,60,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <FlaskConical size={24} color="var(--color-primary)" />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        No Diagnostic Cases Found
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        No laboratory test orders match the selected criteria or search term.
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
          LAB RESULTS MODAL (SELECT DIAGNOSTIC CASE)
      ═══════════════════════════════════════════════ */}
      {showResultModal && selectedTest && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowResultModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 500, borderRadius: 20, overflow: 'hidden' }}>
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
                    <Beaker size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      {selectedTest.status === 'Completed' ? 'Diagnostic Report View' : 'Enter Test Results'}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      Order Ref: {selectedTest.id} · {selectedTest.category}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowResultModal(false)}
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
              <div style={{
                background: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 12, padding: 14, marginBottom: 20
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>PATIENT NAME</span>
                    <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{selectedTest.patientName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>TEST PARAMETER</span>
                    <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{selectedTest.testName}</strong>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveResult}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
                    Diagnostic Analytes Values
                  </div>
                  
                  {Object.keys(resultVal).map(key => (
                    <div className="form-group" key={key}>
                      <label className="form-label" style={{ fontWeight: 600 }}>{key}</label>
                      <input
                        className="form-control"
                        required
                        disabled={selectedTest.status === 'Completed'}
                        value={resultVal[key]}
                        onChange={e => handleResultChange(key, e.target.value)}
                        placeholder="Enter measured value..."
                      />
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowResultModal(false)}
                  >
                    Close
                  </button>
                  {selectedTest.status !== 'Completed' && (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ flex: 2, justifyContent: 'center', gap: 8 }}
                      disabled={submitting}
                    >
                      {submitting ? 'Completing Order...' : 'Complete & Log Order'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laboratory;
