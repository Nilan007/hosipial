import React, { useEffect, useState } from 'react';
import {
  ShieldCheck, Lock, UserCheck, Database, Key,
  Plus, Trash2, Edit2, X, Eye, EyeOff, Check,
  User, AlertTriangle, RefreshCw
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const ALL_MODULES = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/patients', label: 'Patients', icon: '👤' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/opd', label: 'OPD', icon: '🏥' },
  { path: '/ipd', label: 'IPD', icon: '🛏️' },
  { path: '/emergency', label: 'Emergency', icon: '🚨' },
  { path: '/emr', label: 'EMR / EHR', icon: '📋' },
  { path: '/nursing', label: 'Nursing', icon: '👩‍⚕️' },
  { path: '/pharmacy', label: 'Pharmacy', icon: '💊' },
  { path: '/laboratory', label: 'Laboratory', icon: '🔬' },
  { path: '/radiology', label: 'Radiology', icon: '📡' },
  { path: '/ot', label: 'Operation Theatre', icon: '🏥' },
  { path: '/beds', label: 'Bed Management', icon: '🛏️' },
  { path: '/billing', label: 'Billing', icon: '💳' },
  { path: '/insurance', label: 'Insurance & TPA', icon: '📄' },
  { path: '/doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { path: '/staff', label: 'Staff & HR', icon: '👥' },
  { path: '/inventory', label: 'Inventory', icon: '📦' },
  { path: '/assets', label: 'Asset Management', icon: '🖥️' },
  { path: '/bloodbank', label: 'Blood Bank', icon: '🩸' },
  { path: '/ambulance', label: 'Ambulance', icon: '🚑' },
  { path: '/diet', label: 'Diet & Nutrition', icon: '🥗' },
  { path: '/housekeeping', label: 'Housekeeping', icon: '🧹' },
  { path: '/mrd', label: 'Medical Records', icon: '📋' },
  { path: '/crm', label: 'CRM', icon: '💬' },
  { path: '/reports', label: 'Reports', icon: '📊' },
  { path: '/compliance', label: 'Compliance', icon: '🛡️' },
  { path: '/admin', label: 'Administration', icon: '⚙️' },
];

