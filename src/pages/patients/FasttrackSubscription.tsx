import React, { useEffect, useState } from 'react';
import {
  Sparkles, Shield, User, Clock, CreditCard, Search,
  Users, CheckCircle, Calendar, TrendingUp, Plus, AlertCircle,
  RefreshCw, X, Star, Zap, ChevronRight, Crown
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const FasttrackSubscription: React.FC = () => {
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [planDuration, setPlanDuration] = useState('30');
  const [pricePaid, setPricePaid] = useState(999);
  const [autoRenew, setAutoRenew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients();
      setPatientsList(data);
      if (data.length > 0 && !selectedPatientId) {
        setSelectedPatientId(data[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) { toast.error('Please select a patient profile'); return; }

    const patient = patientsList.find(p => p.id === selectedPatientId);
    if (!patient) return;

    setSubmitting(true);
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + parseInt(planDuration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const subscriptionData = {
      fasttrackSubscription: {
        status: 'Active',
        planName: 'VIP Fasttrack Monthly Pass',
        pricePaid,
        startDate,
        endDate,
        priorityTier: 'High',
        autoRenew
      }
    };

    try {
      await api.updatePatient(patient.id, subscriptionData);
      const invoiceId = `INV-${Math.floor(20000 + Math.random() * 80000)}`;
      const subBill = {
        id: invoiceId,
        patientId: patient.id,
        patientName: patient.name,
        date: startDate,
        type: 'OP',
        items: [{ desc: `VIP Fasttrack Priority Pass (${startDate} to ${endDate})`, qty: 1, rate: pricePaid, amount: pricePaid }],
        subtotal: pricePaid,
        gst: Math.round(pricePaid * 0.09),
        discount: 0,
        total: pricePaid + Math.round(pricePaid * 0.09),
        paid: pricePaid + Math.round(pricePaid * 0.09),
        balance: 0,
        status: 'Paid',
        payment: paymentMethod
      };
      await api.createBill(subBill);
      toast.success(`🌟 VIP Fasttrack activated for ${patient.name}!`);
      setShowActivationModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error('Error activating subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAutoRenew = async (patient: any) => {
    try {
      await api.updatePatient(patient.id, {
        fasttrackSubscription: { ...patient.fasttrackSubscription, autoRenew: !patient.fasttrackSubscription.autoRenew }
      });
      toast.success(`Auto-renew updated for ${patient.name}`);
      loadData();
    } catch (e) { toast.error('Failed to toggle auto-renew'); }
  };

  const handleCancelSubscription = async (patient: any) => {
    if (!window.confirm(`Cancel Fasttrack VIP pass for ${patient.name}?`)) return;
    try {
      await api.updatePatient(patient.id, {
        fasttrackSubscription: { status: 'Inactive', planName: '', pricePaid: 0, startDate: '', endDate: '', priorityTier: 'Normal', autoRenew: false }
      });
      toast.success(`Subscription cancelled for ${patient.name}`);
      loadData();
    } catch (e) { toast.error('Failed to cancel subscription'); }
  };

  const subscribers = patientsList.filter(p => p.fasttrackSubscription?.status === 'Active');
  const totalSubscribersCount = subscribers.length;
  const monthlyRecurringRevenue = subscribers.reduce((acc, s) => acc + (s.fasttrackSubscription.pricePaid || 999), 0);
  const filteredSubscribers = subscribers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.includes(searchTerm)
  );

  const selectedPatient = patientsList.find(p => p.id === selectedPatientId);

  return (
    <div className="page-content">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--color-primary-glow)'
            }}>
              <Crown size={18} color="white" />
            </span>
            <span className="gradient-text">Patient Fasttrack VIP Console</span>
          </h1>
          <p className="page-subtitle">
            Subscribed patients bypass queue waits across Doctor Consultations, Laboratory, Radiology &amp; Pharmacy.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowActivationModal(true)}
            style={{ gap: 8, paddingLeft: 20, paddingRight: 20 }}
          >
            <Plus size={16} />
            Activate VIP Pass
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="stats-grid mb-lg" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-purple)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--color-purple)' }}>
            <Users size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Active VIP Subscribers</div>
            <div className="kpi-value">{totalSubscribersCount} Patients</div>
            <span className="kpi-change up"><TrendingUp size={12} /> Prioritized across all clinics</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--color-success)' }}>
            <CreditCard size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Monthly Recurring Revenue (MRR)</div>
            <div className="kpi-value">₹{monthlyRecurringRevenue.toLocaleString('en-IN')}</div>
            <span className="kpi-change up"><TrendingUp size={12} /> Premium service earnings</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(220,20,60,0.12)', color: 'var(--color-primary)' }}>
            <Zap size={22} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Queue Priority Tier</div>
            <div className="kpi-value">Tier-1 High</div>
            <span className="kpi-change up" style={{ background: 'rgba(220,20,60,0.12)', color: 'var(--color-primary)' }}>
              Instant Routing Enabled
            </span>
          </div>
        </div>
      </div>

      {/* ── Full-Width Subscriber Directory ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table Header Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(135deg, #fff 0%, var(--color-bg-tertiary) 100%)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(220,20,60,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Star size={16} color="var(--color-primary)" />
              </div>
              <div>
                <h3 className="card-title" style={{ margin: 0 }}>VIP Subscriber Directory</h3>
                <p className="card-subtitle" style={{ margin: 0 }}>
                  {totalSubscribersCount} active membership{totalSubscribersCount !== 1 ? 's' : ''} — priority-routed across all clinical queues
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="search-bar" style={{ width: 280 }}>
              <Search size={14} color="var(--color-text-muted)" />
              <input
                placeholder="Search by MRN or Patient Name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowActivationModal(true)}
              style={{ whiteSpace: 'nowrap', gap: 6 }}
            >
              <Plus size={13} /> Add VIP Patient
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Patient Name</th>
                <th>Plan</th>
                <th>Validity Range</th>
                <th>Amount Paid</th>
                <th>Auto-Renew</th>
                <th>Priority Tier</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map(patient => (
                <tr key={patient.id}>
                  <td>
                    <span style={{
                      fontFamily: 'monospace', fontWeight: 700,
                      color: 'var(--color-primary)', fontSize: 12
                    }}>
                      {patient.id}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)', flexShrink: 0 }}>
                        {patient.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
                          {patient.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {patient.age} Yrs / {patient.gender}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      background: 'rgba(124,58,237,0.10)',
                      color: 'var(--color-purple)',
                      padding: '3px 10px', borderRadius: 20
                    }}>
                      {patient.fasttrackSubscription.planName || 'VIP Monthly Pass'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                      <Calendar size={12} color="var(--color-primary)" />
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {patient.fasttrackSubscription.startDate}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {patient.fasttrackSubscription.endDate}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>
                      ₹{(patient.fasttrackSubscription.pricePaid || 999).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAutoRenew(patient)}
                      className={`badge badge-${patient.fasttrackSubscription.autoRenew ? 'success' : 'gray'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle auto-renewal"
                    >
                      {patient.fasttrackSubscription.autoRenew ? '● Enabled' : '● Disabled'}
                    </button>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ gap: 4 }}>
                      <Crown size={10} />
                      {patient.fasttrackSubscription.priorityTier || 'High'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: 11, padding: '4px 12px' }}
                      onClick={() => handleCancelSubscription(patient)}
                    >
                      Cancel Pass
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubscribers.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(220,20,60,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <Crown size={24} color="var(--color-primary)" />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        {searchTerm ? 'No subscribers match your search' : 'No VIP Subscribers Yet'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 16 }}>
                        {searchTerm ? 'Try a different name or MRN.' : 'Activate the first VIP Priority Pass to get started.'}
                      </div>
                      {!searchTerm && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowActivationModal(true)}>
                          <Plus size={13} /> Activate First VIP Pass
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary bar */}
        {filteredSubscribers.length > 0 && (
          <div style={{
            padding: '12px 24px',
            borderTop: '1px solid var(--color-border)',
            background: 'var(--color-bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              Showing <strong style={{ color: 'var(--color-text-primary)' }}>{filteredSubscribers.length}</strong> of{' '}
              <strong style={{ color: 'var(--color-text-primary)' }}>{totalSubscribersCount}</strong> VIP subscribers
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>
              Total MRR:{' '}
              <strong style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                ₹{monthlyRecurringRevenue.toLocaleString('en-IN')}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          VIP ACTIVATION MODAL
      ═══════════════════════════════════════════════ */}
      {showActivationModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowActivationModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 520, borderRadius: 20, overflow: 'hidden' }}>
            {/* Modal Header — Gradient Banner */}
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '20px 24px 18px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative blobs */}
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)'
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: 60,
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)'
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(255,255,255,0.30)'
                  }}>
                    <Crown size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      Activate VIP Fasttrack Pass
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                      Provision a 30-day priority membership for a patient
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowActivationModal(false)}
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

            {/* Modal Body — Form */}
            <div className="modal-body" style={{ padding: 24 }}>
              <form onSubmit={handleSubscribe}>
                {/* Patient Selector */}
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Select Patient Profile
                  </label>
                  <select
                    className="form-control"
                    value={selectedPatientId}
                    onChange={e => setSelectedPatientId(e.target.value)}
                    required
                  >
                    <option value="">— Choose a registered patient —</option>
                    {patientsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {p.fasttrackSubscription?.status || 'Inactive'}
                      </option>
                    ))}
                  </select>
                  {/* Selected patient info chip */}
                  {selectedPatient && (
                    <div style={{
                      marginTop: 8, padding: '8px 12px',
                      background: 'rgba(220,20,60,0.05)',
                      border: '1px solid rgba(220,20,60,0.12)',
                      borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)', fontSize: 10 }}>
                        {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                          {selectedPatient.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {selectedPatient.id} · {selectedPatient.age} yrs · {selectedPatient.gender}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: selectedPatient.fasttrackSubscription?.status === 'Active'
                          ? 'rgba(22,163,74,0.12)' : 'rgba(107,114,128,0.10)',
                        color: selectedPatient.fasttrackSubscription?.status === 'Active'
                          ? 'var(--color-success)' : 'var(--color-text-muted)'
                      }}>
                        {selectedPatient.fasttrackSubscription?.status || 'Inactive'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Plan Card */}
                <div style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: 'block' }}>
                    Subscription Plan
                  </label>
                  <div style={{
                    border: '2px solid var(--color-primary)',
                    background: 'rgba(220,20,60,0.04)',
                    borderRadius: 12, padding: 14,
                    position: 'relative', overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', top: -10, right: -10,
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(220,20,60,0.07)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Crown size={15} color="var(--color-primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>
                          VIP Priority Pass — 30 Days
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-primary)' }}>₹{pricePaid}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                      ✦ High priority queue — Doctor Consultations &nbsp;&nbsp;
                      ✦ Express Lab &amp; Radiology access &nbsp;&nbsp;
                      ✦ Priority Pharmacy dispense
                    </div>
                  </div>
                </div>

                {/* Billing & Payment Row */}
                <div className="form-grid-2" style={{ marginBottom: 18 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Billing Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricePaid}
                      onChange={e => setPricePaid(parseInt(e.target.value) || 999)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Method</label>
                    <select
                      className="form-control"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                    >
                      <option value="Card">Credit / Debit Card</option>
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Cash">Cash</option>
                      <option value="Insurance">Insurance / TPA</option>
                    </select>
                  </div>
                </div>

                {/* Auto-Renew Toggle */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10, cursor: 'pointer', marginBottom: 20
                }}>
                  <input
                    type="checkbox"
                    id="autoRenew"
                    style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    checked={autoRenew}
                    onChange={e => setAutoRenew(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      Enable Monthly Auto-Renewal
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Patient will be auto-billed each month for uninterrupted priority access
                    </div>
                  </div>
                </label>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setShowActivationModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center', gap: 8 }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Processing…</>
                    ) : (
                      <><Crown size={15} /> Activate VIP Fasttrack Pass</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FasttrackSubscription;
