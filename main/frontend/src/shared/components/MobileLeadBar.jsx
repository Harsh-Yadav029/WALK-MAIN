import React from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Calendar, Sparkles } from 'lucide-react';
import { useSettings } from '@/shared/context/SettingsContext';

const MobileLeadBar = () => {
  return null;
};

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent("Hi Walk The Plan! I would like to check studio slot availability for 1:1 blueprint projection.");
    window.open(`https://wa.me/919711022075?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Mobile Sticky Bottom Bar (Visible on mobile/tablets <= 768px) */}
      <aside className="mobile-lead-bar" aria-label="Quick contact actions">
        <a
          href="tel:+919711022075"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-gold-subtle)',
            color: '#f8fafc',
            padding: '0.75rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <Phone size={15} color="var(--accent-orange)" /> Call
        </a>

        <button
          type="button"
          onClick={handleWhatsAppClick}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            background: 'rgba(37, 211, 102, 0.15)',
            border: '1px solid rgba(37, 211, 102, 0.4)',
            color: '#25D366',
            padding: '0.75rem 0.5rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <MessageCircle size={15} /> WhatsApp
        </button>

        <button
          type="button"
          onClick={() => onOpenModal()}
          className="btn-primary"
          style={{
            flex: 1.6,
            padding: '0.75rem 0.5rem',
            fontSize: '0.82rem',
            letterSpacing: '0.02em',
            gap: '0.35rem',
            borderRadius: '8px',
            justifyContent: 'center'
          }}
        >
          <Calendar size={14} /> Book Appointment
        </button>
      </aside>

      {/* Desktop Floating Action Badge (Visible on > 768px) */}
      <button
        type="button"
        className="floating-lead-btn"
        onClick={() => onOpenModal()}
        title="Book Your Appointment — 1:1 Scale Blueprint Projection"
      >
        <Sparkles size={16} /> Book Your Appointment
      </button>

      {/* Desktop Floating WhatsApp Bubble */}
      <button
        type="button"
        onClick={handleWhatsAppClick}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          zIndex: 990,
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: '#25D366',
          border: 'none',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#ffffff',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
        }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} />
      </button>
    </>
  );
};

export default MobileLeadBar;
