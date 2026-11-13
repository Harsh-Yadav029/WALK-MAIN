import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const DynamicBackground = () => {
  const canvasRef = useRef(null);
  const spotlightRef = useRef(null);
  const [hudVisible, setHudVisible] = useState(true);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/fitscalez');

  useEffect(() => {
    if (isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D Perspective settings
    const focalLength = 420;
    const maxZ = 1200;
    let cameraAngleX = 0;
    let cameraAngleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;
    let isScrolling = false;
    let scrollTimeout = null;

    // Fast scroll detection for frame-rate optimization
    const handleScroll = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 90);
    };

    // 3D Point class representing architectural CAD coordinate markers
    class Point3D {
      constructor() {
        this.reset();
        this.z = Math.random() * maxZ;
      }

      reset() {
        this.x = (Math.random() - 0.5) * width * 1.8;
        this.y = (Math.random() - 0.5) * height * 1.8;
        this.z = maxZ;
        this.vz = Math.random() * 0.75 + 0.35;
        this.isLiteGold = Math.random() > 0.35;
        this.isCrosshair = Math.random() > 0.72; // CAD laser target marker
        this.size = Math.random() * 2.2 + 1;
      }

      update() {
        this.z -= this.vz;
        if (this.z <= 15) {
          this.reset();
        }
      }

      project() {
        const cosX = Math.cos(cameraAngleX);
        const sinX = Math.sin(cameraAngleX);
        const cosY = Math.cos(cameraAngleY);
        const sinY = Math.sin(cameraAngleY);

        let rx = this.x * cosY + this.z * sinY;
        let rz = -this.x * sinY + this.z * cosY;
        let ry = this.y * cosX - rz * sinX;
        rz = this.y * sinX + rz * cosX;

        const effectiveZ = focalLength + rz;
        if (effectiveZ <= 10) return { visible: false };

        const scale = focalLength / effectiveZ;
        const px = rx * scale + width / 2;
        const py = ry * scale + height / 2;

        return {
          px,
          py,
          scale,
          visible: px >= -40 && px <= width + 40 && py >= -40 && py <= height + 40 && rz > 0
        };
      }
    }

    // Adapt point count to screen size for optimal performance
    const pointCount = Math.min(50, Math.max(22, Math.floor(width / 32)));
    const points = Array.from({ length: pointCount }, () => new Point3D());

    let mouseMoveTicking = false;
    const handleMouseMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!mouseMoveTicking) {
        requestAnimationFrame(() => {
          const normX = (clientX / width - 0.5) * 2;
          const normY = (clientY / height - 0.5) * 2;
          targetAngleY = normX * 0.08;
          targetAngleX = -normY * 0.08;

          // Update GPU flashlight spotlight position
          if (spotlightRef.current) {
            spotlightRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
          }
          mouseMoveTicking = false;
        });
        mouseMoveTicking = true;
      }
    };

    const handleMouseLeave = () => {
      targetAngleX = 0;
      targetAngleY = 0;
    };

    let resizeTimeout = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    let lastTime = 0;

    const animate = (time) => {
      // Limit to 60/120fps display refresh interval
      if (time - lastTime < 14) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      cameraAngleX += (targetAngleX - cameraAngleX) * 0.05;
      cameraAngleY += (targetAngleY - cameraAngleY) * 0.05;

      const projectedPoints = [];

      // Project & Draw 3D Architectural Nodes
      points.forEach((p) => {
        p.update();
        const proj = p.project();
        if (proj.visible) {
          projectedPoints.push({ ...proj, point: p });

          const alpha = Math.min(0.85, Math.max(0.12, proj.scale * 1.5));
          const color = p.isLiteGold
            ? `rgba(250, 232, 164, ${alpha})`
            : `rgba(240, 205, 111, ${alpha * 0.85})`;

          ctx.fillStyle = color;
          ctx.strokeStyle = color;

          if (p.isCrosshair && proj.scale > 0.4) {
            // Draw CAD Architectural Crosshair
            const arm = 5 * proj.scale;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(proj.px - arm, proj.py);
            ctx.lineTo(proj.px + arm, proj.py);
            ctx.moveTo(proj.px, proj.py - arm);
            ctx.lineTo(proj.px, proj.py + arm);
            ctx.stroke();
          } else {
            // Draw Circular Coordinate Node
            const r = p.size * proj.scale;
            ctx.beginPath();
            ctx.arc(proj.px, proj.py, Math.max(0.8, r), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Proximity Laser Mesh Lines (Skipped during fast scroll for ultra-fluid 120fps scrolling!)
      if (!isScrolling && projectedPoints.length > 1) {
        const maxDist = 90;
        const maxZDiff = 170;
        const len = projectedPoints.length;

        for (let i = 0; i < len; i++) {
          const ptA = projectedPoints[i];
          for (let j = i + 1; j < len; j++) {
            const ptB = projectedPoints[j];
            const dx = ptA.px - ptB.px;
            const dy = ptA.py - ptB.py;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
              const zDiff = Math.abs(ptA.point.z - ptB.point.z);
              if (zDiff < maxZDiff) {
                const avgScale = (ptA.scale + ptB.scale) / 2;
                const lineAlpha = (1 - dist / maxDist) * 0.15 * avgScale;

                ctx.beginPath();
                ctx.moveTo(ptA.px, ptA.py);
                ctx.lineTo(ptB.px, ptB.py);
                ctx.strokeStyle = `rgba(250, 232, 164, ${lineAlpha})`;
                ctx.lineWidth = 0.65;
                ctx.stroke();
              }
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 70% at 50% 20%, #15130e 0%, #0d0c08 55%, #070604 100%)',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
        transform: 'translateZ(0)'
      }}
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Luxury Base Gradient (Hardware-Accelerated) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 90% 70% at 50% 20%, #15130e 0%, #0d0c08 55%, #070604 100%)',
          transform: 'translateZ(0)'
        }}
      />

      {/* 2. Interactive Cursor Flashlight Spotlight (GPU Composited) */}
      <div
        ref={spotlightRef}
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250, 232, 164, 0.055) 0%, rgba(229, 184, 66, 0.02) 40%, transparent 70%)',
          filter: 'blur(30px)',
          willChange: 'transform',
          transform: 'translate3d(-500px, -500px, 0)',
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease'
        }}
      />

      {/* 3. Radiant Lite Gold Atmospheric Ambient Light Wells */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '18%',
          width: '65vw',
          height: '65vw',
          maxWidth: '850px',
          maxHeight: '850px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250, 232, 164, 0.08) 0%, rgba(240, 205, 111, 0.03) 40%, transparent 70%)',
          filter: 'blur(65px)',
          transform: 'translateZ(0)',
          animation: 'pulse-glow 12s ease-in-out infinite alternate'
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '8%',
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240, 205, 111, 0.06) 0%, rgba(196, 150, 34, 0.02) 45%, transparent 70%)',
          filter: 'blur(75px)',
          transform: 'translateZ(0)'
        }}
      />

      {/* 4. High-Performance Canvas for 3D Architectural Coordinates */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          transform: 'translateZ(0)'
        }}
      />

      {/* 5. Architectural Laser Blueprint Grid with Micro-Ticks */}
      <div className="grid-overlay" />

      {/* 6. Sweeping Architectural Laser Projection Horizon Line */}
      <div className="bg-laser-sweep" />

      {/* 7. CAD HUD Corner Reticles (Architectural Calibration Aesthetics) */}
      <div className="cad-corner cad-tl">
        <span className="cad-crosshair">+</span>
        <span className="cad-label">SCALE 1:1 • CALIBRATED</span>
      </div>
      <div className="cad-corner cad-tr">
        <span className="cad-label">STUDIO PROJECTION ACTIVE</span>
        <span className="cad-crosshair">+</span>
      </div>
      <div className="cad-corner cad-bl">
        <span className="cad-ruler">|'''|'''|'''|'''|'''|</span>
        <span className="cad-label">PRECISION ARCHITECTURAL MAPPING</span>
      </div>
    </div>
  );
};

export default DynamicBackground;
