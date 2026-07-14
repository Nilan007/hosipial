import React, { useEffect, useState } from 'react';
import {
  Users, UserPlus, FileText, CheckSquare, ShieldCheck, Printer,
  Download, Plus, Search, Trash2, Shield, Calendar, CreditCard,
  Briefcase, Mail, Phone, Award, AwardIcon, FileSpreadsheet, Check, CheckCircle2,
  DollarSign, Landmark, Eye, RefreshCw, X, QrCode
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

interface EmployeeDetails {
  qualification: string;
  experience: string;
  address: string;
  bloodGroup: string;
  // Salary splits
  basicSalary: number;
  hra: number;
  allowance: number;
  // Tax deductions options
  enablePF: boolean;
  enableESI: boolean;
  enablePT: boolean;
  enableIT: boolean;
  // Identifiers
  aadharNo: string;
  panNo: string;
  // Bank details
  accountNo: string;
  bankName: string;
  ifscCode: string;
  branchName: string;
  photoUrl: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  phone: string;
  email: string;
  shift: 'Day' | 'Night';
  attendance: 'Present' | 'Leave' | 'Absent';
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  details?: EmployeeDetails;
}

const StaffHR: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'List' | 'Add' | 'Attendance' | 'Payroll'>('List');
  
  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Modals / Selected Items
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<{ type: 'Appointment' | 'Confirmation' | 'Appraisal' | 'Experience'; employee: Employee } | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<{ employee: Employee; month: string } | null>(null);

  // Attendance Form
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, 'Present' | 'Leave' | 'Absent'>>({});

  // Payroll Form
  const [payrollMonth, setPayrollMonth] = useState('July 2026');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Doctor',
    dept: 'Cardiology',
    phone: '',
    email: '',
    shift: 'Day' as 'Day' | 'Night',
    joinDate: new Date().toISOString().split('T')[0],
    basicSalary: 45000,
    hra: 15000,
    allowance: 5000,
    qualification: '',
    experience: '',
    address: '',
    bloodGroup: 'B+',
    aadharNo: '',
    panNo: '',
    accountNo: '',
    bankName: '',
    ifscCode: '',
    branchName: '',
    enablePF: true,
    enableESI: true,
    enablePT: true,
    enableIT: true,
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getStaff();
      setEmployees(data);
      // Init attendance status
      const attMap: Record<string, 'Present' | 'Leave' | 'Absent'> = {};
      data.forEach((e: any) => {
        attMap[e.id] = e.attendance || 'Present';
      });
      setAttendanceStatusMap(attMap);
    } catch (e) {
      toast.error('Failed to load employee directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleDisbursePayroll = async () => {
    const totalAmount = employees.reduce((acc, emp) => acc + calculatePayslipData(emp).netSalary, 0);
    if (totalAmount <= 0) {
      toast.error('No employee salary data available to disburse');
      return;
    }
    if (!window.confirm(`Confirm payroll run disbursement for ${payrollMonth} of total amount ₹${totalAmount.toLocaleString('en-IN')}?`)) return;

    try {
      await api.disbursePayroll({ month: payrollMonth, totalAmount });
      toast.success(`🎉 Salaries disbursed successfully for ${payrollMonth}! Ledger updated.`);
    } catch (e) {
      toast.error('Failed to disburse salaries');
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalSalary = Number(formData.basicSalary) + Number(formData.hra) + Number(formData.allowance);
    const empId = `EMP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newEmp: Employee = {
      id: empId,
      name: formData.name,
      role: formData.role,
      dept: formData.dept,
      phone: formData.phone,
      email: formData.email,
      shift: formData.shift,
      attendance: 'Present',
      salary: totalSalary,
      joinDate: formData.joinDate,
      status: 'Active',
      details: {
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        basicSalary: Number(formData.basicSalary),
        hra: Number(formData.hra),
        allowance: Number(formData.allowance),
        enablePF: formData.enablePF,
        enableESI: formData.enableESI,
        enablePT: formData.enablePT,
        enableIT: formData.enableIT,
        aadharNo: formData.aadharNo,
        panNo: formData.panNo,
        accountNo: formData.accountNo,
        bankName: formData.bankName,
        ifscCode: formData.ifscCode,
        branchName: formData.branchName,
        photoUrl: formData.photoUrl
      }
    };

    try {
      await api.createStaff(newEmp);
      toast.success(`${formData.name} added successfully!`);
      setActiveTab('List');
      loadEmployees();
      // Reset form
      setFormData({
        name: '',
        role: 'Doctor',
        dept: 'Cardiology',
        phone: '',
        email: '',
        shift: 'Day',
        joinDate: new Date().toISOString().split('T')[0],
        basicSalary: 45000,
        hra: 15000,
        allowance: 5000,
        qualification: '',
        experience: '',
        address: '',
        bloodGroup: 'B+',
        aadharNo: '',
        panNo: '',
        accountNo: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        enablePF: true,
        enableESI: true,
        enablePT: true,
        enableIT: true,
        photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
      });
    } catch (err) {
      toast.error('Failed to create employee profile');
    }
  };

  const handleUpdateAttendance = async () => {
    try {
      setLoading(true);
      await Promise.all(
        Object.entries(attendanceStatusMap).map(([id, status]) =>
          api.updateStaff(id, { attendance: status })
        )
      );
      toast.success('Attendance records saved!');
      loadEmployees();
    } catch (e) {
      toast.error('Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;
    try {
      await api.deleteStaff(id);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (e) {
      toast.error('Failed to delete employee');
    }
  };

  // Tax calculations
  const calculatePayslipData = (employee: Employee) => {
    const details = employee.details || {
      basicSalary: employee.salary * 0.7,
      hra: employee.salary * 0.2,
      allowance: employee.salary * 0.1,
      enablePF: true,
      enableESI: true,
      enablePT: true,
      enableIT: true
    };

    const basic = details.basicSalary || employee.salary * 0.7;
    const hra = details.hra || employee.salary * 0.2;
    const allowance = details.allowance || employee.salary * 0.1;
    const gross = basic + hra + allowance;

    // Deductions
    const pf = details.enablePF ? Math.round(basic * 0.12) : 0;
    const esi = details.enableESI ? Math.round(gross * 0.0075) : 0;
    const pt = details.enablePT ? 200 : 0;
    const it = details.enableIT ? Math.round(gross * 0.10) : 0; // standard 10% mock income tax

    const totalDeductions = pf + esi + pt + it;
    const netSalary = gross - totalDeductions;

    return {
      basic, hra, allowance, gross,
      pf, esi, pt, it,
      totalDeductions, netSalary
    };
  };

  const printDocument = (title: string, contentId: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const element = document.getElementById(contentId);
    if (!element) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
            .letter-container { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #dc143c; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: 800; color: #dc143c; letter-spacing: -0.5px; }
            .title { text-align: center; font-size: 20px; font-weight: 800; margin: 30px 0; text-transform: uppercase; text-decoration: underline; color: #111827; }
            .meta-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
            .value { font-weight: 700; color: #111827; }
            .body-text { font-size: 14px; text-align: justify; margin-bottom: 40px; }
            .salary-table { width: 100%; border-collapse: collapse; margin: 20px 0 30px; }
            .salary-table th, .salary-table td { border: 1px solid #e5e7eb; padding: 10px; font-size: 13px; }
            .salary-table th { background: #f9fafb; font-weight: 700; }
            .signature-row { display: flex; justify-content: space-between; margin-top: 60px; }
            .sig-block { text-align: center; width: 200px; }
            .line { border-top: 1px solid #9ca3af; margin-top: 50px; margin-bottom: 5px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="letter-container">${element.innerHTML}</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--color-primary-glow)'
            }}>
              <Users size={18} color="white" />
            </span>
            <span className="gradient-text">Human Resources &amp; Staff Console</span>
          </h1>
          <p className="page-subtitle">Add employees, configure payroll splits with active tax options, track consolidated shift schedules &amp; print official HR documentation letters.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary font-bold" onClick={loadEmployees}>
            <RefreshCw size={14} className={loading ? 'animated-spin' : ''} /> Refresh
          </button>
          <button
            className={`btn ${activeTab === 'Add' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setActiveTab(activeTab === 'Add' ? 'List' : 'Add')}
            style={{ gap: 6 }}
          >
            {activeTab === 'Add' ? <FileText size={15} /> : <UserPlus size={15} />}
            {activeTab === 'Add' ? 'View Directory' : 'New Employee'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        <button className={`tab ${activeTab === 'List' ? 'active' : ''}`} onClick={() => setActiveTab('List')}>
          Employee Directory
        </button>
        <button className={`tab ${activeTab === 'Attendance' ? 'active' : ''}`} onClick={() => setActiveTab('Attendance')}>
          Shift Attendance Desk
        </button>
        <button className={`tab ${activeTab === 'Payroll' ? 'active' : ''}`} onClick={() => setActiveTab('Payroll')}>
          Payroll &amp; Payslips
        </button>
      </div>

      {/* TAB 1: EMPLOYEE DIRECTORY */}
      {activeTab === 'List' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Filters toolbar */}
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div className="search-bar" style={{ width: 280 }}>
              <Search size={14} color="var(--color-text-muted)" />
              <input
                placeholder="Search ID, name, role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <select className="form-control" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                <option value="Doctor">Doctors</option>
                <option value="Nurse">Nurses</option>
                <option value="Pharmacist">Pharmacists</option>
                <option value="Radiologist">Radiologists</option>
                <option value="Lab Technician">Lab Technicians</option>
                <option value="Admin">Administrators</option>
              </select>
            </div>
          </div>

          {/* Directory Card */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Photo / Name</th>
                    <th>Employee ID</th>
                    <th>Role &amp; Department</th>
                    <th>Shift</th>
                    <th>Salary (Monthly)</th>
                    <th>QR Card</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={emp.details?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--color-border)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)' }}>{emp.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{emp.email} · {emp.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{emp.id}</span>
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block' }}>{emp.role}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{emp.dept}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${emp.shift === 'Day' ? 'success' : 'purple'}`}>
                          {emp.shift} Shift
                        </span>
                      </td>
                      <td className="font-semibold text-primary">
                        ₹{(emp.salary || 65000).toLocaleString('en-IN')}/m
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary-light)', cursor: 'pointer' }} onClick={() => setSelectedEmployee(emp)}>
                          <QrCode size={16} />
                          <span style={{ fontSize: 10, fontWeight: 700 }}>Show Card</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => {
                              setSelectedLetter({ type: 'Appointment', employee: emp });
                            }}
                          >
                            Generate Letters
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => handleDeleteEmployee(emp.id)}
                            title="Delete Employee"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE MARKING & REPORTS */}
      {activeTab === 'Attendance' && (
        <div className="grid grid-3">
          {/* Daily Marker */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 className="card-title">Daily Shift Attendance Tracker</h3>
                <p className="card-subtitle">Mark shift checklist for active consultants &amp; medical personnel.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} color="var(--color-primary)" />
                <input
                  type="date"
                  className="form-control"
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 13 }}
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="table-container mb-md" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Scheduled Shift</th>
                    <th style={{ textAlign: 'center' }}>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const currentStatus = attendanceStatusMap[emp.id] || 'Present';
                    return (
                      <tr key={emp.id}>
                        <td>
                          <strong className="text-primary">{emp.name}</strong>
                          <span style={{ fontSize: 11, display: 'block', color: 'var(--color-text-muted)' }}>ID: {emp.id}</span>
                        </td>
                        <td>{emp.role}</td>
                        <td><span className={`badge badge-${emp.shift === 'Day' ? 'success' : 'purple'}`}>{emp.shift}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: 6, background: 'var(--color-bg-tertiary)', padding: 4, borderRadius: 8 }}>
                            {(['Present', 'Leave', 'Absent'] as const).map(status => {
                              const active = currentStatus === status;
                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => setAttendanceStatusMap(prev => ({ ...prev, [emp.id]: status }))}
                                  style={{
                                    fontSize: 11, fontWeight: 700,
                                    padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                                    border: 'none',
                                    background: active
                                      ? status === 'Present' ? 'var(--color-success)'
                                        : status === 'Leave' ? 'var(--color-purple)'
                                        : 'var(--color-primary)'
                                      : 'transparent',
                                    color: active ? '#fff' : 'var(--color-text-secondary)',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  {status}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleUpdateAttendance}>
                <Check size={14} style={{ marginRight: 6 }} /> Save Daily Attendance
              </button>
            </div>
          </div>

          {/* Consolidated Report Panel */}
          <div className="card">
            <h3 className="card-title mb-xs">Consolidated Monthly Summary</h3>
            <p className="card-subtitle mb-md">Consolidated attendance index calculations for the current billing month cycle.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {employees.map(emp => {
                const currentStatus = attendanceStatusMap[emp.id] || 'Present';
                // Mock consolidated parameters
                const presents = currentStatus === 'Present' ? 24 : 23;
                const leaves = currentStatus === 'Leave' ? 2 : 1;
                const absents = currentStatus === 'Absent' ? 2 : 1;
                const percentage = Math.round((presents / (presents + leaves + absents)) * 100);

                return (
                  <div key={emp.id} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                    <div className="flex-between mb-xs">
                      <div>
                        <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{emp.name}</strong>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>{emp.role}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 13, color: percentage > 85 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                        {percentage}% Index
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 10, overflow: 'hidden', margin: '6px 0' }}>
                      <div style={{
                        width: `${percentage}%`, height: '100%',
                        background: percentage > 85 ? 'var(--gradient-primary)' : 'var(--color-primary)',
                      }} />
                    </div>

                    <div style={{ display: 'flex', gap: 10, fontSize: 10, color: 'var(--color-text-muted)' }}>
                      <span>Present: <strong>{presents} days</strong></span>
                      <span>Leaves: <strong>{leaves} days</strong></span>
                      <span>Absent: <strong>{absents} days</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYROLL & PAYSLIPS */}
      {activeTab === 'Payroll' && (
        <div className="grid grid-3">
          {/* Main payroll desk */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h3 className="card-title">Corporate Payroll Console</h3>
                <p className="card-subtitle">Perform gross pay calculations, tax configurations, and generate PDF payslips.</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select className="form-control" style={{ width: 'auto', padding: '4px 10px', fontSize: 13 }} value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)}>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                </select>
              </div>
            </div>

            <div className="table-container mb-md" style={{ border: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Basic Pay</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Disbursed</th>
                    <th style={{ textAlign: 'right' }}>Payslip Slip</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => {
                    const pay = calculatePayslipData(emp);
                    return (
                      <tr key={emp.id}>
                        <td>
                          <strong className="text-primary">{emp.name}</strong>
                          <span style={{ fontSize: 11, display: 'block', color: 'var(--color-text-muted)' }}>{emp.role} · {emp.dept}</span>
                        </td>
                        <td>₹{pay.basic.toLocaleString('en-IN')}</td>
                        <td>₹{(pay.hra + pay.allowance).toLocaleString('en-IN')}</td>
                        <td className="text-danger">₹{pay.totalDeductions.toLocaleString('en-IN')}</td>
                        <td className="font-bold text-success">₹{pay.netSalary.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ gap: 4, padding: '4px 10px', fontSize: 11 }}
                            onClick={() => setSelectedPayslip({ employee: emp, month: payrollMonth })}
                          >
                            <FileText size={11} /> Generate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="card">
            <h3 className="card-title mb-xs">Disbursement Overview</h3>
            <p className="card-subtitle mb-md">Summary figures calculated for the payroll cycle of {payrollMonth}.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'rgba(22,163,74,0.05)', border: '1px solid rgba(22,163,74,0.12)', padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>TOTAL NET DISBURSED</span>
                <strong style={{ fontSize: 20, color: 'var(--color-success)', fontWeight: 800 }}>
                  ₹{employees.reduce((acc, emp) => acc + calculatePayslipData(emp).netSalary, 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ background: 'rgba(220,20,60,0.05)', border: '1px solid rgba(220,20,60,0.12)', padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>TOTAL TAX DEDUCTIONS</span>
                <strong style={{ fontSize: 20, color: 'var(--color-primary)', fontWeight: 800 }}>
                  ₹{employees.reduce((acc, emp) => acc + calculatePayslipData(emp).totalDeductions, 0).toLocaleString('en-IN')}
                </strong>
              </div>

              <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.12)', padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block' }}>TOTAL EMPLOYEES BILLED</span>
                <strong style={{ fontSize: 20, color: 'var(--color-purple)', fontWeight: 800 }}>
                  {employees.length} Active Profiles
                </strong>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center', marginTop: 6, gap: 6 }}
                onClick={handleDisbursePayroll}
              >
                Disburse {payrollMonth} Salaries
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADD NEW EMPLOYEE */}
      {activeTab === 'Add' && (
        <form onSubmit={handleAddEmployee} className="card">
          <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
            <h3 className="card-title text-accent">Register New Employee Profile</h3>
            <p className="card-subtitle">Establish official record with salary parameters, bank routing, and identification checks.</p>
          </div>

          <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            {/* Personal parameters */}
            <div style={{ gridColumn: 'span 3', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>1. Personal Profile</span>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Kumar"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                className="form-control"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +91 98450 12345"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. rajesh@medicore.org"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Designation / Role</label>
              <select
                className="form-control"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Pharmacist">Pharmacist</option>
                <option value="Radiologist">Radiologist</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Admin">HR / Administrator</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department Unit</label>
              <input
                className="form-control"
                required
                value={formData.dept}
                onChange={e => setFormData({ ...formData, dept: e.target.value })}
                placeholder="e.g. Cardiology, Radiology"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scheduled Shift</label>
              <select
                className="form-control"
                value={formData.shift}
                onChange={e => setFormData({ ...formData, shift: e.target.value as 'Day' | 'Night' })}
              >
                <option value="Day">Day Shift (08:00 AM - 08:00 PM)</option>
                <option value="Night">Night Shift (08:00 PM - 08:00 AM)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                className="form-control"
                required
                value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g. MBBS, MD (Cardiology), GNM"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                className="form-control"
                required
                value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 8 Years"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-control"
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Residential Address</label>
              <textarea
                className="form-control"
                style={{ height: 60 }}
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Type complete postal address..."
              />
            </div>

            {/* Compensation Splits */}
            <div style={{ gridColumn: 'span 3', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>2. Salary Splits &amp; Tax Deductions</span>
            </div>

            <div className="form-group">
              <label className="form-label">Basic Salary (₹/month)</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.basicSalary}
                onChange={e => setFormData({ ...formData, basicSalary: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">HRA Allowance (₹/month)</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.hra}
                onChange={e => setFormData({ ...formData, hra: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Allowances (₹/month)</label>
              <input
                type="number"
                className="form-control"
                required
                value={formData.allowance}
                onChange={e => setFormData({ ...formData, allowance: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div style={{ gridColumn: 'span 3', display: 'flex', gap: 30, background: 'var(--color-bg-tertiary)', padding: '12px 20px', borderRadius: 10, border: '1px solid var(--color-border)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={formData.enablePF} onChange={e => setFormData({ ...formData, enablePF: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                Enable PF Deductions (12%)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={formData.enableESI} onChange={e => setFormData({ ...formData, enableESI: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                Enable ESI Deductions (0.75%)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={formData.enablePT} onChange={e => setFormData({ ...formData, enablePT: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                Enable PT Deductions (₹200)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={formData.enableIT} onChange={e => setFormData({ ...formData, enableIT: e.target.checked })} style={{ width: 15, height: 15, accentColor: 'var(--color-primary)' }} />
                Enable Income Tax (10% TDS)
              </label>
            </div>

            {/* Identifiers & bank details */}
            <div style={{ gridColumn: 'span 3', borderBottom: '1px solid var(--color-border)', paddingBottom: 8, marginTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>3. Bank &amp; Verification Details</span>
            </div>

            <div className="form-group">
              <label className="form-label">Aadhar Card No</label>
              <input
                className="form-control"
                required
                value={formData.aadharNo}
                onChange={e => setFormData({ ...formData, aadharNo: e.target.value })}
                placeholder="e.g. 1234 5678 9012"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PAN Number</label>
              <input
                className="form-control"
                required
                value={formData.panNo}
                onChange={e => setFormData({ ...formData, panNo: e.target.value.toUpperCase() })}
                placeholder="e.g. ABCDE1234F"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Account Number</label>
              <input
                className="form-control"
                required
                value={formData.accountNo}
                onChange={e => setFormData({ ...formData, accountNo: e.target.value })}
                placeholder="e.g. 912300050012"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                className="form-control"
                required
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. HDFC Bank, SBI"
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                className="form-control"
                required
                value={formData.ifscCode}
                onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC Branch</label>
              <input
                className="form-control"
                required
                value={formData.branchName}
                onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                placeholder="e.g. OMR IT Highway, Chennai"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 30, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('List')}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ gap: 8 }}>
              <Plus size={16} /> Save Profile Registry
            </button>
          </div>
        </form>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL 1: QR ID CARD MOCK
      ═══════════════════════════════════════════════ */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedEmployee(null); }}>
          <div className="modal modal-sm" style={{ maxWidth: 360, borderRadius: 24, overflow: 'hidden', padding: 0 }}>
            {/* Gradient Header */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '24px 20px',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', top: 12, right: 12,
                cursor: 'pointer', color: 'rgba(255,255,255,0.8)'
              }} onClick={() => setSelectedEmployee(null)}>
                <X size={18} />
              </div>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#fff', border: '3px solid rgba(255,255,255,0.4)',
                margin: '0 auto 10px', overflow: 'hidden'
              }}>
                <img
                  src={selectedEmployee.details?.photoUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{selectedEmployee.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 600 }}>{selectedEmployee.role}</div>
            </div>

            {/* Info details body */}
            <div className="modal-body" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', display: 'block', letterSpacing: '0.06em' }}>MEDICORE STAFF PASSPORT ID</span>
                <strong style={{ fontSize: 15, fontFamily: 'monospace', color: 'var(--color-primary)' }}>{selectedEmployee.id}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', fontSize: 12, marginBottom: 24 }}>
                <div className="flex-between">
                  <span className="text-secondary">Department:</span>
                  <strong className="text-primary">{selectedEmployee.dept}</strong>
                </div>
                <div className="flex-between">
                  <span className="text-secondary">Scheduled Shift:</span>
                  <strong className="text-primary">{selectedEmployee.shift} Shift</strong>
                </div>
                <div className="flex-between">
                  <span className="text-secondary">Blood Group:</span>
                  <strong className="text-primary">{selectedEmployee.details?.bloodGroup || 'B+'}</strong>
                </div>
                <div className="flex-between">
                  <span className="text-secondary">PAN Code:</span>
                  <strong className="text-primary" style={{ fontFamily: 'monospace' }}>{selectedEmployee.details?.panNo || 'N/A'}</strong>
                </div>
              </div>

              {/* QR Mockup */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  padding: 12, background: 'white',
                  borderRadius: 14, border: '1.5px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <QrCode size={90} color="var(--color-primary)" />
                </div>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 600 }}>Scan QR to verify parameters</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL 2: HR LETTERS GENERATION
      ═══════════════════════════════════════════════ */}
      {selectedLetter && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedLetter(null); }}>
          <div className="modal modal-lg" style={{ maxWidth: 820, borderRadius: 24, overflow: 'hidden' }}>
            <div className="modal-header">
              <h2 className="modal-title">Official Document Manager</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                {(['Appointment', 'Confirmation', 'Appraisal', 'Experience'] as const).map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ${selectedLetter.type === type ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedLetter({ ...selectedLetter, type })}
                  >
                    {type} Letter
                  </button>
                ))}
              </div>
              <button className="btn-secondary" onClick={() => setSelectedLetter(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ background: '#f8fafc', padding: 30 }}>
              {/* Document Container */}
              <div id="hr-letter-printable" style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: 40,
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                color: '#1f2937',
                fontSize: '14px',
                lineHeight: 1.6
              }}>
                {/* Letterhead */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #dc143c', paddingBottom: 20, marginBottom: 40 }}>
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#dc143c', margin: 0, letterSpacing: '-0.5px' }}>MEDICORE HOSPITAL</h2>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0' }}>Corporate HR Operations Center</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                    <p style={{ margin: 0 }}>100, OMR IT Highway, Chennai</p>
                    <p style={{ margin: 0 }}>Email: hr@medicore.org | Web: www.medicore.org</p>
                  </div>
                </div>

                {/* Meta details */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
                  <div>
                    <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Ref Code</span>
                    <strong style={{ fontSize: '12px' }}>MED/HR/{selectedLetter.type.toUpperCase()}/{selectedLetter.employee.id}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: '#6b7280', display: 'block', textTransform: 'uppercase' }}>Date</span>
                    <strong style={{ fontSize: '12px' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                  </div>
                </div>

                {/* Recipient */}
                <div style={{ marginBottom: 30 }}>
                  <p style={{ margin: 0 }}>To,</p>
                  <strong style={{ fontSize: '15px', color: '#111827' }}>{selectedLetter.employee.name}</strong>
                  <p style={{ margin: '2px 0 0' }}>ID: {selectedLetter.employee.id}</p>
                  <p style={{ margin: '2px 0 0' }}>{selectedLetter.employee.details?.address || 'OMR IT Highway, Chennai'}</p>
                </div>

                {/* Dynamic Content */}
                {selectedLetter.type === 'Appointment' && (
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', margin: '24px 0', textTransform: 'uppercase', textDecoration: 'underline', color: '#111827' }}>
                      Subject: Letter of Appointment
                    </div>
                    <p>Dear {selectedLetter.employee.name},</p>
                    <p>
                      We are pleased to offer you an appointment in our organization as a <strong>{selectedLetter.employee.role}</strong> in the Department of <strong>{selectedLetter.employee.dept}</strong>. Your joining date is confirmed as <strong>{selectedLetter.employee.joinDate}</strong>.
                    </p>
                    <p>
                      Your consolidated monthly compensation package will be <strong>₹{selectedLetter.employee.salary.toLocaleString('en-IN')}</strong>. The detailed salary splits, allowances, and tax withholding structures have been recorded under your employee profile.
                    </p>
                    <p>
                      Please sign and return the duplicate copy of this letter as a token of your acceptance of the terms and conditions of employment.
                    </p>
                  </div>
                )}

                {selectedLetter.type === 'Confirmation' && (
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', margin: '24px 0', textTransform: 'uppercase', textDecoration: 'underline', color: '#111827' }}>
                      Subject: Employment Confirmation Order
                    </div>
                    <p>Dear {selectedLetter.employee.name},</p>
                    <p>
                      Consequent to the successful completion of your probation period, we have the pleasure in confirming your appointment as a permanent employee of MediCore Hospital in the role of <strong>{selectedLetter.employee.role}</strong> with immediate effect.
                    </p>
                    <p>
                      All other terms and conditions of your employment as detailed in your initial appointment letter remain unchanged. We look forward to your continued valuable contributions to our medical care teams.
                    </p>
                  </div>
                )}

                {selectedLetter.type === 'Appraisal' && (
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', margin: '24px 0', textTransform: 'uppercase', textDecoration: 'underline', color: '#111827' }}>
                      Subject: Annual Performance Appraisal &amp; Increment
                    </div>
                    <p>Dear {selectedLetter.employee.name},</p>
                    <p>
                      Based on your outstanding performance index and clinical contributions during the past review cycle, we are pleased to inform you that your compensation package has been revised.
                    </p>
                    <p>
                      Your monthly salary has been incremented to <strong>₹{(selectedLetter.employee.salary + 8000).toLocaleString('en-IN')}</strong> (including revised HRA allowances), effective from next billing month.
                    </p>
                    <p>
                      We appreciate your dedication and commitment to maintaining clinical care excellence at our institution.
                    </p>
                  </div>
                )}

                {selectedLetter.type === 'Experience' && (
                  <div>
                    <div style={{ textAlign: 'center', fontWeight: 800, fontSize: '16px', margin: '24px 0', textTransform: 'uppercase', textDecoration: 'underline', color: '#111827' }}>
                      Subject: Experience &amp; Relieving Certificate
                    </div>
                    <p>To Whomsoever It May Concern,</p>
                    <p>
                      This is to certify that <strong>{selectedLetter.employee.name}</strong> was employed with MediCore Hospital from <strong>{selectedLetter.employee.joinDate}</strong> to <strong>{new Date().toISOString().split('T')[0]}</strong> as a <strong>{selectedLetter.employee.role}</strong> in the Department of <strong>{selectedLetter.employee.dept}</strong>.
                    </p>
                    <p>
                      During the tenure of employment, we found their clinical performance, work ethics, and behavior to be exemplary. They have resigned on their own accord and have been relieved of all duties.
                    </p>
                    <p>
                      We wish them the absolute best in all future clinical endeavors.
                    </p>
                  </div>
                )}

                {/* Signature line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderTop: '1px solid #9ca3af', marginTop: '50px', marginBottom: '5px' }} />
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Employee Signature</p>
                  </div>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderTop: '1px solid #9ca3af', marginTop: '50px', marginBottom: '5px' }} />
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>HR Director / MD</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedLetter(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => printDocument(`HR_Letter_${selectedLetter.type}`, 'hr-letter-printable')} style={{ gap: 6 }}>
                <Printer size={14} /> Print Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL 3: PAYSLIP DOCUMENT MODAL
      ═══════════════════════════════════════════════ */}
      {selectedPayslip && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPayslip(null); }}>
          <div className="modal modal-lg" style={{ maxWidth: 820, borderRadius: 24, overflow: 'hidden' }}>
            <div className="modal-header">
              <h2 className="modal-title">Disbursed Salary Slip Console</h2>
              <button className="btn-secondary" onClick={() => setSelectedPayslip(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ background: '#f8fafc', padding: 30 }}>
              <div id="payslip-slip-printable" style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: 40,
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                color: '#1f2937',
                fontSize: '14px'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #dc143c', paddingBottom: 20, marginBottom: 30 }}>
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#dc143c', margin: 0 }}>MEDICORE HOSPITAL</h2>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: '4px 0 0' }}>Corporate Finance &amp; HR Operations Center</p>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
                    <p style={{ margin: 0 }}>100, OMR IT Highway, Chennai</p>
                    <p style={{ margin: 0 }}>PF Code: TN/CHN/0012345/000</p>
                  </div>
                </div>

                <div style={{ textTransform: 'uppercase', fontWeight: 800, fontSize: '15px', color: '#111827', letterSpacing: '0.04em', margin: '20px 0', textAlign: 'center' }}>
                  SALARY DISBURSEMENT RECEIPT — {selectedPayslip.month.toUpperCase()}
                </div>

                {/* Grid Employee Metadata */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 30px',
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  padding: 20, borderRadius: 10, marginBottom: 30
                }}>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>EMPLOYEE NAME</span>
                    <strong style={{ fontSize: 13, color: '#111827' }}>{selectedPayslip.employee.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>EMPLOYEE ID / ROLE</span>
                    <strong style={{ fontSize: 13, color: '#111827' }}>{selectedPayslip.employee.id} | {selectedPayslip.employee.role}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>PAN CARD NUMBER</span>
                    <strong style={{ fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>{selectedPayslip.employee.details?.panNo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>AADHAR CARD NO</span>
                    <strong style={{ fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>{selectedPayslip.employee.details?.aadharNo || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>BANK ACCOUNT NUMBER</span>
                    <strong style={{ fontSize: 13, color: '#111827' }}>
                      {selectedPayslip.employee.details?.accountNo} ({selectedPayslip.employee.details?.bankName})
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: '#6b7280', display: 'block' }}>IFSC CODE / BRANCH</span>
                    <strong style={{ fontSize: 13, color: '#111827', fontFamily: 'monospace' }}>
                      {selectedPayslip.employee.details?.ifscCode} · {selectedPayslip.employee.details?.branchName}
                    </strong>
                  </div>
                </div>

                {/* Earnings & Deductions Breakdown Tables */}
                {(() => {
                  const pay = calculatePayslipData(selectedPayslip.employee);
                  return (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
                        {/* Earnings table */}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: 6, marginBottom: 10 }}>
                            Earnings breakdown (A)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                            <div className="flex justify-between"><span>Basic Salary:</span><strong>₹{pay.basic.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between"><span>HRA Allowance:</span><strong>₹{pay.hra.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between"><span>Special Allowance:</span><strong>₹{pay.allowance.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between" style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 700 }}>
                              <span>Gross Earnings:</span><span>₹{pay.gross.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Deductions table */}
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 12, textTransform: 'uppercase', color: '#111827', borderBottom: '2px solid #e5e7eb', paddingBottom: 6, marginBottom: 10 }}>
                            Deductions breakdown (B)
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                            <div className="flex justify-between"><span>Provident Fund (PF):</span><strong>₹{pay.pf.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between"><span>ESI Contribution:</span><strong>₹{pay.esi.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between"><span>Professional Tax (PT):</span><strong>₹{pay.pt.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between"><span>Income Tax (TDS):</span><strong>₹{pay.it.toLocaleString('en-IN')}</strong></div>
                            <div className="flex justify-between" style={{ borderTop: '1px solid #e5e7eb', paddingTop: 8, fontWeight: 700 }}>
                              <span>Total Deductions:</span><span>₹{pay.totalDeductions.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Net disbursed row */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderTop: '2px solid #111827', borderBottom: '2.5px double #111827',
                        padding: '12px 10px', marginTop: 30
                      }}>
                        <strong style={{ fontSize: 15, color: '#dc143c' }}>NET DISBURSED TO BANK ACCOUNT (A - B)</strong>
                        <strong style={{ fontSize: 20, color: 'var(--color-success)', fontWeight: 800 }}>
                          ₹{pay.netSalary.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>
                  );
                })()}

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderTop: '1px solid #9ca3af', marginTop: '50px', marginBottom: '5px' }} />
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>Employee Acknowledgment</p>
                  </div>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderTop: '1px solid #9ca3af', marginTop: '50px', marginBottom: '5px' }} />
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>HR Administrator Signature</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => printDocument(`Payslip_Slip_${selectedPayslip.employee.id}`, 'payslip-slip-printable')} style={{ gap: 6 }}>
                <Printer size={14} /> Print Payslip Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffHR;
