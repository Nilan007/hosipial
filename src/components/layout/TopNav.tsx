import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { notifications } from '../../data/mockData';
import { useLocation } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

const pathToLabel: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patients',
  '/appointments': 'Appointments',
  '/opd': 'OPD',
  '/ipd': 'IPD',
  '/emergency': 'Emergency',
  '/emr': 'EMR / EHR',
  '/nursing': 'Nursing',
  '/pharmacy': 'Pharmacy',
  '/laboratory': 'Laboratory',
  '/radiology': 'Radiology',
  '/ot': 'Operation Theatre',
  '/beds': 'Bed Management',
  '/billing': 'Billing',
  '/insurance': 'Insurance & TPA',
  '/doctors': 'Doctors',
  '/staff': 'Staff & HR',
  '/inventory': 'Inventory',
  '/assets': 'Asset Management',
  '/bloodbank': 'Blood Bank',
  '/ambulance': 'Ambulance',
  '/diet': 'Diet & Nutrition',
  '/housekeeping': 'Housekeeping',
  '/mrd': 'Medical Records',
  '/crm': 'CRM',
  '/reports': 'Reports & Analytics',
  '/compliance': 'Compliance',
  '/admin': 'Administration',
};

interface TopNavProps {
  onMenuToggle: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;
  const currentPage = pathToLabel[location.pathname] || 'Dashboard';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifColors: Record<string, string> = {
    critical: '#ef4444', appointment: '#3b82f6', pharmacy: '#f59e0b',
    billing: '#10b981', surgery: '#8b5cf6',
  };

  return (
    <header className="topnav">
      <button className="topnav-toggle" onClick={onMenuToggle}>
        <Menu size={18} />
      </button>

      <div className="topnav-breadcrumb">
        <span>MediCore</span>
        <ChevronRight size={14} />
        <span className="current">{currentPage}</span>
      </div>

      <div className="topnav-search">
        <Search size={14} color="var(--color-text-muted)" />
        <input
          placeholder="Search patients, doctors, reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="topnav-actions">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="topnav-btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}>
            <Bell size={16} />
            {unread > 0 && <span className="topnav-btn-badge" />}
          </button>

          {showNotifications && (
            <div className="dropdown">
              <div className="dropdown-header">
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>Notifications</span>
                <span className="badge badge-danger">{unread} New</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className="dropdown-item" style={{ opacity: n.read ? 0.6 : 1 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: notifColors[n.type] || '#64748b', flexShrink: 0, marginTop: 6 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-disabled)', marginTop: 4 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            className="topnav-btn"
            style={{ width: 'auto', padding: '0 10px', gap: 8, fontSize: '13px', fontWeight: 600 }}
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
          >
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white' }}>
              {user?.avatar}
            </div>
            <span style={{ color: 'var(--color-text-primary)' }}>{user?.name?.split(' ')[0]}</span>
          </button>

          {showProfile && (
            <div className="dropdown" style={{ width: 220 }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.role}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user?.dept}</div>
              </div>
              <div className="dropdown-item" onClick={logout} style={{ cursor: 'pointer' }}>
                <LogOut size={16} color="var(--color-danger-light)" />
                <span style={{ fontSize: '13px', color: 'var(--color-danger-light)' }}>Sign Out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
