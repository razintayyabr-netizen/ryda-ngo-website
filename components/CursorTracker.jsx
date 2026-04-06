'use client';

import { useEffect, useState } from 'react';

export default function CursorTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;
    setIsVisible(true);

    const cards = document.querySelectorAll('.panel-card, .about-card, .prog-card, .news-card');

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Update spotlight coordinates locally on cards for accurate gradient tracking
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.closest('a') ||
        e.target.closest('button') ||
        e.target.closest('.tab')
      ) {
        setIsHovered(true);
      }
    };
    
    const handleMouseOut = () => setIsHovered(false);

    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="cursor-dot" style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }} />
      <div className={`cursor-ring ${isHovered ? 'hovered' : ''}`} style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }} />
    </>
  );
}
