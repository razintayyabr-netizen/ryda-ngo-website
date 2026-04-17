export default function DonateBand() {
  return (
    <section className="donate-band">
      <div className="donate-inner">
        <div className="donate-text">
          <h2>Help Us Continue the Work</h2>
          <p>Your support enables RYDA to document violations, train leaders, and deliver aid. Every contribution makes a real difference.</p>
        </div>
        <div className="donate-actions">
          <a href="https://donate.stripe.com" target="_blank" rel="noreferrer" className="btn btn-donate">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M20.25 12.75H3.75M20.25 6.75H3.75M20.25 18.75H3.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Donate Now
          </a>
          <a href="mailto:ryda.rohingya@gmail.com?subject=Partnership%20Inquiry" className="btn btn-outline-light">Partner With Us</a>
        </div>
      </div>
    </section>
  );
}