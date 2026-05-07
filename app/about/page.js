import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import ScrollReveal from '@/components/ScrollReveal';
import Link from 'next/link';

const values = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Human Dignity',
    desc: 'We uphold the inherent dignity and fundamental rights of Rohingya communities through systematic documentation and public reporting of violations.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Youth Empowerment',
    desc: 'We strengthen the leadership, skills, and participation of Rohingya youths, girls, and women as agents of positive change in their communities.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Integrity & Accountability',
    desc: 'We ensure transparency, honesty, and ethical responsibility through evidence-based documentation and advocacy for justice.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Community Participation',
    desc: 'We place Rohingya communities at the center of our work — their voices, experiences, and priorities guide every action we take.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Equality & Justice',
    desc: 'We stand for non-discrimination, fairness, and equal access to rights through advocacy, legal engagement, and international outreach.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Humanitarian Assistance',
    desc: 'We respond to urgent needs — food, water, shelter, medical care, and psychosocial support — prioritizing the most vulnerable.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-inner">
              <span className="section-tag">About RYDA</span>
              <h1>Rohingya Youth Development Association</h1>
              <p className="about-hero-sub">
                A Rohingya-led civil society organization working exclusively for the Rohingya community.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Text */}
        <section className="section about-mission">
          <div className="container">
            <div className="about-grid">
              <div className="about-text">
                <p>The Rohingya Youth Development Association (RYDA) is a civil society organization working exclusively for the Rohingya community. RYDA conducts comprehensive human rights advocacy, systematically documents and publicly reports violations including killings, arbitrary detention, sexual and gender-based violence, and restrictions on freedom of expression, association, and movement, and carries out in-depth research while engaging in international advocacy and global campaigns to ensure accountability.</p>
                <p>RYDA actively promotes fundamental freedoms including freedom of expression, association, and movement even in the face of severe restrictions. The organization provides training, mentorship, and platforms for youth, girls, and women to organize, lead initiatives, and participate fully in decision-making.</p>
                <p>Through its programs, RYDA strengthens community resilience, representation, empowerment, and protection of Rohingya rights and dignity at local, national, and international levels. The organization also provides emergency humanitarian support including food, shelter, medical care, and psychosocial assistance to vulnerable populations in refugee camps and other crisis-affected areas.</p>
                <p>By combining human rights advocacy, documentation and reporting of violations, leadership development, research, community engagement, and humanitarian response, RYDA seeks to empower Rohingya youth, girls, and women to become responsible leaders who contribute to building a peaceful, just, and sustainable future for their Rohingya communities.</p>
              </div>
              <div className="about-stats">
                <div className="about-stat-card">
                  <span className="about-stat-num">2019</span>
                  <span className="about-stat-label">Founded</span>
                </div>
                <div className="about-stat-card">
                  <span className="about-stat-num">8</span>
                  <span className="about-stat-label">Program Areas</span>
                </div>
                <div className="about-stat-card">
                  <span className="about-stat-num">1000+</span>
                  <span className="about-stat-label">Youth Trained</span>
                </div>
                <div className="about-stat-card">
                  <span className="about-stat-num">Cox&apos;s Bazar</span>
                  <span className="about-stat-label">Base Location</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="section about-values">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Core Values</span>
              <h2>What We Stand For</h2>
            </div>
            <div className="values-grid">
              {values.map((v, i) => (
                <ScrollReveal key={i} delay={i * 80}>
                  <div className="value-card">
                    <div className="value-icon">{v.icon}</div>
                    <h3>{v.title}</h3>
                    <p>{v.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section about-cta">
          <div className="container">
            <h2>Partner With Us</h2>
            <p>Join RYDA in our mission to empower Rohingya youth, document violations, and deliver humanitarian aid to those who need it most.</p>
            <div className="about-cta-actions">
              <Link className="is-btn-donate" href="https://donate.stripe.com" target="_blank" rel="noreferrer">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 15V5M10 5L6.5 8.5M10 5L13.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Donate Now
              </Link>
              <Link className="is-btn-secondary" href="/#contact">Contact Us</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}