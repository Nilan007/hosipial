import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  Activity,
  Heart,
  Shield,
  Users,
  Building2,
  Star,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Inline styles (no external CSS file required)
───────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  /* Full-screen wrapper */
  root: {
    minHeight: '100vh',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1626 40%, #0a1628 70%, #07101e 100%)',
  },

  /* ── Animated gradient orbs ── */
  orb1: {
    position: 'fixed',
    top: '-20%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(56,139,253,0.18) 0%, transparent 70%)',
    animation: 'orbFloat1 12s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orb2: {
    position: 'fixed',
    bottom: '-15%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
    animation: 'orbFloat2 15s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orb3: {
    position: 'fixed',
    top: '40%',
    left: '35%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)',
    animation: 'orbFloat3 18s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* ── Floating cross container ── */
  crossesWrapper: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  },

  /* ── Two-column layout ── */
  layout: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    position: 'relative',
    zIndex: 1,
  },

  /* ── LEFT PANEL ── */
  leftPanel: {
    flex: '0 0 48%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 64px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftPanelBg: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(145deg, rgba(56,139,253,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(139,92,246,0.10) 100%)',
    backdropFilter: 'blur(2px)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  leftContent: { position: 'relative', zIndex: 2 },

  /* Logo */
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 28px rgba(59,130,246,0.45)',
  },
  logoText: {
    fontSize: 26,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
  },
  logoSub: { fontSize: 11, color: 'rgba(148,163,184,0.8)', letterSpacing: 2, marginTop: 2, textTransform: 'uppercase' },

  /* Headline */
  headline: {
    fontSize: 42,
    fontWeight: 800,
    color: '#f1f5f9',
    lineHeight: 1.18,
    marginBottom: 18,
    letterSpacing: '-1px',
  },
  headlineAccent: {
    background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtext: { fontSize: 16, color: 'rgba(148,163,184,0.85)', lineHeight: 1.7, marginBottom: 52, maxWidth: 400 },

  /* Stats grid */
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 48 },
  statCard: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '20px 22px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s, border-color 0.2s',
    cursor: 'default',
  },
  statIcon: { marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'rgba(148,163,184,0.75)', marginTop: 4, fontWeight: 500 },

  /* Trust badges */
  trustRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  trustBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 20,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    fontSize: 12,
    color: 'rgba(203,213,225,0.9)',
    fontWeight: 500,
  },

  /* ── RIGHT PANEL ── */
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
  },
  formCard: {
    width: '100%',
    maxWidth: 460,
    background: 'rgba(15,23,42,0.75)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 24,
    padding: '44px 44px',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
  },
  formTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#f1f5f9',
    marginBottom: 6,
    letterSpacing: '-0.5px',
  },
  formSubtitle: { fontSize: 14, color: 'rgba(148,163,184,0.75)', marginBottom: 28 },

  /* Role switcher */
  roleSwitcherLabel: { fontSize: 12, color: 'rgba(148,163,184,0.75)', fontWeight: 600, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  roleSwitcher: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 },

  /* Input group */
  inputGroup: { marginBottom: 20, position: 'relative' },
  inputLabel: { display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(203,213,225,0.9)', marginBottom: 8 },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(148,163,184,0.6)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1.5px solid rgba(255,255,255,0.10)',
    borderRadius: 12,
    padding: '13px 44px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    boxSizing: 'border-box',
  },
  inputFocused: {
    borderColor: 'rgba(99,102,241,0.6)',
    background: 'rgba(255,255,255,0.09)',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.18)',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(148,163,184,0.7)',
    padding: 0,
    display: 'flex',
  },

  /* Remember row */
  rememberRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'rgba(203,213,225,0.85)' },
  checkbox: { width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' },
  forgotLink: { fontSize: 13, color: 'rgba(99,102,241,0.9)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 },

  /* Submit button */
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: 12,
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
    transition: 'opacity 0.2s, transform 0.15s, box-shadow 0.2s',
    letterSpacing: '0.3px',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },

  /* Alert */
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 20,
    fontWeight: 500,
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderRadius: 10,
    background: 'rgba(52,211,153,0.12)',
    border: '1px solid rgba(52,211,153,0.3)',
    color: '#6ee7b7',
    fontSize: 13,
    marginBottom: 20,
    fontWeight: 500,
  },

  /* Demo credentials hint */
  credHint: {
    marginTop: 24,
    padding: '14px 16px',
    borderRadius: 12,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.18)',
  },
  credHintTitle: { fontSize: 11, fontWeight: 700, color: 'rgba(165,180,252,0.9)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  credGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' },
  credItem: { fontSize: 11, color: 'rgba(148,163,184,0.75)', fontFamily: 'monospace' },

  /* Spinner */
  spinner: {
    width: 18,
    height: 18,
    border: '2.5px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
};

