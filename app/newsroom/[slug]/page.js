import STATIC_NEWS from '@/lib/staticNews';
import ArticleClient from './ArticleClient';

export function generateStaticParams() {
  return STATIC_NEWS.map(post => ({ slug: post.id }));
}

export default function ArticlePage({ params }) {
  const post = STATIC_NEWS.find(p => p.id === params.slug);
  
  if (!post) {
    return (
      <>
        <div className="article-loading">
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <a href="/newsroom" className="btn btn-primary">← Back to Newsroom</a>
        </div>
      </>
    );
  }

  return <ArticleClient post={post} />;
}
