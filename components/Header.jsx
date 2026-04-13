'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ryda-theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    const handleClickOutside = (e) => {
      if (!e.target.closest('#site-header')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ryda-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ryda-theme', 'light');
    }
  };

  const closeMenu = () => {
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`} id="site-header" role="banner">
      <div className="header-inner">
        <Link href="/#top" className="brand" aria-label="RYDA home" onClick={closeMenu}>
          <div className="brand-logo">
            <img src="/assets/ryda-logo.svg" alt="RYDA logo" width="44" height="44" fetchPriority="high" />
          </div>
          <div className="brand-text">
            <span className="brand-abbr">RYDA</span>
            <span className="brand-full">Rohingya Youth Development Association</span>
          </div>
        </Link>

        <nav className="site-nav" id="site-nav" aria-label="Primary navigation">
          <Link href="/#about" onClick={closeMenu}>About</Link>
          <Link href="/#programs" onClick={closeMenu}>Programs</Link>
          <Link href="/newsroom" onClick={closeMenu}>Newsroom</Link>
          <Link href="/#values" onClick={closeMenu}>Values</Link>
          <Link href="/#contact" onClick={closeMenu}>Contact</Link>
          <Link href="/writer" className="nav-writer-link" target="_blank" onClick={closeMenu}>
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" aria-hidden="true">
              <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            Write
          </Link>
          <button
            className="dark-mode-toggle"
            type="button"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 2V4M12 20V22M4 12H2M22 12H20M6.34 6.34L4.93 4.93M19.07 19.07L17.66 17.66M6.34 17.66L4.93 19.07M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </nav>

        <button 
          className="menu-toggle" 
          type="button" 
          aria-expanded={menuOpen} 
          aria-controls="site-nav" 
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  );
}