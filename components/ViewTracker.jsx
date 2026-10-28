'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_KEY = 'ryda_vid';
const SEEN_KEY = 'ryda_seen';
const DEDUPE_MS = 30 * 60 * 1000; // same page in same session counts once per 30 min

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return 'anon';
  }
}

function alreadySeen(path) {
  try {
    const seen = JSON.parse(sessionStorage.getItem(SEEN_KEY) || '{}');
    const last = seen[path];
    if (last && Date.now() - last < DEDUPE_MS) return true;
    seen[path] = Date.now();
    sessionStorage.setItem(SEEN_KEY, JSON.stringify(seen));
    return false;
  } catch {
    return false;
  }
}

function publish(detail) {
  window.__rydaViews = detail;
  window.dispatchEvent(new CustomEvent('ryda:views', { detail }));
}

/**
 * Privacy-friendly view tracker: anonymous visitor id (no cookies, no PII),
 * counts article reads, page views and writer-panel visits.
 */
export default function ViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;

    const isArticle = /^\/newsroom\/[^/]+\/?$/.test(pathname) && !pathname.startsWith('/newsroom/article');
    const seen = alreadySeen(pathname);

    // Already counted in this session — still fetch the live count for article pages
    if (seen) {
      if (isArticle) {
        const slug = decodeURIComponent(pathname.split('/')[2] || '');
        fetch(`/api/views?id=${encodeURIComponent(slug)}`, { cache: 'no-store' })
          .then(r => r.json())
          .then(d => publish({ path: pathname, views: d.views || 0, unique: d.unique || 0 }))
          .catch(() => {});
      }
      return;
    }

    const payload = {
      path: pathname,
      visitor: getVisitorId(),
      referrer: document.referrer || '',
    };

    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then(r => r.json())
      .then(d => {
        if (d && d.type === 'article') publish({ path: pathname, views: d.views || 0, unique: d.unique || 0 });
      })
      .catch(() => {});
  }, [pathname]);

  return null;
}
