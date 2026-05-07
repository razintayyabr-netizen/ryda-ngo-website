'use client';

import { useEffect, useRef } from 'react';

export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    if (!('IntersectionObserver' in window)) {
      ref.current.style.opacity = '1';
      ref.current.style.transform = 'translateY(0)';
      return;
    }

    const el = ref.current;
    el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
