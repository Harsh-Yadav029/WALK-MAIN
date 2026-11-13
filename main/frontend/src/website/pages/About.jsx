import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Eye, Monitor, Layers, Quote, ArrowRight } from 'lucide-react';
import parthPhoto from '@/assets/parth_khanna.png';
import himanshuPhoto from '@/assets/himanshu_makkar.png';
import sanyaPhoto from '@/assets/sanya_khanna.jpg';

const About = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    about_video: '/uploads/2.mp4'
  });

  useEffect(() => {
    document.title = "About Walk The Plan | 1:1 Scale Architectural Blueprint Projection Studio India";
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && data.about_video) {
            setSettings(prev => ({ ...prev, about_video: data.about_video }));
          }
        }
      } catch (e) {
        console.error("Error loading about page settings:", e);
      }
    };
    fetchSettings();
  }, []);

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem',
  };

  return (
    <div className="about-page" style={{ backgroundColor: 'transparent', color: '#ffffff', minHeight: '100vh', paddingTop: '5rem' }}>

      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6rem 0',
        overflow: 'hidden',
        textAlign: 'center'
      }}>
        {/* Background Video */}
        <video
          key={settings.about_video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1,
            pointerEvents: 'none',
            imageRendering: 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
          }}
          src={settings.about_video}
        >
          Your browser does not support the video tag.
        </video>

        {/* Overlay for text contrast */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(7, 10, 18, 0.4) 0%, rgba(7, 10, 18, 0.1) 50%, rgba(7, 10, 18, 0.4) 100%)',
          zIndex: 2
        }}></div>

        <div style={{ ...containerStyles, maxWidth: '900px', position: 'relative', zIndex: 3 }}>
          <span className="calligraphy-kicker">
            Who We Are
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', marginTop: '0.75rem', marginBottom: '1.5rem', fontFamily: 'var(--font-headings)', fontWeight: 800, lineHeight: 1.15, textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)' }}>
            Every Home Deserves <br /><span className="calligraphy-accent-lg">A Scale Test Drive</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '750px', margin: '0 auto', textShadow: '0 2px 12px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)' }}>
            We started Walk The Plan because we saw a major gap in the Indian home building process: families investing their life savings into blueprints and 3D screens they couldn't physically feel.
          </p>
        </div>
      </section>

      {/* 2. EDITORIAL JOURNEY SECTION */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(11, 15, 25, 0.5)' }}>
        <div style={containerStyles}>
          <div className="editorial-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(2rem, 4vw, 4rem)',
          }}>
            {/* Left Column: The Journey & Why */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
              {/* Our Journey */}
              <article style={{ borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.75rem' }}>
                <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>01 / Origin</span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 700 }}>OUR JOURNEY</h2>
                <h4 style={{ fontSize: '1.05rem', color: '#d1a60a', marginBottom: '1.25rem', fontWeight: 600 }}>Reimagining How India Builds Homes, One Walkthrough at a Time.</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  A home is one of the biggest investments a person makes in their lifetime. Yet, for decades, homeowners have been expected to make critical decisions based on drawings, floor plans, and digital screens. We believed there had to be a better way.
                </p>
              </article>

              {/* The Why */}
              <article style={{ borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.75rem' }}>
                <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>02 / The Catalyst</span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 700 }}>THE WHY</h2>
                <h4 style={{ fontSize: '1.05rem', color: '#d1a60a', marginBottom: '1.25rem', fontWeight: 600 }}>The Problem We Set Out to Solve</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  With over 8 years of experience in the architecture industry, our Founder recognized a common challenge faced by homeowners, architects, builders, and developers alike:
                </p>
                <div style={{ backgroundColor: 'rgba(239, 199, 25, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(239, 199, 25, 0.15)', marginBottom: '1.25rem' }}>
                  <p style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
                    "People struggle to truly understand a space before it is built."
                  </p>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  No matter how detailed a floor plan or 3D design may be, it is often difficult to fully visualize dimensions, layouts, movement, and the overall feel of a space. This uncertainty can lead to confusion, design changes, delays, and costly mistakes during construction.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  While immersive visualization experiences have already proven successful across mature construction markets around the world, this concept remained largely unexplored in India.
                </p>
              </article>

              {/* Sparked Vision */}
              <article style={{ borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.75rem' }}>
                <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>03 / Breakthrough</span>
                <h2 style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 700 }}>THAT INSIGHT SPARKED A VISION.</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  A vision to help people experience their future spaces before construction begins, reducing uncertainty, improving decision-making, and creating better outcomes for everyone involved in the building journey.
                </p>
                <p style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 700 }}>
                  This vision became Walk The Plan Private Limited.
                </p>
              </article>
            </div>

            {/* Right Column: Present & Future */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
              {/* The Present */}
              <article style={{ borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.75rem' }}>
                <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>04 / Today</span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 700 }}>THE PRESENT</h2>
                <h4 style={{ fontSize: '1.05rem', color: '#d1a60a', marginBottom: '1.25rem', fontWeight: 600 }}>Redefining How Spaces Are Understood</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  Today, Walk The Plan is pioneering a new category in architectural visualization and pre-construction planning. Through innovative solutions such as AR-Based 1:1 Floor Plan Projection, Real-Time Bare-Shell VR, 3D Walkthroughs, and Design Visualization Services, we enable people to see, understand, and experience their spaces before execution begins.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  Our solutions empower homeowners, architects, interior designers, builders, and developers to make informed decisions with greater confidence and clarity.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                  By bridging the gap between imagination and reality, Walk The Plan helps transform plans into experiences—making the design and construction journey smarter, clearer, and more predictable.
                </p>
              </article>

              {/* The Future */}
              <article style={{ borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.75rem' }}>
                <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>05 / Destiny</span>
                <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 700 }}>THE FUTURE</h2>
                <h4 style={{ fontSize: '1.05rem', color: '#d1a60a', marginBottom: '1.25rem', fontWeight: 600 }}>Creating a New Standard in Home Building</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  Our vision extends far beyond walkthrough experiences. We are building a future where experiencing a space before construction becomes a natural and essential part of the home-building journey. Inspired by successful concepts adopted across global construction markets, Walk The Plan is bringing this transformative approach to India.
                </p>
                <div style={{ borderLeft: '2px solid #d1a60a', paddingLeft: '1rem', margin: '1.5rem 0' }}>
                  <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>
                    Our goal is simple yet ambitious: To make Walk The Plan an integral step before every construction project begins.
                  </p>
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                  Just as a test drive helps people make confident decisions before purchasing a vehicle, we believe every homeowner should have the opportunity to experience their future home before it is built.
                </p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                  As we continue expanding our presence and advancing our technology, we remain committed to one mission:
                </p>
                <p style={{ color: 'var(--accent-orange)', fontSize: '1.15rem', fontWeight: 700, lineHeight: '1.6', marginBottom: '0.5rem' }}>
                  "Empowering people to see, feel, understand, and refine their spaces before construction starts."
                </p>
                <p style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem' }}>
                  Because the best decisions are made when you can experience them first.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUNDER PROFILE: PARTH KHANNA */}
      <section style={{ padding: '6rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={containerStyles}>
          {/* Header Grid: Large Name/Title/Quote + Photo */}
          <div className="editorial-header-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '3.5rem'
          }}>
            {/* Left: Name and Pull Quote */}
            <div>
              <span className="founder-name" style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-headings)', letterSpacing: '-0.03em', lineHeight: 1.05, display: 'block', marginBottom: '0.5rem' }}>
                Parth <span style={{ color: 'var(--accent-orange)', fontWeight: 300 }}>Khanna</span>
              </span>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '2.5rem' }}>
                Founder & Director, Walk The Plan
              </span>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-orange)', borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 700, fontFamily: 'var(--font-headings)', lineHeight: '1.4', margin: 0, color: '#ffffff' }}>
                  "Making it possible to <span style={{ color: 'var(--accent-orange)' }}>walk through your future home</span> before construction begins"
                </h3>
              </div>
            </div>

            {/* Right: Photo */}
            <div className="glass-card" style={{
              padding: '0.75rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <img
                src={parthPhoto}
                alt="Parth Khanna"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* Body: Responsive Multi-column Text underneath */}
          <div className="editorial-body" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.85',
            columnCount: 2,
            columnGap: '4rem',
            columnRule: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'justify'
          }}>
            <p style={{ marginBottom: '1.5rem' }}>Every meaningful innovation begins with an observation.</p>
            <p style={{ marginBottom: '1.5rem' }}>
              As a <strong>Bachelor of Architecture</strong> with over <strong>8 years of professional experience</strong> across residential homes, luxury villas, commercial developments, and a wide range of architectural projects, I wasn't just designing buildings—I was understanding people. Every client had a dream, every family had a vision, yet I noticed one challenge that appeared in almost every project.
            </p>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Architects could visualize the design. Clients often couldn't.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Despite detailed floor plans, elevations, and 3D renders, homeowners still struggled to truly understand how their future home would feel once it was built. This communication gap between architectural imagination and client understanding frequently resulted in uncertainty, design revisions, delayed decisions, and avoidable costs.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              While exploring global advancements in architecture and construction technology, I discovered that immersive pre-construction experiences were already transforming the way projects were planned in more mature markets. It immediately raised a question in my mind:
            </p>
            <blockquote style={{ borderLeft: '4px solid var(--accent-orange)', paddingLeft: '1.5rem', margin: '1.5rem 0', fontStyle: 'italic', color: '#ffffff', fontWeight: 600, breakInside: 'avoid' }}>
              "Why should homeowners here rely only on imagination when they can actually experience their future home before construction begins?"
            </blockquote>
            <p style={{ marginBottom: '1.5rem' }}>
              That single question became the foundation of <strong>Walk The Plan</strong>.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Our vision was never to create another visualization company. We wanted to redefine how people experience construction itself. By allowing homeowners to walk through their future spaces before a single brick is laid, we empower them to make informed decisions with clarity, confidence, and complete peace of mind. Every design choice becomes easier, every discussion becomes more meaningful, and every project moves forward with fewer surprises.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              The response has been incredibly encouraging. Walk The Plan has earned the trust of homeowners, architects, builders, and industry leaders who believe that the future of construction begins long before execution. Renowned professionals, including Sumit Dhawan and Ridhi Khosla, have experienced our platform firsthand, further reinforcing our belief that immersive planning is not just an innovation—it is the future of the construction industry.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              For me, Walk The Plan has never been about technology alone. It is about protecting one of the biggest emotional and financial investments of a person's life. If we can help families build with greater confidence, reduce costly mistakes, and transform uncertainty into clarity, then we are not simply improving construction—we are changing the way people experience it.
            </p>
            <p style={{ color: 'var(--accent-orange)', fontWeight: 700, fontSize: '1.15rem', breakInside: 'avoid', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              "The best construction decisions are made before construction begins."
            </p>
          </div>
        </div>
      </section>

      {/* 4. DIRECTOR PROFILE: HIMANSHU MAKKAR */}
      <section style={{ padding: '6rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(11, 15, 25, 0.2)' }}>
        <div style={containerStyles}>
          {/* Header Grid: Photo + Large Name/Title/Quote */}
          <div className="editorial-header-grid" style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '3.5rem'
          }}>
            {/* Left: Photo */}
            <div className="glass-card" style={{
              padding: '0.75rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <img
                src={himanshuPhoto}
                alt="Himanshu Makkar"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            {/* Right: Name and Pull Quote */}
            <div>
              <span className="founder-name" style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-headings)', letterSpacing: '-0.03em', lineHeight: 1.05, display: 'block', marginBottom: '0.5rem' }}>
                Himanshu <span style={{ color: 'var(--accent-orange)', fontWeight: 300 }}>Makkar</span>
              </span>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '2.5rem' }}>
                Director, Walk The Plan
              </span>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-orange)', borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 700, fontFamily: 'var(--font-headings)', lineHeight: '1.4', margin: 0, color: '#ffffff' }}>
                  "Making every <span style={{ color: 'var(--accent-orange)' }}>construction journey clearer</span> before the first brick is laid."
                </h3>
              </div>
            </div>
          </div>

          {/* Body: Responsive Multi-column Text underneath */}
          <div className="editorial-body" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.85',
            columnCount: 2,
            columnGap: '4rem',
            columnRule: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'justify'
          }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Great construction is never defined by beautiful drawings alone. It is defined by what actually gets built on-site. Coming from a family deeply rooted in the construction industry and backed by over <strong>8 years of hands-on experience</strong> in construction execution, I have spent my career where projects truly come to life—on construction sites. Every foundation, every beam, every wall, and every finishing detail has reinforced one lesson: even the smallest planning mistake can become one of the biggest construction challenges.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Over the years, I have managed residential and commercial projects, coordinated with architects, contractors, engineers, vendors, and site teams, ensuring that every stage of execution meets the highest standards of quality, precision, and accountability. While every stakeholder works towards the same goal, I repeatedly noticed a common challenge.
            </p>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              Many homeowners approved designs without fully understanding how their spaces would actually look and function after construction.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Architects explained their vision through drawings, while site teams executed according to approved plans. Yet somewhere between design and execution, expectations often changed. This resulted in unnecessary revisions, additional costs, project delays, material wastage, and avoidable stress for everyone involved.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              When Parth shared the vision of Walk The Plan, I immediately recognized its potential—not as another technology solution, but as a practical answer to one of construction's most overlooked problems.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Giving homeowners the opportunity to experience their future spaces before construction begins creates something invaluable: confidence. It allows better decisions to be made before execution starts, strengthens communication between architects and clients, and enables construction teams to work with greater clarity and efficiency.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              At Walk The Plan, my responsibility is to ensure that every vision can be translated into reality with precision. From construction planning and execution strategies to quality control and site coordination, our focus is on making every project smoother, smarter, and more predictable. Technology may help people visualize their dream home, but disciplined execution is what transforms that vision into reality.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              As the construction industry continues to evolve, I believe success will belong to those who combine innovation with execution. The future is not only about building faster—it is about building smarter, minimizing costly mistakes, reducing uncertainty, and delivering quality that lasts for generations. Walk The Plan represents that future. It is where architectural vision meets construction excellence, where technology meets practical execution, and where every homeowner gains the confidence to build without second thoughts.
            </p>
            <p style={{ color: 'var(--accent-orange)', fontWeight: 700, fontSize: '1.15rem', breakInside: 'avoid', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              "Every successful project is built twice—first through thoughtful planning, and then through flawless execution."
            </p>
          </div>
        </div>
      </section>

      {/* 4.5. CO-FOUNDER & DIRECTOR PROFILE: SANYA CHAWLA KHANNA */}
      <section style={{ padding: '6rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={containerStyles}>
          {/* Header Grid: Large Name/Title/Quote + Photo */}
          <div className="editorial-header-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '3.5rem'
          }}>
            {/* Left: Name and Pull Quote */}
            <div>
              <span className="founder-name" style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-headings)', letterSpacing: '-0.03em', lineHeight: 1.05, display: 'block', marginBottom: '0.5rem' }}>
                Sanya Chawla <span style={{ color: 'var(--accent-orange)', fontWeight: 300 }}>Khanna</span>
              </span>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '2.5rem' }}>
                Director & Co-Founder, Studio Symmetry | Architect | Strategic Backbone of Walk The Plan
              </span>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-orange)', borderLeft: '3px solid var(--accent-orange)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.9rem', fontWeight: 700, fontFamily: 'var(--font-headings)', lineHeight: '1.4', margin: 0, color: '#ffffff' }}>
                  "Every great home begins with a vision, and <span style={{ color: 'var(--accent-orange)' }}>every vision deserves to be experienced</span> before it is built."
                </h3>
              </div>
            </div>

            {/* Right: Photo */}
            <div className="glass-card" style={{
              padding: '0.75rem',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}>
              <img
                src={sanyaPhoto}
                alt="Mrs. Sanya Chawla Khanna"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>
          </div>

          {/* Body: Responsive Multi-column Text underneath */}
          <div className="editorial-body" style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            lineHeight: '1.85',
            columnCount: 2,
            columnGap: '4rem',
            columnRule: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'justify'
          }}>
            <p style={{ marginBottom: '1.5rem' }}>
              Sanya Khanna is a highly accomplished Architect, Interior Design Consultant, and Design Strategist with over <strong>8 years of professional experience</strong> in the architecture, interior design, and construction industry.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              After completing her Bachelor of Architecture (B.Arch.), she built a strong foundation through professional practice before co-founding <strong>Studio Symmetry</strong>, where she currently serves as Director & Co-Founder. Throughout her career, she has successfully led residential, commercial, and interior design projects, delivering innovative, functional, and aesthetically refined spaces that enhance the way people live and experience their environments.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Her expertise spans architectural planning, residential and commercial design, interior architecture, space planning, construction consulting, and project execution. Having worked closely with homeowners, architects, builders, and developers, Sanya understands the practical challenges involved in transforming architectural drawings into reality. Her approach focuses on creating efficient design solutions while ensuring clarity, confidence, and a seamless construction journey for every client.
            </p>
            <p style={{ color: '#ffffff', fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              As the Strategic Backbone of Walk The Plan, Sanya plays a pivotal role in shaping the company's vision, customer experience, and long-term growth strategy.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              She works alongside the leadership team to bridge the gap between architectural imagination and real-world execution through immersive walkthrough technology. Her contribution extends beyond design, helping create an experience that empowers homeowners to visualize, understand, and perfect their dream homes before construction begins.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              For Sanya, Walk The Plan is far more than a business—it is an emotion that transforms dreams into reality. She believes every family deserves the opportunity to experience their future home before laying the first brick. By enabling clients to physically walk through their floor plans, Walk The Plan minimizes design uncertainty, reduces costly construction changes, optimizes space planning, and gives homeowners complete confidence in their decisions.
            </p>
            <blockquote style={{ borderLeft: '4px solid var(--accent-orange)', paddingLeft: '1.5rem', margin: '1.5rem 0', fontStyle: 'italic', color: '#ffffff', fontWeight: 600, breakInside: 'avoid' }}>
              "One experience that continues to inspire her involved a young child joyfully exploring every room of his future home during a walkthrough, while his grandfather—who had waited decades to build his dream house—experienced the overwhelming happiness of seeing that dream come to life before construction had even begun."
            </blockquote>
            <p style={{ marginBottom: '1.5rem' }}>
              Moments like these reaffirm her belief that architecture is not merely about designing structures; it is about creating meaningful experiences, preserving emotions, and building memories that last a lifetime.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Looking ahead, Sanya envisions Walk The Plan becoming India's leading immersive architectural visualization platform, expanding across the country and redefining the way homeowners, architects, builders, developers, and interior designers plan, visualize, and experience construction. Her mission is to combine architecture, design innovation, immersive technology, and customer-centric thinking to build a future where every home is designed with greater confidence, precision, and clarity.
            </p>
            <p style={{ marginBottom: '1.5rem' }}>
              Driven by innovation, creativity, and a deep commitment to improving the home-building journey, Sanya continues to contribute towards making Walk The Plan a benchmark for excellence in the architecture and construction industry.
            </p>
            <p style={{ color: 'var(--accent-orange)', fontWeight: 700, fontSize: '1.15rem', breakInside: 'avoid', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              "Never stop dreaming. Never stop building."
            </p>
          </div>
        </div>
      </section>

      {/* 5. CAPABILITIES SECTION */}
      <section style={{ padding: '6rem 0' }}>
        <div style={containerStyles}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--accent-orange)', fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Our Capabilities</span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', fontFamily: 'var(--font-headings)', fontWeight: 800 }}>Core Technologies We Deploy</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem 2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'var(--accent-orange)', background: 'rgba(239, 199, 25,0.1)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Monitor size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>📐 Floor Projections</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                We convert your CAD file into high-intensity projection maps overlaying our studio floor at 1:1 scale. Walk bedroom outlines and test walkway flow using physical furniture pieces.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem 2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>🥽 Augmented Reality</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                Experience architectural models overlaid on real-world space in our studio. See door structures, wall partitions, and window sightlines float in front of you.
              </p>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2.5rem 2rem', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ color: 'var(--accent-orange)', background: 'rgba(239, 199, 25,0.1)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Eye size={28} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>🌐 Immersive Virtual Reality</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.7' }}>
                Step into a complete 3D environment mapping your home finishes. Change flooring tile materials, wall paints, and light fixtures dynamically during your session.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section style={{ padding: '4rem 0 8rem 0' }}>
        <div style={containerStyles}>
          <div className="glass-card" style={{
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '5rem 2rem',
            borderRadius: '24px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 100%)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <Sparkles size={48} color="var(--accent-orange)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)', fontWeight: 800 }}>Ready to Walk Your Future Home?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto 2.5rem auto', lineHeight: '1.7' }}>
              Send us your floor plan today. We will set up your projection experience inside our Gurugram studio in just 2 to 3 days.
            </p>
            <button
              onClick={() => navigate('/contact')}
              className="btn-primary"
              style={{
                padding: '1rem 2.5rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent-orange) 0%, #d1a60a 100%)',
                color: '#000000',
                boxShadow: '0 4px 14px rgba(239, 199, 25, 0.3)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              Book Your Session Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Embedded CSS for Profile Grid responsive overrides */}
      <style>{`
        .editorial-header-grid {
          grid-template-columns: 1.15fr 0.85fr;
        }
        @media (max-width: 992px) {
          .editorial-header-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            text-align: center;
          }
          .editorial-header-grid div {
            order: 2;
          }
          .editorial-header-grid .glass-card {
            order: 1;
            max-width: 320px;
            margin: 0 auto;
          }
          .editorial-header-grid .glass-card img {
            max-height: 380px;
            object-fit: cover;
            object-position: top center;
          }
          .editorial-body {
            column-count: 1 !important;
            column-gap: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .editorial-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .founder-name {
            font-size: 2.5rem !important;
          }
          .editorial-header-grid .glass-card {
            max-width: 260px;
            padding: 0.5rem !important;
          }
          .editorial-header-grid .glass-card img {
            max-height: 320px;
            border-radius: 12px !important;
          }
          .editorial-header-grid h3 {
            font-size: 1.4rem !important;
          }
        }
        @media (max-width: 480px) {
          .founder-name {
            font-size: 2rem !important;
          }
          .editorial-header-grid {
            gap: 1.5rem !important;
          }
          .editorial-header-grid .glass-card {
            max-width: 220px;
            padding: 0.4rem !important;
          }
          .editorial-header-grid .glass-card img {
            max-height: 260px;
            border-radius: 10px !important;
          }
          .editorial-header-grid h3 {
            font-size: 1.2rem !important;
          }
          .editorial-header-grid span[style*="1.25rem"] {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