/* ─────────────────────────────────────────────────────────
   Role definitions
───────────────────────────────────────────────────────── */
interface RoleOption {
  label: string;
  username: string;
  password: string;
  color: string;
  glow: string;
}

const roles: RoleOption[] = [
  { label: 'Admin',        username: 'admin',       password: 'admin123',       color: 'rgba(99,102,241,0.85)',  glow: 'rgba(99,102,241,0.4)' },
  { label: 'Doctor',       username: 'doctor',      password: 'doctor123',      color: 'rgba(59,130,246,0.85)', glow: 'rgba(59,130,246,0.4)' },
  { label: 'Nurse',        username: 'nurse',       password: 'nurse123',       color: 'rgba(20,184,166,0.85)', glow: 'rgba(20,184,166,0.4)' },
  { label: 'Receptionist', username: 'receptionist',password: 'reception123',   color: 'rgba(251,146,60,0.85)', glow: 'rgba(251,146,60,0.4)' },
  { label: 'Pharmacist',   username: 'pharmacist',  password: 'pharma123',      color: 'rgba(234,179,8,0.85)',  glow: 'rgba(234,179,8,0.4)'  },
  { label: 'Management',   username: 'management',  password: 'manage123',      color: 'rgba(236,72,153,0.85)', glow: 'rgba(236,72,153,0.4)' },
];

/* ─────────────────────────────────────────────────────────
   Stats data
───────────────────────────────────────────────────────── */
const stats = [
  { icon: <Users size={20} color="#60a5fa" />, value: '1,200+', label: 'Active Patients',    accent: '#60a5fa' },
  { icon: <Activity size={20} color="#a78bfa" />, value: '45+',   label: 'Specialist Doctors', accent: '#a78bfa' },
  { icon: <Building2 size={20} color="#34d399" />, value: '27',    label: 'Departments',        accent: '#34d399' },
  { icon: <Star size={20} color="#fbbf24" />, value: '98.2%', label: 'Patient Satisfaction', accent: '#fbbf24' },
];

/* ─────────────────────────────────────────────────────────
   Floating Cross component
───────────────────────────────────────────────────────── */
interface CrossProps { size: number; x: number; y: number; opacity: number; delay: number; duration: number; color: string }
const FloatingCross: React.FC<CrossProps> = ({ size, x, y, opacity, delay, duration, color }) => (
  <svg
    style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      opacity,
      animation: `floatCross ${duration}s ease-in-out ${delay}s infinite`,
    }}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <rect x="9" y="2" width="6" height="20" rx="2" fill={color} />
    <rect x="2" y="9" width="20" height="6" rx="2" fill={color} />
  </svg>
);

const crossData: CrossProps[] = [
  { size: 28, x: 5,  y: 10, opacity: 0.06, delay: 0,   duration: 10, color: '#60a5fa' },
  { size: 18, x: 88, y: 5,  opacity: 0.08, delay: 2,   duration: 13, color: '#a78bfa' },
  { size: 36, x: 15, y: 75, opacity: 0.05, delay: 4,   duration: 16, color: '#34d399' },
  { size: 22, x: 75, y: 80, opacity: 0.07, delay: 1.5, duration: 11, color: '#60a5fa' },
  { size: 14, x: 45, y: 8,  opacity: 0.06, delay: 3,   duration: 14, color: '#fbbf24' },
  { size: 26, x: 92, y: 45, opacity: 0.05, delay: 0.5, duration: 17, color: '#a78bfa' },
  { size: 20, x: 60, y: 92, opacity: 0.07, delay: 2.5, duration: 12, color: '#34d399' },
  { size: 32, x: 30, y: 88, opacity: 0.04, delay: 1,   duration: 19, color: '#60a5fa' },
  { size: 16, x: 78, y: 22, opacity: 0.06, delay: 3.5, duration: 15, color: '#ec4899' },
  { size: 24, x: 20, y: 40, opacity: 0.05, delay: 5,   duration: 13, color: '#a78bfa' },
];

