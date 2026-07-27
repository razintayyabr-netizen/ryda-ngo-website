'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      router.replace(`/newsroom/${encodeURIComponent(id)}`);
    } else {
      router.replace('/newsroom');
    }
  }, [id, router]);

  return (
    <div className="article-loading">
      <div className="article-loading-spinner"></div>
      <p>Redirecting to article…</p>
    </div>
  );
}

export default function ArticleRedirectPage() {
  return (
    <Suspense fallback={
      <div className="article-loading">
        <div className="article-loading-spinner"></div>
        <p>Loading…</p>
      </div>
    }>
      <RedirectContent />
    </Suspense>
  );
}
