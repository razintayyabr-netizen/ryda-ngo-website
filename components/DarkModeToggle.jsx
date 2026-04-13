'use client';

import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('ryda-dark-mode');
    if (saved === 'true') {
      setDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('ryda-dark-mode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        flexShrink: 0,
      }}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" style={{ color: '#2563EB' }}>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" width="20" height="20" style={{ color: '#2563EB' }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}