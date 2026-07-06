import React, { useEffect, useState } from 'react';
import {
  Pill, Search, Package, AlertCircle, ShoppingBag, Plus, RefreshCw,
  TrendingDown, Check, FileSpreadsheet, FileText, ShoppingCart, Trash2, Printer
} from 'lucide-react';
import { api } from '../../utils/api';
import { patients } from '../../data/mockData';
import { exportTablePDF, exportToExcel } from '../../utils/exportUtils';

const Pharmacy: React.FC = () => {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Stock');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  
  // POS Billing states
  const [billingPatientId, setBillingPatientId] = useState(patients[0]?.id || '');
  const [billingType, setBillingType] = useState<'OP' | 'IP'>('OP');
  const [cart, setCart] = useState<{ drugId: string; name: string; qty: number; mrp: number }[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [printedBill, setPrintedBill] = useState<any>(null);

  const loadPharmacyData = async () => {
    try {
      const inventory = await api.getDrugInventory();
      setDrugs(inventory);
      if (inventory.length > 0) {
        setSelectedDrugId(inventory[0].id);
      }
      const rxList = await api.getPrescriptions();
      setPendingOrders(rxList.filter((p: any) => p.status === 'Pending'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const handleDispense = async (id: string) => {
    try {
      await api.updatePrescription(id, { status: 'Dispensed' });
      loadPharmacyData();
      alert('Medication dispensed. Digital prescription status updated to Dispensed and stock count decremented.');
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = () => {
    const d = drugs.find(item => item.id === selectedDrugId);
    if (!d) return;
    if (selectedQty > d.stock) {
      alert(`Insufficient stock. Only ${d.stock} units available.`);
      return;
    }
    const existing = cart.find(c => c.drugId === selectedDrugId);
    if (existing) {
      setCart(cart.map(c => c.drugId === selectedDrugId ? { ...c, qty: c.qty + selectedQty } : c));
    } else {
      setCart([...cart, { drugId: d.id, name: d.name, qty: selectedQty, mrp: d.mrp }]);
    }
  };

  const removeFromCart = (idx: number) => {
    setCart(cart.filter((_, i) => i !== idx));
  };

  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Please add medications to the cart first.');
      return;
    }
    const pat = patients.find(p => p.id === billingPatientId);
    const subtotal = cart.reduce((acc, item) => acc + (item.qty * item.mrp), 0);
    const gst = Math.round(subtotal * 0.09);
    const total = subtotal + gst;

    const newInvoice = {
      id: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      patientId: pat?.id || 'MRN-0000',
      patientName: pat?.name || 'Walkin Patient',
      date: new Date().toISOString().split('T')[0],
      type: billingType,
      items: cart.map(item => ({ desc: `[Pharmacy] ${item.name}`, qty: item.qty, rate: item.mrp, amount: item.qty * item.mrp })),
      subtotal,
      gst,
      discount: 0,
      total,
      paid: total,
      balance: 0,
      status: 'Paid',
      payment: 'Cash'
    };

    try {
      // Save billing invoice to backend database
      await api.createBill(newInvoice);
      setPrintedBill(newInvoice);
      setCart([]);
      loadPharmacyData();
      alert('Pharmacy billing invoice logged. Click Print to print receipt.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportExcel = () => {
    const list = drugs.map(d => ({
      ID: d.id,
      Name: d.name,
      Category: d.category,
      Form: d.form,
      Manufacturer: d.manufacturer,
      Batch: d.batch,
      Expiry: d.expiry,
      Stock: d.stock,
      MRP: d.mrp,
    }));
    exportToExcel(list, 'Pharmacy Stock', 'pharmacy_inventory');
  };

  const handleExportPDF = () => {
    const headers = ['ID', 'Drug Name', 'Category', 'Form', 'Batch/Expiry', 'Stock', 'MRP (₹)'];
    const rows = drugs.map(d => [
      d.id,
      d.name,
      d.category,
      d.form,
      `${d.batch} / ${d.expiry}`,
      d.stock,
      d.mrp
    ]);
    exportTablePDF('Pharmacy Store Inventory Ledger', headers, rows, 'pharmacy_report');
  };

  const triggerPrintReceipt = () => {
    window.print();
  };

  const filtered = drugs.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Pharmacy Management System</h1>
          <p className="page-subtitle">Drug inventory tracking, batch/expiry alerts, electronic prescription dispensing logs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Export Excel
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            Print Catalog
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-md">
        <button className={`tab ${activeTab === 'Stock' ? 'active' : ''}`} onClick={() => setActiveTab('Stock')}>
          Inventory Stock Ledger
        </button>
        <button className={`tab ${activeTab === 'Prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('Prescriptions')}>
          Prescription Dispensing Queue ({pendingOrders.length})
        </button>
        <button className={`tab ${activeTab === 'Billing' ? 'active' : ''}`} onClick={() => { setActiveTab('Billing'); setPrintedBill(null); }}>
          POS Sales & Billing (IP / OP)
        </button>
      </div>

      {activeTab === 'Stock' && (
        <div>
          <div className="alert alert-warning mb-md">
            <AlertCircle size={16} />
            <div>
              <strong>Low Inventory Threshold warning:</strong> Amoxicillin 500mg (DRG-004) has dropped below safety limits. Please raise purchase order.
            </div>
          </div>

          <div className="toolbar">
            <div className="search-bar">
              <Search size={16} />
              <input
                placeholder="Search drug catalog..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item ID</th>
                    <th>Generic Name</th>
                    <th>Classification</th>
                    <th>Form</th>
                    <th>Batch #</th>
                    <th>Expiry Date</th>
                    <th>Stock Count</th>
                    <th>MRP</th>
                    <th>Storage Area</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(d => (
                    <tr key={d.id}>
                      <td className="font-semibold text-accent">{d.id}</td>
                      <td className="font-semibold text-primary">{d.name}</td>
                      <td>{d.category}</td>
                      <td>{d.form}</td>
                      <td>{d.batch}</td>
                      <td className={new Date(d.expiry) < new Date() ? 'text-danger' : ''}>{d.expiry}</td>
                      <td className="font-bold">{d.stock}</td>
                      <td>₹{d.mrp.toFixed(2)}</td>
                      <td><span className="badge badge-gray">{d.location}</span></td>
                      <td>
                        <span className={`badge badge-${d.stock < 200 ? 'danger' : 'success'}`}>
                          {d.stock < 200 ? 'Low Stock' : 'Good Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Prescriptions' && (
        <div className="grid grid-2">
          {pendingOrders.length === 0 ? (
            <div className="card empty-state" style={{ gridColumn: 'span 2' }}>
              <Pill size={40} className="text-success mb-md" />
              <div className="empty-state-title">All Prescriptions Dispensed</div>
              <p className="text-secondary text-sm">There are no pending prescriptions waiting in the pharmacy queue currently.</p>
            </div>
          ) : (
            pendingOrders.map(p => (
              <div className="card" key={p.id}>
                <div className="flex justify-between items-center mb-md" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                  <div>
                    <h3 className="card-title text-accent">{p.id}</h3>
                    <p className="text-secondary text-xs">Patient: {p.patientName} ({p.patientId})</p>
                  </div>
                  <span className="badge badge-warning">Pending Dispense</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, marginBottom: 16 }}>
                  <div className="font-semibold text-primary">Diagnosis: {p.diagnosis}</div>
                  <div className="text-muted text-xs">Prescribed By: {p.doctorName}</div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', padding: 10, borderRadius: 8, marginTop: 8 }}>
                    <div className="font-semibold mb-xs text-xs text-secondary">MEDICATIONS LIST</div>
                    {p.medicines.map((m: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="font-semibold text-primary">{m.name}</span>
                        <span className="text-secondary">{m.dosage} ({m.duration})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn btn-success w-full" onClick={() => handleDispense(p.id)} style={{ justifyContent: 'center' }}>
                  <Check size={14} /> Mark Dispensed & Deduct Stock
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'Billing' && (
        <div className="grid grid-3">
          {/* POS Bill cart entry form */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <h3 className="card-title mb-md" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={18} /> POS Sale Billing Desk
            </h3>
            <form onSubmit={handleCompleteSale}>
              <div className="form-grid-3 mb-md">
                <div className="form-group">
                  <label className="form-label">Billing Type</label>
                  <select className="form-control" value={billingType} onChange={e => setBillingType(e.target.value as 'OP' | 'IP')}>
                    <option value="OP">Out-Patient Department (OPD)</option>
                    <option value="IP">In-Patient Department (IPD)</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Patient Record (MRN)</label>
                  <select className="form-control" value={billingPatientId} onChange={e => setBillingPatientId(e.target.value)}>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id}) — {p.status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add item to cart */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 10, border: '1px solid var(--color-border)', marginBottom: 20 }}>
                <div className="form-grid-3 items-center">
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label text-xs">Select Medication from Catalog</label>
                    <select className="form-control" value={selectedDrugId} onChange={e => setSelectedDrugId(e.target.value)}>
                      {drugs.map(d => (
                        <option key={d.id} value={d.id}>{d.name} — Expiry: {d.expiry} (Stock: {d.stock}) — ₹{d.mrp}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Qty</label>
                      <input className="form-control" type="number" min={1} value={selectedQty} onChange={e => setSelectedQty(parseInt(e.target.value) || 1)} />
                    </div>
                    <button type="button" className="btn btn-secondary btn-icon" onClick={addToCart} title="Add to POS cart">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart List */}
              <h4 className="section-title text-sm mb-sm">Medications Cart</h4>
              <div className="table-container mb-md">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Medication Name</th>
                      <th>Rate (₹)</th>
                      <th>Quantity</th>
                      <th>Total (₹)</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((c, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-primary">{c.name}</td>
                        <td>₹{c.mrp.toFixed(2)}</td>
                        <td>{c.qty}</td>
                        <td className="font-bold">₹{(c.qty * c.mrp).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button type="button" className="btn btn-danger btn-icon btn-sm" onClick={() => removeFromCart(i)}>
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center text-muted text-xs py-4">Cart is currently empty. Add medications using the selector above.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="submit" className="btn btn-primary">Complete Sale & Save Invoice</button>
              </div>
            </form>
          </div>

          {/* Receipt print preview */}
          <div className="card preview-mode">
            {printedBill ? (
              <div>
                {/* Print Letterhead layout */}
                <div className="print-letterhead" style={{ display: 'block' }}>
                  <div className="print-letterhead-header">
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-light)' }}>MEDICORE HOSPITAL</h2>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Quality Healthcare & Diagnostics Center</p>
                    </div>
                    <div className="print-hospital-details">
                      <p>100, OMR IT Highway, Chennai - 600096</p>
                      <p>Phone: +91 44 4890 3000 | Web: www.medicore.org</p>
                    </div>
                  </div>
                  <div className="print-doc-title">PHARMACY INVOICE RECEIPT</div>

                  <div className="print-grid-2">
                    <div className="print-grid-item">
                      <div className="print-grid-label">PATIENT NAME</div>
                      <div className="font-bold text-primary">{printedBill.patientName}</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">INVOICE ID / DATE</div>
                      <div>{printedBill.id} | {printedBill.date}</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">MRN REFERENCE</div>
                      <div className="text-accent font-semibold">{printedBill.patientId}</div>
                    </div>
                    <div className="print-grid-item">
                      <div className="print-grid-label">BILL MODE</div>
                      <div>{printedBill.type === 'IP' ? 'In-Patient (IPD)' : 'Out-Patient (OPD)'}</div>
                    </div>
                  </div>

                  <div className="table-container mb-md" style={{ border: '1px solid var(--color-border)' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Service / Medication</th>
                          <th>Qty</th>
                          <th>Rate (₹)</th>
                          <th style={{ textAlign: 'right' }}>Total (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {printedBill.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td>{item.desc}</td>
                            <td>{item.qty}</td>
                            <td>₹{item.rate.toFixed(2)}</td>
                            <td style={{ textAlign: 'right' }}>₹{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', fontSize: '13px' }}>
                    <div>Subtotal: <span className="font-semibold">₹{printedBill.subtotal.toFixed(2)}</span></div>
                    <div>GST (9%): <span className="font-semibold">₹{printedBill.gst.toFixed(2)}</span></div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-primary-light)', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                      Grand Total: ₹{printedBill.total.toFixed(2)}
                    </div>
                  </div>

                  <div className="print-signature-row">
                    <div className="print-signature-block">
                      <div className="print-signature-line" />
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Dispensed By (Pharmacist)</p>
                    </div>
                    <div className="print-signature-block">
                      <div className="print-signature-line" />
                      <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Authorized Representative</p>
                    </div>
                  </div>
                </div>

                <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginTop: '16px' }} onClick={triggerPrintReceipt}>
                  <Printer size={14} style={{ marginRight: 6 }} /> Print Official Invoice Copy
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 350 }}>
                <ShoppingCart size={36} className="text-muted mb-md" />
                <div className="empty-state-title">Print Sales Slip</div>
                <p className="text-secondary text-xs">Verify items and log the transaction. Complete the sale to generate and print a formal letterhead invoice receipt.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
