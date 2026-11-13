import React, { useState, useEffect } from 'react';
import { Play, Maximize, X, Loader } from 'lucide-react';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, item: null });

  useEffect(() => {
    document.title = "Live Blueprint Projection Studio Gallery | Walk The Plan";
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) throw new Error('Failed to load gallery.');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const defaultCategories = ['Architect', 'Builders', 'Enduser'];
  const extraCategories = [...new Set(items.map(item => item.category))]
    .filter(cat => cat && !defaultCategories.includes(cat));
  const categories = ['All', ...defaultCategories, ...extraCategories];

  const filteredItems = filter === 'All'
    ? items
    : items.filter(item => item.category === filter);

  return (
    <div className="gallery-page container" style={{ padding: '4rem 0 8rem 0' }}>

      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="calligraphy-kicker">Walkthrough Demos</span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.5rem)', marginTop: '0.5rem', marginBottom: '1rem', fontFamily: 'var(--font-headings)' }}>
          Studio Walk <span className="calligraphy-accent">Gallery</span>
        </h1>
      </div>

      {/* Categories Filter Tabs */}
      <div className="tabs-header" style={{ marginBottom: '3rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader className="animated-float" size={32} color="var(--accent-orange)" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          No gallery items found in this category.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-card"
              style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
              onClick={() => setLightbox({ open: true, item })}
            >
              {/* Media Preview Box */}
              <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#070a12' }}>
                {item.type === 'video' ? (
                  <>
                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                    <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-orange)', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(239, 199, 25,0.5)' }}>
                        <Play size={20} fill="#000000" />
                      </div>
                    </div>
                  </>
                ) : (
                  <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="gallery-img" />
                )}

                {/* Category Badge */}
                <span style={{ position: 'absolute', top: '15px', left: '15px', background: 'rgba(11,26,46,0.85)', border: '1px solid var(--border-color)', color: 'var(--accent-orange)', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px' }}>
                  {item.category}
                </span>

                {/* Hover Maximize Overlay */}
                <div className="hover-overlay" style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(239, 199, 25,0.05)', opacity: 0, display: 'flex', alignItems: 'flex-end', padding: '1.5rem', transition: 'var(--transition-fast)' }}>
                  <Maximize size={18} color="#ffffff" />
                </div>
              </div>

              {/* Text Info */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightbox.open && lightbox.item && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

          {/* Close button */}
          <button
            onClick={() => setLightbox({ open: false, item: null })}
            style={{ position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            <X size={32} />
          </button>

          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Visual Container */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000000', maxHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {lightbox.item.type === 'video' ? (
                <video src={lightbox.item.url} controls autoPlay style={{ width: '100%', maxHeight: '70vh' }} />
              ) : (
                <img src={lightbox.item.url} alt={lightbox.item.title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
              )}
            </div>

            {/* Description Text */}
            <div style={{ padding: '0 1rem' }}>
              <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 600 }}>{lightbox.item.category}</span>
              <h2 style={{ fontSize: '1.6rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>{lightbox.item.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{lightbox.item.description}</p>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .gallery-card:hover .gallery-img {
          transform: scale(1.05);
        }
        .gallery-card:hover .hover-overlay {
          opacity: 1 !important;
        }
      `}</style>

    </div>
  );
};

export default Gallery;
