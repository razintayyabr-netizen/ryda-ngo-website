'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(ease * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return count;
}

function StatItem({ value, suffix, label, active }) {
  const count = useCountUp(value, 2000, active);
  return (
    <div className="is-stat-card">
      <h3>{active ? count : 0}{suffix}</h3>
      <p>{label}</p>
    </div>
  );
}

export default function Hero() {
  const [countersActive, setCountersActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    setLoaded(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setCountersActive(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setCountersActive(true); }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="is-hero">
        <div className="is-hero-overlay"></div>
        <div className="is-hero-bg"></div>
        <div className="container is-hero-container">
          <div className="is-hero-content">
            <span className="is-hero-badge">Rohingya-Led · Cox's Bazar, Bangladesh</span>
            <h1 className="animate-fade-in">
              Justice for the Rohingya.<br />Through Evidence &amp; Action.
            </h1>
            <p className="animate-fade-in delay-100">
              RYDA is a Rohingya-led civil society organization documenting human rights violations,
              amplifying refugee voices, building youth leaders, and delivering humanitarian support
              where it matters most.
            </p>
            <div className="is-hero-actions animate-fade-in delay-200">
              <Link className="is-btn-primary" href="/#contact">Partner With Us</Link>
              <Link className="is-btn-secondary" href="/#programs">Our Programs</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="is-stats" ref={statsRef}>
        <div className="container is-stats-grid">
          <StatItem value={50} suffix="+" label="Partner Organizations" active={countersActive} />
          <StatItem value={1200} suffix="+" label="People Directly Reached" active={countersActive} />
          <StatItem value={8} suffix="" label="Active Programs" active={countersActive} />
          <StatItem value={100} suffix="%" label="Rohingya-Led Team" active={countersActive} />
        </div>
      </section>
    </>
  );
}