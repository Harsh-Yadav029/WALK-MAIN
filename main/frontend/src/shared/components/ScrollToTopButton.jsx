import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const visible = window.scrollY > 300;
          setIsVisible(prev => (prev !== visible ? visible : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};

export default ScrollToTopButton;
