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
    <section className="partners-band reveal">
      <div className="partners-inner">
        <span className="partners-label">Working in collaboration with</span>
        <div className="partners-logos">
          {partners.map((p, i) => (
            <div className="partner-logo" key={i} title={p.name}>
              <span>{p.logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
