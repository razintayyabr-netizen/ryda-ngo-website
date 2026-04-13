import Link from 'next/link';

export default function Values() {
  return (
    <section className="section values-section" id="values">
      <div className="section-header">
        <span className="section-tag">Core Values</span>
        <h2>The principles that guide RYDA's advocacy, documentation, and humanitarian action.</h2>
      </div>

      <div className="values-grid" role="list" aria-label="Core values">
        <article className="value-card reveal" style={{ '--delay': '0s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L18.5 7.5V12C18.5 15.88 15.95 19.28 12 20.5C8.05 19.28 5.5 15.88 5.5 12V7.5L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Human Dignity</h3>
          <p>Upholding the inherent dignity and fundamental rights of Rohingya communities in every action.</p>
        </article>
        <article className="value-card reveal" style={{ '--delay': '0.08s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L14.8 10.17L21 11.09L16.5 15.47L17.56 21.5L12 18.58L6.44 21.5L7.5 15.47L3 11.09L9.2 10.17L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Youth Empowerment</h3>
          <p>Rohingya youths, girls, and women supported as leaders, organizers, and agents of change.</p>
        </article>
        <article className="value-card reveal" style={{ '--delay': '0.16s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 5.5H17M7 10.5H17M7 15.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><rect x="4.5" y="3.5" width="15" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Integrity &amp; Accountability</h3>
          <p>Transparency, ethical responsibility, and evidence-based work shape RYDA's reporting and advocacy.</p>
        </article>
        <article className="value-card reveal" style={{ '--delay': '0.24s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12M5 18.5C6.17 16.39 8.78 15 12 15C15.22 15 17.83 16.39 19 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Community Participation</h3>
          <p>Community voices, experiences, and priorities guide RYDA through consultation and participatory action.</p>
        </article>
        <article className="value-card reveal" style={{ '--delay': '0.32s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5L10 16.5L18 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Equality &amp; Justice</h3>
          <p>Standing against discrimination, working for fairness, equal access to rights, and justice.</p>
        </article>
        <article className="value-card reveal" style={{ '--delay': '0.40s' }}>
          <div className="value-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L18.5 7.5V12C18.5 15.88 15.95 19.28 12 20.5C8.05 19.28 5.5 15.88 5.5 12V7.5L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.8 13.2H15.2M12 10V16.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Humanitarian Assistance</h3>
          <p>Urgent support delivered with care and dignity, prioritizing those facing the greatest risk.</p>
        </article>
      </div>

      <div className="cta-band reveal">
        <div className="cta-inner">
          <div className="cta-text">
            <span className="section-tag">Stand With RYDA</span>
            <h2>Stand with a Rohingya-led organization advancing protection, accountability, and community leadership.</h2>
            <p>RYDA welcomes collaboration with civil society organizations, media partners, researchers, advocates, and institutions committed to justice and community-led change.</p>
          </div>
          <div className="cta-actions">
            <a className="btn btn-primary btn-lg" href="mailto:ryda.rohingya@gmail.com">Contact RYDA</a>
            <Link className="btn btn-ghost-light" href="/#newsroom">Read Our Reports</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
