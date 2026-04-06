'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [note, setNote] = useState('');

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name    = fd.get('name')?.toString().trim();
    const email   = fd.get('email')?.toString().trim();
    const subject = fd.get('subject')?.toString().trim();
    const message = fd.get('message')?.toString().trim();

    if (!name || !email || !subject || !message) {
      setNote('Please fill in all fields.');
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const url = "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent("ryda.rohingya@gmail.com")}` +
      `&su=${encodeURIComponent(`[RYDA] ${subject}`)}` +
      `&body=${encodeURIComponent(body)}`;

    window.open(url, "_blank", "noopener");
    setNote('Gmail draft opened in a new tab.');
    e.target.reset();
  };

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand-col">
          <div className="footer-brand">
            <img src="/assets/ryda-logo.svg" alt="RYDA" width="64" height="64" />
            <div>
              <div className="footer-brand-name">RYDA</div>
              <div className="footer-brand-full">Rohingya Youth Development Association</div>
            </div>
          </div>
          <p className="footer-tagline">Documenting violations. Amplifying voices. Building leaders. Delivering relief.</p>
          <div className="footer-social">
            <a href="https://x.com/RYDA35" target="_blank" rel="noreferrer" aria-label="RYDA on X/Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.8 4.5H21L16.1 10.12L21.86 19.5H17.35L13.82 13.83L8.87 19.5H6.65L11.89 13.5L6.36 4.5H10.99L14.18 9.89L18.8 4.5Z"/></svg>
            </a>
            <a href="https://www.instagram.com/ryda.467/" target="_blank" rel="noreferrer" aria-label="RYDA on Instagram">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><rect x="4.5" y="4.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>
            </a>
            <a href="https://www.facebook.com/share/1B9sauUHNF/" target="_blank" rel="noreferrer" aria-label="RYDA on Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M13.35 20V12.75H15.78L16.15 9.92H13.35V8.12C13.35 7.3 13.58 6.74 14.76 6.74H16.25V4.2C15.55 4.12 14.84 4.08 14.13 4.08C11.99 4.08 10.52 5.39 10.52 7.8V9.92H8.08V12.75H10.52V20H13.35Z"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-contact-col">
          <h3 className="footer-col-title">Get In Touch</h3>
          <a href="mailto:ryda.rohingya@gmail.com" className="footer-contact-link">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M4 7.5L11.12 12.24C11.66 12.6 12.34 12.6 12.88 12.24L20 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/></svg>
            ryda.rohingya@gmail.com
          </a>
          <a href="tel:+8801843959525" className="footer-contact-link">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M8.45 4.5H5.8C5.08 4.5 4.5 5.08 4.5 5.8C4.5 13.92 10.08 19.5 18.2 19.5C18.92 19.5 19.5 18.92 19.5 18.2V15.56C19.5 15.02 19.16 14.54 18.64 14.36L15.76 13.4C15.29 13.24 14.77 13.37 14.42 13.73L13.1 15.04C10.86 13.9 9.1 12.14 7.96 9.9L9.27 8.58C9.63 8.23 9.76 7.71 9.6 7.24L8.64 4.36C8.46 3.84 7.98 3.5 7.44 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +880 1843-959525
          </a>

          <form className="footer-contact-form" id="contact-form" noValidate onSubmit={handleContactSubmit}>
            <div className="fcf-row">
              <input type="text" id="fcf-name" name="name" placeholder="Your name" maxLength="80" required />
              <input type="email" id="fcf-email" name="email" placeholder="your@email.com" required />
            </div>
            <input type="text" id="fcf-subject" name="subject" placeholder="Subject" maxLength="140" required />
            <textarea id="fcf-message" name="message" rows="4" placeholder="Your message…" maxLength="3000" required></textarea>
            <button className="btn btn-primary" type="submit">Open Gmail Draft</button>
            <p className="fcf-note" id="fcf-note" aria-live="polite">{note}</p>
          </form>
        </div>

        <div className="footer-nav-col">
          <h3 className="footer-col-title">Navigate</h3>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link href="/#about">About</Link>
            <Link href="/#programs">Programs</Link>
            <Link href="/#newsroom">Newsroom</Link>
            <Link href="/#values">Values</Link>
            <Link href="/#contact">Contact</Link>
            <Link href="/writer" target="_blank">Writer Panel</Link>
          </nav>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2025 Rohingya Youth Development Association (RYDA). All rights reserved.</span>
        <span className="footer-bottom-right">Justice · Dignity · Empowerment</span>
      </div>
    </footer>
  );
}
