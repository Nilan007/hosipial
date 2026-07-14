import React, { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Calendar, Filter, FileText, CheckCircle2,
  Trash2, Landmark, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Users,
  ClipboardList, X
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  status: 'Settled' | 'Pending';
  dueDate?: string;
  referenceId?: string;
}

const CATEGORIES = [
  'Patient Consultation',
  'Pharmacy Sales',
  'Radiology/RIS Fees',
  'Laboratory/LIMS Fees',
  'Outside Lab Commission',
  'Staff Salary & Bonus',
  'Inventory Supply Purchase',
  'Hospital Rent',
  'Electricity & Utilities',
  'Equipment Repair',
  'Miscellaneous Expense'
];

const Accounting: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'All' | 'Receivables' | 'Payables'>('All');

  // Add txn form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState(5000);
  const [status, setStatus] = useState<'Settled' | 'Pending'>('Settled');
  const [dueDate, setDueDate] = useState('');

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTxns(data);
    } catch (e) {
      toast.error('Failed to load ledger records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountingData();
  }, []);

  const handleAddTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    const txnId = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTxn: Transaction = {
      id: txnId,
      date,
      category,
      description,
      type,
      amount: Number(amount),
      status,
      dueDate: status === 'Pending' ? dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined
    };

    try {
      await api.createTransaction(newTxn);
      toast.success('Ledger transaction added!');
      setShowAddModal(false);
      loadAccountingData();
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(CATEGORIES[0]);
      setDescription('');
      setType('Income');
      setAmount(5000);
      setStatus('Settled');
      setDueDate('');
    } catch (err) {
      toast.error('Failed to add transaction');
    }
  };

  const handleSettleTxn = async (txn: Transaction) => {
    try {
      await api.updateTransaction(txn.id, { status: 'Settled' });
      toast.success('Transaction marked as Settled!');
      loadAccountingData();
    } catch (e) {
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTxn = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this ledger entry?')) return;
    try {
      await api.deleteTransaction(id);
      toast.success('Transaction deleted');
      loadAccountingData();
    } catch (e) {
      toast.error('Failed to delete transaction');
    }
  };

  // Calculations
  const incomeList = txns.filter(t => t.type === 'Income' && t.status === 'Settled');
  const expenseList = txns.filter(t => t.type === 'Expense' && t.status === 'Settled');

  const totalIncome = incomeList.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseList.reduce((acc, t) => acc + t.amount, 0);
  const cashOnHand = totalIncome - totalExpense;

  const receivablesList = txns.filter(t => t.type === 'Income' && t.status === 'Pending');
  const payablesList = txns.filter(t => t.type === 'Expense' && t.status === 'Pending');

  const totalReceivables = receivablesList.reduce((acc, t) => acc + t.amount, 0);
  const totalPayables = payablesList.reduce((acc, t) => acc + t.amount, 0);

  // Filter list based on sub-tabs
  const displayList = txns.filter(t => {
    if (activeSubTab === 'Receivables') return t.type === 'Income' && t.status === 'Pending';
    if (activeSubTab === 'Payables') return t.type === 'Expense' && t.status === 'Pending';
    return true; // All
  });

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px var(--color-primary-glow)'
            }}>
              <Landmark size={18} color="white" />
            </span>
            <span className="gradient-text">Hospital Accounts &amp; P&amp;L Console</span>
          </h1>
          <p className="page-subtitle">Hospital ledger audits, income vs operational expenses tracking, accounts receivable &amp; vendor accounts payable.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadAccountingData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animated-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ gap: 6 }}>
            <Plus size={15} /> Log Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="stats-grid mb-lg" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--color-success)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Cash on Hand (Balance)</div>
            <div className="kpi-value">₹{cashOnHand.toLocaleString('en-IN')}</div>
            <span className="kpi-change up">Operational net profit</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #6b7280' }}>
          <div className="kpi-icon" style={{ background: 'rgba(107,114,128,0.12)', color: '#4b5563' }}>
            <TrendingDown size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Total Expenses Billed</div>
            <div className="kpi-value">₹{totalExpense.toLocaleString('en-IN')}</div>
            <span className="kpi-change down">Salaries, supplies, &amp; utilities</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-purple)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--color-purple)' }}>
            <ArrowUpRight size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Accounts Receivable</div>
            <div className="kpi-value">₹{totalReceivables.toLocaleString('en-IN')}</div>
            <span className="kpi-change up" style={{ color: 'var(--color-purple)' }}>Uncollected patient bills</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div className="kpi-icon" style={{ background: 'rgba(220,20,60,0.12)', color: 'var(--color-primary)' }}>
            <ArrowDownRight size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Accounts Payable</div>
            <div className="kpi-value">₹{totalPayables.toLocaleString('en-IN')}</div>
            <span className="kpi-change down" style={{ color: 'var(--color-primary)' }}>Vendor supply dues pending</span>
          </div>
        </div>
      </div>

      {/* Main Ledger Section */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Ledger Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
          background: 'linear-gradient(135deg, #fff 0%, var(--color-bg-tertiary) 100%)'
        }}>
          <div>
            <h3 className="card-title" style={{ margin: 0 }}>Double-Entry Bookkeeping Ledger</h3>
            <p className="card-subtitle" style={{ margin: 0 }}>Real-time logs of patient services revenue and outpatient operational spending flow.</p>
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--color-bg-tertiary)', padding: 4, borderRadius: 8 }}>
            {(['All', 'Receivables', 'Payables'] as const).map(tab => (
              <button
                key={tab}
                className={`tab ${activeSubTab === tab ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab)}
                style={{
                  fontSize: 12, fontWeight: 700, padding: '5px 12px', border: 'none',
                  background: activeSubTab === tab ? 'var(--gradient-primary)' : 'transparent',
                  color: activeSubTab === tab ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: 6, cursor: 'pointer'
                }}
              >
                {tab === 'All' ? 'All Ledger' : tab === 'Receivables' ? `Receivables (${receivablesList.length})` : `Payables (${payablesList.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Voucher ID</th>
                <th>Date</th>
                <th>Classification Category</th>
                <th>Description Summary</th>
                <th>Transaction Type</th>
                <th>Disbursed Status</th>
                <th>Amount (₹)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(txn => (
                <tr key={txn.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>
                      {txn.id}
                    </span>
                  </td>
                  <td>{txn.date}</td>
                  <td>
                    <span style={{
                      fontWeight: 600, fontSize: 11,
                      background: txn.type === 'Income' ? 'rgba(22,163,74,0.08)' : 'rgba(220,20,60,0.06)',
                      color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)',
                      padding: '3px 10px', borderRadius: 20
                    }}>
                      {txn.category}
                    </span>
                  </td>
                  <td className="text-primary font-semibold">{txn.description}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)'
                    }}>
                      {txn.type === 'Income' ? 'CR - Credit (In)' : 'DR - Debit (Out)'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${txn.status === 'Settled' ? 'success' : 'warning'}`}>
                      {txn.status === 'Settled' ? '● Settled' : '● Pending'}
                    </span>
                    {txn.status === 'Pending' && txn.dueDate && (
                      <span style={{ fontSize: 10, display: 'block', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        Due: {txn.dueDate}
                      </span>
                    )}
                  </td>
                  <td>
                    <strong style={{
                      fontSize: 14,
                      color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)'
                    }}>
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {txn.status === 'Pending' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px', color: 'var(--color-success)' }}
                          onClick={() => handleSettleTxn(txn)}
                        >
                          <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Settle Account
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDeleteTxn(txn.id)}
                        title="Delete Voucher"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayList.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div style={{ padding: '48px 0', textAlign: 'center' }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(220,20,60,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <ClipboardList size={24} color="var(--color-primary)" />
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                        No Transactions Billed
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                        Create a voucher transaction or adjust tab filter settings to query transactions.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 480, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '20px 24px 18px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255,255,255,0.20)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid rgba(255,255,255,0.30)'
                  }}>
                    <Landmark size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      Create Ledger Voucher
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      Log operational hospital transactions directly
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
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

            <div className="modal-body" style={{ padding: 24 }}>
              <form onSubmit={handleAddTxn}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Transaction Type</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      className={`btn w-full ${type === 'Income' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setType('Income')}
                    >
                      CR - Credit (Income)
                    </button>
                    <button
                      type="button"
                      className={`btn w-full ${type === 'Expense' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ justifyContent: 'center' }}
                      onClick={() => setType('Expense')}
                    >
                      DR - Debit (Expense)
                    </button>
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Date</label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Classification Category</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Amount (₹)</label>
                  <input
                    type="number"
                    min={1}
                    className="form-control"
                    required
                    value={amount}
                    onChange={e => setAmount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Voucher Details / Notes</label>
                  <textarea
                    className="form-control"
                    style={{ height: 60 }}
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter short description of this transaction..."
                  />
                </div>

                <div className="form-group mb-lg">
                  <label className="form-label" style={{ fontWeight: 700 }}>Settlement Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={e => setStatus(e.target.value as 'Settled' | 'Pending')}
                  >
                    <option value="Settled">Settled (Paid/Cleared)</option>
                    <option value="Pending">Pending (Receivable/Payable)</option>
                  </select>
                </div>

                {status === 'Pending' && (
                  <div className="form-group mb-lg" style={{ animation: 'slideUp 0.15s ease' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Complete Voucher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
