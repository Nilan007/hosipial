import { useEffect, useState } from 'react';
import {
  Receipt, Search, Plus, Eye, DollarSign, CreditCard, Download, FileText,
  ShieldCheck, AlertCircle, ShoppingCart, Activity, CheckSquare, Square, RefreshCw, Printer
} from 'lucide-react';
import { api } from '../../utils/api';
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
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // New Invoice form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [billType, setBillType] = useState('OP');
  const [billItems, setBillItems] = useState<{ desc: string; qty: number; rate: number }[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Card');

  // Centralized payment collection states
  const [pendingCharges, setPendingCharges] = useState<any[]>([]);
  const [checkedCharges, setCheckedCharges] = useState<{ [id: string]: boolean }>({});
  const [loadingCharges, setLoadingCharges] = useState(false);

  const loadData = async () => {
    try {
      const [billsData, patientsData] = await Promise.all([
        api.getBills(),
        api.getPatients()
      ]);
      setInvoices(billsData);
      setPatientsList(patientsData);
      if (patientsData.length > 0 && !selectedPatientId) {
        setSelectedPatientId(patientsData[0].id);
      }
    } catch (e) {
      console.error("Error loading billing ledger data:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch pending unbilled charges whenever the selected patient changes
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientCharges(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadPatientCharges = async (patientId: string) => {
    if (!patientId) return;
    setLoadingCharges(true);
    setPendingCharges([]);
    setCheckedCharges({});
    setBillItems([]); // Clear previous lines when patient changes
    try {
      const [apts, pres, labs, scans, surgeries] = await Promise.all([
        api.getAppointments(),
        api.getPrescriptions(),
        api.getLabTests(),
        api.getRadiologyScans(),
        api.getSurgeries()
      ]);

      const patientApts = apts.filter((a: any) => a.patientId === patientId);
      const patientPres = pres.filter((p: any) => p.patientId === patientId);
      const patientLabs = labs.filter((l: any) => l.patientId === patientId);
      const patientScans = scans.filter((s: any) => s.patientId === patientId);
      const patientSurg = surgeries.filter((s: any) => s.patientId === patientId);

      const items: any[] = [];

      // 1. Doctor Consultation Fee (from appointments)
      patientApts.forEach((a: any) => {
        items.push({
          id: `apt-${a.id || a._id}`,
          category: 'Doctor Fee',
          desc: `Doctor Consultation: ${a.doctorName || 'Attending Doctor'} (${a.dept || 'General OPD'})`,
          qty: 1,
          rate: a.type === 'Teleconsult' ? 800 : 600,
          date: a.date
        });
      });

      // 2. Pharmacy Medicines (from prescriptions)
      patientPres.forEach((p: any) => {
        p.medicines?.forEach((m: any, idx: number) => {
          items.push({
            id: `pres-${p.id || p._id}-${idx}`,
            category: 'Pharmacy Medicine',
            desc: `Rx Med: ${m.name} (${m.dosage} - ${m.duration})`,
            qty: 1,
            rate: 220, // default medication charge
            date: p.date
          });
        });
      });

      // 3. Laboratory Investigations (LIMS)
      patientLabs.forEach((l: any) => {
        items.push({
          id: `lab-${l.id || l._id}`,
          category: 'Lab Investigation',
          desc: `Lab Test: ${l.testName}`,
          qty: 1,
          rate: l.cost || 650,
          date: l.ordered ? l.ordered.split(' ')[0] : 'Today'
        });
      });

      // 4. Radiology Modalities (RIS)
      patientScans.forEach((s: any) => {
        items.push({
          id: `scan-${s.id || s._id}`,
          category: 'Radiology Scan',
          desc: `Imaging Scan: ${s.type} (${s.modality})`,
          qty: 1,
          rate: s.cost || 2000,
          date: s.date
        });
      });

      // 5. Operation Theatre Surgeries
      patientSurg.forEach((sg: any) => {
        items.push({
          id: `surg-${sg.id || sg._id}`,
          category: 'Surgery / OT Cost',
          desc: `Procedure: ${sg.procedure} (OT Charges & Anesthesia)`,
          qty: 1,
          rate: sg.cost || 42000,
          date: sg.date
        });
      });

      // 6. Inpatient Room stay (if admitted)
      const selectedPat = patientsList.find(p => p.id === patientId);
      if (selectedPat && selectedPat.status === 'Admitted') {
        items.push({
          id: `ipd-bed-${patientId}`,
          category: 'IPD Room & Bed',
          desc: `General Ward Bed Stay (2 Days Charges)`,
          qty: 2,
          rate: 1500,
          date: selectedPat.lastVisit || 'Today'
        });
      }

      setPendingCharges(items);
    } catch (err) {
      console.error("Error loading pending patient charges:", err);
    } finally {
      setLoadingCharges(false);
    }
  };

  const handleToggleCharge = (charge: any) => {
    const isChecked = !checkedCharges[charge.id];
    setCheckedCharges(prev => ({ ...prev, [charge.id]: isChecked }));

    if (isChecked) {
      // Add item to invoice line items
      setBillItems(prev => [...prev, { desc: charge.desc, qty: charge.qty, rate: charge.rate }]);
    } else {
      // Remove item from invoice line items
      setBillItems(prev => prev.filter(item => item.desc !== charge.desc));
    }
  };

  const addBillItem = () => {
    setBillItems([...billItems, { desc: '', qty: 1, rate: 0 }]);
  };

  const updateBillItem = (index: number, key: string, value: any) => {
    setBillItems(billItems.map((item, idx) => idx === index ? { ...item, [key]: value } : item));
  };

  const removeBillItem = (index: number) => {
    setBillItems(billItems.filter((_, idx) => idx !== index));
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (billItems.length === 0) {
      alert("Please add at least one line item before compiling the invoice.");
      return;
    }

    const pat = patientsList.find(p => p.id === selectedPatientId);
    const subtotal = billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0);
    const gst = Math.round(subtotal * 0.09); // 9% GST
    const total = subtotal + gst - discountAmount;

    const newInvoice = {
      id: `INV-${Math.floor(20000 + Math.random() * 80000)}`,
      patientId: pat?.id || selectedPatientId,
      patientName: pat?.name || 'Walkin Patient',
      date: new Date().toISOString().split('T')[0],
      type: billType,
      items: billItems.map(item => ({ ...item, amount: item.qty * item.rate })),
      subtotal,
      gst,
      discount: discountAmount,
      total: total > 0 ? total : 0,
      paid: total > 0 ? total : 0,
      balance: 0,
      status: 'Paid',
      payment: paymentMethod
    };

    try {
      await api.createBill(newInvoice);
      loadData();
      setShowInvoiceModal(false);
      // Reset forms
      setBillItems([]);
      setDiscountAmount(0);
    } catch (err) {
      console.error("Error creating compiled invoice:", err);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(invoices, 'Invoices', 'Hospital_Billing_Ledger');
  };

  const filtered = invoices.filter(b => 
    b.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id?.includes(searchTerm) || 
    (b.patientId && b.patientId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Hospital Billing & Centralized Collection</h1>
          <p className="page-subtitle">Centralized collection for consultation fees, medicines, lab tests, scans, beds, and surgery costs.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportExcel}>
            Export Ledger
          </button>
          <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
            <Plus size={16} /> Centralized Patient Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Ledger Table */}
        <div className="card">
          <div className="toolbar">
            <div className="search-bar">
              <Search size={16} />
              <input
                placeholder="Search patient name, MRN or invoice ID..."
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
                    <td className="font-bold">₹{bill.total?.toLocaleString('en-IN')}</td>
                    <td className="text-success">₹{bill.paid?.toLocaleString('en-IN')}</td>
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
                  {selectedBill.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <span>{item.desc} (x{item.qty})</span>
                      <span className="font-semibold text-white">₹{item.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--color-border)', paddingTop: 12, fontSize: 13 }}>
                <div className="flex justify-between text-secondary">
                  <span>Subtotal:</span>
                  <span>₹{selectedBill.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>GST (9%):</span>
                  <span>₹{selectedBill.gst?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Discount:</span>
                  <span>-₹{selectedBill.discount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-primary mt-sm" style={{ fontSize: 15 }}>
                  <span>Grand Total:</span>
                  <span className="text-accent">₹{selectedBill.total?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
                <button className="btn btn-secondary w-full" onClick={() => setSelectedBill(null)}>Close View</button>
                <button className="btn btn-primary w-full" onClick={() => exportInvoicePDF(selectedBill)}>Download PDF</button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <Receipt size={36} className="text-muted mb-md" />
              <div className="empty-state-title">Invoice Information</div>
              <p className="text-secondary text-xs" style={{ marginTop: '8px' }}>Select any invoice ledger from the table on the left side to review charges, calculate tax splits, or generate a PDF invoice receipt.</p>
            </div>
          )}
        </div>
      </div>

      {/* Centralized Invoice Compilation Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal modal-xl" style={{ maxWidth: '1100px', width: '95%' }}>
            <div className="modal-header">
              <h2 className="modal-title">Centralized Payment Collection Invoice</h2>
              <button className="btn-secondary" onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateInvoice}>
              <div className="modal-body" style={{ display: 'flex', gap: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
                
                {/* Left Side: Select Patient & Check pending charges (45% width) */}
                <div style={{ flex: '1 1 450px', borderRight: '1px solid var(--color-border)', paddingRight: 20 }}>
                  <div className="form-group mb-md">
                    <label className="form-label font-bold text-white">Select Patient Profile</label>
                    <select className="form-control" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}>
                      <option value="">-- Choose Patient --</option>
                      {patientsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.id}) — {p.status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label">Billing Category</label>
                      <select className="form-control" value={billType} onChange={e => setBillType(e.target.value)}>
                        <option value="OP">Out-Patient Department (OPD)</option>
                        <option value="IP">In-Patient Ward (IPD)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="UPI">UPI / QR Code Pay</option>
                        <option value="Cash">Cash Pay</option>
                        <option value="Insurance">Insurance Pre-Auth</option>
                      </select>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' }} />

                  <div>
                    <div className="flex-between mb-sm">
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-accent)', margin: 0 }}>Unbilled Clinical Activities (Centralized Ledger)</h4>
                      {loadingCharges && <Activity size={14} className="text-accent animated-pulse" />}
                    </div>

                    {pendingCharges.length === 0 ? (
                      <div className="text-secondary text-xs py-4 text-center">
                        {selectedPatientId ? "No unbilled doctor consultation, pharmacy, laboratory, radiology or OT activities found for this patient." : "Please select a patient to fetch centralized unbilled charges."}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '280px', overflowY: 'auto', paddingRight: '6px' }}>
                        {pendingCharges.map(charge => (
                          <div key={charge.id} className="flex-between text-xs py-2 px-3" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer' }} onClick={() => handleToggleCharge(charge)}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                              {checkedCharges[charge.id] ? (
                                <CheckSquare size={16} className="text-accent" />
                              ) : (
                                <Square size={16} className="text-muted" />
                              )}
                              <div>
                                <span className="font-semibold text-white block">{charge.desc}</span>
                                <span className="text-muted text-xxs">{charge.category} | {charge.date}</span>
                              </div>
                            </div>
                            <span className="font-bold text-accent">₹{charge.rate}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Compiled Invoice Line Items and Totals (50% width) */}
                <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex-between mb-sm">
                      <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Invoice Line Items Breakdown</h4>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={addBillItem}>
                        Add Manual Service
                      </button>
                    </div>

                    {billItems.length === 0 ? (
                      <div className="text-muted text-xs py-6 text-center border-dashed" style={{ border: '1px dashed var(--color-border)', borderRadius: 8 }}>
                        Please select pending unbilled charges from the left panel, or click "Add Manual Service" to insert items.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                        {billItems.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div className="form-group" style={{ flex: '2 1 0' }}>
                              <input className="form-control" style={{ fontSize: '12px', padding: '6px 10px' }} required placeholder="Item description" value={item.desc} onChange={e => updateBillItem(idx, 'desc', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 0' }}>
                              <input className="form-control" style={{ fontSize: '12px', padding: '6px 10px' }} type="number" required placeholder="Qty" value={item.qty} onChange={e => updateBillItem(idx, 'qty', parseInt(e.target.value) || 0)} />
                            </div>
                            <div className="form-group" style={{ flex: '1 1 0' }}>
                              <input className="form-control" style={{ fontSize: '12px', padding: '6px 10px' }} type="number" required placeholder="Rate (₹)" value={item.rate} onChange={e => updateBillItem(idx, 'rate', parseInt(e.target.value) || 0)} />
                            </div>
                            <button type="button" className="btn-secondary" style={{ padding: '6px 8px', borderRadius: 6 }} onClick={() => removeBillItem(idx)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', padding: 16, borderRadius: 8, marginTop: 16 }}>
                    <div className="form-group mb-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-xs text-muted">Discount Applied (₹)</span>
                      <input className="form-control" style={{ width: 120, fontSize: '12px', padding: '4px 8px' }} type="number" value={discountAmount} onChange={e => setDiscountAmount(parseInt(e.target.value) || 0)} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                      <div className="flex-between text-secondary">
                        <span>Subtotal:</span>
                        <span>₹{billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex-between text-secondary">
                        <span>GST (9%):</span>
                        <span>₹{Math.round(billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0) * 0.09).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex-between text-secondary">
                        <span>Discount:</span>
                        <span className="text-danger">-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex-between font-bold text-white mt-xs" style={{ fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                        <span>Compiled Grand Total:</span>
                        <span className="text-accent">
                          ₹{(
                            billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0) +
                            Math.round(billItems.reduce((acc, item) => acc + (item.qty * item.rate), 0) * 0.09) -
                            discountAmount
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 0 0 0' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Compile & Settle Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
