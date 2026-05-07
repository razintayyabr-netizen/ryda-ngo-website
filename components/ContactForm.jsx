'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.target);
    try {
      const res = await fetch('/api/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(fd)), headers: { 'Content-Type': 'application/json' } });
      if (res.ok) { setSubmitted(true); e.target.reset(); }
    } catch { /* silent */ }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(27,94,32,0.08)', borderRadius: '12px', border: '1px solid rgba(27,94,32,0.2)' }}>
        <p style={{ color: 'var(--color-primary)', fontWeight: 600, margin: 0 }}>Thank you! We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form className="is-contact-form" onSubmit={handleSubmit}>
      <div className="is-form-group">
        <label>Name</label>
        <input type="text" name="name" placeholder="Your full name" required />
      </div>
      <div className="is-form-group">
        <label>Email</label>
        <input type="email" name="email" placeholder="your@email.com" required />
      </div>
      <div className="is-form-group">
        <label>Message</label>
        <textarea name="message" placeholder="How would you like to get involved?" required></textarea>
      </div>
      <button type="submit" className="is-submit-btn" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}