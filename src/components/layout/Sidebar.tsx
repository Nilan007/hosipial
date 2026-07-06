import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Calendar, Stethoscope, Bed, FlaskConical,
  Scan, Pill, Receipt, Shield, UserCog, Package, Heart, Truck,
  UtensilsCrossed, Wrench, FileText, MessageSquare, BarChart3,
  ClipboardList, Lock, ChevronLeft, ChevronRight, Cross, Activity,
  Building2, Syringe, TestTube, Scissors, CreditCard, Building,
  Droplets, Ambulance, FileArchive, Star, BookOpen, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navConfig = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', badge: null },
    ],
  },
  {
    section: 'Patient Care',
    items: [
      { label: 'Patients', icon: Users, path: '/patients', badge: null },
      { label: 'Appointments', icon: Calendar, path: '/appointments', badge: '12' },
      { label: 'OPD', icon: Stethoscope, path: '/opd', badge: null },
      { label: 'IPD', icon: Bed, path: '/ipd', badge: null },
      { label: 'Emergency', icon: Cross, path: '/emergency', badge: '3' },
      { label: 'EMR / EHR', icon: FileText, path: '/emr', badge: null },
    ],
  },
  {
    section: 'Clinical',
    items: [
      { label: 'Nursing', icon: Activity, path: '/nursing', badge: null },
      { label: 'Pharmacy', icon: Pill, path: '/pharmacy', badge: null },
      { label: 'Laboratory', icon: FlaskConical, path: '/laboratory', badge: '5' },
      { label: 'Radiology', icon: Scan, path: '/radiology', badge: null },
      { label: 'Operation Theatre', icon: Scissors, path: '/ot', badge: null },
      { label: 'Bed Management', icon: Building2, path: '/beds', badge: null },
    ],
  },
  {
    section: 'Finance',
    items: [
      { label: 'Billing', icon: Receipt, path: '/billing', badge: null },
      { label: 'Insurance & TPA', icon: Shield, path: '/insurance', badge: null },
    ],
  },
  {
    section: 'Administration',
    items: [
      { label: 'Doctors', icon: Stethoscope, path: '/doctors', badge: null },
      { label: 'Staff & HR', icon: UserCog, path: '/staff', badge: null },
      { label: 'Inventory', icon: Package, path: '/inventory', badge: null },
    ],
  },
  {
    section: 'Services',
    items: [
      { label: 'Blood Bank', icon: Droplets, path: '/bloodbank', badge: null },
      { label: 'Ambulance', icon: Ambulance, path: '/ambulance', badge: null },
      { label: 'Diet & Nutrition', icon: UtensilsCrossed, path: '/diet', badge: null },
      { label: 'Housekeeping', icon: Wrench, path: '/housekeeping', badge: null },
      { label: 'Medical Records', icon: FileArchive, path: '/mrd', badge: null },
    ],
  },
  {
    section: 'Insights',
    items: [
      { label: 'CRM', icon: MessageSquare, path: '/crm', badge: null },
      { label: 'Reports', icon: BarChart3, path: '/reports', badge: null },
      { label: 'Compliance', icon: ShieldCheck, path: '/compliance', badge: null },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Administration', icon: Lock, path: '/admin', badge: null },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !collapsed || isHovered;

  return (
    <aside 
      className={`sidebar ${!isExpanded ? 'collapsed' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered ? '4px 0 24px rgba(0, 0, 0, 0.4)' : 'none',
        zIndex: 1100
      }}
    >
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Cross size={18} color="white" />
        </div>
        {isExpanded && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">MediCore</span>
            <span className="sidebar-logo-sub">HMS Platform</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navConfig.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive || location.pathname.startsWith(item.path) ? 'active' : ''}`
                }
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon size={16} className="nav-item-icon" />
                {isExpanded && (
                  <>
                    <span className="nav-item-text">{item.label}</span>
                    {item.badge && (
                      <span className="nav-item-badge">{item.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={logout} title="Logout">
          <div className="sidebar-user-avatar">{user?.avatar}</div>
          {isExpanded && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
