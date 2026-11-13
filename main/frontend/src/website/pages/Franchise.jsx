import React, { useState, useEffect, useRef } from 'react';
import { Building, Wallet, Award, Settings, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Franchise = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [activeModel, setActiveModel] = useState('FOFO');

  const fallbackModels = {
    FOFO: {
      title: "FOFO (Franchisee Owned Franchisee Operated)",
      charges: "₹15 Lakhs One-Time Franchise Fee + 8% Royalty on Sales",
      tc: [
        "Franchisee is responsible for complete setup cost and daily operations.",
        "Must arrange 1,800 to 3,000 sq ft space with 14-foot ceiling height.",
        "Staff training and marketing guidelines provided by Walk The Plan.",
        "Initial hardware purchase must be made through approved vendors."
      ]
    },
    FOCO: {
      title: "FOCO (Franchisee Owned Company Operated)",
      charges: "₹25 Lakhs Initial Capital + 50/50 Revenue Split on Profit Margins",
      tc: [
        "Franchisee owns the physical property/assets, Company operates the daily staff and bookings.",
        "Monthly reporting and audits managed by Walk The Plan corporate team.",
        "Company covers operational software updates and hardware maintenance support.",
        "Minimum lock-in period of 3 years applies."
      ]
    },
    COLLABORATION: {
      title: "Strategic Collaboration Model",
      charges: "Custom Profit Share Model based on Location & Contribution",
      tc: [
        "Available for established design hubs, architecture colleges, or builder networks.",
        "Shared setup infrastructure costs and customized hardware arrays.",
        "Co-branded marketing campaigns and event calendar support.",
        "Subject to approval by the Walk The Plan board."
      ]
    }
  };

  const [modelsData, setModelsData] = useState(fallbackModels);

  useEffect(() => {
    document.title = "Studio Franchise Opportunities | Walk The Plan India";
    const fetchFranchiseModels = async () => {
      try {
        const res = await fetch('/api/franchise-models');
        if (res.ok) {
          const data = await res.json();
          const mapped = {};
          data.forEach(item => {
            mapped[item.model_key] = {
              id: item.id,
              model_key: item.model_key,
              title: item.title,
              charges: item.charges,
              tc: item.tc
            };
          });
          if (Object.keys(mapped).length > 0) {
            setModelsData(mapped);
          }
        }
      } catch (err) {
        console.error("Error loading franchise models:", err);
      }
    };
    fetchFranchiseModels();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    investment: '30-50 Lac',
    experience: '',
    message: ''
  });

  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Franchise application for City: ${formData.city}. Investment range: ${formData.investment}. Experience: ${formData.experience}. Message: ${formData.message}`,
          type: 'franchise',
          device_id: localStorage.getItem('wtp_device_id') || '',
          visitor_id: localStorage.getItem('wtp_vid') || ''
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong.');

      setStatus({
        loading: false,
        success: 'Thank you for your interest! Our Franchise Development Director will call you within 2 business days.',
        error: null
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        investment: '10-20 Lakhs',
        experience: '',
        message: ''
      });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Initialize Leaflet map centered on India to fit all locations
    const map = L.map(mapContainerRef.current, {
      center: [20.5937, 78.9629],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    const locations = [
      {
        name: 'Delhi NCR Gurgaon Headquarters',
        company: 'Walk The Plan',
        coords: [28.4907, 77.0805],
        type: 'Headquarter',
        address: 'building 328, Sector 19, Udyog Vihar, Phase-4, Gurugram, Haryana 122015',
        phone: '+91 97110 22075',
        isHQ: true
      },
      {
        name: 'Dehradun Studio',
        company: 'Walk The Plan',
        coords: [30.3165, 78.0322],
        type: 'Franchise',
        address: 'Building no. 752, GMS Road, Gram Hari Pur Kanwali, Dehradun Uttarakhand 248001',
        phone: '+91 97110 22075',
        isHQ: false
      },
      {
        name: 'Varanasi Studio',
        company: 'Walk The Plan',
        coords: [25.3176, 82.9739],
        type: 'Franchise',
        address: 'Bhairavi Windows, Sarkaripura Manduaddih, Varanasi, Uttar Pradesh 221103',
        phone: '+91 97110 22075',
        isHQ: false
      },
      {
        name: 'Hyderabad Studio',
        company: 'Walk The Plan',
        coords: [17.3850, 78.4867],
        type: 'Franchise',
        address: 'Krishnareddy warehouses, Ware house no 2, Rallaguda Road Shamshabad, Hyderabad, Telangana 501218',
        phone: '+91 97110 22075',
        isHQ: false
      },
      {
        name: 'Madurai Studio',
        company: 'Walk The Plan',
        coords: [9.9252, 78.1198],
        type: 'Franchise',
        address: '2-165, AMR VILLA 59.T. Kodimangalam, New Natham Road, Thirumalpuram Post, Madurai - 625014',
        phone: '+91 97110 22075',
        isHQ: false
      }
    ];

    locations.forEach(loc => {
      const pulseColor = loc.isHQ ? 'var(--accent-orange)' : '#3b82f6';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div style="
              position: absolute; 
              width: 12px; 
              height: 12px; 
              background-color: ${pulseColor}; 
              border: 2px solid #ffffff; 
              border-radius: 50%; 
              top: 6px; 
              left: 6px; 
              z-index: 10;
              box-shadow: 0 0 8px rgba(0,0,0,0.5);
            "></div>
            <div class="pulse-ring" style="
              position: absolute; 
              width: 24px; 
              height: 24px; 
              border-radius: 50%; 
              background-color: ${pulseColor}; 
              opacity: 0.4; 
              animation: pulse 1.8s infinite ease-in-out;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const popupContent = `
        <div style="
          color: #ffffff; 
          font-family: inherit; 
          min-width: 220px; 
          background: #0f1322; 
          padding: 0.5rem;
          border-radius: 4px;
        ">
          <span style="
            background: ${loc.isHQ ? 'rgba(239, 199, 25,0.15)' : 'rgba(59,130,246,0.15)'}; 
            color: ${loc.isHQ ? 'var(--accent-orange)' : '#3b82f6'}; 
            font-size: 0.75rem; 
            font-weight: 600; 
            padding: 0.2rem 0.5rem; 
            border-radius: 4px; 
            display: inline-block; 
            margin-bottom: 0.5rem;
            text-transform: uppercase;
          ">
            ${loc.type}
          </span>
          <h4 style="margin: 0 0 0.25rem 0; font-size: 1rem; color: #ffffff;">${loc.name}</h4>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
            ${loc.address}
          </p>
          <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem; font-size: 0.75rem; color: var(--text-secondary);">
            <strong>Phone:</strong> ${loc.phone}
          </div>
        </div>
      `;

      L.marker(loc.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-leaflet-popup'
        });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="franchise-page container" style={{ padding: '4rem 0 8rem 0' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span className="calligraphy-kicker">Partner With India's #1 Brand</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', marginTop: '0.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-headings)' }}>
          Franchise <span className="calligraphy-accent">Opportunities</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.75 }}>
          Bring the home test-drive revolution to your city. Open a fully-equipped Walk The Plan projection studio and tap into a high-demand tech niche.
        </p>
      </div>

      {/* Grid Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 199, 25,0.1)', color: 'var(--accent-orange)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>High ROI & Quick Payback</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Low operational cost structure and high margins per walkthrough session. Recoup your startup capital within 10 to 14 months of studio launch.
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Full Turnkey Support</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            We provide hardware calibration, custom vector mapping tools, projection arrays layout, host training, and customer bookings software.
          </p>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 199, 25,0.1)', color: 'var(--accent-orange)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Exclusive Territory Rights</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Secure exclusive geographic protection rights. Ensure you are the sole provider of Walk The Plan projections in your district.
          </p>
        </div>
      </div>

      {/* India Presence Map Section */}
      <div className="scroll-reveal" style={{ textAlign: 'center', marginBottom: '6rem' }}>
        <span style={{ color: 'var(--accent-orange)', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>National Footprint</span>
        <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>Our Growing Presence Across India</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto 3rem auto', fontSize: '1rem', lineHeight: '1.8' }}>
          From a pioneering concept to a rapidly expanding national network, Walk The Plan is bringing India's first life-sized architectural floor plan experience to cities across the country, empowering homeowners, architects, and developers to experience spaces before they are built.
        </p>

        <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto', padding: '0.75rem', border: '1px solid var(--border-color)', background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', overflow: 'hidden' }}>
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '500px',
              borderRadius: '8px',
              background: '#070a12',
              zIndex: 1
            }}
          />
        </div>
      </div>

      {/* Main Split Info + Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'start' }}>

        {/* Info Column with Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>Studio Franchise Model</h2>

            {/* Tabs Buttons */}
            <div
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                marginBottom: '2rem',
                borderBottom: '1px solid var(--border-muted)',
                paddingBottom: '1rem'
              }}
            >
              {['FOFO', 'FOCO', 'COLLABORATION'].map((model) => {
                const isActive = activeModel === model;
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => setActiveModel(model)}
                    style={{
                      flex: '1 0 auto',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      background: isActive ? 'var(--accent-orange)' : 'rgba(255,255,255,0.02)',
                      color: isActive ? '#000000' : '#ffffff',
                      border: isActive ? 'none' : '1px solid var(--border-muted)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}
                  >
                    {model}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="glass-card" style={{ border: '1px solid rgba(239, 199, 25,0.2)', padding: '2rem', borderRadius: '12px', background: 'rgba(239, 199, 25, 0.02)' }}>
              <h3 style={{ fontSize: '1.35rem', color: 'var(--accent-orange)', marginBottom: '1rem', fontWeight: 800 }}>
                {modelsData[activeModel].title}
              </h3>

              <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Charges & Fees:</span>
                <p style={{ fontSize: '1.15rem', color: '#ffffff', fontWeight: 700, marginTop: '0.25rem' }}>
                  {modelsData[activeModel].charges}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem' }}>Terms & Conditions (T&C):</span>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', paddingLeft: 0 }}>
                  {modelsData[activeModel].tc.map((rule, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={16} color="var(--accent-orange)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Application Form Column */}
        <div className="glass-card" style={{ border: '1px solid var(--border-color)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Franchise Inquiry</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Submit details below. Our franchise team will verify location availability and contact you.
          </p>

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Vikram Goel"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="goel@example.com"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="9888877777"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Targeted City / State *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. Mumbai, Maharashtra"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Investment Budget *</label>
                <select
                  name="investment"
                  value={formData.investment}
                  onChange={handleInputChange}
                  className="form-control"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <option value="30-50 Lac">30-50 Lac</option>
                  <option value="50-70 Lac">50-70 Lac</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Professional Background / Retail Experience *</label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Real estate broker, retail franchisee owner, architect"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Message & Locations proposed</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="form-control"
                style={{ minHeight: '80px' }}
                placeholder="Share any additional details about proposed locations or startup timeline."
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={status.loading}
            >
              {status.loading ? 'Submitting Application...' : 'Submit Franchise Proposal →'}
            </button>

            {status.success && (
              <div style={{ padding: '0.85rem', background: 'rgba(37,211,102,0.1)', border: '1px solid #25D366', borderRadius: '6px', color: '#25D366', fontSize: '0.85rem', textAlign: 'center' }}>
                {status.success}
              </div>
            )}

            {status.error && (
              <div style={{ padding: '0.85rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                {status.error}
              </div>
            )}
          </form>

        </div>

      </div>

      <style>{`
        /* Custom styling for Leaflet popups */
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #0f1322 !important;
          color: var(--text-primary) !important;
          border: 1px solid var(--border-color) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
          padding: 0 !important;
        }

        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
          padding: 0.75rem !important;
        }

        .custom-leaflet-popup .leaflet-popup-tip {
          background: #0f1322 !important;
          border-left: 1px solid var(--border-color) !important;
          border-bottom: 1px solid var(--border-color) !important;
          box-shadow: none !important;
        }

        .custom-leaflet-popup .leaflet-popup-close-button {
          display: none !important;
        }

        /* Pulsing map pin animation */
        @keyframes pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
};

export default Franchise;
