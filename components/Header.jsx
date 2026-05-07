'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href) => {
    if (href.startsWith('/#')) return false;
    return pathname === href;
  };

  return (
    <>
      <header className={`is-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container is-nav-container">
          <Link href="/" className="is-logo">
            <img src="/assets/ryda-logo.svg" alt="RYDA" width="28" height="28" />
            <span className="is-logo-text">RYDA</span>
          </Link>

          <nav className="is-nav-links">
            <Link href="/#about" className={isActive('/#about') ? 'active' : ''}>About</Link>
            <Link href="/#programs" className={isActive('/#programs') ? 'active' : ''}>Programs</Link>
            <Link href="/newsroom" className={isActive('/newsroom') ? 'active' : ''}>Newsroom</Link>
            <Link href="/#values" className={isActive('/#values') ? 'active' : ''}>Values</Link>
            <Link href="/#contact" className={isActive('/#contact') ? 'active' : ''}>Contact</Link>
            <Link href="https://donate.stripe.com" target="_blank" rel="noreferrer" className="is-nav-donate">
              Donate
            </Link>
          </nav>

          <div className="is-mobile-actions">
            <Link href="https://donate.stripe.com" target="_blank" rel="noreferrer" className="is-mobile-donate">
              Donate
            </Link>
            <button
              className="is-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={`is-mobile-menu ${menuOpen ? 'is-mobile-menu-open' : ''}`}>
        <nav className="is-mobile-nav">
          <Link href="/#about" className={isActive('/#about') ? 'active' : ''} onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/#programs" className={isActive('/#programs') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Programs</Link>
          <Link href="/newsroom" className={isActive('/newsroom') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Newsroom</Link>
          <Link href="/#values" className={isActive('/#values') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Values</Link>
          <Link href="/#contact" className={isActive('/#contact') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link href="https://donate.stripe.com" target="_blank" rel="noreferrer" className="is-mobile-donate-btn" onClick={() => setMenuOpen(false)}>
            Donate Now
          </Link>
        </nav>
      </div>
    </>
  );
}