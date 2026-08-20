'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [senderName, setSenderName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    setSenderName(data.name || 'Friend');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setSubmitted(true);
        e.target.reset();
      } else {
        setError(result.error || 'Failed to send message. Please try again or email us directly.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      setError('Network connection error. Please email ryda.rohingya@gmail.com directly.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="is-contact-success" role="alert">
        <div className="success-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
            <circle cx="12" cy="12" r="10" stroke="#0FA693" strokeWidth="2" fill="rgba(15,166,147,0.12)"/>
            <path d="M7 12.5L10.5 16L17 8.5" stroke="#0FA693" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>Message Sent Successfully!</h3>
        <p>
          Thank you, <strong>{senderName}</strong>. Your message has been sent to our team at <code>ryda.rohingya@gmail.com</code>. We will get back to you promptly.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => { setSubmitted(false); setError(''); }}
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
          >
            Send Another Message
          </button>
          <a
            href="mailto:ryda.rohingya@gmail.com"
            className="btn btn-primary btn-sm"
          >
            Open in Email App ✉️
          </a>
        </div>
      </div>
    );
  }

  return (
    <form className="is-contact-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="is-contact-error" role="alert">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="is-form-group">
        <label htmlFor="c-name">Full Name <span className="req">*</span></label>
        <input
          id="c-name"
          type="text"
          name="name"
          placeholder="Your full name"
          required
          autoComplete="name"
        />
      </div>

      <div className="is-form-group">
        <label htmlFor="c-email">Email Address <span className="req">*</span></label>
        <input
          id="c-email"
          type="email"
          name="email"
          placeholder="your.email@domain.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="is-form-group">
        <label htmlFor="c-subject">Subject (Optional)</label>
        <input
          id="c-subject"
          type="text"
          name="subject"
          placeholder="Partnership, Volunteering, Media, or General inquiry"
        />
      </div>

      <div className="is-form-group">
        <label htmlFor="c-message">Message <span className="req">*</span></label>
        <textarea
          id="c-message"
          name="message"
          rows={4}
          placeholder="How would you like to partner or get involved? Share your questions or thoughts..."
          required
        ></textarea>
      </div>

      <div className="is-form-actions">
        <button type="submit" className="is-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="form-spinner"></span>
              <span>Sending to ryda.rohingya@gmail.com...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M3 10H16M11 5L16 10L11 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
        <a
          href="mailto:ryda.rohingya@gmail.com?subject=Inquiry%20from%20RYDA%20Website"
          className="is-direct-mail-btn"
          title="Directly send an email using your mail client"
        >
          ✉️ Direct Email
        </a>
      </div>
    </form>
  );
}