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

function calcReadTime(text) {
  if (!text) return 1;
  const words = text.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;
  const freshUrl = url ? (url.includes('?') ? `${url}&v=1` : `${url}?v=1`) : url;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: `${title} — RYDA Newsroom`,
        url: freshUrl,
      });
    } catch {}
  };

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
      <h4 className="share-title">Share Article</h4>
      <div className="share-grid">
        {canNativeShare && (
          <button onClick={handleNativeShare} className="share-btn share-native" aria-label="Share via device">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" stroke="currentColor" strokeWidth="2"/><path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" stroke="currentColor" strokeWidth="2"/><path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" stroke="currentColor" strokeWidth="2"/><path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2"/></svg>
            <span>Share...</span>
          </button>
        )}
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(freshUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-twitter" aria-label="Share on X / Twitter">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          <span>𝕏 Post</span>
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(freshUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-facebook" aria-label="Share on Facebook">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>Facebook</span>
        </a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(freshUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-linkedin" aria-label="Share on LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
          <span>LinkedIn</span>
        </a>
        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' — ' + freshUrl)}`} target="_blank" rel="noreferrer" className="share-btn share-whatsapp" aria-label="Share on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          <span>WhatsApp</span>
        </a>
        <button onClick={handleCopy} className={`share-btn share-copy ${copied ? 'is-copied' : ''}`} aria-label="Copy link">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/></svg>
          <span>{copied ? '✓ Link Copied!' : 'Copy Link'}</span>
        </button>
      </div>
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
  const currentImg = images[activeIdx];

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close photo modal">✕</button>
        
        <div className="lightbox-image-container">
          <img src={currentImg.url} alt={currentImg.caption || `Photo ${activeIdx + 1}`} className="lightbox-image" />
        </div>

        {(currentImg.caption || currentImg.credit) && (
          <div className="lightbox-caption-box">
            {currentImg.caption && <p className="lightbox-caption-title">📷 {currentImg.caption}</p>}
            {currentImg.credit && <span className="lightbox-caption-credit">{currentImg.credit}</span>}
          </div>
        )}

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
          background: rgba(0, 0, 0, 0.93);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .lightbox-content {
          position: relative;
          max-width: 1150px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .lightbox-close {
          position: absolute;
          top: -44px;
          right: 0;
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #fff;
          font-size: 1.4rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .lightbox-close:hover { background: rgba(255, 255, 255, 0.35); }

        .lightbox-image-container {
          max-width: 100%;
          max-height: 70vh;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        }

        .lightbox-image {
          display: block;
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
        }

        .lightbox-caption-box {
          margin-top: 12px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          padding: 8px 18px;
          border-radius: 10px;
          text-align: center;
          max-width: 85%;
        }
        .lightbox-caption-title {
          font-size: 0.92rem;
          color: #ffffff;
          font-weight: 600;
          margin: 0;
        }
        .lightbox-caption-credit {
          font-size: 0.78rem;
          color: rgba(200, 149, 42, 0.95);
          display: block;
          margin-top: 2px;
        }

        .lightbox-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 14px;
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
          background: rgba(15, 166, 147, 0.85);
          transform: scale(1.08);
        }

        .lightbox-counter {
          font-family: monospace;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          background: rgba(255, 255, 255, 0.12);
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
  const [scrollProgress, setScrollProgress] = useState(0);

  const rawImages = post
    ? (Array.isArray(post.images) && post.images.length > 0
        ? post.images
        : (post.featured_image ? [post.featured_image] : []))
    : [];

  const images = rawImages.map(img => {
    if (typeof img === 'string') return { url: img, caption: '', credit: '' };
    return { url: img?.url || '', caption: img?.caption || '', credit: img?.credit || '' };
  }).filter(img => img.url);

  const readTime = post ? calcReadTime((post.content || '') + (post.summary || '')) : 1;

  // Track reading scroll progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Top Reading Progress Indicator */}
      <div className="reading-progress-track">
        <div className="reading-progress-fill" style={{ width: `${scrollProgress}%` }}></div>
      </div>

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
            <div className="article-meta-divider"></div>
            <div className="article-meta-item read-time-tag">
              ⏱️ <span>{readTime} min read</span>
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
            <div className="article-featured-image-wrap">
              <div className="article-featured-image" onClick={() => setActiveModalIdx(0)} style={{ cursor: 'pointer' }} title="Click to open photo viewer">
                <img src={images[0].url} alt={post.title} />
                {images.length > 1 && (
                  <div className="photo-badge-overlay">
                    📷 {images.length} Photos — Click to expand
                  </div>
                )}
              </div>
              {(images[0].caption || images[0].credit) && (
                <figcaption className="photo-caption-text">
                  {images[0].caption && <span className="photo-caption-main">📷 {images[0].caption}</span>}
                  {images[0].credit && <span className="photo-caption-sub"> ({images[0].credit})</span>}
                </figcaption>
              )}
            </div>
          )}

          <div className="article-summary">
            <div className="article-summary-icon">
              <svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M10 3L12 8.5H18L13 12L15 17.5L10 14L5 17.5L7 12L2 8.5H8L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p>{post.summary}</p>
          </div>

          <article className="article-body editorial-typography" dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Content not available.</em></p>' }} />

          {/* Multi-Photo Gallery Grid */}
          {images.length > 1 && (
            <div className="article-gallery-section">
              <h3 className="gallery-title">📷 Photo Gallery ({images.length} Photos)</h3>
              <div className="article-gallery-grid">
                {images.map((imgObj, i) => (
                  <div key={i} className="gallery-card-item">
                    <div className="gallery-card" onClick={() => setActiveModalIdx(i)} title="Click to view full photo">
                      <img src={imgObj.url} alt={`Photo ${i + 1}`} loading="lazy" />
                      <div className="gallery-card-zoom">🔍 Zoom</div>
                    </div>
                    {(imgObj.caption || imgObj.credit) && (
                      <div className="gallery-card-caption">
                        {imgObj.caption && <span className="caption-title">{imgObj.caption}</span>}
                        {imgObj.credit && <span className="caption-credit">Photo: {imgObj.credit}</span>}
                      </div>
                    )}
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
        .reading-progress-track {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          z-index: 10000;
        }
        .reading-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0FA693, #C8952A);
          transition: width 0.1s linear;
        }
        .read-time-tag {
          color: rgba(200, 149, 42, 0.95);
          font-weight: 600;
        }

        /* High-Contrast World-Class Share Section */
        .share-section {
          margin-top: 52px;
          padding: 26px 30px;
          background: rgba(18, 24, 38, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          box-shadow: 0 12px 36px rgba(0,0,0,0.35);
        }
        .share-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #0FA693;
          margin-bottom: 18px;
        }
        .share-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }
        .share-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 20px;
          border-radius: 999px;
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        }
        .share-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .share-native {
          background: linear-gradient(135deg, #0B4D41, #0FA693);
          color: #ffffff !important;
        }
        .share-twitter {
          background: #000000;
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .share-twitter:hover {
          background: #181818;
          border-color: #ffffff;
        }
        .share-facebook {
          background: #1877F2;
          color: #ffffff !important;
        }
        .share-facebook:hover {
          background: #146be0;
        }
        .share-linkedin {
          background: #0A66C2;
          color: #ffffff !important;
        }
        .share-linkedin:hover {
          background: #0855a4;
        }
        .share-whatsapp {
          background: #25D366;
          color: #ffffff !important;
        }
        .share-whatsapp:hover {
          background: #1ebd56;
        }
        .share-copy {
          background: rgba(255,255,255,0.1);
          color: #ffffff !important;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .share-copy:hover {
          background: #0FA693;
          border-color: #0FA693;
        }
        .share-copy.is-copied {
          background: #0FA693;
          color: #ffffff !important;
        }

        .article-featured-image-wrap {
          margin-bottom: 24px;
        }
        .article-featured-image {
          position: relative;
        }
        .photo-caption-text {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 10px;
          padding: 6px 12px;
          border-left: 3px solid #0FA693;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 0 8px 8px 0;
        }
        .photo-caption-main {
          font-weight: 600;
          color: #ffffff;
        }
        .photo-caption-sub {
          color: rgba(200, 149, 42, 0.95);
          font-style: italic;
        }
        .photo-badge-overlay {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(11, 77, 65, 0.92);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        }
        .article-gallery-section {
          margin: 44px 0;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .gallery-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 20px;
        }
        .article-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        .gallery-card-item {
          display: flex;
          flex-direction: column;
        }
        .gallery-card {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          background: #1A2232;
          border: 1px solid rgba(255,255,255,0.12);
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
          border-color: #0FA693;
        }
        .gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-card-caption {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .gallery-card-caption .caption-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.35;
        }
        .gallery-card-caption .caption-credit {
          font-size: 0.74rem;
          color: rgba(200, 149, 42, 0.9);
        }
        .gallery-card-zoom {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(3px);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 600;
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
