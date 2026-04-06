'use client';

import { useEffect, useRef } from 'react';

export default function StatsBand() {
  const statsRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    const animCounter = (el) => {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target) || prefersReducedMotion) {
        el.textContent = target;
        return;
      }
      const dur = 1400;
      const start = performance.now();
      
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };

    if ("IntersectionObserver" in window) {
      const fired = new WeakSet();
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting || fired.has(e.target)) return;
          fired.add(e.target);
          const counter = e.target.querySelector(".js-count");
          if (counter) animCounter(counter);
          obs.unobserve(e.target);
        });
      }, { threshold: 0.4 });

      if (statsRef.current) {
        const items = statsRef.current.querySelectorAll('.stat-item');
        items.forEach(el => obs.observe(el));
      }
      return () => obs.disconnect();
    } else {
      if (statsRef.current) {
        statsRef.current.querySelectorAll('.js-count').forEach(el => {
          el.textContent = el.dataset.target;
        });
      }
    }
  }, []);

  return (
    <div className="stats-band" aria-label="Impact at a glance" ref={statsRef}>
      <div className="stats-inner">
        <div className="stat-item">
          <span className="stat-n"><span className="js-count" data-target="8">0</span>+</span>
          <span className="stat-lbl">Active Programs</span>
        </div>
        <div className="stat-sep" aria-hidden="true"></div>
        <div className="stat-item">
          <span className="stat-n"><span className="js-count" data-target="3">0</span>+</span>
          <span className="stat-lbl">Levels of Engagement</span>
        </div>
        <div className="stat-sep" aria-hidden="true"></div>
        <div className="stat-item">
          <span className="stat-n"><span className="js-count" data-target="4">0</span></span>
          <span className="stat-lbl">Core Work Pillars</span>
        </div>
        <div className="stat-sep" aria-hidden="true"></div>
        <div className="stat-item">
          <span className="stat-n">100<span style={{fontSize: '0.65em'}}>%</span></span>
          <span className="stat-lbl">Dedicated to Rohingya</span>
        </div>
      </div>
    </div>
  );
}
