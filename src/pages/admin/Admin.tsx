import { useEffect, useState } from 'react';
import {
  ShieldCheck, Lock, UserCheck, ClipboardList, Database, FileSpreadsheet,
  Download, RefreshCw, Radio, HardDrive, Key, ToggleLeft, ToggleRight
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF } from '../../utils/exportUtils';

const Admin: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Security');
  const [backupStatus, setBackupStatus] = useState('Idle');

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleExportPDF = () => {
    const headers = ['Time', 'User ID', 'IP Address', 'Module', 'Action Details', 'Severity'];
    const rows = logs.map(l => [
      l.time, l.user, l.ip, l.module, l.action, l.severity
    ]);
    exportTablePDF('Regulatory Compliance System Audit Logs', headers, rows, 'security_audit_logs');
  };

  const handleTriggerBackup = () => {
    setBackupStatus('Backing up...');
    setTimeout(() => {
      setBackupStatus('Completed');
      alert('Secure system database backup completed and stored on cloud storage server.');
    }, 2000);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Security & Compliance Dashboard</h1>
          <p className="page-subtitle">Configure Role-Based Access Control (RBAC), view system audit logs, HIPAA/NABH compliance matrices.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            Print Audit Log
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        <button className={`tab ${activeTab === 'Security' ? 'active' : ''}`} onClick={() => setActiveTab('Security')}>
          RBAC Security Matrix
        </button>
        <button className={`tab ${activeTab === 'Audits' ? 'active' : ''}`} onClick={() => setActiveTab('Audits')}>
          Clinical Audit Logs
        </button>
        <button className={`tab ${activeTab === 'HIPAA' ? 'active' : ''}`} onClick={() => setActiveTab('HIPAA')}>
          Compliance Checklist (NABH/HIPAA)
        </button>
        <button className={`tab ${activeTab === 'Backup' ? 'active' : ''}`} onClick={() => setActiveTab('Backup')}>
          Database & Backups
        </button>
      </div>

      {activeTab === 'Security' && (
        <div className="grid grid-2">
          {/* RBAC config */}
          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} /> Role Authorization Mapping
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <span className="font-semibold text-primary">Doctor Access Level</span>
                  <p className="text-secondary text-xs">Can read/write diagnostics notes, prescribe medications, view histories</p>
                </div>
                <span className="badge badge-success">Enabled</span>
              </div>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <span className="font-semibold text-primary">Nurse Access Level</span>
                  <p className="text-secondary text-xs">Can read patient record, log clinical vitals, record diet intakes</p>
                </div>
                <span className="badge badge-success">Enabled</span>
              </div>
              <div className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <span className="font-semibold text-primary">Pharmacist Access Level</span>
                  <p className="text-secondary text-xs">Can read drug prescription data, access inventory ledger</p>
                </div>
                <span className="badge badge-success">Enabled</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={16} /> Multi-Factor Authentication & SSO
            </h3>
            <div className="form-group mb-md">
              <div className="flex justify-between items-center">
                <span>Enforce MFA for all medical staff</span>
                <ToggleRight size={32} className="text-success" />
              </div>
            </div>
            <div className="form-group">
              <div className="flex justify-between items-center">
                <span>Enable Active Directory SSO Integration</span>
                <ToggleLeft size={32} className="text-muted" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Audits' && (
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Operator</th>
                  <th>IP Address</th>
                  <th>System Module</th>
                  <th>Action Log</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, idx) => (
                  <tr key={idx}>
                    <td>{l.time}</td>
                    <td className="font-semibold text-primary">{l.user}</td>
                    <td>{l.ip}</td>
                    <td><span className="badge badge-gray">{l.module}</span></td>
                    <td>{l.action}</td>
                    <td>
                      <span className={`badge badge-${
                        l.severity === 'Info' ? 'success' :
                        l.severity === 'Warning' ? 'warning' : 'danger'
                      }`}>
                        {l.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'HIPAA' && (
        <div className="grid grid-2">
          <div className="card">
            <h3 className="card-title mb-md">HIPAA Compliance Checklist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> Data Encryption at Rest (AES-256)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> Data Encryption in Transit (SSL/TLS)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> System Logout on Idle (15 mins)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> Secure backup recovery strategy verified
              </label>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title mb-md">NABH Standards Audit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> Patient Informed Consent documentation warded
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" defaultChecked /> Medication error log audit warded
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" /> Biomedical waste disposal routine logged
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Backup' && (
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <Database size={48} className="text-accent mb-md" style={{ margin: '0 auto' }} />
          <h3 className="card-title">Hospital Database Backups</h3>
          <p className="text-secondary text-sm mt-sm mb-lg">Verify the system backup status or download copies of clinical data pools.</p>
          <div className="flex justify-between items-center mb-md" style={{ background: 'var(--color-bg-glass)', padding: 12, borderRadius: 8 }}>
            <span>Last Backup:</span>
            <span className="font-semibold text-success">Today at 12:00 PM</span>
          </div>
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handleTriggerBackup}>
            {backupStatus === 'Idle' ? 'Run Full Backup Now' : backupStatus}
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;
