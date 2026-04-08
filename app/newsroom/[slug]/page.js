'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

// Same static posts for fallback
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

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.8 4.5H21L16.1 10.12L21.86 19.5H17.35L13.82 13.83L8.87 19.5H6.65L11.89 13.5L6.36 4.5H10.99L14.18 9.89L18.8 4.5Z"/></svg>,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      color: '#1DA1F2',
    },
    {
      name: 'Facebook',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M13.35 20V12.75H15.78L16.15 9.92H13.35V8.12C13.35 7.3 13.58 6.74 14.76 6.74H16.25V4.2C15.55 4.12 14.84 4.08 14.13 4.08C11.99 4.08 10.52 5.39 10.52 7.8V9.92H8.08V12.75H10.52V20H13.35Z"/></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: '#1877F2',
    },
    {
      name: 'LinkedIn',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6.5 8.5V18H3.5V8.5H6.5ZM5 3.5C6 3.5 6.8 4.3 6.8 5.25S6 7 5 7 3.2 6.2 3.2 5.25 4 3.5 5 3.5ZM21 18H18V13.2C18 11.5 17 11 16.2 11C15.3 11 14.2 11.7 14.2 13.3V18H11.2V8.5H14.1V9.9C14.5 9.2 15.6 8.2 17.2 8.2C19 8.2 21 9.5 21 12.8V18Z"/></svg>,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: '#0A66C2',
    },
    {
      name: 'WhatsApp',
      icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.5 2 2 6.5 2 12C2 13.8 2.5 15.5 3.4 17L2 22L7.2 20.6C8.6 21.4 10.2 21.9 12 21.9C17.5 21.9 22 17.4 22 11.9C22 6.5 17.5 2 12 2ZM16.4 15.3C16.2 15.8 15.2 16.3 14.7 16.4C13.5 16.5 12.6 16.1 11 15.3C8.9 14 7.6 11.8 7.5 11.6C7.3 11.4 6.4 10.3 6.4 9.1C6.4 7.9 7 7.4 7.3 7C7.5 6.7 7.9 6.6 8.1 6.6C8.3 6.6 8.4 6.6 8.6 6.6C8.8 6.6 9.1 6.6 9.3 7.1C9.5 7.6 10 8.8 10.1 9C10.1 9.1 10.1 9.3 10 9.4C9.9 9.6 9.8 9.7 9.7 9.9C9.6 10 9.4 10.2 9.3 10.3C9.2 10.4 9 10.6 9.2 10.9C9.3 11.2 9.9 12.1 10.7 12.9C11.8 13.8 12.7 14.1 13 14.3C13.3 14.4 13.5 14.4 13.6 14.2C13.8 14.1 14.3 13.5 14.5 13.2C14.7 12.9 14.9 13 15.1 13C15.4 13.1 16.5 13.6 16.8 13.8C17.1 13.9 17.3 14 17.3 14.1C17.4 14.4 17.4 15 16.4 15.3Z"/></svg>,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' — ' + url)}`,
      color: '#25D366',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
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
      <h4 className="share-label">Share This Article</h4>
      <div className="share-buttons">
        {shareLinks.map(s => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="share-btn"
            title={`Share on ${s.name}`}
            style={{ '--share-color': s.color }}
          >
            {s.icon}
            <span>{s.name}</span>
          </a>
        ))}
        <button
          className={`share-btn share-copy ${copied ? 'is-copied' : ''}`}
          onClick={handleCopy}
          title="Copy link"
        >
          {copied ? (
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><rect x="6" y="6" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M14 6V5C14 3.9 13.1 3 12 3H5C3.9 3 3 3.9 3 5V12C3 13.1 3.9 14 5 14H6" stroke="currentColor" strokeWidth="1.5"/></svg>
          )}
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
      </div>
    </div>
  );
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug;
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [articleUrl, setArticleUrl] = useState('');

  useEffect(() => {
    setArticleUrl(window.location.href);
  }, []);

  useEffect(() => {
    async function loadPost() {
      // 1. Check if it's a dynamic post (IDs starting with 'post-')
      const isDynamic = slug.startsWith('post-');

      if (!isDynamic) {
        // Check static first for standard IDs like 'nr-1'
        const staticPost = STATIC_NEWS.find(p => p.id === slug);
        if (staticPost) {
          setPost(staticPost);
          const related = STATIC_NEWS.filter(p => p.id !== slug).slice(0, 3);
          setRelatedPosts(related);
          setLoading(false);
          return;
        }
      }

      // 2. Try API for dynamic or non-matched static IDs
      try {
        const res = await fetch(`/api/posts?id=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.post) {
            setPost(data.post);
            
            // Try to find related posts from the API
            try {
              const allRes = await fetch('/api/posts');
              if (allRes.ok) {
                const allData = await allRes.json();
                const related = (allData.posts || [])
                  .filter(p => p.id !== slug)
                  .slice(0, 3);
                setRelatedPosts(related.length > 0 ? related : STATIC_NEWS.slice(0, 3));
              }
            } catch (err) {
              setRelatedPosts(STATIC_NEWS.slice(0, 3));
            }
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Failed to load dynamic post:", err);
        setNotFound(true);
      }
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  // Update document title
  useEffect(() => {
    if (post) {
      document.title = `${post.title} — RYDA Newsroom`;
    }
  }, [post]);

  if (loading) {
    return (
      <>
        <ScrollReveal />
        <Header />
        <main className="article-page">
          <div className="article-container">
            <div className="article-skeleton">
              <div className="skeleton-badge" style={{ width: 100 }}></div>
              <div className="skeleton-title" style={{ width: '80%', height: 48, marginBottom: 24 }}></div>
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '100%', height: 300, marginTop: 40, borderRadius: 20 }}></div>
              <div className="skeleton-line" style={{ width: '100%', marginTop: 40 }}></div>
              <div className="skeleton-line" style={{ width: '90%' }}></div>
              <div className="skeleton-line" style={{ width: '95%' }}></div>
              <div className="skeleton-line" style={{ width: '85%' }}></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <ScrollReveal />
        <Header />
        <main className="article-page">
          <div className="article-container article-not-found">
            <div className="not-found-icon">
              <svg viewBox="0 0 24 24" fill="none" width="64" height="64"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M8 15C8.5 13.5 10 12.5 12 12.5S15.5 13.5 16 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/></svg>
            </div>
            <h1>Article Not Found</h1>
            <p>The article you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
            <Link href="/newsroom" className="btn btn-primary">← Back to Newsroom</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ScrollReveal />
      <Header />
      <main className="article-page">
        {/* Article Hero */}
        <section className="article-hero">
          <div className="article-hero-bg">
            <div className="nr-hero-glow nr-hero-glow-1"></div>
            <div className="nr-hero-glow nr-hero-glow-2"></div>
          </div>
          <div className="article-hero-content reveal">
            <Link href="/newsroom" className="article-back">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M16 10H4M8 6L4 10L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Newsroom
            </Link>
            <span className="news-badge article-badge">{post.category}</span>
            <h1>{post.title}</h1>
            <div className="article-meta">
              <div className="article-meta-item">
                <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4 17C4 14.24 6.69 12 10 12S16 14.24 16 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
                    {post.tags.map(t => (
                      <span key={t} className="article-tag">#{t}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="article-content-section">
          <div className="article-container">
            {/* Featured Image */}
            {post.featured_image && (
              <div className="article-featured-image reveal">
                <img src={post.featured_image} alt={post.title} />
              </div>
            )}

            {/* Summary callout */}
            <div className="article-summary reveal">
              <div className="article-summary-icon">
                <svg viewBox="0 0 20 20" fill="none" width="20" height="20"><path d="M10 3L12 8.5H18L13 12L15 17.5L10 14L5 17.5L7 12L2 8.5H8L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
              </div>
              <p>{post.summary}</p>
            </div>

            {/* Main content */}
            <article
              className="article-body reveal"
              dangerouslySetInnerHTML={{ __html: post.content || '<p><em>Full article content is not available.</em></p>' }}
            />

            {/* Share */}
            <div className="reveal">
              <ShareButtons title={post.title} url={articleUrl} />
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="related-section">
            <div className="related-inner">
              <div className="related-header reveal">
                <span className="section-tag">More from RYDA</span>
                <h2>Related Articles</h2>
              </div>
              <div className="related-grid">
                {relatedPosts.map((item, idx) => (
                  <Link href={`/newsroom/${item.id}`} key={item.id} className="nr-card reveal" style={{ '--delay': `${idx * 0.1}s` }}>
                    <div className="nr-card-body">
                      <span className="news-badge">{item.category}</span>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                      <div className="nr-card-footer">
                        <span className="nr-card-author">{item.author}</span>
                        <span className="nr-card-date">{fmtDate(item.date)}</span>
                      </div>
                      <span className="nr-card-read">
                        Read Article
                        <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M4 10H16M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="related-cta reveal">
                <Link href="/newsroom" className="btn btn-outline">View All Articles →</Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
