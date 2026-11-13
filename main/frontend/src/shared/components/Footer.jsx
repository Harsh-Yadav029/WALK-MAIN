import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Phone, MessageCircle } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useSettings } from '@/shared/context/SettingsContext';

const Footer = ({ onOpenBooking }) => {
  const { whatsappLink, whatsappNumber, openLeadModal } = useSettings();
  const triggerBooking = onOpenBooking || openLeadModal;

  const footerStyles = {
    backgroundColor: '#05070c',
    borderTop: '1px solid var(--border-gold-subtle)',
    padding: '4.5rem 0 2.5rem 0',
    position: 'relative',
    zIndex: 10,
    marginTop: 'auto',
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '2.5rem',
    marginBottom: '3rem',
  };

  const colStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  };

  const titleStyles = {
    fontFamily: 'var(--font-headings)',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: '#ffffff',
    position: 'relative',
    paddingBottom: '0.4rem',
    letterSpacing: '-0.01em'
  };

  const textStyles = {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: '1.65',
  };

  const linkStyles = {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    width: 'fit-content',
    transition: 'color 0.2s ease',
  };

  const bottomStyles = {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  return (
    <footer style={footerStyles} aria-label="Footer">
      <div className="container">
        <div style={gridStyles}>
          {/* Col 1: About Brand */}
          <div style={colStyles}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src={logo} alt="Walk The Plan Logo" style={{ height: '38px', width: 'auto', objectFit: 'contain' }} />
            </Link>
            <span className="calligraphy-motto" style={{ fontSize: '1.45rem', margin: '0.2rem 0 -0.4rem 0', display: 'block' }}>
              Where vision meets living scale
            </span>
            <p style={textStyles}>
              India's Premier 1:1 Scale Floor Plan Projection Studio. Step inside your blueprints at actual life-size, test real furniture, and eliminate costly redesigns before laying brick.
            </p>
            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => (triggerBooking ? triggerBooking() : null)}
                className="btn-primary"
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Sparkles size={14} /> Book Studio Walk
              </button>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div style={colStyles}>
            <h4 style={titleStyles}>Quick Links</h4>
            <Link to="/about" style={linkStyles} className="footer-link">About Walk The Plan</Link>
            <Link to="/services" style={linkStyles} className="footer-link">1:1 Projection Services</Link>
            <Link to="/franchise" style={linkStyles} className="footer-link">Studio Franchise Program</Link>
            <Link to="/gallery" style={linkStyles} className="footer-link">Live Studio Gallery</Link>
            <Link to="/blog" style={linkStyles} className="footer-link">Articles & Case Studies</Link>
          </div>

          {/* Col 3: Legal & Support */}
          <div style={colStyles}>
            <h4 style={titleStyles}>Legal & Policies</h4>
            <Link to="/terms" style={linkStyles} className="footer-link">Terms & Conditions</Link>
            <Link to="/privacy" style={linkStyles} className="footer-link">Privacy Policy</Link>
            <Link to="/refund" style={linkStyles} className="footer-link">Refund & Cancellation</Link>
            <Link to="/shipping" style={linkStyles} className="footer-link">Session Booking Policy</Link>
            <Link to="/careers" style={linkStyles} className="footer-link">Careers at Walk The Plan</Link>
          </div>

          {/* Col 4: Contact */}
          <div style={colStyles}>
            <h4 style={titleStyles}>Connect & Inquire</h4>
            <p style={textStyles}>
              <strong>Direct Phone:</strong> <a href={`tel:${whatsappNumber}`} style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{whatsappNumber}</a><br />
              <strong>Email Support:</strong> <a href="mailto:info@walktheplan.in" style={{ color: '#ffffff' }}>info@walktheplan.in</a><br />
              <strong>Hours:</strong> Mon - Sun (10:00 AM - 7:00 PM)
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#25D366',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <MessageCircle size={16} /> WhatsApp Concierge →
              </a>
            </div>
          </div>
        </div>

        {/* Walk into: Locations Grid */}
        <div style={{
          borderTop: '1px solid rgba(229, 184, 66, 0.12)',
          paddingTop: '2.5rem',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <h4 style={{ ...titleStyles, paddingBottom: 0, color: 'var(--accent-orange)' }}>Our Presence Across India:</h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.75rem'
          }}>
            <div>
              <h5 style={{ color: 'var(--accent-orange)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Gurugram HQ</h5>
              <p style={{ ...textStyles, fontSize: '0.85rem' }}>
                Building 328, Sector 19, Udyog Vihar Phase-4, Gurugram, Haryana 122015
              </p>
            </div>
            <div>
              <h5 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Dehradun</h5>
              <p style={{ ...textStyles, fontSize: '0.85rem' }}>
                Building no. 752, GMS Road, Gram Hari Pur Kanwali, Dehradun, Uttarakhand 248001
              </p>
            </div>
            <div>
              <h5 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Varanasi</h5>
              <p style={{ ...textStyles, fontSize: '0.85rem' }}>
                Bhairavi Windows, Sarkaripura Manduaddih, Varanasi, Uttar Pradesh 221103
              </p>
            </div>
            <div>
              <h5 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Hyderabad</h5>
              <p style={{ ...textStyles, fontSize: '0.85rem' }}>
                Krishnareddy Warehouses, Warehouse #2, Rallaguda Road, Shamshabad, Hyderabad, Telangana 501218
              </p>
            </div>
            <div>
              <h5 style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.35rem' }}>Madurai</h5>
              <p style={{ ...textStyles, fontSize: '0.85rem' }}>
                2-165, AMR Villa 59.T, Kodimangalam, New Natham Road, Thirumalpuram Post, Madurai, Tamil Nadu 625014
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div style={bottomStyles}>
          <p style={{ ...textStyles, fontSize: '0.82rem' }}>
            &copy; {new Date().getFullYear()} Walk The Plan. All rights reserved.
          </p>
          <p style={{ ...textStyles, fontSize: '0.85rem' }}>
            Digital Presence by :{' '}
            <a
              href="https://fitscalez.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent-orange)',
                fontWeight: 700,
                textDecoration: 'underline',
                letterSpacing: '0.03em',
                transition: 'all 0.2s'
              }}
              className="footer-link-highlight"
            >
              Fitscalez
            </a>
          </p>
        </div>
      </div>

      <style>{`
        .footer-link:hover {
          color: var(--accent-orange) !important;
        }
        .footer-link-highlight:hover {
          color: #ffffff !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
