import Link from 'next/link';

export default function Programs() {
  return (
    <section className="section programs-section" id="programs">
      <div className="section-header">
        <span className="section-tag">Programs &amp; Activities</span>
        <h2>Ten integrated programs linking evidence, advocacy, education, and response.</h2>
      </div>

      <div className="programs-grid">
        <article className="prog-card reveal" style={{ '--delay': '0s' }} aria-label="Human Rights Documentation & Reporting">
          <div className="prog-num">01</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M7 5.5H17M7 10.5H17M7 15.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><rect x="4.5" y="3.5" width="15" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Human Rights Documentation &amp; Reporting</h3>
          <p>Systematic documentation, verification, and preservation of evidence on killings, arbitrary detention, gender-based violence, and restrictions on fundamental freedoms.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.06s' }} aria-label="Advocacy & International Engagement">
          <div className="prog-num">02</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4.5 12.5L19.5 6.5V17.5L4.5 11.5V12.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.5 14L9.5 19.5H13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3>Advocacy &amp; International Engagement</h3>
          <p>Sustained advocacy with global human rights bodies, public campaigns, and outreach to advance accountability, protection, and durable solutions.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.12s' }} aria-label="Youth Leadership & Capacity Building">
          <div className="prog-num">03</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L14.8 10.17L21 11.09L16.5 15.47L17.56 21.5L12 18.58L6.44 21.5L7.5 15.47L3 11.09L9.2 10.17L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Youth Leadership &amp; Capacity Building</h3>
          <p>Training, mentorship, and leadership development for Rohingya youths, girls, and women to lead initiatives and participate in advocacy and community action.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.18s' }} aria-label="Education & Youth Development">
          <div className="prog-num">04</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 14l9-5-9-5-9 5 9 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3>Education &amp; Youth Development</h3>
          <p>Promoting access to education, community-based learning, skills building, human rights and statelessness education, and secondary/higher education advocacy for Rohingya youth.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.24s' }} aria-label="Research & Analysis">
          <div className="prog-num">05</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M11 8v6M8 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Research &amp; Analysis</h3>
          <p>In-depth research on human rights conditions and evidence-based analysis that support advocacy, policy recommendations, and informed decision-making.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.30s' }} aria-label="Journalism, Storytelling & Media">
          <div className="prog-num">06</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m4 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 8h6m-6 4h6m-6 4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
          <h3>Journalism, Storytelling &amp; Media</h3>
          <p>Community-based journalism, field reporting, and human-interest storytelling that amplify Rohingya perspectives and bring underreported issues to global audiences.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.36s' }} aria-label="Community Engagement & Participation">
          <div className="prog-num">07</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12M5 18.5C6.17 16.39 8.78 15 12 15C15.22 15 17.83 16.39 19 18.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Community Engagement &amp; Participation</h3>
          <p>Consultations, participatory research, and community-led initiatives that ensure Rohingya priorities and lived experiences shape the response.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.42s' }} aria-label="Campaigns & Awareness Raising">
          <div className="prog-num">08</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 11C9.4 11 12.4 8.86 13.5 5.7C14.6 8.86 17.6 11 21 11C17.6 11 14.6 13.14 13.5 16.3C12.4 13.14 9.4 11 6 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg></div>
          <h3>Campaigns &amp; Awareness Raising</h3>
          <p>Advocacy campaigns, media engagement, and awareness initiatives that amplify Rohingya voices and draw attention to violations and systemic discrimination.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.48s' }} aria-label="Accountability & Justice Initiatives">
          <div className="prog-num">09</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 12.5L10 16.5L18 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/></svg></div>
          <h3>Accountability &amp; Justice Initiatives</h3>
          <p>Documentation and reporting processes that contribute to legal action, accountability efforts, and international justice mechanisms.</p>
        </article>

        <article className="prog-card reveal" style={{ '--delay': '0.54s' }} aria-label="Humanitarian Assistance in Emergencies">
          <div className="prog-num">10</div>
          <div className="prog-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 4.5L18.5 7.5V12C18.5 15.88 15.95 19.28 12 20.5C8.05 19.28 5.5 15.88 5.5 12V7.5L12 4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8.8 13.2H15.2M12 10V16.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          <h3>Humanitarian Assistance in Emergencies</h3>
          <p>Food, safe water, temporary shelter, hygiene support, medical care, psychosocial assistance, and essential supplies for the most vulnerable.</p>
        </article>
      </div>
    </section>
  );
}
