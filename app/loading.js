export default function Loading() {
  return (
    <div className="page-loading" aria-label="Loading page" role="status">
      <div className="page-loading-spinner">
        <div className="spinner-ring"></div>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}