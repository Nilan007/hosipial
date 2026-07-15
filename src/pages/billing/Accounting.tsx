import React, { useEffect, useState } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Calendar, Filter, FileText, CheckCircle2,
  Trash2, Landmark, Clock, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, Users,
  ClipboardList, X, Edit3, ArrowLeftRight, Check, Eye, Download, Info, CheckCircle
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
  partyName?: string;
  paymentMethod?: string;
  bankAccount?: string;
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

const BANK_ACCOUNTS = ['HDFC Main', 'SBI Operations', 'Petty Cash Drawer'];
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque'];

// Initial opening balances
const BANK_OPENING_BALANCES: Record<string, number> = {
  'HDFC Main': 500000,
  'SBI Operations': 250000,
  'Petty Cash Drawer': 15000
};

const Accounting: React.FC = () => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'GL' | 'AR' | 'AP' | 'DayBook' | 'Banks'>('GL');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Form states for Add/Edit
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState(5000);
  const [status, setStatus] = useState<'Settled' | 'Pending'>('Settled');
  const [dueDate, setDueDate] = useState('');
  const [partyName, setPartyName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [bankAccount, setBankAccount] = useState(BANK_ACCOUNTS[0]);
  const [referenceId, setReferenceId] = useState('');

  // Contra transfer state
  const [showContraModal, setShowContraModal] = useState(false);
  const [contraFrom, setContraFrom] = useState(BANK_ACCOUNTS[0]);
  const [contraTo, setContraTo] = useState(BANK_ACCOUNTS[1]);
  const [contraAmount, setContraAmount] = useState(10000);

  // General Ledger drill-down state
  const [selectedGLCategory, setSelectedGLCategory] = useState<string | null>(null);

  const loadAccountingData = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions();
      setTxns(data);
    } catch (e) {
      toast.error('Failed to load accounting ledger records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountingData();
  }, []);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(CATEGORIES[0]);
    setDescription('');
    setType('Income');
    setAmount(5000);
    setStatus('Settled');
    setDueDate('');
    setPartyName('');
    setPaymentMethod(PAYMENT_METHODS[0]);
    setBankAccount(BANK_ACCOUNTS[0]);
    setReferenceId('');
  };

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
      dueDate: status === 'Pending' ? dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      partyName: partyName.trim() || 'General Customer',
      paymentMethod: status === 'Settled' ? paymentMethod : 'Pending',
      bankAccount: status === 'Settled' ? bankAccount : 'Pending',
      referenceId: referenceId.trim() || undefined
    };

    try {
      await api.createTransaction(newTxn);
      toast.success('Accounts voucher transaction recorded!');
      setShowAddModal(false);
      resetForm();
      loadAccountingData();
    } catch (err) {
      toast.error('Failed to save transaction');
    }
  };

  const handleOpenEditModal = (txn: Transaction) => {
    setSelectedTxn(txn);
    setDate(txn.date);
    setCategory(txn.category);
    setDescription(txn.description);
    setType(txn.type);
    setAmount(txn.amount);
    setStatus(txn.status);
    setDueDate(txn.dueDate || '');
    setPartyName(txn.partyName || '');
    setPaymentMethod(txn.paymentMethod || PAYMENT_METHODS[0]);
    setBankAccount(txn.bankAccount || BANK_ACCOUNTS[0]);
    setReferenceId(txn.referenceId || '');
    setShowEditModal(true);
  };

  const handleEditTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    const updatedTxn: Partial<Transaction> = {
      date,
      category,
      description,
      type,
      amount: Number(amount),
      status,
      dueDate: status === 'Pending' ? dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      partyName: partyName.trim() || 'General Customer',
      paymentMethod: status === 'Settled' ? paymentMethod : 'Pending',
      bankAccount: status === 'Settled' ? bankAccount : 'Pending',
      referenceId: referenceId.trim() || undefined
    };

    try {
      await api.updateTransaction(selectedTxn.id, updatedTxn);
      toast.success('Accounts voucher updated successfully!');
      setShowEditModal(false);
      setSelectedTxn(null);
      loadAccountingData();
    } catch (err) {
      toast.error('Failed to update transaction');
    }
  };

  const handleOpenSettleModal = (txn: Transaction) => {
    setSelectedTxn(txn);
    setPaymentMethod(PAYMENT_METHODS[0]);
    setBankAccount(BANK_ACCOUNTS[0]);
    setReferenceId('');
    setShowSettleModal(true);
  };

  const handleSettleTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxn) return;
    const updateBody = {
      status: 'Settled',
      paymentMethod,
      bankAccount,
      referenceId: referenceId.trim() || `SETTLE-${Date.now().toString().slice(-6)}`
    };

    try {
      await api.updateTransaction(selectedTxn.id, updateBody);
      toast.success('Voucher settled and account balances updated!');
      setShowSettleModal(false);
      setSelectedTxn(null);
      loadAccountingData();
    } catch (e) {
      toast.error('Failed to settle voucher');
    }
  };

  const handleDeleteTxn = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this accounts voucher? This will immediately recalculate all accounts.')) return;
    try {
      await api.deleteTransaction(id);
      toast.success('Voucher deleted and accounts updated');
      loadAccountingData();
    } catch (e) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleContraTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contraFrom === contraTo) {
      toast.error('Source and Destination bank accounts must be different!');
      return;
    }
    const txnIdOut = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const txnIdIn = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;

    const dateStr = new Date().toISOString().split('T')[0];
    const amountVal = Number(contraAmount);

    // Create both Debit and Credit contra vouchers
    const contraOut: Transaction = {
      id: txnIdOut,
      date: dateStr,
      category: 'Miscellaneous Expense',
      description: `Contra Transfer: Moved to ${contraTo}`,
      type: 'Expense',
      amount: amountVal,
      status: 'Settled',
      partyName: 'Internal Transfer',
      paymentMethod: 'Bank Transfer',
      bankAccount: contraFrom,
      referenceId: 'CONTRA-OUT'
    };

    const contraIn: Transaction = {
      id: txnIdIn,
      date: dateStr,
      category: 'Outside Lab Commission', // Treat as general income categories or simple counter-entry
      description: `Contra Transfer: Received from ${contraFrom}`,
      type: 'Income',
      amount: amountVal,
      status: 'Settled',
      partyName: 'Internal Transfer',
      paymentMethod: 'Bank Transfer',
      bankAccount: contraTo,
      referenceId: 'CONTRA-IN'
    };

    try {
      await api.createTransaction(contraOut);
      await api.createTransaction(contraIn);
      toast.success('Contra Bank Transfer Vouchers Recorded!');
      setShowContraModal(false);
      loadAccountingData();
    } catch (e) {
      toast.error('Failed to complete contra transfer');
    }
  };

  // ────────────────────────────────────────────────────────
  // CALCULATION LOGIC
  // ────────────────────────────────────────────────────────

  // Cash on hand & general balances
  const settledTxns = txns.filter(t => t.status === 'Settled');
  const totalIncome = settledTxns.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = settledTxns.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const cashOnHand = totalIncome - totalExpense;

  // AR & AP totals
  const arList = txns.filter(t => t.type === 'Income' && t.status === 'Pending');
  const apList = txns.filter(t => t.type === 'Expense' && t.status === 'Pending');
  const totalReceivables = arList.reduce((s, t) => s + t.amount, 0);
  const totalPayables = apList.reduce((s, t) => s + t.amount, 0);

  // Bank accounts calculation
  const bankDetails = BANK_ACCOUNTS.map(bank => {
    const opening = BANK_OPENING_BALANCES[bank] || 0;
    const deposits = settledTxns
      .filter(t => t.bankAccount === bank && t.type === 'Income')
      .reduce((s, t) => s + t.amount, 0);
    const withdrawals = settledTxns
      .filter(t => t.bankAccount === bank && t.type === 'Expense')
      .reduce((s, t) => s + t.amount, 0);
    const currentBalance = opening + deposits - withdrawals;

    return {
      name: bank,
      opening,
      deposits,
      withdrawals,
      balance: currentBalance
    };
  });

  // Aging function
  const getAgingDays = (dueDateStr?: string) => {
    if (!dueDateStr) return 0;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diff = now - due;
    if (diff <= 0) return 0;
    return Math.floor(diff / (24 * 60 * 60 * 1000));
  };

  const getAgingBucket = (dueDateStr?: string) => {
    const days = getAgingDays(dueDateStr);
    if (days <= 0) return 'Current';
    if (days <= 30) return '1-30 Days';
    if (days <= 60) return '31-60 Days';
    if (days <= 90) return '61-90 Days';
    return '90+ Days';
  };

  // Aging distribution helper
  const getAgingDistribution = (list: Transaction[]) => {
    const distribution = {
      'Current': 0,
      '1-30 Days': 0,
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0
    };
    list.forEach(item => {
      const bucket = getAgingBucket(item.dueDate);
      distribution[bucket] += item.amount;
    });
    return distribution;
  };

  const arAging = getAgingDistribution(arList);
  const apAging = getAgingDistribution(apList);

  // General Ledger categorization groups
  const getGLData = () => {
    const ledgerGroups: Record<string, { category: string, type: string, debit: number, credit: number, net: number, count: number }> = {};
    
    // Seed all default categories
    CATEGORIES.forEach(cat => {
      const isExpense = ['Staff Salary & Bonus', 'Inventory Supply Purchase', 'Hospital Rent', 'Electricity & Utilities', 'Equipment Repair', 'Miscellaneous Expense'].includes(cat);
      ledgerGroups[cat] = {
        category: cat,
        type: isExpense ? 'Debit (DR)' : 'Credit (CR)',
        debit: 0,
        credit: 0,
        net: 0,
        count: 0
      };
    });

    // Populate with real transactions
    settledTxns.forEach(t => {
      if (!ledgerGroups[t.category]) {
        ledgerGroups[t.category] = {
          category: t.category,
          type: t.type === 'Income' ? 'Credit (CR)' : 'Debit (DR)',
          debit: 0,
          credit: 0,
          net: 0,
          count: 0
        };
      }
      const group = ledgerGroups[t.category];
      if (t.type === 'Income') {
        group.credit += t.amount;
      } else {
        group.debit += t.amount;
      }
      group.count += 1;
    });

    // Calculate net values (Credit - Debit)
    return Object.values(ledgerGroups).map(g => {
      g.net = g.credit - g.debit;
      return g;
    });
  };

  const glData = getGLData();

  // Day Book calculations
  const getDayBookList = () => {
    // Sort settled transactions by date ascending to calculate running balance accurately
    const sorted = [...settledTxns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    
    return sorted.map(t => {
      if (t.type === 'Income') {
        currentBalance += t.amount;
      } else {
        currentBalance -= t.amount;
      }
      return {
        ...t,
        runningBalance: currentBalance
      };
    }).reverse(); // Reverse to display newest first
  };

  const dayBookList = getDayBookList();

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #0284c7, #0369a1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(2,132,199,0.25)'
            }}>
              <Landmark size={18} color="white" />
            </span>
            <span className="gradient-text">MediCore Accounts Executive Suite</span>
          </h1>
          <p className="page-subtitle">Unified General Ledger, Accounts Receivable, Accounts Payable aging sheets, Bank registries, and double-entry books.</p>
        </div>
        <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={loadAccountingData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animated-spin' : ''} /> Refresh
          </button>
          <button className="btn btn-secondary" onClick={() => setShowContraModal(true)} style={{ gap: 6 }}>
            <ArrowLeftRight size={14} /> Contra Bank Entry
          </button>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} style={{ gap: 6 }}>
            <Plus size={15} /> Log Accounts Voucher
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="stats-grid mb-lg" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
            <TrendingUp size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Cash on Hand (Current Balance)</div>
            <div className="kpi-value">₹{cashOnHand.toLocaleString('en-IN')}</div>
            <span className="kpi-change up">All accounts net profit</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
            <ArrowUpRight size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Accounts Receivable (AR)</div>
            <div className="kpi-value">₹{totalReceivables.toLocaleString('en-IN')}</div>
            <span className="kpi-change up" style={{ color: '#8b5cf6' }}>{arList.length} outstanding client bills</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #f97316' }}>
          <div className="kpi-icon" style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316' }}>
            <ArrowDownRight size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Accounts Payable (AP)</div>
            <div className="kpi-value">₹{totalPayables.toLocaleString('en-IN')}</div>
            <span className="kpi-change down" style={{ color: '#f97316' }}>{apList.length} outstanding supplier invoices</span>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeft: '4px solid #06b6d4' }}>
          <div className="kpi-icon" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
            <Landmark size={20} />
          </div>
          <div className="kpi-body">
            <div className="kpi-label">Reconciled Bank Assets</div>
            <div className="kpi-value">₹{bankDetails.reduce((s, b) => s + b.balance, 0).toLocaleString('en-IN')}</div>
            <span className="kpi-change up" style={{ color: '#06b6d4' }}>Reconciliation online</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector Navigation Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 24, gap: 14 }}>
        <button
          className={`tab-btn ${activeTab === 'GL' ? 'active' : ''}`}
          onClick={() => { setActiveTab('GL'); setSelectedGLCategory(null); }}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'GL' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            color: activeTab === 'GL' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '14px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <FileText size={15} /> General Ledger
        </button>
        <button
          className={`tab-btn ${activeTab === 'AR' ? 'active' : ''}`}
          onClick={() => setActiveTab('AR')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'AR' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            color: activeTab === 'AR' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '14px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <ArrowUpRight size={15} /> Receivables (AR)
          {arList.length > 0 && <span style={{ background: '#8b5cf6', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, marginLeft: 4 }}>{arList.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'AP' ? 'active' : ''}`}
          onClick={() => setActiveTab('AP')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'AP' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            color: activeTab === 'AP' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '14px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <ArrowDownRight size={15} /> Payables (AP)
          {apList.length > 0 && <span style={{ background: '#f97316', color: '#fff', fontSize: 10, padding: '2px 6px', borderRadius: 10, marginLeft: 4 }}>{apList.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'DayBook' ? 'active' : ''}`}
          onClick={() => setActiveTab('DayBook')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'DayBook' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            color: activeTab === 'DayBook' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '14px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <ClipboardList size={15} /> Cash/Day Book
        </button>
        <button
          className={`tab-btn ${activeTab === 'Banks' ? 'active' : ''}`}
          onClick={() => setActiveTab('Banks')}
          style={{
            background: 'none', border: 'none', borderBottom: activeTab === 'Banks' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
            color: activeTab === 'Banks' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '14px', fontWeight: 700, padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <Landmark size={15} /> Bank Ledgers
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. GENERAL LEDGER TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'GL' && (
        <div>
          {selectedGLCategory ? (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedGLCategory(null)} style={{ marginBottom: 10 }}>
                    ← Back to Accounts List
                  </button>
                  <h3 className="card-title">{selectedGLCategory} Account History</h3>
                  <p className="card-subtitle">Showing all settled vouchers in this general ledger category.</p>
                </div>
                <div style={{
                  fontSize: 16, fontWeight: 800, padding: '8px 16px', borderRadius: 8,
                  background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                  color: settledTxns.filter(t => t.category === selectedGLCategory).reduce((s, t) => s + (t.type === 'Income' ? t.amount : -t.amount), 0) >= 0 ? 'var(--color-success)' : 'var(--color-primary)'
                }}>
                  Net Running Balance: ₹{settledTxns.filter(t => t.category === selectedGLCategory).reduce((s, t) => s + (t.type === 'Income' ? t.amount : -t.amount), 0).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="table-container" style={{ border: '1px solid var(--color-border)' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Voucher ID</th>
                      <th>Date</th>
                      <th>Party Name</th>
                      <th>Description</th>
                      <th>Reference No</th>
                      <th>Type</th>
                      <th>Bank Routed</th>
                      <th>Amount (₹)</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settledTxns.filter(t => t.category === selectedGLCategory).map(txn => (
                      <tr key={txn.id}>
                        <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txn.id}</span></td>
                        <td>{txn.date}</td>
                        <td>{txn.partyName || 'General Client'}</td>
                        <td>{txn.description}</td>
                        <td>{txn.referenceId || 'N/A'}</td>
                        <td style={{ fontWeight: 700, color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                          {txn.type === 'Income' ? 'Credit (CR)' : 'Debit (DR)'}
                        </td>
                        <td>{txn.bankAccount} ({txn.paymentMethod})</td>
                        <td><strong style={{ color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)' }}>₹{txn.amount.toLocaleString('en-IN')}</strong></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleOpenEditModal(txn)}><Edit3 size={12} /></button>
                            <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTxn(txn.id)}><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {settledTxns.filter(t => t.category === selectedGLCategory).length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>No ledger vouchers logged under this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                <h3 className="card-title">Hospital General Ledger Accounts</h3>
                <p className="card-subtitle">Real-time compilation of double-entry ledger summaries categorized by operational codes.</p>
              </div>

              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Account Category</th>
                      <th>Account Type</th>
                      <th>Total Debits (DR)</th>
                      <th>Total Credits (CR)</th>
                      <th>Net Balance (CR - DR)</th>
                      <th>Voucher Count</th>
                      <th style={{ textAlign: 'right' }}>Auditing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glData.map(group => (
                      <tr key={group.category} hover-style="true">
                        <td><strong>{group.category}</strong></td>
                        <td>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12,
                            background: group.type === 'Debit (DR)' ? 'rgba(220,20,60,0.06)' : 'rgba(16,185,129,0.06)',
                            color: group.type === 'Debit (DR)' ? 'var(--color-primary)' : 'var(--color-success)'
                          }}>
                            {group.type}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{group.debit.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>₹{group.credit.toLocaleString('en-IN')}</td>
                        <td>
                          <strong style={{ color: group.net >= 0 ? 'var(--color-success)' : 'var(--color-primary)' }}>
                            ₹{group.net.toLocaleString('en-IN')}
                          </strong>
                        </td>
                        <td>{group.count} vouchers</td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedGLCategory(group.category)}>
                            <Eye size={12} style={{ marginRight: 4 }} /> View Vouchers
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. ACCOUNTS RECEIVABLE (AR) TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'AR' && (
        <div>
          {/* Aging metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
            {Object.entries(arAging).map(([bucket, total]) => (
              <div key={bucket} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6, borderLeft: '3.5px solid #8b5cf6' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{bucket} Receivables</span>
                <strong style={{ fontSize: 18, color: total > 0 ? '#8b5cf6' : 'var(--color-text-muted)' }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title">Accounts Receivable Aging Sheet</h3>
              <p className="card-subtitle">Pending patient, corporate insurance claims, and panel billing collections awaiting settlement.</p>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Voucher ID</th>
                    <th>Due Date</th>
                    <th>Aging Status</th>
                    <th>Patient/Client Name</th>
                    <th>Clinical Category</th>
                    <th>Description Notes</th>
                    <th>Amount (₹)</th>
                    <th style={{ textAlign: 'right' }}>Voucher Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arList.map(txn => (
                    <tr key={txn.id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txn.id}</span></td>
                      <td>{txn.dueDate || 'N/A'}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12,
                          background: getAgingDays(txn.dueDate) > 0 ? 'rgba(220,20,60,0.06)' : 'rgba(16,185,129,0.06)',
                          color: getAgingDays(txn.dueDate) > 0 ? 'var(--color-primary)' : 'var(--color-success)'
                        }}>
                          {getAgingBucket(txn.dueDate)} {getAgingDays(txn.dueDate) > 0 ? `(${getAgingDays(txn.dueDate)}d late)` : ''}
                        </span>
                      </td>
                      <td className="font-semibold text-primary">{txn.partyName || 'Unknown Patient'}</td>
                      <td>{txn.category}</td>
                      <td>{txn.description}</td>
                      <td><strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>₹{txn.amount.toLocaleString('en-IN')}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => handleOpenSettleModal(txn)}>
                            <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Collect
                          </button>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleOpenEditModal(txn)}><Edit3 size={12} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTxn(txn.id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {arList.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 48 }}>
                        <CheckCircle size={32} color="#10b981" style={{ marginBottom: 8 }} />
                        <div style={{ fontWeight: 700 }}>All Receivables Settled!</div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>No outstanding client balances pending collection.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 3. ACCOUNTS PAYABLE (AP) TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'AP' && (
        <div>
          {/* Aging metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
            {Object.entries(apAging).map(([bucket, total]) => (
              <div key={bucket} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 6, borderLeft: '3.5px solid #f97316' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>{bucket} Payables</span>
                <strong style={{ fontSize: 18, color: total > 0 ? '#f97316' : 'var(--color-text-muted)' }}>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title">Accounts Payable Sheet</h3>
              <p className="card-subtitle">Pending vendor supply bills, laboratory commissions, and operational leases awaiting disbursement.</p>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Voucher ID</th>
                    <th>Due Date</th>
                    <th>Aging Status</th>
                    <th>Vendor/Supplier Name</th>
                    <th>Expense Category</th>
                    <th>Voucher Summary</th>
                    <th>Amount (₹)</th>
                    <th style={{ textAlign: 'right' }}>Voucher Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apList.map(txn => (
                    <tr key={txn.id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txn.id}</span></td>
                      <td>{txn.dueDate || 'N/A'}</td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12,
                          background: getAgingDays(txn.dueDate) > 0 ? 'rgba(220,20,60,0.06)' : 'rgba(16,185,129,0.06)',
                          color: getAgingDays(txn.dueDate) > 0 ? 'var(--color-primary)' : 'var(--color-success)'
                        }}>
                          {getAgingBucket(txn.dueDate)} {getAgingDays(txn.dueDate) > 0 ? `(${getAgingDays(txn.dueDate)}d late)` : ''}
                        </span>
                      </td>
                      <td className="font-semibold text-primary">{txn.partyName || 'Unknown Vendor'}</td>
                      <td>{txn.category}</td>
                      <td>{txn.description}</td>
                      <td><strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>₹{txn.amount.toLocaleString('en-IN')}</strong></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-success)' }} onClick={() => handleOpenSettleModal(txn)}>
                            <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Pay Bill
                          </button>
                          <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleOpenEditModal(txn)}><Edit3 size={12} /></button>
                          <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTxn(txn.id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apList.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 48 }}>
                        <CheckCircle size={32} color="#10b981" style={{ marginBottom: 8 }} />
                        <div style={{ fontWeight: 700 }}>All Accounts Payable Cleared!</div>
                        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>No outstanding vendor bills or utility payments due.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 4. DAY BOOK / CASH JOURNAL TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'DayBook' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid var(--color-border)'
          }}>
            <div>
              <h3 className="card-title">Hospital Day Book (General Cash Book)</h3>
              <p className="card-subtitle">Real-time chronicle of settled vouchers with chronological running account balance auditing.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Download size={12} style={{ marginRight: 4 }} /> Export Day Book Summary
            </button>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Voucher ID</th>
                  <th>Date</th>
                  <th>Classification</th>
                  <th>Client/Party Name</th>
                  <th>Description Summary</th>
                  <th>Payment Type</th>
                  <th>Account Routed</th>
                  <th>Credit (CR In)</th>
                  <th>Debit (DR Out)</th>
                  <th>Running Balance (₹)</th>
                  <th style={{ textAlign: 'right' }}>Voucher Actions</th>
                </tr>
              </thead>
              <tbody>
                {dayBookList.map(txn => (
                  <tr key={txn.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txn.id}</span></td>
                    <td>{txn.date}</td>
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                        background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)'
                      }}>
                        {txn.category}
                      </span>
                    </td>
                    <td>{txn.partyName || 'General Customer'}</td>
                    <td>{txn.description}</td>
                    <td style={{ fontWeight: 700, color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                      {txn.type === 'Income' ? 'CR - In' : 'DR - Out'}
                    </td>
                    <td>
                      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                        {txn.bankAccount} <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>({txn.paymentMethod})</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                      {txn.type === 'Income' ? `₹${txn.amount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {txn.type === 'Expense' ? `₹${txn.amount.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td>
                      <strong style={{ color: 'var(--color-text-primary)' }}>
                        ₹{txn.runningBalance.toLocaleString('en-IN')}
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => handleOpenEditModal(txn)}><Edit3 size={12} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDeleteTxn(txn.id)}><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {dayBookList.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: 48 }}>No settled transaction logs exist in the cash journal yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 5. BANK LEDGER TAB */}
      {/* ──────────────────────────────────────────────────────── */}
      {activeTab === 'Banks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Bank cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {bankDetails.map(bank => (
              <div key={bank.name} className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: bank.name.includes('Petty Cash') ? 'rgba(249,115,22,0.12)' : 'rgba(2,132,199,0.12)',
                      color: bank.name.includes('Petty Cash') ? '#f97316' : '#0284c7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Landmark size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{bank.name}</h4>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Hospital Account</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                    background: 'rgba(16,185,129,0.08)', color: '#10b981'
                  }}>Reconciled</span>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 2 }}>Current Account Balance</div>
                  <strong style={{ fontSize: 24, color: 'var(--color-text-primary)' }}>₹{bank.balance.toLocaleString('en-IN')}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, background: 'var(--color-bg-tertiary)', padding: 10, borderRadius: 8 }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Opening Balance:</span>
                    <span>₹{bank.opening.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Deposits (+):</span>
                    <span className="text-success font-semibold">₹{bank.deposits.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--color-text-muted)' }}>Total Withdrawals (-):</span>
                    <span className="text-primary font-semibold">₹{bank.withdrawals.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Account transaction history filter */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title">Bank Reconciliation Audit Ledger</h3>
              <p className="card-subtitle">Showing all deposits, electronic clearings, check payouts, and cash drawers settlements.</p>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Voucher ID</th>
                    <th>Date</th>
                    <th>Bank Account</th>
                    <th>Payment Mode</th>
                    <th>Creditor/Debitor</th>
                    <th>Ledger Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {settledTxns.map(txn => (
                    <tr key={txn.id}>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{txn.id}</span></td>
                      <td>{txn.date}</td>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{txn.bankAccount}</strong></td>
                      <td>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)'
                        }}>
                          {txn.paymentMethod}
                        </span>
                      </td>
                      <td>{txn.partyName || 'Internal Transfer'}</td>
                      <td>{txn.category}</td>
                      <td>{txn.description}</td>
                      <td><span className="badge badge-success">● Cleared</span></td>
                      <td>
                        <strong style={{ color: txn.type === 'Income' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                          {txn.type === 'Income' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                        </strong>
                      </td>
                    </tr>
                  ))}
                  {settledTxns.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 48 }}>No reconciled bank records logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* ADD LEDGER VOUCHER MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 500, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.30)' }}>
                    <Plus size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Create Accounts Voucher</h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Log hospital credit or debit transactions</div>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={15} /></button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
              <form onSubmit={handleAddTxn}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Transaction Type</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className={`btn w-full ${type === 'Income' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'center' }} onClick={() => setType('Income')}>CR - Credit (Income)</button>
                    <button type="button" className={`btn w-full ${type === 'Expense' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'center' }} onClick={() => setType('Expense')}>DR - Debit (Expense)</button>
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Date</label>
                  <input type="date" className="form-control" required value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Party Name (Patient / Vendor / Payee)</label>
                  <input type="text" className="form-control" required value={partyName} onChange={e => setPartyName(e.target.value)} placeholder="e.g. Ramesh Kumar, Biotronik India..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Account Category</label>
                    <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Amount (₹)</label>
                    <input type="number" min={1} className="form-control" required value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Reference / Invoice ID</label>
                  <input type="text" className="form-control" value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="e.g. INV-1002, CHQ-8891..." />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Description Notes</label>
                  <textarea className="form-control" style={{ height: 60 }} required value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter details of this voucher entry..." />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Settlement Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value as 'Settled' | 'Pending')}>
                    <option value="Settled">Settled (Paid/Cleared)</option>
                    <option value="Pending">Pending (Receivable/Payable)</option>
                  </select>
                </div>

                {status === 'Settled' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18, animation: 'slideUp 0.15s ease' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Payment Method</label>
                      <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Bank Account</label>
                      <select className="form-control" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                        {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="form-group mb-md" style={{ animation: 'slideUp 0.15s ease' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Due Date</label>
                    <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Record Voucher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* EDIT LEDGER VOUCHER MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {showEditModal && selectedTxn && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 500, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.30)' }}>
                    <Edit3 size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Edit Voucher {selectedTxn.id}</h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Edit recorded financial entry</div>
                  </div>
                </div>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={15} /></button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
              <form onSubmit={handleEditTxn}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Transaction Type</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className={`btn w-full ${type === 'Income' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'center' }} onClick={() => setType('Income')}>CR - Credit (Income)</button>
                    <button type="button" className={`btn w-full ${type === 'Expense' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'center' }} onClick={() => setType('Expense')}>DR - Debit (Expense)</button>
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Date</label>
                  <input type="date" className="form-control" required value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Party Name (Patient / Vendor / Payee)</label>
                  <input type="text" className="form-control" required value={partyName} onChange={e => setPartyName(e.target.value)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Account Category</label>
                    <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600 }}>Amount (₹)</label>
                    <input type="number" min={1} className="form-control" required value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} />
                  </div>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Reference / Invoice ID</label>
                  <input type="text" className="form-control" value={referenceId} onChange={e => setReferenceId(e.target.value)} />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Description Notes</label>
                  <textarea className="form-control" style={{ height: 60 }} required value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 700 }}>Settlement Status</label>
                  <select className="form-control" value={status} onChange={e => setStatus(e.target.value as 'Settled' | 'Pending')}>
                    <option value="Settled">Settled (Paid/Cleared)</option>
                    <option value="Pending">Pending (Receivable/Payable)</option>
                  </select>
                </div>

                {status === 'Settled' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18, animation: 'slideUp 0.15s ease' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Payment Method</label>
                      <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600 }}>Bank Account</label>
                      <select className="form-control" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                        {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="form-group mb-md" style={{ animation: 'slideUp 0.15s ease' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Payment Due Date</label>
                    <input type="date" className="form-control" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Update Voucher</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* SETTLE PENDING VOUCHER MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {showSettleModal && selectedTxn && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSettleModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 440, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.30)' }}>
                    <CheckCircle2 size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Settle Entry {selectedTxn.id}</h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Mark pending account as settled</div>
                  </div>
                </div>
                <button onClick={() => setShowSettleModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={15} /></button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <div style={{ background: 'var(--color-bg-tertiary)', padding: 14, borderRadius: 10, marginBottom: 20, border: '1px solid var(--color-border)' }}>
                <div className="flex justify-between mb-xs" style={{ fontSize: 13 }}><span style={{ color: 'var(--color-text-secondary)' }}>Party / Client Name:</span><strong className="text-primary">{selectedTxn.partyName}</strong></div>
                <div className="flex justify-between mb-xs" style={{ fontSize: 13 }}><span style={{ color: 'var(--color-text-secondary)' }}>Ledger Category:</span><strong>{selectedTxn.category}</strong></div>
                <div className="flex justify-between" style={{ fontSize: 14, borderTop: '1px solid var(--color-border)', paddingTop: 10, marginTop: 10 }}><span>Settlement Amount:</span><strong className="text-accent" style={{ fontSize: 16 }}>₹{selectedTxn.amount.toLocaleString('en-IN')}</strong></div>
              </div>

              <form onSubmit={handleSettleTxn}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Payment Method *</label>
                  <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Deposit / Withdrawal Bank *</label>
                  <select className="form-control" value={bankAccount} onChange={e => setBankAccount(e.target.value)}>
                    {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group mb-lg">
                  <label className="form-label" style={{ fontWeight: 600 }}>Clearing Reference / Transaction ID</label>
                  <input type="text" className="form-control" value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="e.g. UPI-9982711, CHQ-2009..." />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowSettleModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Complete Settlement</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* CONTRA BANK TRANSFER ENTRY MODAL */}
      {/* ──────────────────────────────────────────────────────── */}
      {showContraModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowContraModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 440, borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.30)' }}>
                    <ArrowLeftRight size={20} color="white" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>Contra Bank Entry</h3>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>Transfer funds internally between accounts</div>
                  </div>
                </div>
                <button onClick={() => setShowContraModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}><X size={15} /></button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: 24 }}>
              <form onSubmit={handleContraTransfer}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Source Account (Transfer FROM) *</label>
                  <select className="form-control" value={contraFrom} onChange={e => setContraFrom(e.target.value)}>
                    {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Destination Account (Transfer TO) *</label>
                  <select className="form-control" value={contraTo} onChange={e => setContraTo(e.target.value)}>
                    {BANK_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group mb-lg">
                  <label className="form-label" style={{ fontWeight: 600 }}>Transfer Amount (₹) *</label>
                  <input type="number" min={1} className="form-control" required value={contraAmount} onChange={e => setContraAmount(parseInt(e.target.value) || 0)} />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowContraModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Authorize Transfer</button>
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
