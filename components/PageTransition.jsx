'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={`page-transition ${isVisible ? 'page-transition-visible' : 'page-transition-hidden'}`}>
      {children}
    </div>
  );
}