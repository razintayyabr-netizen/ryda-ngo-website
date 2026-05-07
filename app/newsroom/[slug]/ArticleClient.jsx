'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

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

const STATIC_NEWS = [
  {
    id: "nr-1",
    title: "RYDA Releases Documentation Brief on Restrictions on Fundamental Freedoms",
    category: "Report",
    author: "RYDA Team",
    summary: "A new RYDA briefing highlights restrictions on expression, movement, and association affecting Rohingya communities across camps and crisis zones.",
    date: "2026-03-18T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association (RYDA) has released a comprehensive documentation brief examining the severe restrictions on fundamental freedoms affecting Rohingya communities. The brief details systematic violations of freedom of expression, movement, and association across refugee camps and crisis zones.</p><h2>Key Findings</h2><p>The documentation reveals a pattern of increasingly restrictive measures that limit the ability of Rohingya individuals and communities to exercise their basic human rights. These restrictions have intensified in recent months, creating a climate of fear and self-censorship.</p><p>RYDA's field researchers documented over 47 incidents of movement restrictions in the first quarter of 2026 alone, affecting an estimated 12,000 individuals across multiple camp sectors.</p><h2>Recommendations</h2><p>The brief calls on international stakeholders to urgently address these violations through coordinated diplomatic pressure, increased monitoring, and direct engagement with community representatives.</p>",
    tags: ["human-rights", "documentation", "freedoms"],
  },
  {
    id: "nr-2",
    title: "Youth Leadership Training Expands Community Representation",
    category: "Leadership",
    author: "RYDA Team",
    summary: "Leadership workshops are helping Rohingya youths, girls, and women strengthen advocacy, organization, and public engagement skills.",
    date: "2026-03-10T12:00:00Z",
    content: "<p>RYDA's Youth Leadership Training program has entered its third phase, expanding to reach more young Rohingya leaders across communities. The program focuses on building practical skills in advocacy, community organization, and public engagement.</p><h2>Program Highlights</h2><p>Over 120 young leaders — including 68 young women — have completed the training modules this quarter. Participants have reported increased confidence in representing their communities in meetings with international organizations and local administrators.</p><p>The training curriculum covers public speaking, rights-based advocacy, conflict resolution, and digital literacy, equipping participants with tools for effective community leadership.</p><h2>Impact</h2><p>Graduates of the program are already making measurable impact. Several have been selected as community representatives, and three participants have been invited to present at regional conferences on refugee rights.</p>",
    tags: ["youth", "leadership", "training"],
  },
  {
    id: "nr-3",
    title: "RYDA Submits Briefing to UN Special Rapporteur",
    category: "Advocacy",
    author: "RYDA Advocacy Unit",
    summary: "RYDA submitted a detailed briefing to the UN Special Rapporteur outlining documented violations and urging stronger international protection measures.",
    date: "2026-02-28T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association has submitted a formal briefing paper to the United Nations Special Rapporteur on the situation of human rights in Myanmar. The document outlines documented violations and provides recommendations for enhanced international protection measures.</p><h2>Briefing Contents</h2><p>The submission includes testimonies from affected individuals, data from RYDA's monitoring network, and a legal analysis of the obligations of relevant states under international humanitarian law.</p><p>Key areas covered include: arbitrary detention, restrictions on movement, denial of education access, and limitations on humanitarian operations in affected areas.</p><h2>Call to Action</h2><p>RYDA urges the Special Rapporteur to include the perspectives of Rohingya-led organizations in upcoming reports and to advocate for independent monitoring mechanisms with direct community participation.</p>",
    tags: ["UN", "advocacy", "human-rights"],
  },
  {
    id: "nr-4",
    title: "Emergency Response: Food and Medical Aid in Cox's Bazar",
    category: "Emergency",
    author: "RYDA Relief Team",
    summary: "Following flooding, RYDA coordinated emergency food parcels, hygiene kits, and basic medical support for affected families.",
    date: "2026-02-14T12:00:00Z",
    content: "<p>In response to severe flooding that affected thousands of families in Cox's Bazar refugee camps, RYDA mobilized an emergency relief operation delivering critical supplies to the most vulnerable households.</p><h2>Response Details</h2><p>Within 48 hours of the flooding, RYDA teams distributed:</p><ul><li>850 emergency food parcels containing rice, lentils, oil, and nutritional supplements</li><li>1,200 hygiene kits with soap, water purification tablets, and sanitary supplies</li><li>Mobile medical teams providing first aid and referrals to 340 individuals</li></ul><h2>Ongoing Needs</h2><p>The situation remains critical, with many families still displaced from their shelters. RYDA continues to coordinate with partner organizations to ensure sustained delivery of essential services during the recovery period.</p>",
    tags: ["emergency", "cox-bazar", "relief"],
  },
  {
    id: "nr-5",
    title: "RYDA Issues Public Statement on Arbitrary Detention Reports",
    category: "Statement",
    author: "RYDA Team",
    summary: "RYDA is deeply concerned by verified reports of arbitrary detention and calls on authorities to uphold international human rights standards.",
    date: "2026-01-30T12:00:00Z",
    content: "<p>The Rohingya Youth Development Association expresses deep concern regarding verified reports of arbitrary detention of Rohingya individuals. These actions represent a clear violation of international human rights standards and must be addressed with urgency.</p><h2>Our Position</h2><p>RYDA has documented multiple cases of individuals being detained without charge, denied access to legal representation, and held in conditions that fall below minimum international standards for the treatment of detainees.</p><p>We call on all relevant authorities to:</p><ul><li>Immediately release all individuals detained without lawful basis</li><li>Ensure access to legal representation for all detainees</li><li>Allow independent monitoring of detention facilities</li><li>Provide transparent reporting on the status and conditions of detained individuals</li></ul><h2>Commitment</h2><p>RYDA will continue to document and publicly report on these violations as part of our mandate to protect the human rights of Rohingya communities.</p>",
    tags: ["statement", "detention", "human-rights"],
  },
  {
    id: "nr-6",
    title: "New Research Report: Education Barriers Facing Rohingya Youth",
    category: "Report",
    author: "RYDA Research Unit",
    summary: "A new RYDA publication documents systemic barriers preventing Rohingya children from accessing quality education, with policy recommendations.",
    date: "2026-01-18T12:00:00Z",
    content: "<p>RYDA's Research Unit has published a comprehensive report examining the systemic barriers that prevent Rohingya children and youth from accessing quality education. The report draws on extensive field research and presents actionable policy recommendations.</p><h2>Research Findings</h2><p>The study surveyed 500 families across 12 camp sectors, revealing that:</p><ul><li>73% of Rohingya youth aged 15-24 have had their education disrupted for more than 3 years</li><li>Only 12% of school-age girls have access to any form of structured learning</li><li>Language barriers and lack of accredited curricula remain the most significant obstacles</li></ul><h2>Policy Recommendations</h2><p>The report recommends the adoption of the Myanmar curriculum in relevant languages, accreditation of learning programs, and the inclusion of Rohingya educators in program design and delivery.</p><p>RYDA calls on education sector partners to prioritize these recommendations in their 2026-2027 programming cycles.</p>",
    tags: ["research", "education", "youth"],
  },
];

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
      <span className="share-label">Share:</span>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-twitter" aria-label="Share on Twitter">𝕏</a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-facebook" aria-label="Share on Facebook">f</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="share-btn share-linkedin" aria-label="Share on LinkedIn">in</a>
      <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' — ' + url)}`} target="_blank" rel="noreferrer" className="share-btn share-whatsapp" aria-label="Share on WhatsApp">WA</a>
      <button onClick={handleCopy} className="share-btn share-copy" aria-label="Copy link">{copied ? '✓' : 'Copy'}</button>
    </div>
  );
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug;
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');

  useEffect(() => { setArticleUrl(window.location.href); }, []);

  useEffect(() => {
    if (!slug) return;

    async function loadPost() {
      // 1. Check static fallback first
      const staticPost = STATIC_NEWS.find(p => p.id === slug);
      if (staticPost) {
        setPost(staticPost);
        setRelatedPosts(STATIC_NEWS.filter(p => p.id !== slug).slice(0, 3));
        setLoading(false);
        return;
      }

      // 2. Try Firestore
      try {
        const db = getDb();
        const docRef = doc(db, 'posts', slug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const postData = { id: snap.id, ...snap.data(), date: snap.data().createdAt };
          setPost(postData);
          // Get related
          const allQ = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
          const allSnap = await getDocs(allQ);
          const related = allSnap.docs
            .filter(d => d.id !== slug)
            .slice(0, 3)
            .map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt }));
          setRelatedPosts(related.length > 0 ? related : STATIC_NEWS.slice(0, 3));
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
        setNotFound(true);
      }
      setLoading(false);
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <>
        <ScrollReveal />
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
        <ScrollReveal />
        <div className="article-loading">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/newsroom" className="btn btn-primary">← Back to Newsroom</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="article-page">
      <ScrollReveal />
      
      {/* Article Header */}
      <section className="article-hero">
        <div className="article-container">
          <div className="article-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/newsroom">
              Newsroom
            </Link>
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
        </div>
      </section>

      {/* Article Content */}
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
          <article
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Full article content is not available.</em></p>' }}
          />
          <ShareButtons title={post.title} url={articleUrl} />
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-section">
          <div className="related-inner">
            <div className="related-header">
              <span className="section-tag">More from RYDA</span>
              <h2>Related Articles</h2>
            </div>
            <div className="related-grid">
              {relatedPosts.map(item => (
                <Link href={`/newsroom/${item.id}`} key={item.id} className="nr-card">
                  <div className="nr-card-body">
                    <span className="news-badge">{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <div className="nr-card-footer">
                      <span className="nr-card-author">{item.author}</span>
                      <span className="nr-card-date">{fmtDate(item.date)}</span>
                    </div>
                    <span className="nr-card-read">
                      Read Article →
                    </span>
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
