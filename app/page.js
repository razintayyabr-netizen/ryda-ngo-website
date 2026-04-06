import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StatsBand from '@/components/StatsBand';
import Programs from '@/components/Programs';
import Newsroom from '@/components/Newsroom';
import Values from '@/components/Values';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Header />
      
      <main id="top">
        <Hero />
        <StatsBand />
        
        <section className="section about-section" id="about">
          <div className="section-tag-line">
            <span className="section-tag">About RYDA</span>
          </div>

          <div className="about-grid">
            <div className="about-text reveal">
              <h2>A Rohingya-led civil society organization built on rights, representation, and protection.</h2>
              <p>RYDA conducts comprehensive human rights advocacy, documents and publicly reports violations, carries out in-depth research, and advances community-led engagement for accountability and justice.</p>
              <p>The organization actively promotes freedom of expression, association, and movement — even in highly restrictive environments — while creating space for youth, girls, and women to lead.</p>
              <Link className="btn btn-outline" href="/#programs">Our Programs →</Link>
            </div>

            <div className="about-cards">
              <div className="about-card reveal" style={{ '--delay': '0.1s' }}>
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M7 5.5H17M7 10.5H17M7 15.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><rect x="4.5" y="3.5" width="15" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/></svg>
                </div>
                <h3>Documentation</h3>
                <p>Preserving evidence of violations with accuracy, safety, and credibility.</p>
              </div>
              <div className="about-card reveal" style={{ '--delay': '0.2s' }}>
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4.5 12.5L19.5 6.5V17.5L4.5 11.5V12.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.5 14L9.5 19.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3>Advocacy</h3>
                <p>Taking Rohingya voices into public campaigns and international human rights spaces.</p>
              </div>
              <div className="about-card reveal" style={{ '--delay': '0.3s' }}>
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L14.8 10.17L21 11.09L16.5 15.47L17.56 21.5L12 18.58L6.44 21.5L7.5 15.47L3 11.09L9.2 10.17L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                </div>
                <h3>Leadership</h3>
                <p>Developing Rohingya youth, girls &amp; women as leaders, organizers &amp; advocates.</p>
              </div>
              <div className="about-card reveal" style={{ '--delay': '0.4s' }}>
                <div className="about-card-icon">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4.5 12L12 5L19.5 12M6.5 10.5V18.5H17.5V10.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                </div>
                <h3>Relief</h3>
                <p>Emergency food, shelter, medical care, and psychosocial support for vulnerable families.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="vision-band reveal">
          <div className="vision-inner">
            <span className="section-tag">Vision</span>
            <blockquote>
              "A peaceful, just, and sustainable future where Rohingya communities live with dignity, equality, security, and full respect for their human rights."
            </blockquote>
          </div>
        </div>

        <Programs />
        <Newsroom />
        <Values />
      </main>

      <Footer />
    </>
  );
}
