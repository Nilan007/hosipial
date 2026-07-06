import { useEffect, useState } from 'react';
import {
  Calendar, Search, Clock, Plus, Video, PhoneCall, Trash2, Edit, Check,
  User, CheckCircle, RefreshCw, AlertCircle, Play, FileText
} from 'lucide-react';
import { doctors, patients } from '../../data/mockData';
import { api } from '../../utils/api';
import { exportTablePDF, exportToExcel } from '../../utils/exportUtils';

const Appointments: React.FC = () => {
  const [aptList, setAptList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showBookModal, setShowBookModal] = useState(false);

  // New booking form states
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors[0]?.id || '');
  const [aptTime, setAptTime] = useState('10:00');
  const [aptDate, setAptDate] = useState('2026-07-07');
  const [aptType, setAptType] = useState('Online');
  const [aptNotes, setAptNotes] = useState('');

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments();
      setAptList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find(d => d.id === selectedDoctorId);
    const pat = patients.find(p => p.id === selectedPatientId);
    const tokenNum = `T-${Math.floor(100 + Math.random() * 900)}`;

    const newApt = {
      id: `APT-${Math.floor(5000 + Math.random() * 5000)}`,
      patientId: pat?.id || '',
      patientName: pat?.name || '',
      doctorId: doc?.id || '',
      doctorName: doc?.name || '',
      dept: doc?.specialization || '',
      date: aptDate,
      time: aptTime,
      type: aptType,
      status: 'Confirmed',
      token: tokenNum,
      notes: aptNotes
    };

    try {
      await api.createAppointment(newApt);
      loadAppointments();
      setShowBookModal(false);
      setAptNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await api.updateAppointment(id, { status: 'Cancelled' });
      loadAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportExcel = () => {
    const list = aptList.map(a => ({
      Token: a.token,
      'Apt ID': a.id,
      Patient: a.patientName,
      Doctor: a.doctorName,
      Department: a.dept,
      'Date/Time': `${a.date} ${a.time}`,
      Type: a.type,
      Status: a.status
    }));
    exportToExcel(list, 'Appointments', 'appointments_export');
  };

  const handleExportPDF = () => {
    const headers = ['Token', 'Apt ID', 'Patient', 'Doctor', 'Dept', 'Date/Time', 'Type', 'Status'];
    const rows = aptList.map(a => [
      a.token,
      a.id,
      a.patientName,
      a.doctorName,
      a.dept,
      `${a.date} ${a.time}`,
      a.type,
      a.status
    ]);
    exportTablePDF('Hospital Appointments Ledger', headers, rows, 'appointments_report');
  };

  const filtered = aptList.filter(a => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || a.type === filterType;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Appointment & Consultation Queue</h1>
          <p className="page-subtitle">Schedule telemedicine visits, Walk-in token routing, queue management, and notifications.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Export Excel
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            Print Ledger
          </button>
          <button className="btn btn-primary" onClick={() => setShowBookModal(true)}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      {/* Live Queue Cards */}
      <div className="grid grid-3 mb-lg">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid var(--color-success)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}><Play size={18} /></div>
          <div>
            <div className="text-muted text-xs">CURRENTLY CONSULTING</div>
            <div className="font-bold text-lg text-primary">Token T-003</div>
            <div className="text-secondary text-xs">Arun Patel — General Medicine</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid var(--color-warning)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}><Clock size={18} /></div>
          <div>
            <div className="text-muted text-xs">UPCOMING NEXT</div>
            <div className="font-bold text-lg text-primary">Token T-004</div>
            <div className="text-secondary text-xs">Kavitha Nair — Neurology</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, borderLeft: '4px solid var(--color-primary)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary-light)' }}><Calendar size={18} /></div>
          <div>
            <div className="text-muted text-xs">TODAY'S STATUS</div>
            <div className="font-bold text-lg text-primary">48 Scheduled</div>
            <div className="text-secondary text-xs">22 Completed | 8 In Progress</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="toolbar">
        <div className="search-bar">
          <Search size={16} />
          <input
            placeholder="Search patient or doctor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-control" style={{ width: 140 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Visit Types</option>
            <option value="Online">Online Booking</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Teleconsult">Teleconsult</option>
          </select>
          <select className="form-control" style={{ width: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waiting">Waiting</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Apt ID</th>
                <th>Patient</th>
                <th>Assigned Specialist</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Visit Channel</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(apt => (
                <tr key={apt.id}>
                  <td><span className="badge badge-purple">{apt.token}</span></td>
                  <td>{apt.id}</td>
                  <td className="font-semibold text-primary">{apt.patientName}</td>
                  <td>{apt.doctorName}</td>
                  <td>{apt.dept}</td>
                  <td>{apt.date} at <span className="text-primary">{apt.time}</span></td>
                  <td>
                    <span className={`badge badge-${
                      apt.type === 'Online' ? 'primary' :
                      apt.type === 'Walk-in' ? 'gray' : 'cyan'
                    }`}>
                      {apt.type === 'Teleconsult' ? <Video size={11} style={{ marginRight: 4 }} /> : null}
                      {apt.type}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      apt.status === 'Confirmed' ? 'primary' :
                      apt.status === 'Waiting' ? 'warning' :
                      apt.status === 'In Progress' ? 'purple' :
                      apt.status === 'Completed' ? 'success' : 'danger'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={async () => { await api.updateAppointment(apt.id, { status: 'In Progress' }); loadAppointments(); }} title="Start Consultation">
                          <Check size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleCancel(apt.id)} title="Cancel Appointment">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Schedule New Patient Consultation</h2>
              <button className="btn-secondary" onClick={() => setShowBookModal(false)}>✕</button>
            </div>
            <form onSubmit={handleBook}>
              <div className="modal-body">
                <div className="form-group mb-md">
                  <label className="form-label">Select Patient Profile</label>
                  <select className="form-control" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Select Consultant Doctor</label>
                  <select className="form-control" value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.specialization} ({d.status})</option>
                    ))}
                  </select>
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Appointment Date</label>
                    <input className="form-control" type="date" value={aptDate} onChange={e => setAptDate(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Slot</label>
                    <input className="form-control" type="time" value={aptTime} onChange={e => setAptTime(e.target.value)} />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Booking Channel</label>
                  <select className="form-control" value={aptType} onChange={e => setAptType(e.target.value)}>
                    <option>Online</option>
                    <option>Walk-in</option>
                    <option>Teleconsult</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Symptoms / Notes</label>
                  <textarea className="form-control" value={aptNotes} onChange={e => setAptNotes(e.target.value)} placeholder="Enter brief reason for visit..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Generate Appointment Token</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
