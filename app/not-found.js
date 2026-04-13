import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-not-found">
      <div className="page-not-found-inner">
        <div className="page-not-found-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="page-not-found-actions">
          <Link href="/" className="btn btn-primary">Go Home</Link>
          <Link href="/newsroom" className="btn btn-outline">Visit Newsroom</Link>
        </div>
      </div>
    </div>
  );
}