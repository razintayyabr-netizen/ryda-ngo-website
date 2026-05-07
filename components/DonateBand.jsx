export default function DonateBand() {
  return (
    <section className="is-donate-band">
      <div className="container is-donate-inner">
        <div className="is-donate-text">
          <h2>Help Us Continue the Work</h2>
          <p>Your support enables RYDA to document violations, train leaders, and deliver aid. Every contribution makes a real difference.</p>
        </div>
        <div className="is-donate-actions">
          <a href="https://donate.stripe.com" target="_blank" rel="noreferrer" className="is-donate-white">
            Donate Now
          </a>
          <a href="mailto:ryda.rohingya@gmail.com?subject=Partnership%20Inquiry" className="is-donate-outline">
            Partner With Us
          </a>
        </div>
      </div>
    </section>
  );
}