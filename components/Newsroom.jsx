'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const STATIC_NEWS = [
  {
    id: "nr-1",
    title: "RYDA Releases Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Report",
    author: "RYDA Team",
    summary: "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities across camps and crisis zones.",
    date: "2026-03-18T12:00:00Z",
  },
  {
    id: "nr-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary: "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    date: "2026-03-10T12:00:00Z",
  },
  {
    id: "nr-3",
    title: "RYDA Submits Briefing to UN Special Rapporteur",
    category: "Advocacy",
    author: "RYDA Advocacy Unit",
    summary: "RYDA submitted a detailed briefing to the UN Special Rapporteur outlining documented violations and urging stronger international protection measures.",
    date: "2026-02-28T12:00:00Z",
  },
  {
    id: "nr-4",
    title: "Emergency Response: Food and Medical Aid in Cox's Bazar",
    category: "Emergency",
    author: "RYDA Relief Team",
    summary: "Following flooding, RYDA coordinated emergency food parcels, hygiene kits, and basic medical support for affected families.",
    date: "2026-02-14T12:00:00Z",
  },
  {
    id: "nr-5",
    title: "RYDA Issues Public Statement on Arbitrary Detention Reports",
    category: "Statement",
    author: "RYDA Team",
    summary: "RYDA is deeply concerned by verified reports of arbitrary detention and calls on authorities to uphold international human rights standards.",
    date: "2026-01-30T12:00:00Z",
  },
  {
    id: "nr-6",
    title: "New Research Report: Education Barriers Facing Rohingya Youth",
    category: "Report",
    author: "RYDA Research Unit",
    summary: "A new RYDA publication documents systemic barriers preventing Rohingya children from accessing quality education, with policy recommendations.",
    date: "2026-01-18T12:00:00Z",
  },
];

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function Newsroom() {
  const [allNews, setAllNews] = useState(STATIC_NEWS);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          const apiPosts = (data.posts || []).map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            author: p.author,
            summary: p.summary,
            date: p.date,
          }));
          setAllNews([...apiPosts, ...STATIC_NEWS]);
        }
      } catch (err) {
        // Fallback to static
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const filteredNews = activeFilter 
    ? allNews.filter(n => n.category === activeFilter) 
    : allNews;
    
  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date) - new Date(a.date));
  const displayedNews = sortedNews.slice(0, 6);

  useEffect(() => {
    if (!loading && gridRef.current && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08 }
      );
      
      const cards = gridRef.current.querySelectorAll('.news-card');
      cards.forEach(c => obs.observe(c));

      return () => obs.disconnect();
    }
  }, [loading, displayedNews]);

  return (
    <section className="section newsroom-section" id="newsroom">
      <div className="section-header newsroom-header">
        <div>
          <span className="section-tag">Newsroom</span>
          <h2>Latest updates, statements &amp; field reports.</h2>
        </div>
        <p>Stay informed with RYDA&apos;s public statements, human rights bulletins, emergency updates, and campaign announcements.</p>
      </div>

      <div className="newsroom-tabs" id="newsroom-tabs" role="tablist">
        {[
          { label: 'All', filter: '' },
          { label: 'Statements', filter: 'Statement' },
          { label: 'Reports', filter: 'Report' },
          { label: 'Emergency', filter: 'Emergency' },
          { label: 'Advocacy', filter: 'Advocacy' },
          { label: 'Leadership', filter: 'Leadership' },
        ].map(tab => (
          <button 
            key={tab.label}
            className={`tab ${activeFilter === tab.filter ? 'is-active' : ''}`} 
            type="button" 
            role="tab" 
            aria-selected={activeFilter === tab.filter}
            onClick={() => setActiveFilter(tab.filter)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="newsroom-grid" id="newsroom-grid" aria-live="polite" ref={gridRef}>
        {loading && [1, 2, 3].map(i => (
          <div className="news-card skeleton" key={i}>
            <div className="skeleton-badge"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-footer"></div>
          </div>
        ))}

        {!loading && displayedNews.length === 0 && (
          <div className="newsroom-empty"><p>No updates in this category yet.</p></div>
        )}
        
        {!loading && displayedNews.map(item => (
          <Link href={`/newsroom/${item.id}`} key={item.id} className="news-card reveal" style={{ textDecoration: 'none' }}>
            <span className="news-badge">{item.category}</span>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="news-meta">
              <span className="news-meta-author">{item.author}</span>
              <span className="news-meta-date">{fmtDate(item.date)}</span>
            </div>
            <span className="news-card-readmore">
              Read Article →
            </span>
          </Link>
        ))}
      </div>

      <div className="newsroom-footer">
        <Link className="btn btn-primary" href="/newsroom">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 8.5H13.5M6.5 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          View All Articles
        </Link>
        <Link className="btn btn-outline" href="/writer" target="_blank" style={{ marginLeft: 16 }}>
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          Publish a Story
        </Link>
      </div>
    </section>
  );
}