const ROLE_PRESETS: Record<string, string[]> = {
  'Administrator': ['*'],
  'Doctor': ['/dashboard', '/patients', '/appointments', '/opd', '/ipd', '/emr', '/nursing', '/pharmacy', '/laboratory', '/radiology', '/ot', '/mrd'],
  'Nurse': ['/dashboard', '/patients', '/nursing', '/ipd', '/beds', '/mrd', '/diet'],
  'Receptionist': ['/dashboard', '/patients', '/appointments', '/opd', '/billing', '/crm'],
  'Pharmacist': ['/dashboard', '/pharmacy', '/inventory'],
  'Lab Technician': ['/dashboard', '/laboratory', '/mrd'],
  'Accounts': ['/dashboard', '/billing', '/reports', '/insurance'],
  'Housekeeping': ['/dashboard', '/housekeeping'],
  'Custom': [],
};

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Users');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Doctor');
  const [newDept, setNewDept] = useState('');
  const [newAvatar, setNewAvatar] = useState('👤');
  const [newPermissions, setNewPermissions] = useState<string[]>(ROLE_PRESETS['Doctor']);

  // Logs
  const [logs, setLogs] = useState<any[]>([]);
  const [backupStatus, setBackupStatus] = useState('Idle');

  const loadUsers = async () => {
    try {
      const u = await api.getSystemUsers();
      setSystemUsers(u);
    } catch (e) {
      console.error(e);
    }
  };

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const handleRoleChange = (role: string) => {
    setNewRole(role);
    setNewPermissions(ROLE_PRESETS[role] || []);
  };

  const togglePermission = (path: string) => {
    if (newPermissions.includes('*')) return; // Admin has all
    if (newPermissions.includes(path)) {
      setNewPermissions(newPermissions.filter(p => p !== path));
    } else {
      setNewPermissions([...newPermissions, path]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const u = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newName,
        username: newUsername,
        password: newPassword,
        role: newRole,
        dept: newDept,
        avatar: newAvatar,
        isAdmin: newRole === 'Administrator',
        isActive: true,
        permissions: newPermissions,
      };
      await api.createSystemUser(u);
      toast.success(`User "${newName}" created successfully!`);
      setShowAddModal(false);
      setNewName(''); setNewUsername(''); setNewPassword(''); setNewDept(''); setNewAvatar('👤');
      setNewPermissions(ROLE_PRESETS['Doctor']);
      await loadUsers();
    } catch {
      toast.error('Failed to create user. Username may already exist.');
    }
  };

  const handleToggleActive = async (u: any) => {
    try {
      await api.updateSystemUser(u.id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      await loadUsers();
      if (selectedUser?.id === u.id) setSelectedUser({ ...selectedUser, isActive: !u.isActive });
    } catch { toast.error('Failed to update user'); }
  };

  const handleDeleteUser = async (u: any) => {
    if (u.isAdmin) { toast.error('Cannot delete the admin account!'); return; }
    try {
      await api.deleteSystemUser(u.id);
      toast.success('User deleted');
      await loadUsers();
      if (selectedUser?.id === u.id) setSelectedUser(null);
    } catch { toast.error('Failed to delete user'); }
  };

  const handleUpdatePermissions = async (userId: string, newPerms: string[]) => {
    try {
      await api.updateSystemUser(userId, { permissions: newPerms });
      toast.success('Permissions updated!');
      await loadUsers();
      setSelectedUser({ ...selectedUser, permissions: newPerms });
    } catch { toast.error('Failed to update permissions'); }
  };

  const avatarOptions = ['👤', '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍💼', '👩‍💼', '🛡️', '🔬', '💊', '🧹'];

  const hasAccess = (user: any, path: string) => {
    return user.permissions?.includes('*') || user.permissions?.includes(path);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⚙️</span>
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Administration &amp; RBAC</span>
          </h1>
          <p className="page-subtitle">Manage system users, assign roles, configure module-level permissions, and maintain security. Admin: <strong>admin</strong> / <strong>hospital@2026</strong></p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', gap: 8 }}>
            <Plus size={15} /> Create System User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total System Users', value: systemUsers.length, color: '#6366f1', icon: '👥' },
          { label: 'Active Users', value: systemUsers.filter(u => u.isActive).length, color: '#10b981', icon: '✅' },
          { label: 'Inactive Users', value: systemUsers.filter(u => !u.isActive).length, color: '#f59e0b', icon: '⏸️' },
          { label: 'Admin Accounts', value: systemUsers.filter(u => u.isAdmin).length, color: '#ef4444', icon: '🛡️' },
        ].map((k, i) => (
          <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div>
            </div>
            <div style={{ fontSize: 24 }}>{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        {['Users', 'Permission Matrix', 'Audit Logs', 'System'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'Users' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1.5fr 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: 14 }}>
              👥 System Users
              <span style={{ fontSize: 11, background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: 20, padding: '2px 8px', fontWeight: 600, marginLeft: 8 }}>{systemUsers.length}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  {['User', 'Username', 'Role', 'Department', 'Permissions', 'Last Login', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemUsers.map((u) => {
                  const isSel = selectedUser?.id === u.id;
                  const permCount = u.permissions?.includes('*') ? 'All' : u.permissions?.length || 0;
                  return (
                    <tr key={u.id} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: isSel ? 'rgba(99,102,241,0.04)' : 'transparent', borderLeft: isSel ? '3px solid #6366f1' : '3px solid transparent', opacity: u.isActive ? 1 : 0.55 }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{u.avatar || '👤'}</div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            {u.isAdmin && <div style={{ fontSize: 9, color: '#ef4444', fontWeight: 800 }}>SYSTEM ADMIN</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: '#6366f1', fontWeight: 700 }}>{u.username}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{u.dept || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{permCount} modules</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: u.isActive ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)', color: u.isActive ? '#10b981' : '#6b7280', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleToggleActive(u)} title={u.isActive ? 'Deactivate' : 'Activate'} disabled={u.isAdmin}
                            style={{ padding: '4px 7px', background: u.isActive ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, cursor: u.isAdmin ? 'not-allowed' : 'pointer', color: u.isActive ? '#f59e0b' : '#10b981', opacity: u.isAdmin ? 0.4 : 1 }}>
                            {u.isActive ? '⏸' : '▶'}
                          </button>
                          <button onClick={() => handleDeleteUser(u)} disabled={u.isAdmin}
                            style={{ padding: '4px 7px', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, cursor: u.isAdmin ? 'not-allowed' : 'pointer', color: '#ef4444', opacity: u.isAdmin ? 0.3 : 1 }}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {systemUsers.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No system users yet. Click "Create System User" to begin.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* User Detail / Permissions Panel */}
          {selectedUser && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* User Card */}
              <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(99,102,241,0.2)' }}>
                <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{selectedUser.avatar}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{selectedUser.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{selectedUser.role} · @{selectedUser.username}</div>
                      {selectedUser.isAdmin && <div style={{ fontSize: 10, background: 'rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: 20, padding: '2px 8px', marginTop: 4, fontWeight: 800, display: 'inline-block' }}>🛡️ SYSTEM ADMINISTRATOR</div>}
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[{ label: 'Department', value: selectedUser.dept || '—' }, { label: 'Status', value: selectedUser.isActive ? '✅ Active' : '⏸️ Inactive' }, { label: 'Last Login', value: selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('en-IN') : 'Never' }, { label: 'Modules Access', value: selectedUser.permissions?.includes('*') ? 'Full (All)' : `${selectedUser.permissions?.length || 0} modules` }].map(f => (
                      <div key={f.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>{f.label}</div>
                        <div style={{ fontWeight: 700, fontSize: 12 }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module Permissions */}
              {!selectedUser.isAdmin && (
                <div className="card" style={{ padding: 16, borderRadius: 14 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    🔐 Module Permissions
                    <button onClick={async () => { await handleUpdatePermissions(selectedUser.id, selectedUser.permissions || []); }} style={{ padding: '5px 12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Save Permissions</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                    {ALL_MODULES.map(m => {
                      const has = hasAccess(selectedUser, m.path);
                      return (
                        <label key={m.path} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: has ? 'rgba(99,102,241,0.08)' : 'transparent', border: `1px solid ${has ? 'rgba(99,102,241,0.2)' : 'var(--color-border)'}` }}>
                          <input type="checkbox" checked={has} onChange={() => {
                            const perms = selectedUser.permissions?.includes('*') ? selectedUser.permissions : [...(selectedUser.permissions || [])];
                            const newPerms = perms.includes(m.path) ? perms.filter((p: string) => p !== m.path) : [...perms, m.path];
                            setSelectedUser({ ...selectedUser, permissions: newPerms });
                          }} style={{ accentColor: '#6366f1', width: 13, height: 13 }} />
                          <span style={{ fontSize: 12 }}>{m.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: has ? '#6366f1' : 'var(--color-text-secondary)' }}>{m.label}</span>
                        </label>
                      );
                    })}
                  </div>
                  <button onClick={async () => { await handleUpdatePermissions(selectedUser.id, selectedUser.permissions || []); }} style={{ marginTop: 12, width: '100%', padding: '9px 0', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    💾 Save Permission Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Permission Matrix Tab */}
      {activeTab === 'Permission Matrix' && (
        <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: 14 }}>
            🔐 User × Module Access Matrix
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', minWidth: 140 }}>User</th>
                  {ALL_MODULES.map(m => (
                    <th key={m.path} style={{ padding: '10px 8px', fontSize: 9, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'center', minWidth: 70 }}>
                      <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', padding: '4px 0' }}>{m.icon} {m.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {systemUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>{u.avatar}</span>
                        <div>
                          <div style={{ fontSize: 12 }}>{u.name}</div>
                          <div style={{ fontSize: 9, color: '#6366f1', fontFamily: 'monospace' }}>{u.role}</div>
                        </div>
                      </div>
                    </td>
                    {ALL_MODULES.map(m => {
                      const has = u.permissions?.includes('*') || u.permissions?.includes(m.path);
                      return (
                        <td key={m.path} style={{ textAlign: 'center', padding: '10px 8px' }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, background: has ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.05)', border: `1.5px solid ${has ? '#10b981' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                            {has ? <Check size={10} color="#10b981" strokeWidth={3} /> : <span style={{ fontSize: 8, color: '#ef4444' }}>✗</span>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'Audit Logs' && (
        <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            📋 System Audit Logs
            <button onClick={loadLogs} style={{ background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#6366f1', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={12} /> Refresh</button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th><th>Operator</th><th>IP Address</th><th>Module</th><th>Action</th><th>Severity</th>
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
                    <span className={`badge badge-${l.severity === 'Info' ? 'success' : l.severity === 'Warning' ? 'warning' : 'danger'}`}>
                      {l.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No audit logs recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'System' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Lock size={16} /> HIPAA Compliance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
              {['Data Encryption at Rest (AES-256)', 'Data Encryption in Transit (SSL/TLS)', 'System Auto-Logout on Idle (15 mins)', 'Secure Backup Recovery Strategy', 'Access Log Maintained (90 days)'].map(item => (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" defaultChecked style={{ accentColor: '#10b981' }} /> {item}</label>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Database size={16} /> Database &amp; Backups</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13 }}>Last Backup</span>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: 13 }}>Today at 12:00 PM</span>
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13 }}>Backup Schedule</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>Daily at 12:00 AM</span>
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }} onClick={() => { setBackupStatus('Backing up...'); setTimeout(() => { setBackupStatus('Idle'); alert('Backup completed successfully!'); }, 2000); }}>
                {backupStatus === 'Idle' ? '🔄 Run Full Backup Now' : backupStatus}
              </button>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={16} /> Admin Credentials</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>⚠️ MASTER ADMIN ACCOUNT</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13 }}>Username: <strong>admin</strong></div>
                <div style={{ fontFamily: 'monospace', fontSize: 13 }}>Password: <strong>hospital@2026</strong></div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>Keep this credential safe. This account has full unrestricted access to all modules.</div>
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={16} /> Security Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔴', msg: 'Biomedical Waste Authorization OVERDUE — renew immediately', time: '2 days ago', color: '#ef4444' },
                { icon: '🟡', msg: 'Fire NOC Certificate expiring in 30 days', time: '1 hour ago', color: '#f59e0b' },
                { icon: '🟢', msg: 'NABH Accreditation — Compliant, next audit June 2025', time: 'Today', color: '#10b981' },
              ].map((a, i) => (
                <div key={i} style={{ background: `${a.color}08`, border: `1px solid ${a.color}20`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>{a.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{a.msg}</span>
                    </div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 680, boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '18px 24px', position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>👤 Create System User</div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreateUser} style={{ padding: 24 }}>
              {/* Avatar */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>Avatar</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {avatarOptions.map(a => (
                    <button key={a} type="button" onClick={() => setNewAvatar(a)} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: newAvatar === a ? '2px solid #6366f1' : '2px solid var(--color-border)', background: newAvatar === a ? 'rgba(99,102,241,0.1)' : 'transparent' }}>{a}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Full Name *</label>
                  <input className="form-control" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Dr. Arun Sharma" /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Username *</label>
                  <input className="form-control" required value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="arun.sharma" /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} className="form-control" required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Set strong password" style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Department</label>
                  <input className="form-control" value={newDept} onChange={e => setNewDept(e.target.value)} placeholder="Cardiology, HR, Pharmacy..." /></div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Role *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {Object.keys(ROLE_PRESETS).map(r => (
                    <button key={r} type="button" onClick={() => handleRoleChange(r)} style={{ padding: '8px 6px', borderRadius: 8, cursor: 'pointer', border: newRole === r ? 'none' : '1px solid var(--color-border)', background: newRole === r ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent', color: newRole === r ? '#fff' : 'var(--color-text-secondary)', fontSize: 11, fontWeight: 700 }}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Module Permissions */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Module Access Permissions
                  {newPermissions.includes('*') && <span style={{ marginLeft: 8, color: '#6366f1', fontSize: 11 }}>✅ Full Access (All Modules)</span>}
                </label>
                {!newPermissions.includes('*') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, maxHeight: 200, overflowY: 'auto', padding: 4 }}>
                    {ALL_MODULES.map(m => (
                      <label key={m.path} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 8, cursor: 'pointer', background: newPermissions.includes(m.path) ? 'rgba(99,102,241,0.08)' : 'transparent', border: `1px solid ${newPermissions.includes(m.path) ? 'rgba(99,102,241,0.2)' : 'var(--color-border)'}` }}>
                        <input type="checkbox" checked={newPermissions.includes(m.path)} onChange={() => togglePermission(m.path)} style={{ accentColor: '#6366f1', width: 12, height: 12 }} />
                        <span style={{ fontSize: 11 }}>{m.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: newPermissions.includes(m.path) ? '#6366f1' : 'var(--color-text-secondary)', lineHeight: 1.2 }}>{m.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>
                  👤 Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
