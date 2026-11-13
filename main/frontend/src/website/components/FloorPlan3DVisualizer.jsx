import React, { useState, useEffect } from 'react';
import { Layers, Eye, RotateCw, Sparkles, CheckCircle2, AlertTriangle, Compass, Move3d, ShieldCheck, Zap } from 'lucide-react';

const FloorPlan3DVisualizer = ({ onBookClick }) => {
  // 3D View mode: 'isometric' | 'topdown' | 'vastu'
  const [viewMode, setViewMode] = useState('isometric');
  // Rotation states
  const [rotX, setRotX] = useState(55);
  const [rotZ, setRotZ] = useState(-18);
  // Feature toggles
  const [laserActive, setLaserActive] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [activeRoom, setActiveRoom] = useState('living');
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Auto rotation loop if enabled
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotZ((prev) => (prev >= 180 ? -180 : prev + 0.5));
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Handle View Mode presets
  const handleModeChange = (mode) => {
    setViewMode(mode);
    setIsAutoRotating(false);
    if (mode === 'isometric') {
      setRotX(55);
      setRotZ(-18);
    } else if (mode === 'topdown') {
      setRotX(0);
      setRotZ(0);
    } else if (mode === 'vastu') {
      setRotX(48);
      setRotZ(0);
    }
  };

  const roomsData = {
    living: {
      name: 'Grand Living & Dining Hall',
      dimensions: "26' 4\" × 18' 2\"",
      area: '479 sq.ft',
      vastu: 'North-East (Ishan) — Abundant Natural Light & Prosperity',
      clearance: '4.2 ft Walkway Clearance (Optimal)',
      commonMistake: 'Without 1:1 test, 65% of clients find 6-seater dining blocks main living circulation path.',
      savings: '₹4,80,000 saved in civil partition relocation'
    },
    master: {
      name: 'Presidential Master Suite',
      dimensions: "20' 0\" × 16' 6\"",
      area: '330 sq.ft',
      vastu: 'South-West (Nairutya) — Master Grounding & Stability',
      clearance: '3.8 ft Passage to Walk-in Wardrobe (Passed)',
      commonMistake: 'Wardrobe swing collision with King bed corner — caught instantly at 1:1 projection.',
      savings: '₹3,50,000 saved in carpentry and civil rework'
    },
    kitchen: {
      name: 'Modern Modular Chef Kitchen',
      dimensions: "16' 0\" × 14' 0\"",
      area: '224 sq.ft',
      vastu: 'South-East (Agni) — Fire Energy Alignment',
      clearance: '3.6 ft Counter-to-Island Clearance (Comfortable)',
      commonMistake: 'Island too close to refrigerator door; adjusted 14 inches outward in real time.',
      savings: '₹2,90,000 saved in plumbing and stone slab modifications'
    },
    balcony: {
      name: 'Extended Sky Deck & Lounge',
      dimensions: "18' 0\" × 8' 6\"",
      area: '153 sq.ft',
      vastu: 'North-Facing — Morning Sun Exposure',
      clearance: '5.0 ft Open Entertainment Deck',
      commonMistake: 'Sliding door opening span was too narrow; widened before fabrication.',
      savings: '₹1,80,000 saved in aluminum glazing alteration'
    }
  };

  const activeRoomData = roomsData[activeRoom];

  return (
    <section className="section scroll-reveal" style={{ padding: '6rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background Architectural Grid Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(0, 240, 255, 0.08) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.45rem 1.25rem',
            borderRadius: '9999px',
            background: 'rgba(0, 240, 255, 0.08)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
            color: 'var(--accent-cyan)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            <Move3d size={16} />
            <span>Interactive 3D Architectural Visualizer</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem'
          }}>
            Experience Your Layout in <br />
            <span style={{
              background: 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #e5b842 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              True 3D Spatial Dimension
            </span>
          </h2>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
            maxWidth: '720px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Toggle between 3D Isometric View, 1:1 Laser Projection Floor, and Vastu alignment. Test real furniture scale and verify circulation clearances before laying a single brick.
          </p>
        </div>

        {/* 3D Visualizer Workspace Card */}
        <div style={{
          background: 'rgba(10, 17, 34, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 50px rgba(0, 240, 255, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          padding: 'clamp(0.85rem, 2.5vw, 2.25rem)',
          position: 'relative',
          overflow: 'hidden'
        }} className="visualizer-card">

          {/* Holographic Corner Tech Brackets */}
          <div className="tech-bracket-tl" />
          <div className="tech-bracket-br" />

          {/* LEFT COLUMN: 3D Interactive Stage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            {/* Top Stage Control Toolbar */}
            <div className="stage-toolbar" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(5, 8, 17, 0.65)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {/* View Mode Tabs */}
              <div className="stage-tabs-group" style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.25rem', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleModeChange('isometric')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'isometric' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                    color: viewMode === 'isometric' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Move3d size={14} />
                  <span>3D Isometric</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('topdown')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'topdown' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                    color: viewMode === 'topdown' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Eye size={14} />
                  <span>1:1 Floor View</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('vastu')}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'vastu' ? 'rgba(229, 184, 66, 0.2)' : 'transparent',
                    color: viewMode === 'vastu' ? 'var(--accent-gold)' : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Compass size={14} />
                  <span>Vastu Grid</span>
                </button>
              </div>

              {/* Laser & Auto-Rotate Toggles */}
              <div className="stage-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setLaserActive(!laserActive)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    border: laserActive ? '1px solid rgba(0, 240, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: laserActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: laserActive ? '#00f0ff' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Zap size={13} />
                  <span>Laser {laserActive ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFurniture(!showFurniture)}
                  style={{
                    padding: '0.45rem 0.8rem',
                    borderRadius: '6px',
                    border: showFurniture ? '1px solid rgba(229, 184, 66, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: showFurniture ? 'rgba(229, 184, 66, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: showFurniture ? '#e5b842' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Layers size={13} />
                  <span>Furniture</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAutoRotating(!isAutoRotating)}
                  title="Toggle 3D Orbit Rotation"
                  style={{
                    padding: '0.45rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: isAutoRotating ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                    color: isAutoRotating ? '#00f0ff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <RotateCw size={14} className={isAutoRotating ? 'spin-slow' : ''} />
                </button>
              </div>
            </div>

            {/* 3D Perspective Canvas Stage */}
            <div className="stage-canvas-card" style={{
              position: 'relative',
              height: 'clamp(320px, 46vh, 490px)',
              background: 'radial-gradient(circle at 50% 50%, #081122 0%, #03060d 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 240, 255, 0.18)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1200px',
              cursor: 'grab'
            }}>
              {/* Studio Laser Rig at Top */}
              {laserActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '40px',
                  background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.25) 0%, transparent 100%)',
                  display: 'flex',
                  justifyContent: 'space-around',
                  paddingTop: '6px',
                  pointerEvents: 'none',
                  zIndex: 20
                }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#00f0ff',
                        boxShadow: '0 0 12px #00f0ff, 0 0 24px #00f0ff'
                      }} />
                      <div style={{
                        width: '1px',
                        height: '140px',
                        background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.6) 0%, transparent 100%)',
                        filter: 'blur(0.5px)'
                      }} />
                    </div>
                  ))}
                </div>
              )}

              {/* 3D Blueprint Plane */}
              <div
                className="stage-blueprint-plane"
                style={{
                  width: 'min(92%, 520px)',
                  height: 'min(92%, 380px)',
                  transform: `scale(var(--blueprint-scale, 1)) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: isAutoRotating ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative'
                }}
              >
                {/* 3D Grid Floor Surface */}
                <div style={{
                  position: 'absolute',
                  inset: '-20px',
                  backgroundImage: `
                    linear-gradient(rgba(0, 240, 255, 0.12) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 240, 255, 0.12) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                  border: '2px solid rgba(0, 240, 255, 0.4)',
                  boxShadow: '0 0 60px rgba(0, 240, 255, 0.18), inset 0 0 40px rgba(0, 240, 255, 0.08)',
                  backgroundPosition: 'center center'
                }}>
                  {/* Real-time Laser Scan line sweeping the floor */}
                  {laserActive && <div className="laser-scan-bar" />}
                </div>

                {/* SVG Blueprint Architecture Floor Layout */}
                <svg
                  viewBox="0 0 520 380"
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transform: 'translateZ(2px)'
                  }}
                >
                  {/* Outer Boundary Walls */}
                  <rect
                    x="20"
                    y="20"
                    width="480"
                    height="340"
                    fill="rgba(0, 240, 255, 0.03)"
                    stroke="#00f0ff"
                    strokeWidth="4"
                  />

                  {/* ROOM 1: Living & Dining Hall (Top Left / Center) */}
                  <rect
                    x="24"
                    y="24"
                    width="300"
                    height="210"
                    fill={activeRoom === 'living' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(10, 24, 48, 0.45)'}
                    stroke={activeRoom === 'living' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                    strokeWidth={activeRoom === 'living' ? '3' : '1.5'}
                    style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                    onClick={() => setActiveRoom('living')}
                  />
                  <text x="36" y="50" fill="#ffffff" fontSize="13" fontWeight="800" letterSpacing="0.05em">
                    GRAND LIVING & DINING
                  </text>
                  <text x="36" y="68" fill="rgba(0, 240, 255, 0.85)" fontSize="11" fontFamily="var(--font-mono)">
                    26' 4" × 18' 2" • 479 SQ.FT
                  </text>

                  {/* Movable Modular Furniture: Living Room Sofa & Dining */}
                  {showFurniture && (
                    <g style={{ transition: 'opacity 0.3s' }}>
                      {/* Sectional Sofa */}
                      <rect x="50" y="90" width="110" height="45" rx="6" fill="rgba(229, 184, 66, 0.35)" stroke="#e5b842" strokeWidth="1.5" />
                      <rect x="50" y="135" width="45" height="50" rx="6" fill="rgba(229, 184, 66, 0.35)" stroke="#e5b842" strokeWidth="1.5" />
                      <rect x="110" y="110" width="40" height="25" rx="3" fill="rgba(255, 255, 255, 0.15)" stroke="#ffffff" strokeWidth="1" />
                      <text x="60" y="116" fill="#f8fafc" fontSize="9" fontWeight="700">L-SOFA</text>

                      {/* 6-Seater Dining Set */}
                      <rect x="200" y="95" width="90" height="50" rx="4" fill="rgba(229, 184, 66, 0.3)" stroke="#e5b842" strokeWidth="1.5" />
                      <text x="215" y="125" fill="#f8fafc" fontSize="10" fontWeight="700">6-SEAT DINING</text>
                      {/* Dining Chairs */}
                      <circle cx="215" cy="85" r="6" fill="#e5b842" />
                      <circle cx="245" cy="85" r="6" fill="#e5b842" />
                      <circle cx="275" cy="85" r="6" fill="#e5b842" />
                      <circle cx="215" cy="155" r="6" fill="#e5b842" />
                      <circle cx="245" cy="155" r="6" fill="#e5b842" />
                      <circle cx="275" cy="155" r="6" fill="#e5b842" />

                      {/* Clearance Indicator Line (Green) */}
                      <line x1="160" y1="120" x2="200" y2="120" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                      <circle cx="180" cy="120" r="10" fill="#10b981" />
                      <text x="175" y="123" fill="#ffffff" fontSize="8" fontWeight="800">4.2'</text>
                    </g>
                  )}

                  {/* ROOM 2: Chef Kitchen (Top Right) */}
                  <rect
                    x="324"
                    y="24"
                    width="172"
                    height="150"
                    fill={activeRoom === 'kitchen' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(10, 24, 48, 0.45)'}
                    stroke={activeRoom === 'kitchen' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                    strokeWidth={activeRoom === 'kitchen' ? '3' : '1.5'}
                    style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                    onClick={() => setActiveRoom('kitchen')}
                  />
                  <text x="336" y="50" fill="#ffffff" fontSize="12" fontWeight="800" letterSpacing="0.05em">
                    MODULAR KITCHEN
                  </text>
                  <text x="336" y="68" fill="rgba(0, 240, 255, 0.85)" fontSize="10" fontFamily="var(--font-mono)">
                    16' × 14' • 224 SQ.FT
                  </text>
                  {showFurniture && (
                    <g>
                      {/* Counter L-shape */}
                      <path d="M 334 85 L 486 85 L 486 164 L 460 164 L 460 110 L 334 110 Z" fill="rgba(229, 184, 66, 0.25)" stroke="#e5b842" strokeWidth="1.2" />
                      {/* Kitchen Island */}
                      <rect x="360" y="125" width="70" height="32" rx="4" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" strokeWidth="1.2" />
                      <text x="370" y="145" fill="#ffffff" fontSize="9" fontWeight="700">ISLAND</text>
                      {/* Clearance Circle */}
                      <line x1="395" y1="110" x2="395" y2="125" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                      <text x="400" y="120" fill="#10b981" fontSize="8" fontWeight="800">3.6' PASS</text>
                    </g>
                  )}

                  {/* ROOM 3: Presidential Master Bedroom (Bottom Left) */}
                  <rect
                    x="24"
                    y="234"
                    width="260"
                    height="122"
                    fill={activeRoom === 'master' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(10, 24, 48, 0.45)'}
                    stroke={activeRoom === 'master' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                    strokeWidth={activeRoom === 'master' ? '3' : '1.5'}
                    style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                    onClick={() => setActiveRoom('master')}
                  />
                  <text x="36" y="260" fill="#ffffff" fontSize="12" fontWeight="800" letterSpacing="0.05em">
                    MASTER SUITE (VASTU SW)
                  </text>
                  <text x="36" y="278" fill="rgba(0, 240, 255, 0.85)" fontSize="10" fontFamily="var(--font-mono)">
                    20' × 16' 6" • 330 SQ.FT
                  </text>
                  {showFurniture && (
                    <g>
                      {/* King Bed */}
                      <rect x="70" y="286" width="75" height="60" rx="4" fill="rgba(229, 184, 66, 0.35)" stroke="#e5b842" strokeWidth="1.5" />
                      {/* Pillows */}
                      <rect x="74" y="290" width="30" height="15" rx="3" fill="rgba(255, 255, 255, 0.25)" />
                      <rect x="111" y="290" width="30" height="15" rx="3" fill="rgba(255, 255, 255, 0.25)" />
                      <text x="82" y="325" fill="#ffffff" fontSize="9" fontWeight="700">KING BED</text>
                      {/* Side tables */}
                      <rect x="52" y="290" width="14" height="20" rx="2" fill="#e5b842" />
                      <rect x="149" y="290" width="14" height="20" rx="2" fill="#e5b842" />
                      {/* Wardrobe */}
                      <rect x="195" y="286" width="80" height="22" rx="3" fill="rgba(0, 240, 255, 0.2)" stroke="#00f0ff" strokeWidth="1.2" />
                      <text x="210" y="300" fill="#ffffff" fontSize="8" fontWeight="700">WARDROBE</text>
                      {/* Clearance Door Swing Arc */}
                      <path d="M 215 308 A 20 20 0 0 1 235 328" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
                      <text x="200" y="335" fill="#10b981" fontSize="8" fontWeight="800">3.8' CLEAR</text>
                    </g>
                  )}

                  {/* ROOM 4: Extended Sky Deck / Balcony (Bottom Right) */}
                  <rect
                    x="284"
                    y="234"
                    width="212"
                    height="122"
                    fill={activeRoom === 'balcony' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(10, 24, 48, 0.45)'}
                    stroke={activeRoom === 'balcony' ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                    strokeWidth={activeRoom === 'balcony' ? '3' : '1.5'}
                    style={{ cursor: 'pointer', transition: 'all 0.25s' }}
                    onClick={() => setActiveRoom('balcony')}
                  />
                  <text x="296" y="260" fill="#ffffff" fontSize="12" fontWeight="800" letterSpacing="0.05em">
                    OPEN SKY DECK
                  </text>
                  <text x="296" y="278" fill="rgba(0, 240, 255, 0.85)" fontSize="10" fontFamily="var(--font-mono)">
                    18' × 8' 6" • 153 SQ.FT
                  </text>

                  {/* Vastu Grid Overlay Lines if active */}
                  {viewMode === 'vastu' && (
                    <g style={{ pointerEvents: 'none' }}>
                      <line x1="20" y1="133" x2="500" y2="133" stroke="rgba(229, 184, 66, 0.5)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="20" y1="246" x2="500" y2="246" stroke="rgba(229, 184, 66, 0.5)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="180" y1="20" x2="180" y2="360" stroke="rgba(229, 184, 66, 0.5)" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="340" y1="20" x2="340" y2="360" stroke="rgba(229, 184, 66, 0.5)" strokeWidth="1" strokeDasharray="4 4" />
                      <text x="35" y="348" fill="#e5b842" fontSize="11" fontWeight="800">SW: EARTH (STABILITY)</text>
                      <text x="350" y="42" fill="#e5b842" fontSize="11" fontWeight="800">SE: AGNI (FIRE/KITCHEN)</text>
                      <text x="35" y="42" fill="#e5b842" fontSize="11" fontWeight="800">NE: ISHAN (WATER/LIGHT)</text>
                    </g>
                  )}
                </svg>

                {/* 3D Isometric Wall Extrusions (Z-axis depth layers) */}
                {viewMode === 'isometric' && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    transform: 'translateZ(18px)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    pointerEvents: 'none'
                  }} />
                )}
              </div>

              {/* Real-Time Live CAD HUD Readout Badge */}
              <div className="stage-hud-badge" style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                background: 'rgba(5, 8, 17, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.4rem 0.65rem',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                color: '#94a3b8',
                zIndex: 10,
                maxWidth: 'calc(100% - 20px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 6px #00f0ff' }} />
                  <span style={{ color: '#00f0ff', fontWeight: 700 }}>4K LASER CALIBRATED</span>
                </div>
                <span>SCALE: 1:1</span>
                <span>PITCH: {rotX}°</span>
                <span>YAW: {Math.round(rotZ)}°</span>
              </div>
            </div>

            {/* Rotation Sliders */}
            <div className="stage-sliders-container" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1.25rem',
              padding: '0.6rem 1.15rem',
              background: 'rgba(5, 8, 17, 0.5)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <div className="stage-slider-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>3D Tilt Angle:</span>
                <input
                  type="range"
                  min="0"
                  max="75"
                  value={rotX}
                  onChange={(e) => setRotX(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
                <span style={{ minWidth: '32px', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{rotX}°</span>
              </div>

              <div className="stage-slider-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>3D Orbit:</span>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={rotZ}
                  onChange={(e) => setRotZ(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
                />
                <span style={{ minWidth: '32px', fontFamily: 'var(--font-mono)', color: '#00f0ff' }}>{rotZ}°</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Architectural Room Inspector */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Quick Room Selector Chips */}
              <div className="room-selector-chips" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'living', label: 'Living & Dining' },
                  { id: 'kitchen', label: 'Kitchen' },
                  { id: 'master', label: 'Master Suite' },
                  { id: 'balcony', label: 'Sky Deck' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setActiveRoom(r.id)}
                    style={{
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      border: activeRoom === r.id ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: activeRoom === r.id ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: activeRoom === r.id ? '#00f0ff' : 'var(--text-muted)',
                      fontSize: '0.76rem',
                      fontWeight: activeRoom === r.id ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      flex: '1 1 auto',
                      textAlign: 'center'
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Room Inspector Header */}
              <div style={{
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                    Live Spatial Inspector
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 0 0' }}>
                    {activeRoomData.name}
                  </h3>
                </div>
                <span style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00f0ff',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}>
                  {activeRoomData.area}
                </span>
              </div>

              {/* Room Dimension Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                <div style={{ padding: '0.7rem', background: 'rgba(5, 8, 17, 0.6)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dimensions</span>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {activeRoomData.dimensions}
                  </div>
                </div>

                <div style={{ padding: '0.7rem', background: 'rgba(5, 8, 17, 0.6)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Circulation Check</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <CheckCircle2 size={13} />
                    <span>PASS (Zero Risk)</span>
                  </div>
                </div>
              </div>

              {/* Vastu & Clearance Data */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{
                  padding: '0.85rem',
                  background: 'rgba(229, 184, 66, 0.06)',
                  borderRadius: '10px',
                  border: '1px solid rgba(229, 184, 66, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e5b842', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <Compass size={14} />
                    <span>Vastu Shastra Compliance</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                    {activeRoomData.vastu}
                  </p>
                </div>

                <div style={{
                  padding: '0.85rem',
                  background: 'rgba(239, 68, 68, 0.06)',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <AlertTriangle size={14} />
                    <span>Paper Blueprint Trap Avoided</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.45 }}>
                    {activeRoomData.commonMistake}
                  </p>
                </div>

                <div style={{
                  padding: '0.85rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}>
                  <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#10b981', fontWeight: 700 }}>
                      Demolition Rework Prevented
                    </span>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      {activeRoomData.savings}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Studio Booking CTA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={onBookClick}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.95rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  boxShadow: '0 4px 25px rgba(0, 240, 255, 0.35)',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 60%, #e5b842 100%)',
                  color: '#000000'
                }}
              >
                <span>Walk YOUR Plan at 1:1 Scale →</span>
              </button>
              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ⚡ Test in Gurugram, Dehradun, Varanasi, Hyderabad, or Madurai
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FloorPlan3DVisualizer;
