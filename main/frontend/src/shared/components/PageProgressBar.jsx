import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on route change and initial mount
    setVisible(true);
    setProgress(15);

    const t1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const t2 = setTimeout(() => {
      setProgress(100);
    }, 240);

    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        zIndex: 99999,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Background track */}
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(250, 232, 164, 0.08)'
        }}
      />
      {/* Laser progress beam */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #ca9a24 0%, #e5b842 60%, #fae8a4 100%)',
          boxShadow: '0 0 12px rgba(250, 232, 164, 0.9), 0 0 24px rgba(229, 184, 66, 0.6)',
          transition: progress === 100 ? 'width 0.2s ease-out, opacity 0.3s ease-out' : 'width 0.2s ease-out',
          opacity: visible ? 1 : 0
        }}
      >
        {/* Intense Laser Leading Tip */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            right: 0,
            width: '12px',
            height: '7px',
            background: '#ffffff',
            borderRadius: '50%',
            boxShadow: '0 0 10px #ffffff, 0 0 20px #fae8a4, 0 0 35px #e5b842',
            transform: 'translateX(50%)'
          }}
        />
      </div>
    </div>
  );
};

export default PageProgressBar;
