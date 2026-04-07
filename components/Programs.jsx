import Link from 'next/link';

export default function Programs() {
  return (
    <section className="section programs-section" id="programs">
      <div className="section-header">
        <span className="section-tag">Programs &amp; Activities</span>
        <h2>Nine integrated programs linking evidence, advocacy, education, and response.</h2>
      </div>

      <div className="programs-grid">
        <article className="prog-card reveal" style={{ '--delay': '0s' }}>
          <div className="prog-num">01</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 5.5H17M7 10.5H17M7 15.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><rect x="4.5" y="3.5" width="15" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Human Rights Documentation &amp; Reporting</h3>
          <p>Systematic documentation, verification, and preservation of evidence on killings, arbitrary detention, gender-based violence, and restrictions on fundamental freedoms.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.06s' }}>
          <div className="prog-num">02</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4.5 12.5L19.5 6.5V17.5L4.5 11.5V12.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.5 14L9.5 19.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3>Advocacy &amp; International Engagement</h3>
          <p>Sustained advocacy with global human rights bodies, public campaigns, and outreach to advance accountability, protection, and durable solutions.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.12s' }}>
          <div className="prog-num">03</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L14.8 10.17L21 11.09L16.5 15.47L17.56 21.5L12 18.58L6.44 21.5L7.5 15.47L3 11.09L9.2 10.17L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Youth Leadership &amp; Capacity Building</h3>
          <p>Training, mentorship, and leadership development for Rohingya youths, girls, and women to lead initiatives and participate in advocacy and community action.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.18s' }}>
          <div className="prog-num">04</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M5 17.5L9.5 13L12.5 16L18.5 9.5M18.5 13V9.5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3>Research &amp; Analysis</h3>
          <p>In-depth research on human rights conditions and evidence-based analysis that support advocacy, policy recommendations, and informed decision-making.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.24s' }}>
          <div className="prog-num">05</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12M5 18.5C6.17 16.39 8.78 15 12 15C15.22 15 17.83 16.39 19 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Community Engagement &amp; Participation</h3>
          <p>Consultations, participatory research, and community-led initiatives that ensure Rohingya priorities and lived experiences shape the response.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.30s' }}>
          <div className="prog-num">06</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 11C9.4 11 12.4 8.86 13.5 5.7C14.6 8.86 17.6 11 21 11C17.6 11 14.6 13.14 13.5 16.3C12.4 13.14 9.4 11 6 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Campaigns &amp; Awareness Raising</h3>
          <p>Advocacy campaigns, media engagement, and awareness initiatives that amplify Rohingya voices and draw attention to violations and systemic discrimination.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.36s' }}>
          <div className="prog-num">07</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5L10 16.5L18 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Accountability &amp; Justice Initiatives</h3>
          <p>Documentation and reporting processes that contribute to legal action, accountability efforts, and international justice mechanisms.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.42s' }}>
          <div className="prog-num">08</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L14.8 10.17L21 11.09L16.5 15.47L17.56 21.5L12 18.58L6.44 21.5L7.5 15.47L3 11.09L9.2 10.17L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Education &amp; Literacy Development</h3>
          <p>Supporting community-led learning initiatives, literacy programs, and vocational training to empower Rohingya youth, girls, and children.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.48s' }}>
          <div className="prog-num">09</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L18.5 7.5V12C18.5 15.88 15.95 19.28 12 20.5C8.05 19.28 5.5 15.88 5.5 12V7.5L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.8 13.2H15.2M12 10V16.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Humanitarian Assistance in Emergencies</h3>
          <p>Food, safe water, temporary shelter, hygiene support, medical care, psychosocial assistance, and essential supplies for the most vulnerable.</p>
        </article>
      </div>
    </section>
  );
}
