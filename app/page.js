import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import StatsBand from '@/components/StatsBand';
import DonateBand from '@/components/DonateBand';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import ContactForm from '@/components/ContactForm';
import BackToTop from '@/components/BackToTop';
import Link from 'next/link';

const values = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Human Dignity',
    desc: 'We uphold the inherent dignity and fundamental rights of Rohingya communities through systematic documentation and reporting of violations.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Youth Empowerment',
    desc: 'We strengthen the leadership, skills, and participation of Rohingya youths, girls, and women as agents of change in their communities.',
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
    desc: 'We place Rohingya communities at the center of our work, ensuring their voices and priorities guide all our actions.',
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
        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Humanitarian Assistance',
    desc: 'We respond to urgent humanitarian needs — food, water, shelter, medical care, and psychosocial support — prioritizing the most vulnerable.',
  },
];

const programs = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Human Rights Documentation & Reporting',
    desc: 'Systematically document, verify, and preserve evidence of human rights violations — killings, arbitrary detention, gender-based violence, and restrictions on freedom of expression, movement, and association. Produce reports and briefings for national and international stakeholders.',
    tag: 'Core Program',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 6v12M12 6v12M17 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Advocacy & International Engagement',
    desc: 'Conduct sustained advocacy to promote Rohingya rights. Engage international mechanisms and global human rights bodies to advance accountability, protection, and durable solutions for affected communities.',
    tag: 'Advocacy',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Youth Leadership & Capacity Building',
    desc: 'Provide training, mentorship, and leadership development programs for Rohingya youths, girls, and women. Build their capacity to engage in advocacy, documentation, and community initiatives.',
    tag: 'Flagship',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Research & Analysis',
    desc: 'Carry out in-depth research on human rights conditions affecting Rohingya communities. Generate evidence-based analysis to support advocacy, policy recommendations, and informed decision-making.',
    tag: 'Research',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 7a4 4 0 110 8 4 4 0 010-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Community Engagement & Participation',
    desc: 'Actively engage with Rohingya communities to ensure meaningful participation. Conduct consultations, participatory research, and community-led initiatives that reflect their needs and priorities.',
    tag: 'Community',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Campaigns & Awareness Raising',
    desc: 'Organize advocacy campaigns, media engagement, and awareness initiatives. Amplify Rohingya voices and bring global attention to human rights violations and systemic discrimination.',
    tag: 'Campaigns',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Accountability & Justice Initiatives',
    desc: 'Advocate for accountability and justice for human rights violations. Support documentation and reporting processes that contribute to legal action and international justice mechanisms.',
    tag: 'Justice',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 2v4M12 8v4M12 16v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Humanitarian Assistance in Emergencies',
    desc: 'Provide essential support to Rohingya refugees in Bangladesh — food, safe drinking water, shelter, sanitation, medical care, and psychosocial support — prioritizing women, children, elderly, and persons with disabilities.',
    tag: 'Humanitarian',
  },
];

export default function Home() {
  return (
    <main>
      <Hero />
      <StatsBand />
      <Partners />

      {/* About RYDA */}
      <section className="section is-about-ryda" id="about">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About RYDA</span>
            <h2>Who We Are</h2>
          </div>
          <div className="ryda-about-text">
            <p>The Rohingya Youth Development Association (RYDA) is a civil society organization working exclusively for the Rohingya community. RYDA conducts comprehensive human rights advocacy, systematically documents and publicly reports violations including killings, arbitrary detention, sexual and gender-based violence, and restrictions on freedom of expression, association, and movement, and carries out in-depth research while engaging in international advocacy and global campaigns to ensure accountability.</p>
            <p>RYDA actively promotes fundamental freedoms including freedom of expression, association, and movement even in the face of severe restrictions. The organization provides training, mentorship, and platforms for youth, girls, and women to organize, lead initiatives, and participate fully in decision-making.</p>
            <p>Through its programs, RYDA strengthens community resilience, representation, empowerment, and protection of Rohingya rights and dignity at local, national, and international levels. The organization also provides emergency humanitarian support including food, shelter, medical care, and psychosocial assistance to vulnerable populations in refugee camps and other crisis-affected areas.</p>
            <p>By combining human rights advocacy, documentation and reporting of violations, leadership development, research, community engagement, and humanitarian response, RYDA seeks to empower Rohingya youth, girls, and women to become responsible leaders who contribute to building a peaceful, just, and sustainable future for their Rohingya communities.</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section is-values" id="values">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Core Values</span>
            <h2>What We Stand For</h2>
            <p>Our work is guided by core principles that keep us accountable to the communities we serve.</p>
          </div>
          <div className="is-values-grid">
            {values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="is-value-card">
                  <div className="is-value-icon">{v.icon}</div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="section is-programs" id="programs">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Programs & Activities</span>
            <h2>Our Work</h2>
            <p>
              From documentation to youth leadership, from advocacy to emergency relief — our programs
              address the most pressing needs of Rohingya communities.
            </p>
          </div>
          <div className="is-programs-grid">
            {programs.map((prog, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="is-prog-card">
                  <div className="is-prog-icon">{prog.icon}</div>
                  <div className="is-prog-header">
                    <h3>{prog.title}</h3>
                  </div>
                  <div className="is-prog-body">
                    <span style={{ display: 'inline-block', background: 'rgba(136,14,79,0.08)', color: '#880e4f', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', marginBottom: '12px' }}>
                      {prog.tag}
                    </span>
                    <p>{prog.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section is-cta">
        <div className="container">
          <h2>Join Our Mission</h2>
          <p>
            Stand with RYDA as we document violations, build youth leaders, and deliver humanitarian aid
            to Rohingya communities in Cox&apos;s Bazar, Bangladesh.
          </p>
          <div className="is-cta-actions">
            <Link className="is-btn-donate" href="https://donate.stripe.com" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 15V5M10 5L6.5 8.5M10 5L13.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Donate Now
            </Link>
            <Link className="is-btn-secondary" href="/#contact">Partner With Us</Link>
          </div>
        </div>
      </section>

      {/* Donate Band */}
      <DonateBand />

      {/* Contact */}
      <section className="section is-contact" id="contact">
        <div className="container">
          <div className="section-header">
            <h2>Get In Touch</h2>
            <p>Whether you want to partner, volunteer, or simply learn more — we&apos;d love to hear from you.</p>
          </div>
          <div className="is-contact-grid">
            <div className="is-contact-info">
              <div className="is-contact-item">
                <div className="is-contact-icon">📍</div>
                <div><h4>Office</h4><p>Cox&apos;s Bazar, Bangladesh</p></div>
              </div>
              <div className="is-contact-item">
                <div className="is-contact-icon">📧</div>
                <div><h4>Email</h4><p>ryda.rohingya@gmail.com</p></div>
              </div>
              <div className="is-contact-item">
                <div className="is-contact-icon">🌐</div>
                <div><h4>Website</h4><p>www.rydango.org</p></div>
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}