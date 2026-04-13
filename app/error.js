'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('RYDA page error:', error);
  }, [error]);

  return (
    <div className="page-error" role="alert">
      <div className="page-error-inner">
        <div className="page-error-icon">
          <svg viewBox="0 0 24 24" fill="none" width="64" height="64" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
        </div>
        <h1>Something went wrong</h1>
        <p>We encountered an unexpected error. Please try again.</p>
        <button className="btn btn-primary" type="button" onClick={reset}>
          Try Again
        </button>
      </div>
    </div>
  );
}