/* ─────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────── */
const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeRole, setActiveRole] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [btnHovered, setBtnHovered] = useState(false);

  /* Inject keyframes once */
  useEffect(() => {
    const id = 'medicore-login-keyframes';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        @keyframes orbFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-30px) scale(1.05); }
          66%      { transform: translate(-20px,20px) scale(0.98); }
        }
        @keyframes orbFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-50px,30px) scale(1.08); }
          70%      { transform: translate(20px,-20px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-40px) scale(1.06); }
        }
        @keyframes floatCross {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25%      { transform: translateY(-18px) rotate(8deg); }
          75%      { transform: translateY(10px) rotate(-5deg); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .stat-card-hover:hover {
          transform: translateY(-3px) !important;
          border-color: rgba(255,255,255,0.16) !important;
        }
        .role-btn-active {
          transform: scale(1.04);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const selectRole = (idx: number) => {
    setActiveRole(idx);
    setUsername(roles[idx].username);
    setPassword(roles[idx].password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const ok = await login(username.trim(), password.trim());
      if (ok) {
        setSuccess('Login successful! Redirecting…');
        setTimeout(() => navigate('/dashboard'), 900);
      } else {
        setError('Invalid credentials. Try one of the demo roles below.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Merge base + focus styles for inputs */
  const getInputStyle = (field: string): React.CSSProperties =>
    focusedField === field
      ? { ...styles.input, ...styles.inputFocused }
      : styles.input;

  return (
    <div style={styles.root}>
      {/* CSS keyframe injection is done in useEffect */}

      {/* Orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* Floating crosses */}
      <div style={styles.crossesWrapper}>
        {crossData.map((c, i) => <FloatingCross key={i} {...c} />)}
      </div>

      <div style={styles.layout}>
        {/* ════════════════ LEFT PANEL ════════════════ */}
        <div style={styles.leftPanel}>
          <div style={styles.leftPanelBg} />
          <div style={styles.leftContent}>

            {/* Logo */}
            <div style={styles.logoRow}>
              <div style={styles.logoIcon}>
                <Heart size={26} color="#fff" fill="#fff" />
              </div>
              <div>
                <div style={styles.logoText}>MediCore HMS</div>
                <div style={styles.logoSub}>Hospital Management System</div>
              </div>
            </div>

            {/* Headline */}
            <h1 style={styles.headline}>
              Next-Gen<br />
              <span style={styles.headlineAccent}>Healthcare</span>{' '}
              Management
            </h1>
            <p style={styles.subtext}>
              Streamline operations, enhance patient care, and empower your
              medical team with our comprehensive hospital management platform.
            </p>

            {/* Stats */}
            <div style={styles.statsGrid}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  style={styles.statCard}
                  className="stat-card-hover"
                >
                  <div style={styles.statIcon}>{s.icon}</div>
                  <div style={{ ...styles.statValue, color: s.accent }}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={styles.trustRow}>
              {[
                { icon: <Shield size={13} color="#34d399" />, text: 'HIPAA Compliant' },
                { icon: <CheckCircle2 size={13} color="#60a5fa" />, text: 'ISO 27001 Certified' },
                { icon: <Activity size={13} color="#a78bfa" />, text: '99.9% Uptime' },
              ].map((b, i) => (
                <div key={i} style={styles.trustBadge}>
                  {b.icon}
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ════════════════ RIGHT PANEL ════════════════ */}
        <div style={styles.rightPanel}>
          <div style={{ ...styles.formCard, animation: 'fadeSlideIn 0.5s ease both' }}>
            <div style={styles.formTitle}>Welcome Back 👋</div>
            <div style={styles.formSubtitle}>Sign in to access your dashboard</div>

            {/* Role switcher */}
            <div style={styles.roleSwitcherLabel}>Quick Demo Login</div>
            <div style={styles.roleSwitcher}>
              {roles.map((r, i) => (
                <button
                  key={i}
                  onClick={() => selectRole(i)}
                  className={activeRole === i ? 'role-btn-active' : ''}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${activeRole === i ? r.color : 'rgba(255,255,255,0.10)'}`,
                    background: activeRole === i
                      ? `rgba(${r.color.slice(5, -6)}, 0.18)`
                      : 'rgba(255,255,255,0.04)',
                    color: activeRole === i ? '#f1f5f9' : 'rgba(148,163,184,0.8)',
                    fontSize: 12,
                    fontWeight: activeRole === i ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: activeRole === i ? `0 0 12px ${r.glow}` : 'none',
                    letterSpacing: '0.2px',
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Alerts */}
            {error && (
              <div style={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div style={styles.successAlert}>
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Username */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Username</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}><User size={16} /></span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your username"
                    style={getInputStyle('username')}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Password</label>
                <div style={styles.inputWrapper}>
                  <span style={styles.inputIcon}><Lock size={16} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Enter your password"
                    style={getInputStyle('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me / Forgot */}
              <div style={styles.rememberRow}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={styles.checkbox}
                  />
                  Remember me
                </label>
                <button type="button" style={styles.forgotLink}>Forgot password?</button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  ...styles.submitBtn,
                  ...(loading ? styles.submitBtnDisabled : {}),
                  ...(btnHovered && !loading ? { opacity: 0.92, transform: 'translateY(-1px)', boxShadow: '0 12px 32px rgba(99,102,241,0.55)' } : {}),
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
                    Signing In…
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Demo credentials hint */}
            <div style={styles.credHint}>
              <div style={styles.credHintTitle}>🔑 Demo Credentials</div>
              <div style={styles.credGrid}>
                {roles.map((r, i) => (
                  <div key={i} style={styles.credItem}>
                    <span style={{ color: 'rgba(165,180,252,0.85)' }}>{r.username}</span>
                    <span style={{ color: 'rgba(100,116,139,0.7)' }}> / </span>
                    <span>{r.password}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
