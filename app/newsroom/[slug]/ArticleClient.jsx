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

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: `${title} — RYDA Newsroom`,
        url: url,
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
      <span className="share-label">Share Article:</span>
      {canNativeShare && (
        <button onClick={handleNativeShare} className="share-btn share-native" aria-label="Share via device">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M15 7C16.1046 7 17 6.10457 17 5C17 3.89543 16.1046 3 15 3C13.8954 3 13 3.89543 13 5C13 6.10457 13.8954 7 15 7Z" stroke="currentColor" strokeWidth="1.5"/><path d="M5 12C6.10457 12 7 11.1046 7 10C7 8.89543 6.10457 8 5 8C3.89543 8 3 8.89543 3 10C3 11.1046 3.89543 12 5 12Z" stroke="currentColor" strokeWidth="1.5"/><path d="M15 17C16.1046 17 17 16.1046 17 15C17 13.8954 16.1046 13 15 13C13.8954 13 13 13.8954 13 15C13 16.1046 13.8954 17 15 17Z" stroke="currentColor" strokeWidth="1.5"/><path d="M6.7 10.9L13.3 14.1M13.3 5.9L6.7 9.1" stroke="currentColor" strokeWidth="1.5"/></svg>
          Share
        </button>
      )}
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
  const currentImg = images[activeIdx];

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close photo modal">✕</button>
        
        <div className="lightbox-image-container">
          <img src={currentImg.url} alt={currentImg.caption || `Photo ${activeIdx + 1}`} className="lightbox-image" />
        </div>

        {currentImg.caption && (
          <p className="lightbox-caption">📷 {currentImg.caption}</p>
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
          background: rgba(0, 0, 0, 0.92);
          backdrop-filter: blur(12px);
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
          top: -42px;
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
          max-height: 72vh;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
        }

        .lightbox-image {
          display: block;
          max-width: 100%;
          max-height: 72vh;
          object-fit: contain;
        }

        .lightbox-caption {
          margin-top: 10px;
          font-size: 0.92rem;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
          padding: 6px 16px;
          border-radius: 8px;
          text-align: center;
          max-width: 80%;
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
    if (typeof img === 'string') return { url: img, caption: '' };
    return { url: img?.url || '', caption: img?.caption || '' };
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
              {images[0].caption && (
                <figcaption className="photo-caption-text">
                  📷 {images[0].caption}
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
                      <div className="gallery-card-zoom">🔍 Click to zoom</div>
                    </div>
                    {imgObj.caption && (
                      <p className="gallery-card-caption">{imgObj.caption}</p>
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
          color: rgba(200, 149, 42, 0.9);
          font-weight: 600;
        }
        .share-native {
          background: linear-gradient(135deg, #0B4D41, #0FA693);
          color: #fff !important;
          border: none !important;
          padding: 6px 14px;
          border-radius: 999px;
        }
        .article-featured-image-wrap {
          margin-bottom: 24px;
        }
        .article-featured-image {
          position: relative;
        }
        .photo-caption-text {
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
          margin-top: 8px;
          padding: 4px 8px;
          border-left: 2px solid #0FA693;
        }
        .photo-badge-overlay {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(11, 77, 65, 0.88);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 999px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.35);
        }
        .article-gallery-section {
          margin: 40px 0;
          padding-top: 28px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .gallery-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 18px;
        }
        .article-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
        }
        .gallery-card-item {
          display: flex;
          flex-direction: column;
        }
        .gallery-card {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: #1A2232;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.45);
          border-color: #0FA693;
        }
        .gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-card-caption {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 6px;
          line-height: 1.35;
        }
        .gallery-card-zoom {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px);
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
