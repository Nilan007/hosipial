import React, { useEffect, useState } from 'react';
import {
  Pill, Search, Package, AlertCircle, ShoppingBag, Plus, RefreshCw,
  TrendingDown, Check, FileSpreadsheet, FileText, ShoppingCart, Trash2, Printer, Sparkles,
  Minus, Edit3, X, ChevronDown, ChevronUp, PlusCircle, Landmark
} from 'lucide-react';
import { api } from '../../utils/api';
import { exportTablePDF, exportToExcel } from '../../utils/exportUtils';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────
   PRESCRIPTION QUEUE SUB-COMPONENT
   Supports: Add Medicine, Remove Medicine, Change Qty
───────────────────────────────────────────────── */
interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  qty?: number;
}

interface PrescriptionQueueProps {
  pendingOrders: any[];
  drugs: any[];
  getPatientSubscription: (id: string) => boolean;
  onDispense: (id: string) => void;
  onRefresh: () => void;
}

const DOSAGE_OPTIONS = ['1-0-0', '0-1-0', '0-0-1', '1-1-0', '1-0-1', '0-1-1', '1-1-1', '1-1-1-1', 'SOS'];
const DURATION_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days', '45 days', '60 days', '90 days'];

const PrescriptionQueue: React.FC<PrescriptionQueueProps> = ({
  pendingOrders, drugs, getPatientSubscription, onDispense, onRefresh
}) => {
  // Per-prescription local medicines state
  const [localMeds, setLocalMeds] = useState<Record<string, Medicine[]>>({});
  const [addPanelOpen, setAddPanelOpen] = useState<Record<string, boolean>>({});

  // Add-medicine form state per prescription
  const [newDrugId, setNewDrugId] = useState<Record<string, string>>({});
  const [newDosage, setNewDosage] = useState<Record<string, string>>({});
  const [newDuration, setNewDuration] = useState<Record<string, string>>({});
  const [newQty, setNewQty] = useState<Record<string, number>>({});

  // Init local medicines from server data
  useEffect(() => {
    const init: Record<string, Medicine[]> = {};
    pendingOrders.forEach(p => {
      if (!localMeds[p.id]) {
        init[p.id] = (p.medicines || []).map((m: any) => ({ ...m, qty: m.qty || 1 }));
      }
    });
    if (Object.keys(init).length > 0) {
      setLocalMeds(prev => ({ ...init, ...prev }));
    }
  }, [pendingOrders]);

  const getMeds = (rxId: string): Medicine[] => localMeds[rxId] || [];

  const updateQty = (rxId: string, idx: number, delta: number) => {
    setLocalMeds(prev => {
      const meds = [...(prev[rxId] || [])];
      meds[idx] = { ...meds[idx], qty: Math.max(1, (meds[idx].qty || 1) + delta) };
      return { ...prev, [rxId]: meds };
    });
  };

  const setQtyDirect = (rxId: string, idx: number, val: number) => {
    setLocalMeds(prev => {
      const meds = [...(prev[rxId] || [])];
      meds[idx] = { ...meds[idx], qty: Math.max(1, val) };
      return { ...prev, [rxId]: meds };
    });
  };

  const removeMed = (rxId: string, idx: number) => {
    setLocalMeds(prev => {
      const meds = [...(prev[rxId] || [])];
      meds.splice(idx, 1);
      return { ...prev, [rxId]: meds };
    });
  };

  const addMedicine = (rxId: string) => {
    const drugId = newDrugId[rxId] || (drugs[0]?.id ?? '');
    const drug = drugs.find(d => d.id === drugId);
    if (!drug) return;

    const med: Medicine = {
      name: drug.name,
      dosage: newDosage[rxId] || '1-0-0',
      duration: newDuration[rxId] || '7 days',
      qty: newQty[rxId] || 1,
    };

    setLocalMeds(prev => ({
      ...prev,
      [rxId]: [...(prev[rxId] || []), med],
    }));
    // Close panel after adding
    setAddPanelOpen(prev => ({ ...prev, [rxId]: false }));
  };

  const toggleAddPanel = (rxId: string) => {
    setAddPanelOpen(prev => ({ ...prev, [rxId]: !prev[rxId] }));
    // Pre-fill defaults
    if (!newDrugId[rxId] && drugs.length > 0) {
      setNewDrugId(prev => ({ ...prev, [rxId]: drugs[0].id }));
      setNewDosage(prev => ({ ...prev, [rxId]: '1-0-0' }));
      setNewDuration(prev => ({ ...prev, [rxId]: '7 days' }));
      setNewQty(prev => ({ ...prev, [rxId]: 1 }));
    }
  };

  const sorted = [...pendingOrders].sort((a, b) => {
    const aV = getPatientSubscription(a.patientId);
    const bV = getPatientSubscription(b.patientId);
    return aV && !bV ? -1 : !aV && bV ? 1 : 0;
  });

  if (sorted.length === 0) {
    return (
      <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: 60 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(22,163,74,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Pill size={26} color="var(--color-success)" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 6 }}>All Prescriptions Dispensed</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No pending prescriptions in the pharmacy queue.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
      {sorted.map(p => {
        const isVip = getPatientSubscription(p.patientId);
        const meds = getMeds(p.id);
        const isAddOpen = addPanelOpen[p.id];

        return (
          <div
            className="card"
            key={p.id}
            style={{
              padding: 0,
              overflow: 'hidden',
              borderLeft: isVip ? '4px solid var(--color-purple)' : undefined,
            }}
          >
            {/* Card Header */}
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              background: 'linear-gradient(135deg, #fff 0%, var(--color-bg-tertiary) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-primary)' }}>{p.id}</span>
                  {isVip && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      background: 'rgba(124,58,237,0.12)', color: 'var(--color-purple)', border: '1px solid rgba(124,58,237,0.2)'
                    }}>★ VIP</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {p.patientName} · <span style={{ fontFamily: 'monospace' }}>{p.patientId}</span>
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: 10 }}>● Pending Dispense</span>
            </div>

            {/* Diagnosis Info */}
            <div style={{ padding: '10px 18px 0', display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Diagnosis</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>{p.diagnosis}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prescribing Doctor</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{p.doctorName}</div>
              </div>
            </div>

            {/* Medications Table */}
            <div style={{ padding: '12px 18px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                  Medications List ({meds.length})
                </span>
                <button
                  onClick={() => toggleAddPanel(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 700, padding: '4px 12px',
                    borderRadius: 20, cursor: 'pointer', border: 'none',
                    background: isAddOpen ? 'rgba(220,20,60,0.10)' : 'var(--color-primary)',
                    color: isAddOpen ? 'var(--color-primary)' : 'white',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isAddOpen ? <><X size={11} /> Close</> : <><Plus size={11} /> Add Medicine</>}
                </button>
              </div>

              {/* Medicine Rows */}
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                {meds.length === 0 ? (
                  <div style={{ padding: '18px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                    No medicines added. Use "+ Add Medicine" to add items.
                  </div>
                ) : (
                  <>
                    {/* Header row */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 36px',
                      padding: '7px 12px', gap: 8,
                      background: 'rgba(220,20,60,0.04)',
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: 10, fontWeight: 700, color: 'var(--color-primary-dark)',
                      textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>
                      <span>Drug Name</span>
                      <span>Dosage</span>
                      <span>Duration</span>
                      <span style={{ textAlign: 'center' }}>Qty (Strips)</span>
                      <span></span>
                    </div>

                    {meds.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'grid', gridTemplateColumns: '1fr 80px 90px 90px 36px',
                          padding: '8px 12px', gap: 8, alignItems: 'center',
                          borderBottom: idx < meds.length - 1 ? '1px solid var(--color-border)' : 'none',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,20,60,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        {/* Drug name */}
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
                          <Pill size={12} color="var(--color-primary)" style={{ marginRight: 5, verticalAlign: 'middle' }} />
                          {m.name}
                        </div>

                        {/* Dosage */}
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: 'rgba(124,58,237,0.08)', color: 'var(--color-purple)',
                          padding: '2px 7px', borderRadius: 12, whiteSpace: 'nowrap'
                        }}>
                          {m.dosage}
                        </span>

                        {/* Duration */}
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                          {m.duration}
                        </span>

                        {/* Qty stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                          <button
                            onClick={() => updateQty(p.id, idx, -1)}
                            style={{
                              width: 22, height: 22, borderRadius: 6, border: '1px solid var(--color-border)',
                              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--color-text-muted)', flexShrink: 0
                            }}
                          >
                            <Minus size={10} />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={m.qty || 1}
                            onChange={e => setQtyDirect(p.id, idx, parseInt(e.target.value) || 1)}
                            style={{
                              width: 30, textAlign: 'center', fontSize: 12, fontWeight: 700,
                              border: '1px solid var(--color-border)', borderRadius: 6,
                              padding: '2px 0', background: '#fff', color: 'var(--color-text-primary)',
                              outline: 'none'
                            }}
                          />
                          <button
                            onClick={() => updateQty(p.id, idx, 1)}
                            style={{
                              width: 22, height: 22, borderRadius: 6, border: '1px solid var(--color-border)',
                              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'var(--color-primary)', flexShrink: 0
                            }}
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeMed(p.id, idx)}
                          title="Remove this medicine"
                          style={{
                            width: 28, height: 28, borderRadius: 7,
                            border: '1px solid rgba(220,20,60,0.15)',
                            background: 'rgba(220,20,60,0.06)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--color-danger)', flexShrink: 0
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Add Medicine Slide-Down Panel */}
              {isAddOpen && drugs.length > 0 && (
                <div style={{
                  border: '1.5px solid var(--color-primary)',
                  borderRadius: 12, padding: 14,
                  background: 'rgba(220,20,60,0.03)',
                  marginBottom: 12, animation: 'slideUp 0.2s ease'
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <PlusCircle size={14} /> Add New Medicine to Prescription
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {/* Drug search/select */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Select Drug from Inventory</label>
                      <select
                        className="form-control"
                        style={{ fontSize: 12 }}
                        value={newDrugId[p.id] || drugs[0]?.id}
                        onChange={e => setNewDrugId(prev => ({ ...prev, [p.id]: e.target.value }))}
                      >
                        {drugs.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} — {d.form} | Stock: {d.stock} | ₹{d.mrp}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dosage */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Dosage Schedule</label>
                      <select
                        className="form-control"
                        style={{ fontSize: 12 }}
                        value={newDosage[p.id] || '1-0-0'}
                        onChange={e => setNewDosage(prev => ({ ...prev, [p.id]: e.target.value }))}
                      >
                        {DOSAGE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Duration</label>
                      <select
                        className="form-control"
                        style={{ fontSize: 12 }}
                        value={newDuration[p.id] || '7 days'}
                        onChange={e => setNewDuration(prev => ({ ...prev, [p.id]: e.target.value }))}
                      >
                        {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }}>Qty (Strips)</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        style={{ fontSize: 12 }}
                        value={newQty[p.id] || 1}
                        onChange={e => setNewQty(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 1 }))}
                      />
                    </div>

                    {/* Add button */}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: 12 }}
                        onClick={() => addMedicine(p.id)}
                      >
                        <PlusCircle size={13} /> Add to List
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer: summary + dispense */}
            <div style={{ padding: '10px 18px 14px' }}>
              {meds.length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 10,
                  padding: '6px 10px', background: 'var(--color-bg-tertiary)',
                  borderRadius: 8, border: '1px solid var(--color-border)'
                }}>
                  <span><strong style={{ color: 'var(--color-text-primary)' }}>{meds.length}</strong> medication{meds.length !== 1 ? 's' : ''} in prescription</span>
                  <span>Total strips: <strong style={{ color: 'var(--color-primary)' }}>{meds.reduce((s, m) => s + (m.qty || 1), 0)}</strong></span>
                </div>
              )}
              <button
                className="btn btn-success w-full"
                onClick={() => onDispense(p.id)}
                style={{ justifyContent: 'center', gap: 8 }}
                disabled={meds.length === 0}
              >
                <Check size={14} />
                Mark Dispensed &amp; Deduct Stock
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   3D VIRTUAL PHARMACY STOCK ROOM
   Renders 200 boxes (5 Racks x 40 Bins) in 3D Vertical Warehouse Room
───────────────────────────────────────────────── */
interface VirtualStockRoomProps {
  drugs: any[];
  onSelectLocation: (rack: string, shelf: string) => void;
}

const RACKS = [
  { id: 'A', name: 'Analgesics & General (A)', color: 'var(--color-success)', transform: 'rotateY(55deg) translate3d(-240px, 0, -120px)' },
  { id: 'B', name: 'Cardiology & Antihypertensive (B)', color: '#3b82f6', transform: 'rotateY(55deg) translate3d(-240px, 0, 140px)' },
  { id: 'C', name: 'Antibiotics & Vials (C)', color: '#8b5cf6', transform: 'translate3d(0, -10px, -280px)' },
  { id: 'D', name: 'Syrups & Drops (D)', color: '#eab308', transform: 'rotateY(-55deg) translate3d(240px, 0, 140px)' },
  { id: 'E', name: 'Controlled Substances (E)', color: 'var(--color-primary)', transform: 'rotateY(-55deg) translate3d(240px, 0, -120px)' }
];

const VirtualStockRoom: React.FC<VirtualStockRoomProps> = ({ drugs, onSelectLocation }) => {
  const [animationMode, setAnimationMode] = useState<'Low' | 'Medium' | 'Full'>('Medium');
  const [searchText, setSearchText] = useState('');
  const [selectedBox, setSelectedBox] = useState<{ rack: string; shelf: string; drug?: any } | null>(null);
  const [rotationAngle, setRotationAngle] = useState(-18);

  useEffect(() => {
    if (animationMode !== 'Full') return;
    const interval = setInterval(() => {
      setRotationAngle(prev => {
        const next = prev + 0.12;
        return next > 10 ? -25 : next; // gentle drift back and forth
      });
    }, 20);
    return () => clearInterval(interval);
  }, [animationMode]);

  const getDrugForLocation = (rackId: string, idx: number) => {
    const locStr = `R-${rackId}-${String(idx).padStart(2, '0')}`;
    return drugs.find(d => d.location === locStr);
  };

  const handleBoxClick = (rackId: string, idx: number, drug: any) => {
    const shelfStr = String(idx).padStart(2, '0');
    setSelectedBox({ rack: rackId, shelf: shelfStr, drug });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* CSS Keyframe Injector for smooth 3D warehouse walking camera */}
      <style>{`
        @keyframes walkThrough {
          0% { transform: rotateX(14deg) rotateY(-18deg) translateZ(-60px) translateX(-20px); }
          50% { transform: rotateX(17deg) rotateY(-10deg) translateZ(-160px) translateX(20px); }
          100% { transform: rotateX(14deg) rotateY(-18deg) translateZ(-60px) translateX(-20px); }
        }
        .animate-walkthrough {
          animation: walkThrough 10s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        @keyframes wave {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(1.08); }
          100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
        }
      `}</style>

      {/* Control Panel Card */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px var(--color-primary-glow)'
              }}>
                <Landmark size={16} color="white" />
              </span>
              <span className="gradient-text">3D Virtual Pharmacy Warehouse Room</span>
            </h3>
            <p className="card-subtitle" style={{ margin: '4px 0 0' }}>
              Simulates exactly <strong>200 warded drawer bins</strong> across 5 upright steel rack systems warded in warehouse configuration.
            </p>
          </div>

          {/* Search & Animation Settings */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="search-bar" style={{ maxWidth: 220, height: 34 }}>
              <Search size={14} color="var(--color-text-muted)" />
              <input
                placeholder="Search drug location..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>

            {/* Animation Toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--color-bg-tertiary)', padding: 4, borderRadius: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '0 8px', color: 'var(--color-text-muted)' }}>ANIMATION:</span>
              {(['Low', 'Medium', 'Full'] as const).map(mode => {
                const active = animationMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setAnimationMode(mode);
                      if (mode === 'Full') setRotationAngle(-18);
                    }}
                    style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      border: 'none',
                      background: active ? 'var(--gradient-primary)' : 'transparent',
                      color: active ? '#fff' : 'var(--color-text-secondary)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {mode === 'Full' ? 'Walkthrough Mode' : mode}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main 3D Viewport layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20, alignItems: 'stretch' }}>
        
        {/* Viewport Box */}
        <div className="card" style={{
          height: 600,
          background: 'radial-gradient(circle at center, #100f24 0%, #03020a 100%)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none'
        }}>
          {/* Virtual ceiling coordinates */}
          <div style={{ position: 'absolute', top: 16, left: 20, color: '#8589a1', fontSize: 10, fontFamily: 'monospace' }}>
            3D WAREHOUSE · DYNAMIC CORRIDOR AISLE · CAMERA ROT: {Math.round(rotationAngle)}°
          </div>

          {/* Legend Strip */}
          <div style={{ position: 'absolute', bottom: 16, left: 20, display: 'flex', gap: 12, fontSize: 10, color: '#9ca3af' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4b5563' }} /> Empty Slot
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }} /> Good Stock
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} /> Low Stock
            </span>
          </div>

          {/* 3D Container Box */}
          <div style={{
            perspective: 1000,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            transition: 'all 0.4s ease'
          }}>
            {/* Rack corridor alignment layout */}
            <div 
              className={animationMode === 'Full' ? 'animate-walkthrough' : ''}
              style={{
                transformStyle: 'preserve-3d',
                transform: animationMode === 'Full' 
                  ? undefined
                  : animationMode === 'Medium'
                    ? `rotateX(14deg) rotateY(${rotationAngle}deg) translateZ(-60px)`
                    : 'none',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.4s ease'
              }}
            >
              {/* Floor grid visualizer */}
              <div style={{
                position: 'absolute',
                width: 600,
                height: 600,
                background: 'repeating-linear-gradient(rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 42px), repeating-linear-gradient(90deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 42px)',
                transform: 'rotateX(90deg) translateZ(-200px)',
                opacity: 0.75,
                borderRadius: 20
              }} />

              {/* Ceiling light indicator */}
              <div style={{
                position: 'absolute',
                width: 200,
                height: 4,
                background: 'rgba(239,68,68,0.8)',
                boxShadow: '0 0 20px rgba(239,68,68,0.9)',
                transform: 'translate3d(0, -240px, -100px)',
                borderRadius: 2
              }} />

              {RACKS.map((rack) => {
                return (
                  <div
                    key={rack.id}
                    style={{
                      transformStyle: 'preserve-3d',
                      position: 'absolute',
                      transform: rack.transform,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: 'rgba(9, 9, 11, 0.94)',
                      // Metallic frame style
                      borderLeft: '5px solid #a1a1aa',
                      borderRight: '5px solid #a1a1aa',
                      boxShadow: '0 35px 70px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05)',
                      borderRadius: 6,
                      padding: '16px 10px',
                      width: 200,
                      height: 480,
                      justifyContent: 'space-between'
                    }}
                  >
                    {/* Rack Wing Label */}
                    <div style={{
                      color: '#ffffff',
                      fontWeight: 900,
                      fontSize: 11,
                      background: 'rgba(0,0,0,0.85)',
                      border: `2px solid ${rack.color}`,
                      padding: '4px 12px',
                      borderRadius: 8,
                      textShadow: `0 0 6px ${rack.color}`,
                      boxShadow: `0 0 12px ${rack.color}a0`,
                      marginBottom: 12,
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.06em'
                    }}>
                      WING {rack.id}
                    </div>

                    {/* 5x8 Grid of 40 Boxes representing real cabinet shelves */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 8,
                      width: '100%',
                      transformStyle: 'preserve-3d',
                      flex: 1,
                      alignContent: 'center',
                      // horizontal shelves visual separator
                      background: 'repeating-linear-gradient(rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 46px, rgba(161,161,170,0.8) 46px, rgba(161,161,170,0.8) 49px)'
                    }}>
                      {Array.from({ length: 40 }, (_, idx) => {
                        const boxNo = idx + 1;
                        const drug = getDrugForLocation(rack.id, boxNo);
                        const isLow = drug && drug.stock < drug.minStock;
                        const locationId = `R-${rack.id}-${String(boxNo).padStart(2, '0')}`;
                        
                        // Check if searched
                        const isSearchMatch = searchText && drug &&
                          drug.name.toLowerCase().includes(searchText.toLowerCase());

                        // Selected state
                        const isBoxSelected = selectedBox &&
                          selectedBox.rack === rack.id &&
                          selectedBox.shelf === String(boxNo).padStart(2, '0');

                        return (
                          <div
                            key={boxNo}
                            onClick={() => handleBoxClick(rack.id, boxNo, drug)}
                            style={{
                              width: 28,
                              height: 42, // taller drawer-like bins
                              borderRadius: 4,
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              position: 'relative',
                              transformStyle: 'preserve-3d',
                              // drawer colors
                              background: isBoxSelected
                                ? 'rgba(59,130,246,0.85)'
                                : drug
                                  ? isLow ? 'rgba(239,68,68,0.35)' : 'rgba(34,197,94,0.35)'
                                  : 'rgba(255,255,255,0.08)',
                              border: isSearchMatch
                                ? '2px solid #eab308'
                                : isBoxSelected
                                  ? '2px solid white'
                                  : drug
                                    ? isLow ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-success)'
                                    : '1.5px dashed rgba(255,255,255,0.2)',
                              boxShadow: isSearchMatch
                                ? '0 0 15px #eab308'
                                : isBoxSelected
                                  ? '0 0 15px rgba(59,130,246,1)'
                                  : 'inset 0 1px 4px rgba(255,255,255,0.15)',
                              transform: animationMode !== 'Low' && isBoxSelected
                                ? 'translateZ(15px) scale(1.15)'
                                : 'translateZ(0px)',
                              transition: 'all 0.15s ease',
                              padding: '4px 0'
                            }}
                            onMouseEnter={e => {
                              if (animationMode !== 'Low') {
                                e.currentTarget.style.transform = 'translateZ(10px) scale(1.1)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (animationMode !== 'Low' && !isBoxSelected) {
                                e.currentTarget.style.transform = 'translateZ(0px) scale(1)';
                              }
                            }}
                            title={locationId}
                          >
                            {/* Little drawer metallic pull handle */}
                            <div style={{
                              width: 14,
                              height: 3,
                              background: '#f4f4f5',
                              border: '1px solid #71717a',
                              borderRadius: 1.5,
                              opacity: 0.95
                            }} />

                            {/* Inner dot */}
                            <span style={{
                              width: 4,
                              height: 4,
                              borderRadius: '50%',
                              background: drug
                                ? isLow ? 'var(--color-primary)' : 'var(--color-success)'
                                : 'rgba(255,255,255,0.2)',
                              animation: isLow ? 'pulse 1.2s infinite' : 'none'
                            }} />

                            {/* Glow ring for search match */}
                            {isSearchMatch && (
                              <span style={{
                                position: 'absolute',
                                inset: -2,
                                borderRadius: 4,
                                border: '1.5px solid #eab308',
                                animation: 'pulse 1s infinite'
                              }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Box Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedBox ? (
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Location Badge */}
              <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0.06em' }}>SELECTED DRAWER BIN</span>
                <h3 style={{ margin: '2px 0 0', fontWeight: 900, color: 'var(--color-primary)', fontSize: 18, fontFamily: 'monospace' }}>
                  R-{selectedBox.rack}-{selectedBox.shelf}
                </h3>
                <span className="badge badge-gray" style={{ fontSize: 10, marginTop: 4 }}>
                  Wing {selectedBox.rack} · Level {selectedBox.shelf}
                </span>
              </div>

              {/* Stored Content info */}
              {selectedBox.drug ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>DRUG NAME</span>
                    <strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{selectedBox.drug.name}</strong>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>STOCK STATUS</span>
                      <span className={`badge badge-${selectedBox.drug.stock < selectedBox.drug.minStock ? 'danger' : 'success'}`} style={{ display: 'inline-block', marginTop: 2 }}>
                        {selectedBox.drug.stock} units
                      </span>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>BATCH CODE</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{selectedBox.drug.batch}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>EXPIRY DATE</span>
                    <strong style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedBox.drug.expiry}</strong>
                  </div>

                  <div style={{ background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 10, fontSize: 11, color: 'var(--color-text-muted)' }}>
                    Storage Area: Wing {selectedBox.rack} is optimized for {RACKS.find(r => r.id === selectedBox.rack)?.name.split(' (')[0]}.
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 10px', background: 'rgba(0,0,0,0.02)', borderRadius: 12, border: '1.5px dashed var(--color-border)' }}>
                  <Package size={26} color="var(--color-text-muted)" style={{ margin: '0 auto 8px' }} />
                  <strong style={{ fontSize: 12, display: 'block', color: 'var(--color-text-secondary)', marginBottom: 4 }}>Empty Slot</strong>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>This drawer location is currently vacant. No medications assigned.</p>
                </div>
              )}

              {/* Trigger add stock */}
              <button
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center', marginTop: 10 }}
                onClick={() => onSelectLocation(selectedBox.rack, selectedBox.shelf)}
              >
                <Plus size={14} style={{ marginRight: 6 }} /> Assign Stock Here
              </button>
            </div>
          ) : (
            <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Package size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
              <strong style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Inspect Storage Box</strong>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Click on any of the 200 virtual stock bins inside the 3D isometric room to view stored medications, safety stocks, or assign a new inventory product to that location.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   MAIN PHARMACY COMPONENT
───────────────────────────────────────────────── */
const Pharmacy: React.FC = () => {

  const [drugs, setDrugs] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Stock');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  
  // POS Billing states
  const [billingPatientId, setBillingPatientId] = useState('');
  const [billingType, setBillingType] = useState<'OP' | 'IP'>('OP');
  const [cart, setCart] = useState<{ drugId: string; name: string; qty: number; mrp: number }[]>([]);
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [printedBill, setPrintedBill] = useState<any>(null);

  // Add Stock Form States
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [stockName, setStockName] = useState('');
  const [stockCategory, setStockCategory] = useState('Analgesic');
  const [stockForm, setStockForm] = useState('Tablet');
  const [stockBatch, setStockBatch] = useState('');
  const [stockExpiry, setStockExpiry] = useState('');
  const [stockCount, setStockCount] = useState(1000);
  const [stockMinSafety, setStockMinSafety] = useState(200);
  const [stockMrp, setStockMrp] = useState(10);
  const [stockPurchaseRate, setStockPurchaseRate] = useState(6);
  const [stockUnit, setStockUnit] = useState('Strip');
  const [stockRack, setStockRack] = useState('A');
  const [stockShelf, setStockShelf] = useState('01');
  const [stockControlled, setStockControlled] = useState(false);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const stockId = `DRG-${Math.floor(100 + Math.random() * 900)}`;
    const location = `R-${stockRack}-${stockShelf}`;

    const newStock = {
      id: stockId,
      name: stockName,
      category: stockCategory,
      form: stockForm,
      manufacturer: 'MediCore Pharma Ltd',
      batch: stockBatch || `B2026-${Math.floor(100 + Math.random() * 900)}`,
      expiry: stockExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      stock: Number(stockCount),
      minStock: Number(stockMinSafety),
      mrp: Number(stockMrp),
      purchaseRate: Number(stockPurchaseRate),
      unit: stockUnit,
      location,
      lowStock: Number(stockCount) < Number(stockMinSafety),
      controlled: stockControlled
    };

    try {
      await api.createDrugInventory(newStock);
      toast.success(`${stockName} added to Rack ${stockRack}, Shelf ${stockShelf}!`);
      setShowAddStockModal(false);
      loadPharmacyData();
      // Reset form
      setStockName('');
      setStockBatch('');
      setStockExpiry('');
      setStockCount(1000);
      setStockMrp(10);
      setStockPurchaseRate(6);
      setStockControlled(false);
    } catch (err) {
      toast.error('Failed to add drug stock');
    }
  };

  const getPatientSubscription = (patientId: string) => {
    const p = patientsList.find(pat => pat.id === patientId);
    return p?.fasttrackSubscription?.status === 'Active';
  };

  const loadPharmacyData = async () => {
    try {
      const [inventory, rxList, patsData] = await Promise.all([
        api.getDrugInventory(),
        api.getPrescriptions(),
        api.getPatients()
      ]);
      setDrugs(inventory);
      if (inventory.length > 0) {
        setSelectedDrugId(inventory[0].id);
      }
      setPendingOrders(rxList.filter((p: any) => p.status === 'Pending'));
      setPatientsList(patsData);
      if (patsData.length > 0 && !billingPatientId) {
        setBillingPatientId(patsData[0].id);
      }
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
    const pat = patientsList.find(p => p.id === billingPatientId);
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
        <button className={`tab ${activeTab === '3D' ? 'active' : ''}`} onClick={() => setActiveTab('3D')}>
          3D Virtual Stock Room
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

          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="search-bar">
              <Search size={16} />
              <input
                placeholder="Search drug catalog..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={() => setShowAddStockModal(true)} style={{ gap: 6 }}>
              <Plus size={15} /> Add New Stock
            </button>
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
        <PrescriptionQueue
          pendingOrders={pendingOrders}
          drugs={drugs}
          getPatientSubscription={getPatientSubscription}
          onDispense={handleDispense}
          onRefresh={loadPharmacyData}
        />
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
                  <label className="form-label font-bold text-white">Patient Record (MRN)</label>
                  <select className="form-control" value={billingPatientId} onChange={e => setBillingPatientId(e.target.value)}>
                    {patientsList.map(p => {
                      const isVip = p.fasttrackSubscription?.status === 'Active';
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id}) {isVip ? '★ [VIP Fasttrack]' : ''} — {p.status}
                        </option>
                      );
                    })}
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
      {activeTab === '3D' && (
        <VirtualStockRoom
          drugs={drugs}
          onSelectLocation={(rack, shelf) => {
            setStockRack(rack);
            setStockShelf(shelf);
            setShowAddStockModal(true);
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════
          ADD PHARMACY STOCK MODAL (RACK-WISE)
      ═══════════════════════════════════════════════ */}
      {showAddStockModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddStockModal(false); }}>
          <div className="modal modal-sm" style={{ maxWidth: 520, borderRadius: 20, overflow: 'hidden' }}>
            {/* Modal Header */}
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
                    <Package size={20} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      Add Drug Stock (Rack-Wise)
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                      Track generic medication batches &amp; storage locations
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddStockModal(false)}
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

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: 24 }}>
              <form onSubmit={handleAddStock}>
                <div className="form-group mb-md">
                  <label className="form-label" style={{ fontWeight: 600 }}>Generic Drug Name</label>
                  <input
                    className="form-control"
                    required
                    value={stockName}
                    onChange={e => setStockName(e.target.value)}
                    placeholder="e.g. Paracetamol 650mg, Ibuprofen 400mg"
                  />
                </div>

                <div className="form-grid-2 mb-md">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Classification</label>
                    <select
                      className="form-control"
                      value={stockCategory}
                      onChange={e => setStockCategory(e.target.value)}
                    >
                      <option value="Analgesic">Analgesic</option>
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Antihypertensive">Antihypertensive</option>
                      <option value="Antidiabetic">Antidiabetic</option>
                      <option value="Antihistamine">Antihistamine</option>
                      <option value="Steroid">Steroid</option>
                      <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Form</label>
                    <select
                      className="form-control"
                      value={stockForm}
                      onChange={e => setStockForm(e.target.value)}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Inhaler">Inhaler</option>
                    </select>
                  </div>
                </div>

                {/* RACK-WISE STORAGE SELECTION */}
                <div style={{
                  background: 'rgba(220,20,60,0.03)',
                  border: '1.5px solid var(--color-primary)',
                  borderRadius: 12, padding: 14, marginBottom: 16
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Landmark size={14} /> Storage Placement (Rack &amp; Shelf)
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label text-xs">Assign Rack Wing</label>
                      <select
                        className="form-control"
                        value={stockRack}
                        onChange={e => setStockRack(e.target.value)}
                      >
                        <option value="A">Rack Wing A (Analgesics / General)</option>
                        <option value="B">Rack Wing B (Antihypertensive / Cardio)</option>
                        <option value="C">Rack Wing C (Antibiotics / Vials)</option>
                        <option value="D">Rack Wing D (Syrups / Drops)</option>
                        <option value="E">Rack Wing E (Controlled Substances)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label text-xs">Shelf / Bin Level</label>
                      <select
                        className="form-control"
                        value={stockShelf}
                        onChange={e => setStockShelf(e.target.value)}
                      >
                        {Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(2, '0')).map(lvl => (
                          <option key={lvl} value={lvl}>Shelf Level {lvl}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-grid-3 mb-md">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Batch #</label>
                    <input
                      className="form-control"
                      value={stockBatch}
                      onChange={e => setStockBatch(e.target.value)}
                      placeholder="e.g. B2026-001"
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontWeight: 600 }}>Expiry Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={stockExpiry}
                      onChange={e => setStockExpiry(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-grid-3 mb-md">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Stock Qty</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stockCount}
                      onChange={e => setStockCount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Min Safety</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stockMinSafety}
                      onChange={e => setStockMinSafety(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Unit</label>
                    <select
                      className="form-control"
                      value={stockUnit}
                      onChange={e => setStockUnit(e.target.value)}
                    >
                      <option value="Strip">Strip (Tablets)</option>
                      <option value="Bottle">Bottle (Syrup)</option>
                      <option value="Vial">Vial (Injections)</option>
                      <option value="Piece">Piece (Inhaler)</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid-2 mb-lg">
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>Purchase Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={stockPurchaseRate}
                      onChange={e => setStockPurchaseRate(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>MRP (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={stockMrp}
                      onChange={e => setStockMrp(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddStockModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary w-full">Add to Stock Ledger</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
