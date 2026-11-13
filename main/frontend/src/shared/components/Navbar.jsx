import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useSettings } from '@/shared/context/SettingsContext';

const Navbar = ({ onOpenBooking }) => {
  const { whatsappLink } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          setScrolled(prev => (prev !== isScrolled ? isScrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBookingClick = (e) => {
    e.preventDefault();
    if (onOpenBooking) {
      onOpenBooking();
    } else {
      navigate('/contact');
    }
    setIsOpen(false);
  };

  const navStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100,
    padding: scrolled ? '0.85rem 0' : '1.35rem 0',
    backgroundColor: scrolled ? 'rgba(7, 9, 14, 0.92)' : 'rgba(7, 9, 14, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: scrolled ? '1px solid rgba(250, 232, 164, 0.22)' : '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(250, 232, 164, 0.12)' : 'none',
    transition: 'var(--transition-smooth)',
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontFamily: 'var(--font-headings)',
    fontSize: '1.35rem',
    fontWeight: 800,
    color: '#ffffff',
    flexShrink: 0,
  };

  const linkStyles = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.92rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'color 0.2s ease',
  };

  return (
    <nav style={navStyles} aria-label="Main Navigation">
      <div className="container" style={containerStyles}>
        {/* Logo */}
        <Link to="/" style={logoStyles} aria-label="Walk The Plan Home">
          <img src={logo} alt="Walk The Plan - 1:1 Scale Blueprint Projection" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
        </Link>

        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/about" style={linkStyles} className="nav-link">About</Link>
          <Link to="/services" style={linkStyles} className="nav-link">Services</Link>
          <Link to="/franchise" style={linkStyles} className="nav-link">Franchise</Link>
          <Link to="/gallery" style={linkStyles} className="nav-link">Gallery</Link>
          <Link to="/blog" style={linkStyles} className="nav-link">Blog</Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            style={{
              ...linkStyles,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#25D366'
            }}
          >
            <MessageCircle size={15} /> WhatsApp
          </a>

          <button
            type="button"
            onClick={handleBookingClick}
            className="btn-primary"
            style={{
              padding: '0.65rem 1.4rem',
              fontSize: '0.85rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}
          >
            <Sparkles size={14} /> Book Your Appointment
          </button>
        </div>

        {/* Mobile & Tablet Action Group (Book Your Appointment Button + Hamburger Menu) */}
        <div className="mobile-action-group" style={{ display: 'none', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleBookingClick}
            className="mobile-nav-book-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, #fae8a4 0%, #f0cd6f 50%, #d4a528 100%)',
              color: '#120e03',
              padding: '0.45rem 1rem',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '0.76rem',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 15px rgba(240, 205, 111, 0.4)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            title="Book Your Appointment"
          >
            <Sparkles size={14} />
            <span className="mobile-nav-book-text">Book Your Appointment</span>
          </button>

          {/* Mobile Hamburger Toggle */}
          <div className="mobile-toggle" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {isOpen ? (
              <X size={26} color="var(--accent-orange)" onClick={() => setIsOpen(false)} aria-label="Close Menu" />
            ) : (
              <Menu size={26} color="#ffffff" onClick={() => setIsOpen(true)} aria-label="Open Menu" />
            )}
          </div>
        </div>
      </div>

      {/* CSS injection for responsive navbar */}
      <style>{`
        @media (min-width: 992px) {
          .desktop-menu { display: flex !important; }
          .mobile-action-group { display: none !important; }
        }
        @media (max-width: 991px) {
          .desktop-menu { display: none !important; }
          .mobile-action-group { display: flex !important; }
        }
        @media (max-width: 440px) {
          .mobile-nav-book-btn {
            padding: 0.38rem 0.65rem !important;
            font-size: 0.68rem !important;
            gap: 0.3rem !important;
          }
        }
        @media (max-width: 360px) {
          .mobile-nav-book-btn {
            font-size: 0.64rem !important;
            padding: 0.35rem 0.5rem !important;
          }
        }
        .mobile-nav-book-btn:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.55) !important;
        }
        .mobile-nav-book-btn:active {
          transform: scale(0.98);
        }
        .nav-link:hover {
          color: var(--accent-orange) !important;
        }
        .mobile-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          background: rgba(7, 9, 14, 0.98);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          z-index: 99;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 1.25rem;
          transition: var(--transition-smooth);
          padding: 5.5rem 1.5rem 2rem 1.5rem;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="mobile-drawer">
          {/* Close button inside drawer */}
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ 
              position: 'absolute', 
              top: '1.25rem', 
              right: '1.25rem', 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#ffffff', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close Menu"
          >
            <X size={24} />
          </button>

          <Link to="/" style={{ ...logoStyles, marginBottom: '1rem' }} onClick={() => setIsOpen(false)}>
            <img src={logo} alt="Walk The Plan Logo" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
          </Link>
          <Link to="/about" style={{ ...linkStyles, fontSize: '1.15rem' }} className="nav-link" onClick={() => setIsOpen(false)}>About Us</Link>
          <Link to="/services" style={{ ...linkStyles, fontSize: '1.15rem' }} className="nav-link" onClick={() => setIsOpen(false)}>Our Services</Link>
          <Link to="/franchise" style={{ ...linkStyles, fontSize: '1.15rem' }} className="nav-link" onClick={() => setIsOpen(false)}>Franchise Model</Link>
          <Link to="/gallery" style={{ ...linkStyles, fontSize: '1.15rem' }} className="nav-link" onClick={() => setIsOpen(false)}>Studio Gallery</Link>
          <Link to="/blog" style={{ ...linkStyles, fontSize: '1.15rem' }} className="nav-link" onClick={() => setIsOpen(false)}>Articles & Case Studies</Link>

          <div style={{ width: '100%', maxWidth: '320px', borderTop: '1px solid var(--border-gold-subtle)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                borderRadius: '8px',
                background: '#25D366',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              <MessageCircle size={18} /> WhatsApp Concierge
            </a>

            <button
              type="button"
              onClick={handleBookingClick}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={16} /> Book Your Appointment
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
