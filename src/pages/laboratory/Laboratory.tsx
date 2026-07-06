import { useEffect, useState } from 'react';
import {
  FlaskConical, Search, Clock, Award, ShieldAlert, Plus, Check, Play,
  Download, FileText, CheckCircle
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF } from '../../utils/exportUtils';

const Laboratory: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
  // Results input states
  const [resultVal, setResultVal] = useState<Record<string, string>>({});

  const loadLabTests = async () => {
    try {
      const data = await api.getLabTests();
      setTests(data);
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
      initialResults['Hemoglobin'] = '13.5';
      initialResults['WBC'] = '7500';
      initialResults['Platelets'] = '2.2';
    } else {
      initialResults['Glucose'] = '98';
    }
    setResultVal(initialResults);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateLabTest(selectedTest.id, { status: 'Completed', result: resultVal });
      loadLabTests();
      setSelectedTest(null);
      alert('Lab results logged. Notifications automatically dispatched to the consulting doctor.');
    } catch (err) {
      console.error(err);
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
    const matchesSearch = t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || t.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Laboratory Information System (LIMS)</h1>
          <p className="page-subtitle">Sample collections log, Diagnostic test results processing, critical value alerts.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <Download size={14} /> Export Directory
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        {['All', 'Pending', 'Processing', 'Completed'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t} Orders
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {/* Lab orders list table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient Name</th>
                  <th>Test Name</th>
                  <th>Department</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td className="font-semibold text-accent">{t.id}</td>
                    <td className="font-semibold text-primary">{t.patientName}</td>
                    <td>{t.testName}</td>
                    <td>{t.category}</td>
                    <td>{t.ordered}</td>
                    <td>
                      <span className={`badge badge-${
                        t.status === 'Completed' ? 'success' :
                        t.status === 'Processing' ? 'purple' : 'warning'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {t.status === 'Pending' && (
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleStartProcess(t.id)} title="Collect Sample">
                            <Play size={12} />
                          </button>
                        )}
                        {t.status === 'Processing' && (
                          <button className="btn btn-success btn-icon btn-sm" onClick={() => handleCompleteTest(t)} title="Enter Results">
                            <Check size={12} />
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

        {/* Results Entry Form Card */}
        <div className="card">
          {selectedTest ? (
            <form onSubmit={handleSaveResult}>
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
                <h3 className="card-title text-accent">Test Processing: {selectedTest.id}</h3>
                <p className="text-secondary text-sm">Parameter: {selectedTest.testName}</p>
                <p className="text-muted text-xs">Patient: {selectedTest.patientName}</p>
              </div>

              <div className="section mb-md">
                <h4 className="section-title text-xs mb-sm">Analyze Parameters Results</h4>
                {Object.keys(resultVal).map(key => (
                  <div className="form-group mb-sm" key={key}>
                    <label className="form-label">{key}</label>
                    <input
                      className="form-control"
                      value={resultVal[key]}
                      onChange={e => handleResultChange(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary w-full" onClick={() => setSelectedTest(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary w-full">Complete Order</button>
              </div>
            </form>
          ) : (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <FlaskConical size={36} className="text-muted mb-md" />
              <div className="empty-state-title">Select Diagnostic Case</div>
              <p className="text-secondary text-xs">Sample collection, specimen barcodes, and testing reports are processed. Select a processing case to log diagnostic parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Laboratory;
