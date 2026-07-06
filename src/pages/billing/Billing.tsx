import { useEffect, useState } from 'react';
import {
  Receipt, Search, Plus, Eye, DollarSign, CreditCard, Download, FileText,
  ShieldCheck, AlertCircle, ShoppingCart
} from 'lucide-react';
import { api } from '../../utils/api';
import { patients } from '../../data/mockData';
import { exportInvoicePDF, exportTablePDF, exportToExcel } from '../../utils/exportUtils';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const SVGQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 64 }) => {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#ffffff"
      fgColor="#0f172a"
      level="M"
      style={{
        borderRadius: '4px',
        border: '1px solid #cbd5e1',
        padding: '4px',
        background: '#ffffff',
        display: 'inline-block'
      }}
    />
  );
};

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // New Invoice form states
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [billType, setBillType] = useState('OP');
  const [billItems, setBillItems] = useState<{ desc: string; qty: number; rate: number }[]>([
    { desc: 'General Consultation', qty: 1, rate: 600 }
  ]);

  const loadBills = async () => {
    try {
      const data = await api.getBills();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const addBillItem = () => {
    setBillItems([...billItems, { desc: '', qty: 1, rate: 0 }]);
  };

  const updateBillItem = (index: number, key: string, value: any) => {
    setBillItems(billItems.map((item, idx) => idx === index ? { ...item, [key]: value } : item));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === selectedPatientId);
    const subtotal = billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const gst = Math.round(subtotal * 0.09);
    const total = subtotal + gst;

    const newInvoice = {
      id: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      patientId: pat?.id || 'MRN-0000',
      patientName: pat?.name || 'Walkin Patient',
      date: new Date().toISOString().split('T')[0],
      type: billType,
      items: billItems.map(item => ({ ...item, amount: item.qty * item.rate })),
      subtotal,
      gst,
      discount: 0,
      total,
      paid: total,
      balance: 0,
      status: 'Paid',
      payment: 'Card'
    };

    try {
      await api.createBill(newInvoice);
      loadBills();
      setShowInvoiceModal(false);
      setBillItems([{ desc: 'General Consultation', qty: 1, rate: 600 }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const list = invoices.map(b => ({
      Invoice: b.id,
      Patient: b.patientName,
      MRN: b.patientId,
      Date: b.date,
      Type: b.type,
      Total: b.total,
      Paid: b.paid,
      Balance: b.balance,
      Status: b.status,
    }));
    exportToExcel(list, 'Billing Invoices', 'billing_ledger');
  };

  const filtered = invoices.filter(b => 
    b.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.includes(searchTerm) || 
    (b.patientId && b.patientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Hospital Billing & Finance</h1>
          <p className="page-subtitle">Compile diagnostics bills, IPD room rates calculation, insurance pre-auth settlement tracking.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Export Ledger
          </button>
          <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-3">
        {/* Ledger Table */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="toolbar">
            <div className="search-bar">
              <Search size={16} />
              <input
                placeholder="Search patient name or invoice ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Date</th>
                  <th>Total (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(bill => (
                  <tr key={bill.id}>
                    <td className="font-semibold text-accent">{bill.id}</td>
                    <td className="font-semibold text-primary">{bill.patientName}</td>
                    <td>{bill.patientId}</td>
                    <td>{bill.date}</td>
                    <td className="font-bold">₹{bill.total.toLocaleString('en-IN')}</td>
                    <td className="text-success">₹{bill.paid.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge badge-${
                        bill.status === 'Paid' ? 'success' :
                        bill.status === 'Partial' ? 'warning' : 'danger'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setSelectedBill(bill)} title="Inspect Breakdown">
                          <Eye size={12} />
                        </button>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={() => exportInvoicePDF(bill)} title="Print PDF Slip">
                          <Download size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice breakdown details */}
        <div className="card">
          {selectedBill ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: 12, marginBottom: 16 }}>
                <div>
                  <h3 className="card-title text-accent" style={{ margin: 0 }}>Receipt: {selectedBill.id}</h3>
                  <p className="text-secondary text-sm" style={{ marginTop: 2 }}>Patient: {selectedBill.patientName}</p>
                  <p className="text-muted text-xs">Date: {selectedBill.date} | MRN: {selectedBill.patientId}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Link to={`/patient-record/${selectedBill.patientId}`} target="_blank" title="Scan or click to view Patient EMR">
                    <div style={{ background: '#fff', padding: 4, borderRadius: 6, display: 'inline-block' }}>
                      <SVGQRCode value={`${window.location.origin}/patient-record/${selectedBill.patientId}`} size={40} />
                    </div>
                  </Link>
                  <span className="text-xxs text-muted">Scan EMR QR</span>
                </div>
              </div>

              <div className="section mb-md">
                <h4 className="section-title text-xs mb-sm">Bill Items Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedBill.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span>{item.desc} (x{item.qty})</span>
                      <span className="font-semibold">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 13 }}>
                <div className="flex justify-between text-secondary">
                  <span>Subtotal:</span>
                  <span>₹{selectedBill.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>GST (9%):</span>
                  <span>₹{selectedBill.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Discount:</span>
                  <span>-₹{selectedBill.discount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-primary mt-sm" style={{ fontSize: 15 }}>
                  <span>Grand Total:</span>
                  <span>₹{selectedBill.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary w-full" onClick={() => setSelectedBill(null)}>Close View</button>
                <button className="btn btn-primary w-full" onClick={() => exportInvoicePDF(selectedBill)}>Download PDF</button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 300 }}>
              <Receipt size={36} className="text-muted mb-md" />
              <div className="empty-state-title">Invoice Information</div>
              <p className="text-secondary text-xs">Select any invoice ledger from the table on the left side to review charges, calculate tax splits, or generate a PDF invoice receipt.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2 className="modal-title">Create Patient Tax Invoice</h2>
              <button className="btn-secondary" onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body">
                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label">Select Patient Profile</label>
                    <select className="form-control" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Billing Category</label>
                    <select className="form-control" value={billType} onChange={e => setBillType(e.target.value)}>
                      <option value="OP">Out-Patient Department (OPD)</option>
                      <option value="IP">In-Patient Ward (IPD)</option>
                    </select>
                  </div>
                </div>

                <div className="section mb-md">
                  <div className="section-header">
                    <h4 className="section-title text-sm">Line Items Listing</h4>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addBillItem}>Add Service Line</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {billItems.map((item, idx) => (
                      <div key={idx} className="form-grid-3 items-center" style={{ gap: 8 }}>
                        <div className="form-group" style={{ gridColumn: 'span 1' }}>
                          <input className="form-control" required placeholder="Service Description" value={item.desc} onChange={e => updateBillItem(idx, 'desc', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <input className="form-control" type="number" required placeholder="Quantity" value={item.qty} onChange={e => updateBillItem(idx, 'qty', parseInt(e.target.value) || 0)} />
                        </div>
                        <div className="form-group">
                          <input className="form-control" type="number" required placeholder="Rate (₹)" value={item.rate} onChange={e => updateBillItem(idx, 'rate', parseInt(e.target.value) || 0)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Save Invoice & Print</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
