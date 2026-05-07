import ArticleClient from './ArticleClient';

export function generateStaticParams() {
  return [
    { slug: 'nr-1' },
    { slug: 'nr-2' },
    { slug: 'nr-3' },
    { slug: 'nr-4' },
    { slug: 'nr-5' },
    { slug: 'nr-6' },
  ];
}

export default function ArticlePage({ params }) {
  return <ArticleClient />;
}
