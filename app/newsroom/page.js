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
  const [isWriter, setIsWriter] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [adminToast, setAdminToast] = useState(null);
  const [viewMap, setViewMap] = useState({});
  const gridRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('ryda_writer_token');
      setIsWriter(!!token);
    }
  }, []);

  const loadNews = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setAllNews(Array.isArray(data) ? data : (data.posts || []));
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    fetch('/api/views?all=1', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : {}))
      .then(d => setViewMap(d && typeof d === 'object' ? d : {}))
      .catch(() => {});
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(safetyTimer);
  }, []);

  const handleDeleteCard = async (e, post) => {
    e.preventDefault();
    e.stopPropagation();

    const ok = window.confirm(`Permanently delete post:\n"${post.title}"?\n\nThis will remove it from the live website immediately.`);
    if (!ok) return;

    setDeletingId(post.id);
    try {
      const token = typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ryda_writer_token') || '') : '';
      const idToDelete = post.id || post.slug;
      const res = await fetch(`/api/posts/${encodeURIComponent(idToDelete)}`, {
        method: 'DELETE',
        headers: { 'x-writer-token': token }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setAllNews(prev => prev.filter(p => p.id !== post.id && p.slug !== post.slug));
      setAdminToast(`✓ Post "${post.title}" has been deleted.`);
      setTimeout(() => setAdminToast(null), 3500);
    } catch (err) {
      alert('Could not delete post: ' + (err.message || 'Unknown error'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    if (confirm('Log out from Writer Mode?')) {
      try { sessionStorage.removeItem('ryda_writer_token'); } catch {}
      setIsWriter(false);
    }
  };

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

  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));

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
      {/* Toast feedback for writer actions */}
      {adminToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: '#0B4D41',
          color: '#ffffff',
          padding: '14px 24px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          border: '1px solid #0FA693',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {adminToast}
        </div>
      )}

      {/* Writer Admin Floating Bar */}
      {isWriter && (
        <div style={{
          background: 'linear-gradient(90deg, #0B4D41, #121826)',
          borderBottom: '1px solid rgba(15, 166, 147, 0.4)',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.88rem',
          color: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#0FA693',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.05em'
            }}>WRITER MODE</span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>You can edit or delete articles directly from this page.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/writer" style={{
              background: '#0FA693',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.84rem'
            }}>
              ＋ Create New Post
            </Link>
            <Link href="/writer" style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              padding: '5px 14px',
              borderRadius: '6px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.84rem'
            }}>
              Writer Dashboard
            </Link>
            <button type="button" onClick={handleLogout} style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.84rem',
              padding: '4px 8px'
            }}>
              Log Out
            </button>
          </div>
        </div>
      )}

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
              const isItemDeleting = deletingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`nr-card-wrap ${isItemDeleting ? 'is-deleting' : ''}`}
                  style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}
                >
                  <Link
                    href={href}
                    className={`nr-card reveal ${isStory ? 'is-story-card' : ''}`}
                    style={{ '--delay': `${Math.min(idx * 0.05, 0.3)}s`, width: '100%', height: '100%' }}
                  >
                    {item.featured_image && (
                      <div className="nr-card-image">
                        <img src={item.featured_image} alt="" loading="lazy" />
                        {isStory && <span className="story-ribbon">📖 Story</span>}
                      </div>
                    )}
                    <div className="nr-card-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span className={`news-badge ${isStory ? 'badge-story' : ''}`}>{item.category}</span>
                        {viewMap[item.id] > 0 && (
                          <span className="nr-card-views" title={`${viewMap[item.id].toLocaleString('en-US')} views`}>
                            <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true"><path d="M1.5 12S5.5 4.5 12 4.5 22.5 12 22.5 12 18.5 19.5 12 19.5 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8"/></svg>
                            {viewMap[item.id].toLocaleString('en-US')}
                          </span>
                        )}
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <div className="nr-card-footer">
                        <span className="nr-card-author">{item.author}</span>
                        <span className="nr-card-date">{fmtDate(item.date || item.createdAt)}</span>
                      </div>
                      <span className="nr-card-read">
                        {isStory ? 'Read Full Story' : 'Read Article'}
                        <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 10H16M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </div>
                  </Link>

                  {/* Writer quick action buttons overlay on cards */}
                  {isWriter && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      zIndex: 10,
                      display: 'flex',
                      gap: '6px',
                      background: 'rgba(18, 24, 38, 0.88)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 6px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    }}>
                      <Link
                        href={`/writer?edit=${encodeURIComponent(item.id || item.slug)}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#0FA693',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Edit this post in Writer Panel"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCard(e, item)}
                        disabled={isItemDeleting}
                        style={{
                          background: 'rgba(220, 38, 38, 0.85)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '999px',
                          padding: '3px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: isItemDeleting ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Permanently delete this post"
                      >
                        {isItemDeleting ? '…' : '🗑️ Delete'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

