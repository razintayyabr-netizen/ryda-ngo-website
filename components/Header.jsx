'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = () => {
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`} id="site-header">
      <div className="header-inner">
        <Link href="/#top" className="brand" aria-label="RYDA home" onClick={closeMenu}>
          <div className="brand-logo">
            <img src="/assets/ryda-logo.svg" alt="RYDA" width="44" height="44" fetchPriority="high" />
          </div>
          <div className="brand-text">
            <span className="brand-abbr">RYDA</span>
            <span className="brand-full">Rohingya Youth Development Association</span>
          </div>
        </Link>

        <nav className="site-nav" id="site-nav" aria-label="Primary navigation">
          <Link href="/#about" onClick={closeMenu}>About</Link>
          <Link href="/#programs" onClick={closeMenu}>Programs</Link>
          <Link href="/#newsroom" onClick={closeMenu}>Newsroom</Link>
          <Link href="/#values" onClick={closeMenu}>Values</Link>
          <Link href="/#contact" onClick={closeMenu}>Contact</Link>
          <Link href="/writer" className="nav-writer-link" target="_blank" onClick={closeMenu}>
            <svg viewBox="0 0 20 20" fill="none" width="14" height="14" aria-hidden="true">
              <path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            </svg>
            Write
          </Link>
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
