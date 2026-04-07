import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero" aria-label="RYDA introduction">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grain"></div>
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>
        <div className="hero-lines"></div>
      </div>

      <div className="hero-content">
        <div className="hero-eyebrow">
          <img src="/assets/ryda-logo.svg" alt="" width="28" height="28" aria-hidden="true" />
          <span>Est. Cox's Bazar · Bangladesh</span>
        </div>

        <h1 className="hero-headline">
          <span className="headline-thin">Justice for the</span>
          <span className="headline-bold">Rohingya</span>
          <span className="headline-italic">through evidence,</span>
          <span className="headline-bold headline-accent">advocacy &amp; action.</span>
        </h1>

        <p className="hero-lead">
          RYDA is a Rohingya-led civil society organization documenting
          violations, amplifying refugee voices, building youth leaders, and delivering
          humanitarian support where it matters most.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary" href="/#contact">Partner With RYDA</Link>
          <Link className="btn btn-ghost" href="/#programs">Explore Programs</Link>
        </div>

        <div className="hero-pillars">
          <div className="pillar">
            <span className="pillar-num">01</span>
            <span className="pillar-label">Documentation<br/>&amp; Reporting</span>
          </div>
          <div className="pillar-divider" aria-hidden="true"></div>
          <div className="pillar">
            <span className="pillar-num">02</span>
            <span className="pillar-label">International<br/>Advocacy</span>
          </div>
          <div className="pillar-divider" aria-hidden="true"></div>
          <div className="pillar">
            <span className="pillar-num">03</span>
            <span className="pillar-label">Youth<br/>Leadership</span>
          </div>
          <div className="pillar-divider" aria-hidden="true"></div>
          <div className="pillar">
            <span className="pillar-num">04</span>
            <span className="pillar-label">Education<br/>&amp; Literacy</span>
          </div>
          <div className="pillar-divider" aria-hidden="true"></div>
          <div className="pillar">
            <span className="pillar-num">05</span>
            <span className="pillar-label">Emergency<br/>Response</span>
          </div>
        </div>
      </div>

      <div className="hero-panel" aria-label="Key facts">
        <div className="panel-card">
          <span className="panel-label">Mandate</span>
          <p>Working exclusively for Rohingya communities through advocacy, documentation, leadership, education, research, and humanitarian action.</p>
        </div>
        <div className="panel-card">
          <span className="panel-label">Human Rights Focus</span>
          <p>Tracking killings, arbitrary detention, sexual &amp; gender-based violence, and restrictions on expression, association, and movement.</p>
        </div>
        <div className="panel-card panel-card-accent">
          <span className="panel-label">Reach</span>
          <p>Local, national &amp; international representation — strengthening protection at every level.</p>
        </div>
      </div>
    </section>
  );
}
