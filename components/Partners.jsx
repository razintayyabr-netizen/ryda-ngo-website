'use client';

export default function Partners() {
  const partners = [
    { name: "UNHCR", logo: "UN" },
    { name: "Global Rights", logo: "GR" },
    { name: "HRW", logo: "HRW" },
    { name: "Amnesty", logo: "AI" },
    { name: "Fortify", logo: "FR" }
  ];

  return (
      <div className="is-partners" aria-label="Partner organizations">
      <div className="is-partners-inner">
        <span className="is-partners-label">Working in collaboration with</span>
        <div className="is-partners-logos">
          {partners.map((p, i) => (
            <div className="is-partner-item" key={i} title={p.name} role="img" aria-label={p.name}>
              <span>{p.logo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
