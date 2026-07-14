import React, { useEffect, useState } from 'react';
import {
  Building, DollarSign, Plus, Search, Calendar, Check,
  Download, FileText, TrendingUp, AlertCircle, RefreshCw, Printer, Percent, Eye
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import { exportTablePDF } from '../../utils/exportUtils';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const OutsideLabCommission: React.FC = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Analytics');

  // Directory form states
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabContact, setNewLabContact] = useState('');
  const [newLabPhone, setNewLabPhone] = useState('');
  const [newLabEmail, setNewLabEmail] = useState('');
  const [newLabAddress, setNewLabAddress] = useState('');
  const [newLabRate, setNewLabRate] = useState(20);
  const [newLabCycle, setNewLabCycle] = useState('Weekly');

  // Referral logger states
  const [showReferModal, setShowReferModal] = useState(false);
  const [refPatientId, setRefPatientId] = useState('');
  const [refLabId, setRefLabId] = useState('');
  const [refScanType, setRefScanType] = useState('Contrast MRI Brain');
  const [refTotalAmount, setRefTotalAmount] = useState(8000);
  const [refDate, setRefDate] = useState(new Date().toISOString().split('T')[0]);

  // Billing states
  const [selectedLabId, setSelectedLabId] = useState('');
  const [billStartDate, setBillStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [billEndDate, setBillEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Search/Filters
  const [refSearch, setRefSearch] = useState('');
  const [refLabFilter, setRefLabFilter] = useState('All');
  const [refStatusFilter, setRefStatusFilter] = useState('All');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [labsData, referralsData, invoicesData, patientsData] = await Promise.all([
        api.getOutsideLabs(),
        api.getOutsideReferrals(),
        api.getOutsideInvoices(),
        api.getPatients()
      ]);
      setLabs(labsData);
      setReferrals(referralsData);
      setInvoices(invoicesData);
      setPatients(patientsData);
      
      if (labsData.length > 0) {
        setRefLabId(labsData[0].id);
        setSelectedLabId(labsData[0].id);
      }
      if (patientsData.length > 0) {
        setRefPatientId(patientsData[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load commission system datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddLab = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLab = {
      id: `LAB-EXT-${Math.floor(100 + Math.random() * 900)}`,
      name: newLabName,
      contactPerson: newLabContact,
      phone: newLabPhone,
      email: newLabEmail,
      address: newLabAddress,
      commissionRate: newLabRate,
      billingCycle: newLabCycle,
      status: 'Active'
    };

    try {
      await api.createOutsideLab(newLab);
      toast.success('Outside laboratory registered successfully!');
      loadAllData();
      setShowAddLabModal(false);
      // Reset form
      setNewLabName('');
      setNewLabContact('');
      setNewLabPhone('');
      setNewLabEmail('');
      setNewLabAddress('');
      setNewLabRate(20);
      setNewLabCycle('Weekly');
    } catch (err) {
      console.error(err);
      toast.error('Failed to register outside lab');
    }
  };

  const handleLogReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === refPatientId);
    const lab = labs.find(l => l.id === refLabId);
    if (!pat || !lab) {
      toast.error('Patient or Laboratory not found');
      return;
    }

    const commissionAmount = Math.round((refTotalAmount * lab.commissionRate) / 100);
    const newReferral = {
      id: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: pat.id,
      patientName: pat.name,
      labId: lab.id,
      labName: lab.name,
      scanType: refScanType,
      date: refDate,
      totalAmount: refTotalAmount,
      commissionRate: lab.commissionRate,
      commissionAmount,
      billingStatus: 'Pending',
      invoiceId: ''
    };

    try {
      await api.createOutsideReferral(newReferral);
      toast.success(`Referral logged for ${pat.name} to ${lab.name}`);
      loadAllData();
      setShowReferModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to log outside referral');
    }
  };

  const handleGenerateInvoice = async () => {
    const lab = labs.find(l => l.id === selectedLabId);
    if (!lab) {
      toast.error('Please select a laboratory');
      return;
    }

    // Filter referrals that are Pending, matching selected lab, and between start/end dates
    const pendingRefs = referrals.filter(r => 
      r.labId === lab.id && 
      r.billingStatus === 'Pending' && 
      r.date >= billStartDate && 
      r.date <= billEndDate
    );

    if (pendingRefs.length === 0) {
      toast.error('No pending unbilled referrals found in the selected date range');
      return;
    }

    const confirmGen = window.confirm(`Generate invoice for ${lab.name} with ${pendingRefs.length} referrals?`);
    if (!confirmGen) return;

    const invoicePayload = {
      labId: lab.id,
      labName: lab.name,
      startDate: billStartDate,
      endDate: billEndDate,
      billingCycle: lab.billingCycle,
      referrals: pendingRefs
    };

    try {
      await api.generateOutsideInvoice(invoicePayload);
      toast.success(`Commission invoice generated for ${lab.name}!`);
      loadAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error generating commission invoice');
    }
  };

  const handleSettleInvoice = async (invoiceId: string) => {
    if (!window.confirm(`Mark commission invoice ${invoiceId} as fully Paid/Settled?`)) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await api.settleOutsideInvoice(invoiceId, { paymentDate: today });
      toast.success(`Commission invoice ${invoiceId} settled!`);
      loadAllData();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: 'Paid', paymentDate: today });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to settle commission invoice');
    }
  };

  const handleExportPDF = () => {
    const headers = ['Ref ID', 'Patient', 'Outside Lab', 'Scan Modality', 'Billing Value (₹)', 'Rate (%)', 'Commission Due (₹)', 'Status'];
    const rows = filteredReferrals.map(r => [
      r.id,
      r.patientName,
      r.labName,
      r.scanType,
      r.totalAmount.toLocaleString('en-IN'),
      `${r.commissionRate}%`,
      r.commissionAmount.toLocaleString('en-IN'),
      r.billingStatus
    ]);
    exportTablePDF('Outside Labs Referrals & Commission Directory', headers, rows, 'outside_lab_referrals_report');
  };

  // Computations for Analytics
  const totalReferrals = referrals.length;
  const totalBillingValue = referrals.reduce((acc, r) => acc + r.totalAmount, 0);
  const totalCommissionEarned = referrals.reduce((acc, r) => acc + r.commissionAmount, 0);
  
  // Pending commissions (referrals pending + invoices unpaid)
  const pendingCommissions = referrals
    .filter(r => r.billingStatus === 'Pending')
    .reduce((acc, r) => acc + r.commissionAmount, 0) +
    invoices
      .filter(i => i.status === 'Unpaid')
      .reduce((acc, i) => acc + i.totalCommission, 0);

  // Chart data: Commission per lab
  const labDataMap: { [name: string]: number } = {};
  referrals.forEach(ref => {
    labDataMap[ref.labName] = (labDataMap[ref.labName] || 0) + ref.commissionAmount;
  });
  const chartData = Object.entries(labDataMap).map(([name, amount]) => ({
    name: name.split(' ')[0], // abbreviation
    Commission: amount
  }));

  // Filtering referrals
  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = r.patientName.toLowerCase().includes(refSearch.toLowerCase()) || r.id.includes(refSearch);
    const matchesLab = refLabFilter === 'All' || r.labId === refLabFilter;
    const matchesStatus = refStatusFilter === 'All' || r.billingStatus === refStatusFilter;
    return matchesSearch && matchesLab && matchesStatus;
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title gradient-text flex-align" style={{ gap: 10 }}>
            <Building className="text-accent" size={28} />
            Outside Radiology Lab Commission Desk
          </h1>
          <p className="page-subtitle">Track referred diagnostic scans, compute percentage-based commissions (10%-50%), and dispatch weekly, fortnightly, or monthly bills.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowAddLabModal(true)}>
            <Plus size={16} /> Register Partner Lab
          </button>
          <button className="btn btn-primary" onClick={() => setShowReferModal(true)}>
            <Plus size={16} /> Log Scan Referral
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        {['Analytics', 'Partner Labs', 'Referrals Registry', 'Commission Billing'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setSelectedInvoice(null); }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && (
        <div>
          {/* Stats KPI Grid */}
          <div className="stats-grid mb-lg">
            <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="kpi-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)' }}><Building size={20} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Referred Scan Volume</div>
                <div className="kpi-value">{totalReferrals} Patients</div>
                <div className="text-secondary text-xs">Apex, Metro, & Precision partners</div>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}><DollarSign size={20} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Total Out-Lab Billing</div>
                <div className="kpi-value">₹{totalBillingValue.toLocaleString('en-IN')}</div>
                <div className="text-secondary text-xs">Total Scan values billed externally</div>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}><Percent size={20} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Commissions Earned</div>
                <div className="kpi-value">₹{totalCommissionEarned.toLocaleString('en-IN')}</div>
                <div className="text-secondary text-xs">Revenue from referral margins</div>
              </div>
            </div>

            <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}><AlertCircle size={20} /></div>
              <div className="kpi-body">
                <div className="kpi-label">Unpaid Commission Dues</div>
                <div className="kpi-value text-danger">₹{pendingCommissions.toLocaleString('en-IN')}</div>
                <div className="text-secondary text-xs">Outstanding invoice balances due</div>
              </div>
            </div>
          </div>

          {/* Revenue distribution and stats */}
          <div className="grid grid-3 mb-lg" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div className="card">
              <h3 className="card-title mb-md">Commission Yield by Laboratory</h3>
              <div style={{ width: '100%', height: 260 }}>
                {chartData.length > 0 ? (
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => [`₹${value ? Number(value).toLocaleString('en-IN') : 0}`, 'Commission']} />
                      <Bar dataKey="Commission" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex-center text-muted" style={{ height: '100%' }}>No referral data available for analysis</div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 className="card-title mb-sm">Agreed Terms Directory</h3>
              <p className="text-secondary text-xs mb-md">Configured billing cycles and rates for partners.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {labs.map(lab => (
                  <div key={lab.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <div className="flex-between">
                      <span className="font-semibold text-white">{lab.name}</span>
                      <span className="badge badge-purple">{lab.commissionRate}% Rate</span>
                    </div>
                    <div className="flex justify-between text-secondary text-xxs mt-xs">
                      <span>Cycle: {lab.billingCycle}</span>
                      <span>Contact: {lab.contactPerson}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Labs Tab */}
      {activeTab === 'Partner Labs' && (
        <div className="card">
          <h3 className="card-title mb-md">Registered Outside Radiology Labs</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Lab ID</th>
                  <th>Center Name</th>
                  <th>Contact Person</th>
                  <th>Phone Number</th>
                  <th>Email Address</th>
                  <th>Commission Rate</th>
                  <th>Billing Cycle</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labs.map(lab => (
                  <tr key={lab.id}>
                    <td className="font-semibold text-accent">{lab.id}</td>
                    <td className="font-semibold text-primary">{lab.name}</td>
                    <td>{lab.contactPerson}</td>
                    <td>{lab.phone}</td>
                    <td>{lab.email}</td>
                    <td className="font-bold text-accent">{lab.commissionRate}%</td>
                    <td>
                      <span className="badge badge-purple">{lab.billingCycle}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${lab.status === 'Active' ? 'success' : 'gray'}`}>
                        {lab.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => {
                        toast.success('Terms editing features scheduled for next sub-release');
                      }}>
                        Edit Rules
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referrals Registry Tab */}
      {activeTab === 'Referrals Registry' && (
        <div>
          {/* Filters */}
          <div className="toolbar mb-md">
            <div className="search-bar">
              <Search size={16} />
              <input
                placeholder="Search patient referred..."
                value={refSearch}
                onChange={e => setRefSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <select className="form-control" style={{ width: 150 }} value={refLabFilter} onChange={e => setRefLabFilter(e.target.value)}>
                <option value="All">All Laboratories</option>
                {labs.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <select className="form-control" style={{ width: 140 }} value={refStatusFilter} onChange={e => setRefStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending billing</option>
                <option value="Invoiced">Invoiced</option>
                <option value="Settled">Settled payment</option>
              </select>
              <button className="btn btn-secondary" onClick={handleExportPDF} title="Download Ledger PDF">
                <Download size={14} /> PDF Ledger
              </button>
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Referral ID</th>
                    <th>Patient Name</th>
                    <th>Outside Lab Center</th>
                    <th>Scan Parameters</th>
                    <th>Scan Price (₹)</th>
                    <th>Commission Rate</th>
                    <th>Commission Due (₹)</th>
                    <th>Referral Date</th>
                    <th>Billing Status</th>
                    <th>Invoice ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map(ref => (
                    <tr key={ref.id}>
                      <td className="font-semibold text-accent">{ref.id}</td>
                      <td className="font-semibold text-primary">{ref.patientName}</td>
                      <td>{ref.labName}</td>
                      <td>{ref.scanType}</td>
                      <td className="font-semibold text-white">₹{ref.totalAmount.toLocaleString('en-IN')}</td>
                      <td>{ref.commissionRate}%</td>
                      <td className="font-bold text-accent">₹{ref.commissionAmount.toLocaleString('en-IN')}</td>
                      <td>{ref.date}</td>
                      <td>
                        <span className={`badge badge-${
                          ref.billingStatus === 'Settled' ? 'success' :
                          ref.billingStatus === 'Invoiced' ? 'primary' : 'warning'
                        }`}>
                          {ref.billingStatus}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-secondary">{ref.invoiceId || <span className="text-muted">-</span>}</td>
                    </tr>
                  ))}
                  {filteredReferrals.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-muted text-sm">No referrals match the filters configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Commission Billing Tab */}
      {activeTab === 'Commission Billing' && (
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px' }}>
          {/* Left panel: Generate Invoice */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
              <h3 className="card-title text-accent">Generate Cycle Invoice</h3>
              <p className="text-secondary text-xs">Run cycle aggregation for outside labs based on date parameters.</p>
            </div>

            <div className="form-group mb-md">
              <label className="form-label font-bold text-white">Select Outside Laboratory</label>
              <select className="form-control" value={selectedLabId} onChange={e => setSelectedLabId(e.target.value)}>
                {labs.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.billingCycle} Cycle)</option>
                ))}
              </select>
            </div>

            <div className="form-grid-2 mb-lg">
              <div className="form-group">
                <label className="form-label text-xs">From Date</label>
                <input type="date" className="form-control" value={billStartDate} onChange={e => setBillStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label text-xs">To Date</label>
                <input type="date" className="form-control" value={billEndDate} onChange={e => setBillEndDate(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={handleGenerateInvoice} style={{ justifyContent: 'center' }}>
              Compile & Generate Cycle Bill
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '20px 0' }} />

            {/* Generated Invoices List */}
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 12 }}>Generated Invoices Ledger</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {invoices.map(inv => (
                <div 
                  key={inv.id} 
                  onClick={() => setSelectedInvoice(inv)}
                  style={{ 
                    background: selectedInvoice?.id === inv.id ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)', 
                    border: '1px solid',
                    borderColor: selectedInvoice?.id === inv.id ? 'var(--color-accent)' : 'var(--color-border)', 
                    padding: '10px 14px', 
                    borderRadius: 8, 
                    cursor: 'pointer' 
                  }}
                >
                  <div className="flex-between">
                    <span className="font-mono font-semibold text-accent text-xs">{inv.id}</span>
                    <span className={`badge badge-${inv.status === 'Paid' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>
                      {inv.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-secondary text-xxs mt-xs">
                    <span>Lab: {inv.labName.split(' ')[0]}</span>
                    <span className="font-bold text-white">Commission: ₹{inv.totalCommission.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Invoice Breakdown & Print Letterhead */}
          <div className="card">
            {selectedInvoice ? (
              <div>
                <div className="print-letterhead" style={{ display: 'block', border: '1px solid var(--color-border)', padding: 20, background: 'var(--color-bg-secondary)', borderRadius: 10 }}>
                  <div className="print-letterhead-header">
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary-light)' }}>MEDICORE MULTISPECIALTY HOSPITAL</h2>
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Financial & Referral Collections Dept</p>
                    </div>
                    <div className="print-hospital-details" style={{ fontSize: '10px' }}>
                      <p>Chennai, India | Phone: +91 44 4890 3000</p>
                      <p>GSTIN: 33AABCM1234R1Z5</p>
                    </div>
                  </div>
                  <div className="print-doc-title" style={{ fontSize: '14px', margin: '12px 0' }}>OUTSIDE RADIOLOGY LAB COMMISSION BILL</div>

                  <div className="print-grid-2" style={{ gap: '10px', padding: '10px', marginBottom: '14px', fontSize: '12px' }}>
                    <div className="print-grid-item">
                      <div className="print-grid-label">PARTNER LABORATORY</div>
                      <div className="font-bold text-primary">{selectedInvoice.labName}</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">INVOICE ID / GENERATED DATE</div>
                      <div className="font-mono text-accent">{selectedInvoice.id} | {selectedInvoice.dateGenerated}</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">BILLING CYCLE</div>
                      <div className="font-semibold text-white">{selectedInvoice.billingCycle} ({selectedInvoice.startDate} to {selectedInvoice.endDate})</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">SETTLEMENT STATUS</div>
                      <div>
                        <span className={`badge badge-${selectedInvoice.status === 'Paid' ? 'success' : 'danger'}`}>
                          {selectedInvoice.status} {selectedInvoice.paymentDate ? `on ${selectedInvoice.paymentDate}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary counts */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, border: '1px solid var(--color-border)', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'center', fontSize: '12px' }}>
                    <div>
                      <span className="text-secondary block">Total Referrals</span>
                      <strong className="text-white text-md">{selectedInvoice.referralCount} Cases</strong>
                    </div>
                    <div>
                      <span className="text-secondary block">Total Billing Value</span>
                      <strong className="text-white text-md">₹{selectedInvoice.totalBillingValue.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className="text-accent block">Net Commission Due</span>
                      <strong className="text-accent text-md font-bold">₹{selectedInvoice.totalCommission.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  <p className="text-xxs text-muted" style={{ fontStyle: 'italic', textAlign: 'center', marginTop: 10 }}>This is a computer generated digital ledger invoice statement calculated based on agreed referral commissions terms.</p>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button className="btn btn-secondary w-full" onClick={() => setSelectedInvoice(null)}>Close Inspection</button>
                  {selectedInvoice.status === 'Unpaid' && (
                    <button className="btn btn-success w-full" onClick={() => handleSettleInvoice(selectedInvoice.id)} style={{ justifyContent: 'center' }}>
                      <Check size={14} style={{ marginRight: 6 }} /> Mark Paid & Settle Referrals
                    </button>
                  )}
                  <button className="btn btn-primary w-full" onClick={() => window.print()} style={{ justifyContent: 'center' }}>
                    <Printer size={14} style={{ marginRight: 6 }} /> Print Bill Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 350 }}>
                <Building size={40} className="text-muted mb-md" />
                <div className="empty-state-title">Invoice Information Panel</div>
                <p className="text-secondary text-xs" style={{ marginTop: '8px' }}>Select any compiled lab invoice from the ledger list on the left side to review referred cases statistics, print bills, or record payment collections.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Lab Modal */}
      {showAddLabModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Register Partner Radiology Lab</h2>
              <button className="btn-secondary" onClick={() => setShowAddLabModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddLab}>
              <div className="modal-body">
                <div className="form-group mb-md">
                  <label className="form-label">Laboratory Name</label>
                  <input className="form-control" required value={newLabName} onChange={e => setNewLabName(e.target.value)} placeholder="e.g. Apollo Diagnostics" />
                </div>
                
                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
                    <input className="form-control" required value={newLabContact} onChange={e => setNewLabContact(e.target.value)} placeholder="Name of representative" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" required value={newLabPhone} onChange={e => setNewLabPhone(e.target.value)} placeholder="Phone" />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Email Address</label>
                  <input className="form-control" type="email" required value={newLabEmail} onChange={e => setNewLabEmail(e.target.value)} placeholder="Email address" />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Physical Address</label>
                  <input className="form-control" required value={newLabAddress} onChange={e => setNewLabAddress(e.target.value)} placeholder="Location details" />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Commission Rate (%)</label>
                    <input className="form-control" type="number" min={10} max={50} required value={newLabRate} onChange={e => setNewLabRate(parseInt(e.target.value) || 20)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Cycle</label>
                    <select className="form-control" value={newLabCycle} onChange={e => setNewLabCycle(e.target.value)}>
                      <option>Weekly</option>
                      <option>15 Days</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddLabModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Complete Lab Registration</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Referral Modal */}
      {showReferModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Log Patient Outside Referral</h2>
              <button className="btn-secondary" onClick={() => setShowReferModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLogReferral}>
              <div className="modal-body">
                <div className="form-group mb-md">
                  <label className="form-label">Select Patient Profile</label>
                  <select className="form-control" value={refPatientId} onChange={e => setRefPatientId(e.target.value)} required>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Select Partner Radiology Lab</label>
                  <select className="form-control" value={refLabId} onChange={e => setRefLabId(e.target.value)} required>
                    <option value="">-- Choose Outside Lab --</option>
                    {labs.map(l => (
                      <option key={l.id} value={l.id}>{l.name} ({l.commissionRate}% Rate)</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label">Scan Type / Parameter</label>
                  <input className="form-control" required value={refScanType} onChange={e => setRefScanType(e.target.value)} placeholder="e.g. MRI Brain with contrast, HRCT chest" />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Total Amount Billed (₹)</label>
                    <input className="form-control" type="number" required value={refTotalAmount} onChange={e => setRefTotalAmount(parseInt(e.target.value) || 0)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Scan Date</label>
                    <input className="form-control" type="date" required value={refDate} onChange={e => setRefDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Log Referred Scan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutsideLabCommission;
