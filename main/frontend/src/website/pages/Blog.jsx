import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader, Calendar, User, Clock, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Architectural Insights, 1:1 Scale Projections & Floor Plan Guides | Walk The Plan";

    // Set Meta Tags
    const setMeta = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    setMeta('name', 'description', 'Explore architectural guides, floor plan mistake checklists, and construction cost-saving insights from Walk The Plan — India\'s pioneer in 1:1 scale true architectural projection.');
    setMeta('name', 'keywords', 'floor plan mistakes, 1:1 scale projection, architectural walkthrough, house plan layout, Vastu floor plan, construction cost savings India');
    setMeta('property', 'og:title', 'Architectural Insights & Floor Plan Guides | Walk The Plan');
    setMeta('property', 'og:description', 'Explore guides on eliminating costly floor plan errors before construction with true 1:1 physical scale projection.');
    setMeta('property', 'og:image', 'https://walktheplan.in/uploads/blog_cover_1.jpg');
    setMeta('property', 'og:url', 'https://walktheplan.in/blog');

    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories list
  const categories = ['All', ...new Set(blogs.map(b => b.category))];

  // Filtering blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    let iso = typeof dateStr === 'string' ? dateStr.trim() : dateStr;
    if (typeof iso === 'string' && iso.length > 0) {
      if (!iso.endsWith('Z')) {
        iso = iso.replace(' ', 'T');
        const timePart = iso.includes('T') ? iso.split('T')[1] : '';
        const hasOffset = timePart.includes('+') || timePart.includes('-') || timePart.endsWith('Z');
        if (!hasOffset) iso += 'Z';
      }
    }
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const calculateReadTime = (content) => {
    if (!content) return '6 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  // Featured post is the first article (10 Costly Floor Plan Mistakes)
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;

  return (
    <div className="blog-page container" style={{ padding: '4rem 0 8rem 0' }}>
      
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span style={{ color: 'var(--accent-orange)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
          ARCHITECTURAL INSIGHTS &amp; SPATIAL KNOWLEDGE
        </span>
        <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.5rem)', marginTop: '0.5rem', marginBottom: '1rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>
          The Build-Smart Blog
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
          Expert guides, spatial checklists, and technology breakdowns to help homeowners and architects build without regrets or expensive construction rework.
        </p>
      </div>

      {/* Featured Blog Hero Card (Shown when not filtering or searching) */}
      {!loading && featuredBlog && selectedCategory === 'All' && !searchQuery && (
        <div style={{ marginBottom: '4rem', background: 'radial-gradient(circle at 90% 10%, rgba(245, 151, 20, 0.12), transparent 70%), linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(7, 11, 20, 0.98))', borderRadius: '16px', border: '1px solid var(--accent-orange)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <div style={{ height: '100%', minHeight: '300px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src={featuredBlog.cover_image} 
              alt={featuredBlog.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <span style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--accent-orange)', color: '#000000', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '4px', textTransform: 'uppercase' }}>
              🔥 FEATURED GUIDE
            </span>
          </div>

          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>{featuredBlog.category}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {calculateReadTime(featuredBlog.content)}</span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: '#ffffff', lineHeight: '1.3', fontWeight: 800 }}>
              <Link to={`/blog/${featuredBlog.slug}`} style={{ color: 'inherit' }} className="blog-title-link">
                {featuredBlog.title}
              </Link>
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {featuredBlog.excerpt}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>By {featuredBlog.author}</span>
              <Link to={`/blog/${featuredBlog.slug}`} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', fontSize: '0.9rem', borderRadius: '6px' }}>
                Read Full Guide <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search & Categories Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '3.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <input 
            type="text" 
            placeholder="Search articles by topic or keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.5rem', background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-muted)', color: '#ffffff' }}
          />
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Category list bubbles */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--accent-orange)' : 'rgba(255,255,255,0.03)',
                color: selectedCategory === cat ? '#000000' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedCategory === cat ? 'var(--accent-orange)' : 'var(--border-muted)',
                padding: '0.4rem 1.1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader className="animated-float" size={32} color="var(--accent-orange)" />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No articles match your search criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {filteredBlogs.map((blog) => (
            <article 
              key={blog.id} 
              className="glass-card" 
              style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '12px', transition: 'transform 0.3s ease, border-color 0.3s ease' }}
            >
              {/* Cover Image */}
              <div style={{ height: '210px', overflow: 'hidden', background: '#070a12', position: 'relative' }}>
                <img 
                  src={blog.cover_image} 
                  alt={blog.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(7, 11, 20, 0.9)', border: '1px solid var(--border-color)', color: 'var(--accent-orange)', padding: '0.2rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase' }}>
                  {blog.category}
                </span>
              </div>

              {/* Text Area */}
              <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                
                {/* Meta details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} color="var(--accent-orange)" /> {formatDate(blog.created_at)}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {calculateReadTime(blog.content)}</span>
                </div>

                <h2 style={{ fontSize: '1.25rem', color: '#ffffff', lineHeight: '1.35', fontWeight: 700 }}>
                  <Link to={`/blog/${blog.slug}`} style={{ color: 'inherit' }} className="blog-title-link">
                    {blog.title}
                  </Link>
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {blog.excerpt}
                </p>

                {/* Footer Strip */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>By {blog.author}</span>
                  <Link to={`/blog/${blog.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-orange)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Read Guide →
                  </Link>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}

      {/* Bottom Conversion Strip */}
      <div style={{ marginTop: '6rem', padding: '3rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-muted)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginBottom: '0.75rem' }}>
          Have an Architectural Blueprint or Floor Plan Ready?
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.75rem', fontSize: '1rem', lineHeight: '1.6' }}>
          Test drive your layout at full 1:1 true scale before starting construction. Walk through bedrooms, kitchen, and living areas with 100% spatial certainty.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/services" className="btn-primary" style={{ padding: '0.8rem 1.75rem', fontWeight: 700, borderRadius: '8px' }}>
            Book Studio Walkthrough
          </Link>
          <a 
            href="https://wa.me/919711022075?text=Hi%20Walk%20The%20Plan!%20I%20want%20to%20know%20more%20about%20your%201:1%20scale%20floor%20plan%20projection%20sessions."
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none', fontWeight: 600 }}
          >
            <MessageCircle size={18} /> Chat on WhatsApp (+91 97110 22075)
          </a>
        </div>
      </div>

      <style>{`
        .blog-title-link:hover {
          color: var(--accent-orange) !important;
        }
      `}</style>

    </div>
  );
};

export default Blog;
