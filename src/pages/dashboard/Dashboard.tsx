import { useEffect, useState } from 'react';
import {
  Users, Bed, Banknote, FlaskConical, AlertCircle, ChevronRight,
  TrendingUp, Calendar, Heart, Shield, CheckCircle2, Clock,
  ArrowUpRight, Droplet, Scissors, Ambulance, Sparkles
} from 'lucide-react';
import { api } from '../../utils/api';
import {
  revenueData, occupancyData, deptRevenueData, bloodInventory, notifications, wards
} from '../../data/mockData';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { exportTablePDF, exportToExcel } from '../../utils/exportUtils';

const Dashboard: React.FC = () => {
  const activeAlerts = notifications.filter(n => !n.read);
  
  const [stats, setStats] = useState({ activePatients: 1247, occupiedBeds: 118, totalBeds: 164, pendingLabs: 23 });
  const [todayApts, setTodayApts] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const s = await api.getDashboardStats();
        setStats(s);
        const apts = await api.getAppointments();
        setTodayApts(apts.slice(0, 5));
      } catch (e) {
        console.error('Error loading dashboard stats:', e);
      }
    };
    loadDashboardData();
  }, []);

  const handleExportPDF = () => {
    const headers = ['Month', 'OPD Revenue (₹)', 'IPD Revenue (₹)', 'Pharmacy (₹)', 'Lab (₹)', 'Radiology (₹)', 'Total (₹)'];
    const rows = revenueData.map(r => [
      r.month,
      r.opd.toLocaleString('en-IN'),
      r.ipd.toLocaleString('en-IN'),
      r.pharmacy.toLocaleString('en-IN'),
      r.lab.toLocaleString('en-IN'),
      r.radiology.toLocaleString('en-IN'),
      r.total.toLocaleString('en-IN')
    ]);
    exportTablePDF('Monthly Revenue Analysis', headers, rows, 'monthly_revenue_report');
  };

  const handleExportExcel = () => {
    exportToExcel(revenueData, 'Monthly Revenue', 'monthly_revenue_report');
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title gradient-text">Command Center Dashboard</h1>
          <p className="page-subtitle">Welcome back, Administrator. Here is today's live hospital performance statistics.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Export to Excel
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Stats KPI Grid */}
      <div className="stats-grid mb-lg">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary-light)' }}>
            <Users size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Active Patients</div>
            <div className="kpi-value">{stats.activePatients}</div>
            <div className="kpi-change up">
              <TrendingUp size={12} />
              <span>+12.4% this wk</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <Bed size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Bed Occupancy</div>
            <div className="kpi-value">{stats.occupiedBeds} / {stats.totalBeds}</div>
            <div className="kpi-change up">
              <TrendingUp size={12} />
              <span>{Math.round((stats.occupiedBeds / stats.totalBeds) * 100) || 72}% Occupancy</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--color-purple)' }}>
            <Banknote size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Today's Collections</div>
            <div className="kpi-value">₹4,82,350</div>
            <div className="kpi-change up">
              <TrendingUp size={12} />
              <span>+8.2% vs yesterday</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--color-accent-light)' }}>
            <FlaskConical size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Pending Lab Orders</div>
            <div className="kpi-value">{stats.pendingLabs} Tests</div>
            <div className="kpi-change down" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
              <span>Completed 84%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Live Stats Grid */}
      <div className="grid grid-3 mb-lg">
        {/* Left Side: Revenue Chart */}
        <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Hospital Revenue Split (Last 6 Months)</h3>
              <p className="card-subtitle">Monthly breakdown across key service departments</p>
            </div>
            <div className="badge badge-primary">Consolidated</div>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="opd" name="OPD Consult" fill="#06b6d4" stackId="a" />
                <Bar dataKey="ipd" name="IPD Ward" fill="#3b82f6" stackId="a" />
                <Bar dataKey="pharmacy" name="Pharmacy" fill="#8b5cf6" stackId="a" />
                <Bar dataKey="lab" name="Laboratory" fill="#10b981" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Pie Chart breakdown */}
        <div className="card chart-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Contributions</h3>
              <p className="card-subtitle">Current financial quarter percentage</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={deptRevenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
            {deptRevenueData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                <span className="text-secondary">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-3 mb-lg">
        {/* Live Alerts & Notifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="var(--color-danger-light)" />
              Active System Alerts
            </h3>
            <span className="badge badge-danger">{activeAlerts.length} Critical</span>
          </div>
          <div className="timeline">
            {activeAlerts.map(n => (
              <div className="timeline-item" key={n.id}>
                <div className="timeline-icon" style={{
                  background: n.type === 'critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: n.type === 'critical' ? 'var(--color-danger-light)' : 'var(--color-warning)'
                }}>
                  <AlertCircle size={14} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">{n.title}</div>
                  <p className="text-muted text-xs mt-xs">{n.message}</p>
                  <span className="timeline-time">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Bed Occupancy by Ward */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Ward Capacity Status</h3>
              <p className="card-subtitle">Real-time occupancy rates of inpatient wings</p>
            </div>
            <span className="badge badge-success">Update Live</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {wards.slice(0, 6).map((ward) => {
              const percentage = Math.round((ward.occupied / ward.beds) * 100);
              return (
                <div key={ward.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span className="text-primary font-semibold">{ward.name}</span>
                    <span className="text-secondary">{ward.occupied}/{ward.beds} beds ({percentage}%)</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                        background: percentage > 85 ? 'var(--gradient-danger)' : percentage > 60 ? 'var(--gradient-primary)' : 'var(--gradient-success)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Today's Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Scheduled Consultations Today</h3>
            <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center' }}>
              View Schedule <ChevronRight size={14} />
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Dept</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayApts.map(apt => (
                  <tr key={apt.id}>
                    <td><span className="badge badge-purple">{apt.token}</span></td>
                    <td className="font-semibold text-primary">{apt.patientName}</td>
                    <td>{apt.doctorName}</td>
                    <td>{apt.dept}</td>
                    <td>
                      <span className={`badge badge-${
                        apt.status === 'Confirmed' ? 'primary' :
                        apt.status === 'In Progress' ? 'warning' :
                        apt.status === 'Completed' ? 'success' : 'danger'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ancillary Services Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ancillary & Support Services</h3>
            <span className="badge badge-cyan">Facility Overview</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Blood bank card */}
            <div style={{ background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger-light)', marginBottom: 8 }}>
                <Droplet size={18} fill="currentColor" />
                <span className="font-semibold text-sm">Blood Stock</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, fontSize: 11, textAlign: 'center' }}>
                {bloodInventory.slice(0, 4).map(b => (
                  <div key={b.group} style={{ background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 4 }}>
                    <div className="font-bold text-primary">{b.group}</div>
                    <div className="text-secondary">{b.available}U</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency & Ambulance */}
            <div style={{ background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-accent-light)', marginBottom: 8 }}>
                <Ambulance size={18} />
                <span className="font-semibold text-sm">Ambulance Hub</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="flex justify-between">
                  <span>ALS Ambulances:</span>
                  <span className="text-success font-semibold">2 Available</span>
                </div>
                <div className="flex justify-between">
                  <span>BLS Ambulances:</span>
                  <span className="text-warning font-semibold">1 En Route</span>
                </div>
              </div>
            </div>

            {/* Surgical Theatre status */}
            <div style={{ background: 'var(--color-bg-glass)', border: '1px solid var(--color-border)', padding: 12, borderRadius: 10, gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-purple)', marginBottom: 8 }}>
                <Scissors size={18} />
                <span className="font-semibold text-sm">Operation Theatre Status</span>
              </div>
              <div className="flex justify-between text-xs text-secondary">
                <span className="badge badge-success">OT-1: Completed</span>
                <span className="badge badge-warning">OT-2: In Progress</span>
                <span className="badge badge-primary">OT-3: Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
