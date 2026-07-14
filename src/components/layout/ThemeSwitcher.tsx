import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { useTheme, THEMES } from '../../contexts/ThemeContext';
import type { ThemeId } from '../../contexts/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="topnav-btn theme-switcher-btn"
        onClick={() => setOpen(!open)}
        title="Change Theme"
        style={{ position: 'relative' }}
      >
        <Palette size={16} />
      </button>

      {open && (
        <div
          className="theme-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 300,
            background: 'white',
            border: '1.5px solid var(--color-border)',
            borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            background: 'var(--color-bg-primary)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: 8,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Palette size={14} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>Choose Theme</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>6 professional themes</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Themes Grid */}
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {THEMES.map(theme => {
              const isActive = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id as ThemeId); setOpen(false); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    padding: 0,
                    border: isActive
                      ? `2px solid ${theme.preview.accent}`
                      : '2px solid rgba(0,0,0,0.07)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    background: 'none',
                    transition: 'all 0.15s ease',
                    overflow: 'hidden',
                    boxShadow: isActive
                      ? `0 4px 16px ${theme.preview.accent}33`
                      : '0 1px 4px rgba(0,0,0,0.06)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Mini preview */}
                  <div style={{ display: 'flex', height: 44, overflow: 'hidden' }}>
                    {/* Sidebar strip */}
                    <div style={{
                      width: 32,
                      background: theme.preview.sidebar,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '6px 4px',
                      gap: 4,
                    }}>
                      {[...Array(4)].map((_, i) => (
                        <div key={i} style={{
                          width: i === 0 ? 20 : 16,
                          height: 3,
                          borderRadius: 2,
                          background: i === 0
                            ? theme.preview.accent
                            : `rgba(255,255,255,0.25)`,
                        }} />
                      ))}
                    </div>
                    {/* Content area */}
                    <div style={{ flex: 1, background: theme.preview.bg, padding: '5px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <div style={{ height: 5, background: 'white', borderRadius: 2, width: '100%', boxShadow: `0 1px 3px rgba(0,0,0,0.08)` }} />
                      <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                        <div style={{ flex: 1, background: 'white', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: 10, height: 3, borderRadius: 1, background: theme.preview.accent }} />
                        </div>
                        <div style={{ flex: 1, background: 'white', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div style={{
                    padding: '6px 8px',
                    background: isActive ? `${theme.preview.accent}10` : '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(0,0,0,0.05)',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: isActive ? theme.preview.accent : '#374151',
                        lineHeight: 1.2,
                      }}>
                        {theme.label}
                      </div>
                    </div>
                    {isActive && (
                      <div style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: theme.preview.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={9} color="white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{
            padding: '8px 16px',
            fontSize: 10,
            color: '#9ca3af',
            textAlign: 'center',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            background: '#fafafa',
          }}>
            Theme preference saved automatically
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
