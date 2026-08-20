'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import STATIC_NEWS from '@/lib/staticNews';

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
  const [isWriter, setIsWriter] = useState(false);
  const gridRef = useRef(null);

  useEffect(() => {
    // Check if writer is logged in
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('ryda_writer_token') : null;
    setIsWriter(!!token);

    async function loadNews() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.posts || []);
          if (list.length > 0) {
            setAllNews(list);
          }
        }
      } catch (err) {
        // Fallback to static
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  const matchesCategory = (postCat, filter) => {
    if (!filter) return true;
    if (!postCat) return false;
    const c1 = postCat.toLowerCase().replace(/s$/, '').trim();
    const c2 = filter.toLowerCase().replace(/s$/, '').trim();
    return c1 === c2 || postCat.toLowerCase() === filter.toLowerCase();
  };

  const filteredNews = activeFilter
    ? allNews.filter(n => matchesCategory(n.category, activeFilter))
    : allNews;

  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
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
          <h2>Latest updates, stories &amp; field reports.</h2>
        </div>
        <p>Stay informed with RYDA&apos;s human rights documentation, survivor stories, emergency updates, and public statements.</p>
      </div>

      <div className="newsroom-tabs" id="newsroom-tabs" role="tablist">
        {[
          { label: 'All', filter: '' },
          { label: 'Stories', filter: 'Stories' },
          { label: 'Reports', filter: 'Reports' },
          { label: 'Statements', filter: 'Statements' },
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

        {!loading && displayedNews.map(item => {
          const isStory = (item.category || '').toLowerCase().includes('stor');
          const href = `/newsroom/${item.slug || item.id}`;
          return (
            <div key={item.id} className={`news-card reveal ${isStory ? 'is-story-card' : ''}`}>
              {isWriter && (
                <div className="news-card-actions">
                  <Link href={`/writer?edit=${encodeURIComponent(item.id)}`} className="news-edit-btn">
                    <svg viewBox="0 0 20 20" fill="none" width="13" height="13"><path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
                    Edit
                  </Link>
                </div>
              )}
              <Link href={href} className="news-card-link" style={{ textDecoration: 'none' }}>
                {item.featured_image && (
                  <div className="news-card-image-wrap">
                    <img src={item.featured_image} alt={item.title} loading="lazy" />
                    {isStory && <span className="story-ribbon">📖 Story</span>}
                  </div>
                )}
                <span className={`news-badge ${isStory ? 'badge-story' : ''}`}>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="news-meta">
                  <span className="news-meta-author">{item.author}</span>
                  <span className="news-meta-date">{fmtDate(item.date)}</span>
                </div>
                <span className="news-card-readmore">
                  {isStory ? 'Read Full Story →' : 'Read Article →'}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="newsroom-footer">
        <Link className="btn btn-primary" href="/newsroom">
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 8.5H13.5M6.5 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          View All Articles &amp; Stories
        </Link>
        <Link className="btn btn-outline" href="/writer" target="_blank" style={{ marginLeft: 16 }}>
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M14.5 2.5L17.5 5.5L7 16H4V13L14.5 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
          Publish a Story
        </Link>
      </div>
    </section>
  );
}
