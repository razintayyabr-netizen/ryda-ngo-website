'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function NewsroomPage() {
  const [allNews, setAllNews] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef(null);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch('/api/posts');
        if (res.ok) {
          const data = await res.json();
          setAllNews(Array.isArray(data) ? data : (data.posts || []));
        }
      } catch (err) {
        // API failed, static will be handled or fallback
      } finally {
        setLoading(false);
      }
    }

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 8000);

    loadNews();

    return () => clearTimeout(safetyTimer);
  }, []);

  const matchesCategory = (postCat, filter) => {
    if (!filter) return true;
    if (!postCat) return false;
    const c1 = postCat.toLowerCase().replace(/s$/, '').trim();
    const c2 = filter.toLowerCase().replace(/s$/, '').trim();
    if (c1 === c2) return true;
    if ((c2 === 'media' || c2 === 'media coverage') && (c1 === 'media' || c1 === 'media coverage')) return true;
    return postCat.toLowerCase() === filter.toLowerCase();
  };

  const filteredNews = allNews
    .filter(n => matchesCategory(n.category, activeFilter))
    .filter(n => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.summary && n.summary.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q)) ||
        (n.author && n.author.toLowerCase().includes(q)) ||
        (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes(q)))
      );
    });

  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

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
        { threshold: 0.05 }
      );
      const cards = gridRef.current.querySelectorAll('.nr-card');
      cards.forEach(c => obs.observe(c));
      return () => obs.disconnect();
    }
  }, [loading, sortedNews]);

  const categories = [
    { key: '', label: 'All' },
    { key: 'Stories', label: 'Stories' },
    { key: 'Articles', label: 'Articles' },
    { key: 'Statements', label: 'Statements' },
    { key: 'Reports', label: 'Reports' },
    { key: 'Emergency', label: 'Emergency' },
    { key: 'Advocacy', label: 'Advocacy' },
    { key: 'Leadership', label: 'Leadership' },
    { key: 'Research', label: 'Research' },
    { key: 'Documentation', label: 'Documentation' },
    { key: 'Humanitarian', label: 'Humanitarian' },
    { key: 'Training', label: 'Training' },
    { key: 'Field Reports', label: 'Field Reports' },
    { key: 'Media', label: 'Media' },
    { key: 'Campaigns', label: 'Campaigns' },
  ];

  return (
    <>
      <main>
        {/* Hero Banner */}
        <section className="nr-hero">
          <div className="nr-hero-bg">
            <div className="nr-hero-glow nr-hero-glow-1"></div>
            <div className="nr-hero-glow nr-hero-glow-2"></div>
            <div className="hero-lines"></div>
          </div>
          <div className="nr-hero-content">
            <span className="section-tag">Newsroom</span>
            <h1>Updates, Statements &amp; Reports</h1>
            <p>Stay informed with RYDA&apos;s public statements, human rights documentation, survivor stories, emergency updates, and campaign announcements.</p>
          </div>
        </section>

        {/* Filters + Search */}
        <section className="nr-controls">
          <div className="nr-controls-inner">
            <div className="nr-tabs" role="tablist" aria-label="Category filters">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`tab ${activeFilter === cat.key ? 'is-active' : ''}`}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="nr-search-wrap">
              <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <input
                className="nr-search"
                type="search"
                placeholder="Search articles & stories…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="nr-listing">
          <div className="nr-grid" ref={gridRef}>
            {loading && [1, 2, 3, 4, 5, 6].map(i => (
              <div className="nr-card skeleton" key={i}>
                <div className="skeleton-badge"></div>
                <div className="skeleton-title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-footer"></div>
              </div>
            ))}

            {!loading && sortedNews.length === 0 && (
              <div className="nr-empty">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48"><path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/></svg>
                <p>No articles or stories found matching your criteria.</p>
              </div>
            )}

            {!loading && sortedNews.map((item, idx) => {
              const href = `/newsroom/${item.slug || item.id}`;
              const isStory = (item.category || '').toLowerCase().includes('stor');
              return (
                <Link href={href} key={item.id} className={`nr-card reveal ${isStory ? 'is-story-card' : ''}`} style={{ '--delay': `${Math.min(idx * 0.05, 0.3)}s` }}>
                  {item.featured_image && (
                    <div className="nr-card-image">
                      <img src={item.featured_image} alt="" loading="lazy" />
                      {isStory && <span className="story-ribbon">📖 Story</span>}
                    </div>
                  )}
                  <div className="nr-card-body">
                    <span className={`news-badge ${isStory ? 'badge-story' : ''}`}>{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="nr-card-footer">
                      <span className="nr-card-author">{item.author}</span>
                      <span className="nr-card-date">{fmtDate(item.date)}</span>
                    </div>
                    <span className="nr-card-read">
                      {isStory ? 'Read Full Story' : 'Read Article'}
                      <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 10H16M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
