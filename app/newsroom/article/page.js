'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBieGnfxoFqHLLZHz-MnHWRzl1eBarD7yo",
  authDomain: "ryda-68015.firebaseapp.com",
  projectId: "ryda-68015",
  storageBucket: "ryda-68015.firebasestorage.app",
  messagingSenderId: "845909692038",
  appId: "1:845909692038:web:94c8c4a51a737e5abacb07"
};

let app, db;
function getDb() {
  if (!app) app = initializeApp(firebaseConfig);
  if (!db) db = getFirestore(app);
  return db;
}

function fmtDate(iso) {
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
  } catch { return iso; }
}

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };
  return (
    <div className="share-section">
      <span className="share-label">Share:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-twitter" aria-label="Share on Twitter">𝕏</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-facebook" aria-label="Share on Facebook">f</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-linkedin" aria-label="Share on LinkedIn">in</a>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' — ' + url)}`} target="_blank" rel="noreferrer" className="share-btn share-whatsapp" aria-label="Share on WhatsApp">WA</a>
      <button onClick={handleCopy} className="share-btn share-copy" aria-label="Copy link">{copied ? '✓' : 'Copy'}</button>
    </div>
  );
}

function ArticleContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');

  useEffect(() => { setArticleUrl(window.location.href); }, []);

  useEffect(() => {
    if (!id) { setLoading(false); setNotFound(true); return; }

    async function loadPost() {
      try {
        const db = getDb();
        const snap = await getDoc(doc(db, 'posts', id));
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data(), date: snap.data().createdAt || snap.data().date });

          const allQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
          const allSnap = await getDocs(allQ);
          const related = allSnap.docs
            .filter(d => d.id !== id)
            .slice(0, 3)
            .map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt || d.data().date }));
          setRelatedPosts(related);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        setNotFound(true);
      }
      setLoading(false);
    }

    const safetyTimer = setTimeout(() => { setLoading(false); setNotFound(true); }, 8000);
    loadPost();
    return () => clearTimeout(safetyTimer);
  }, [id]);

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
          {post.featured_image && (
            <div className="article-featured-image">
              <img src={post.featured_image} alt={post.title} />
            </div>
          )}
          <div className="article-summary">
            <div className="article-summary-icon">
              <svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M10 3L12 8.5H18L13 12L15 17.5L10 14L5 17.5L7 12L2 8.5H8L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </div>
            <p>{post.summary}</p>
          </div>
          <article className="article-body" dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Content not available.</em></p>' }} />
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
              {relatedPosts.map(item => (
                <Link href={item.id.startsWith('nr-') ? `/newsroom/${item.id}` : `/newsroom/article?id=${item.id}`} key={item.id} className="nr-card">
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
              ))}
            </div>
            <div className="related-cta">
              <Link href="/newsroom" className="is-btn-secondary">View All Articles →</Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={
      <div className="article-loading">
        <div className="article-loading-spinner"></div>
        <p>Loading…</p>
      </div>
    }>
      <ArticleContent />
    </Suspense>
  );
}
