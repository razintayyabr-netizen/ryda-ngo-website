'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="share-section">
      <span className="share-label">Share Article:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-twitter" aria-label="Share on X / Twitter">𝕏</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-facebook" aria-label="Share on Facebook">f</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-linkedin" aria-label="Share on LinkedIn">in</a>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' — ' + url)}`} target="_blank" rel="noreferrer" className="share-btn share-whatsapp" aria-label="Share on WhatsApp">WA</a>
      <button onClick={handleCopy} className="share-btn share-copy" aria-label="Copy link">{copied ? '✓ Copied' : 'Copy Link'}</button>
    </div>
  );
}

function LightboxModal({ images, activeIdx, onClose, onPrev, onNext }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (activeIdx === null || !images[activeIdx]) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close photo modal">✕</button>
        
        <div className="lightbox-image-container">
          <img src={images[activeIdx]} alt={`Photo ${activeIdx + 1}`} className="lightbox-image" />
        </div>

        <div className="lightbox-controls">
          {images.length > 1 && (
            <button className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous photo">‹</button>
          )}
          <span className="lightbox-counter">{activeIdx + 1} / {images.length}</span>
          {images.length > 1 && (
            <button className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next photo">›</button>
          )}
        </div>
      </div>

      <style jsx>{`
        .lightbox-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.90);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .lightbox-content {
          position: relative;
          max-width: 1100px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .lightbox-close {
          position: absolute;
          top: -40px;
          right: 0;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #fff;
          font-size: 1.4rem;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .lightbox-close:hover { background: rgba(255, 255, 255, 0.3); }

        .lightbox-image-container {
          max-width: 100%;
          max-height: 78vh;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .lightbox-image {
          display: block;
          max-width: 100%;
          max-height: 78vh;
          object-fit: contain;
        }

        .lightbox-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 16px;
        }

        .lightbox-nav {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 1.8rem;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.15s;
        }
        .lightbox-nav:hover {
          background: rgba(15, 166, 147, 0.8);
          transform: scale(1.08);
        }

        .lightbox-counter {
          font-family: monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 14px;
          border-radius: 999px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function ArticleClient({ post: preloadedPost }) {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState(preloadedPost || null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(!preloadedPost);
  const [notFound, setNotFound] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');
  const [activeModalIdx, setActiveModalIdx] = useState(null);

  const images = post
    ? (Array.isArray(post.images) && post.images.length > 0
        ? post.images
        : (post.featured_image ? [post.featured_image] : []))
    : [];

  useEffect(() => {
    if (post) {
      const canonical = `${window.location.origin}/newsroom/${post.slug || post.id}`;
      setArticleUrl(canonical);
    } else {
      setArticleUrl(window.location.href);
    }
  }, [post]);

  useEffect(() => {
    if (preloadedPost) {
      setLoading(false);
      async function loadRelated() {
        try {
          const allRes = await fetch('/api/posts');
          if (allRes.ok) {
            const all = await allRes.json();
            setRelatedPosts(all.filter(p => p.id !== preloadedPost.id && p.slug !== preloadedPost.slug).slice(0, 3));
          }
        } catch {}
      }
      loadRelated();
      return;
    }

    if (!slug) { setLoading(false); setNotFound(true); return; }

    let cancelled = false;

    async function loadPost() {
      try {
        const res = await fetch(`/api/posts?id=${slug}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setPost(data);

          const allRes = await fetch('/api/posts');
          if (allRes.ok && !cancelled) {
            const all = await allRes.json();
            setRelatedPosts(all.filter(p => p.id !== slug && p.slug !== slug).slice(0, 3));
          }
        } else {
          if (!cancelled) setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        if (!cancelled) setNotFound(true);
      }
      if (!cancelled) setLoading(false);
    }

    loadPost();
    return () => { cancelled = true; };
  }, [slug, preloadedPost]);

  const handlePrev = () => {
    if (activeModalIdx === null) return;
    setActiveModalIdx((activeModalIdx - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    if (activeModalIdx === null) return;
    setActiveModalIdx((activeModalIdx + 1) % images.length);
  };

  if (loading) {
    return (
      <>
        <div className="article-loading">
          <div className="article-loading-spinner"></div>
          <p>Loading article…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <div className="article-loading">
          <h2>Article Not Found</h2>
          <p>The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link href="/newsroom" className="btn btn-primary">← Back to Newsroom</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="article-page">
      <section className="article-hero">
        <div className="article-container">
          <div className="article-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/newsroom">Newsroom</Link>
          </div>
          <div className="article-meta">
            <span className="article-category-badge">{post.category}</span>
            <div className="article-meta-divider"></div>
            <div className="article-meta-item">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M3 18C3 14.13 6.13 11 10 11C13.87 11 17 14.13 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>{post.author}</span>
            </div>
            <div className="article-meta-divider"></div>
            <div className="article-meta-item">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><rect x="3" y="4" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8H17M7 2V5M13 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <span>{fmtDate(post.date)}</span>
            </div>
            {post.tags && post.tags.length > 0 && (
              <>
                <div className="article-meta-divider"></div>
                <div className="article-tags">
                  {post.tags.map(t => <span key={t} className="article-tag">#{t}</span>)}
                </div>
              </>
            )}
          </div>
          <h1 className="article-title">{post.title}</h1>
        </div>
      </section>

      <section className="article-content-section">
        <div className="article-container">
          {images.length > 0 && (
            <div className="article-featured-image" onClick={() => setActiveModalIdx(0)} style={{ cursor: 'pointer' }} title="Click to open photo viewer">
              <img src={images[0]} alt={post.title} />
              {images.length > 1 && (
                <div className="photo-badge-overlay">
                  📷 {images.length} Photos — Click to expand
                </div>
              )}
            </div>
          )}

          <div className="article-summary">
            <div className="article-summary-icon">
              <svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M10 3L12 8.5H18L13 12L15 17.5L10 14L5 17.5L7 12L2 8.5H8L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p>{post.summary}</p>
          </div>

          <article className="article-body" dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Content not available.</em></p>' }} />

          {/* Multi-Photo Gallery Grid */}
          {images.length > 1 && (
            <div className="article-gallery-section">
              <h3 className="gallery-title">📷 Photo Gallery ({images.length} Photos)</h3>
              <div className="article-gallery-grid">
                {images.map((imgUrl, i) => (
                  <div key={i} className="gallery-card" onClick={() => setActiveModalIdx(i)} title="Click to view full photo">
                    <img src={imgUrl} alt={`Photo ${i + 1}`} loading="lazy" />
                    <div className="gallery-card-zoom">🔍</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ShareButtons title={post.title} url={articleUrl} />
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="related-section">
          <div className="related-inner">
            <div className="related-header">
              <span className="section-tag">More from RYDA</span>
              <h2>Related Articles</h2>
            </div>
            <div className="related-grid">
              {relatedPosts.map(item => {
                const rHref = `/newsroom/${item.slug || item.id}`;
                return (
                <Link href={rHref} key={item.id} className="nr-card">
                  <div className="nr-card-body">
                    <span className="news-badge">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="nr-card-footer">
                      <span className="nr-card-author">{item.author}</span>
                      <span className="nr-card-date">{fmtDate(item.date)}</span>
                    </div>
                    <span className="nr-card-read">Read Article →</span>
                  </div>
                </Link>
                );
              })}
            </div>
            <div className="related-cta">
              <Link href="/newsroom" className="is-btn-secondary">View All Articles →</Link>
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {activeModalIdx !== null && (
        <LightboxModal
          images={images}
          activeIdx={activeModalIdx}
          onClose={() => setActiveModalIdx(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      <Footer />

      <style jsx>{`
        .article-featured-image {
          position: relative;
        }
        .photo-badge-overlay {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(11, 77, 65, 0.85);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .article-gallery-section {
          margin: 36px 0;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .gallery-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }
        .article-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 14px;
        }
        .gallery-card {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          background: #1A2232;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .gallery-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border-color: #0FA693;
        }
        .gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-card-zoom {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          color: #fff;
          transition: opacity 0.2s;
        }
        .gallery-card:hover .gallery-card-zoom {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
