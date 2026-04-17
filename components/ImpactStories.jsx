const stories = [
  {
    quote: "RYDA's documentation work gave our community a voice that could not be silenced. The reports they produced were cited by international bodies.",
    name: "Community Leader",
    location: "Cox's Bazar",
    icon: "📋"
  },
  {
    quote: "The youth leadership program changed my life. I went from feeling powerless to organizing training for 50 young people in my camp.",
    name: "Youth Participant",
    location: "Camp 4",
    icon: "🌱"
  },
  {
    quote: "When the floods hit, RYDA was the first to respond with emergency supplies. They saved lives that night.",
    name: "Relief Recipient",
    location: "Camp 8",
    icon: "🆘"
  },
];

export default function ImpactStories() {
  return (
    <section className="section impact-section" id="impact">
      <div className="section-inner">
        <div className="section-header-simple">
          <span className="section-tag">Impact</span>
          <h2 className="section-title">Stories of Change</h2>
          <p className="section-desc">Real voices from the communities RYDA serves.</p>
        </div>
        <div className="impact-grid">
          {stories.map((s, i) => (
            <div key={i} className="impact-card">
              <div className="impact-icon">{s.icon}</div>
              <blockquote className="impact-quote">"{s.quote}"</blockquote>
              <div className="impact-author">
                <span className="author-name">{s.name}</span>
                <span className="author-location">{s.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}