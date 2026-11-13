import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Loader, Share2, MessageCircle, Clock, CheckCircle, MapPin } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/${slug}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Article not found.');
        throw new Error('Could not load blog post.');
      }
      const data = await response.json();
      setBlog(data);

      // Fetch related blogs for internal linking & engagement
      const allRes = await fetch('/api/blogs');
      if (allRes.ok) {
        const allData = await allRes.json();
        setRelatedBlogs(allData.filter(b => b.slug !== slug).slice(0, 3));
      }

      // Update SEO Head Tags dynamically
      updateSeoTags(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSeoTags = (post) => {
    // 1. Title
    document.title = `${post.title} | Walk The Plan`;

    // Helper to set or create meta tag
    const setMeta = (attr, key, val) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    // 2. Meta Description & Keywords
    setMeta('name', 'description', post.excerpt || `${post.title} - Architectural and floor plan insights from Walk The Plan.`);
    setMeta('name', 'keywords', `${post.category}, floor plan mistakes, 1:1 scale projection, Walk The Plan, architecture India, Gurugram studio`);
    setMeta('name', 'author', post.author || 'Walk The Plan');

    // 3. Open Graph
    setMeta('property', 'og:title', `${post.title} | Walk The Plan`);
    setMeta('property', 'og:description', post.excerpt);
    setMeta('property', 'og:image', post.cover_image?.startsWith('http') ? post.cover_image : `https://walktheplan.in${post.cover_image}`);
    setMeta('property', 'og:url', `https://walktheplan.in/blog/${post.slug}`);
    setMeta('property', 'og:type', 'article');
    setMeta('property', 'og:site_name', 'Walk The Plan');

    // 4. Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', post.title);
    setMeta('name', 'twitter:description', post.excerpt);
    setMeta('name', 'twitter:image', post.cover_image?.startsWith('http') ? post.cover_image : `https://walktheplan.in${post.cover_image}`);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://walktheplan.in/blog/${post.slug}`);

    // 6. Schema.org JSON-LD Structured Data
    let schemaScript = document.getElementById('blog-post-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'blog-post-schema';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `https://walktheplan.in/blog/${post.slug}#article`,
          "headline": post.title,
          "description": post.excerpt,
          "image": post.cover_image?.startsWith('http') ? post.cover_image : `https://walktheplan.in${post.cover_image}`,
          "datePublished": post.created_at,
          "dateModified": post.created_at,
          "author": {
            "@type": "Person",
            "name": post.author || "Parth Khanna",
            "jobTitle": "Spatial Design Specialist",
            "affiliation": {
              "@type": "Organization",
              "name": "Walk The Plan"
            }
          },
          "publisher": {
            "@type": "Organization",
            "name": "Walk The Plan",
            "url": "https://walktheplan.in",
            "logo": {
              "@type": "ImageObject",
              "url": "https://walktheplan.in/assets/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://walktheplan.in/blog/${post.slug}`
          }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://walktheplan.in/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Blog",
              "item": "https://walktheplan.in/blog"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": post.title,
              "item": `https://walktheplan.in/blog/${post.slug}`
            }
          ]
        }
      ]
    };
    schemaScript.textContent = JSON.stringify(schemaData);
  };

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
    if (!content) return '5 min read';
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return `${minutes} min read`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center' }}>
        <Loader className="animated-float" size={32} color="var(--accent-orange)" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#ffffff' }}>{error || 'Post Not Found'}</h2>
        <Link to="/blog" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="blog-post-detail container" style={{ padding: '2rem 0 8rem 0', maxWidth: '880px' }}>
      
      {/* Breadcrumb Navigation for SEO */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <Link to="/blog" style={{ color: 'var(--text-muted)' }}>Blog</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <span style={{ color: 'var(--accent-orange)' }}>{blog.category}</span>
      </nav>

      {/* Back button */}
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }} className="back-link">
        <ArrowLeft size={16} /> Back to All Articles
      </Link>

      {/* Header Info */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-block', background: 'rgba(245, 151, 20, 0.15)', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {blog.category}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            <Clock size={13} /> {calculateReadTime(blog.content)}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.85rem)', lineHeight: '1.25', marginBottom: '1.25rem', color: '#ffffff', fontWeight: 800, letterSpacing: '-0.02em' }}>
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            {blog.excerpt}
          </p>
        )}
        
        {/* Meta details & Share strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Calendar size={14} color="var(--accent-orange)" /> {formatDate(blog.created_at)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} color="var(--accent-orange)" /> By {blog.author}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Share:</span>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' - ' + window.location.href)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#25D366', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
            <button 
              onClick={handleCopyLink} 
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <Share2 size={13} /> {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </header>

      {/* Full-width Cover Image with Scale Indicator */}
      <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#070a12', marginBottom: '3rem', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <img 
          src={blog.cover_image} 
          alt={blog.title} 
          style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '480px', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(7, 11, 20, 0.85)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={12} color="var(--accent-orange)" /> 1:1 Scale True Floor Plan Projection Insight
        </div>
      </div>

      {/* Body Content */}
      <div 
        className="blog-body" 
        dangerouslySetInnerHTML={{ __html: blog.content }} 
        style={{ fontSize: '1.12rem', color: '#cbd5e1', lineHeight: '1.85' }}
      />

      {/* High-Conversion In-Article CTA Banner */}
      <div style={{ marginTop: '4rem', padding: '2.5rem', background: 'radial-gradient(circle at 90% 10%, rgba(245, 151, 20, 0.15), transparent 60%), linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(7, 11, 20, 0.98))', borderRadius: '16px', border: '1px solid var(--accent-orange)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-orange)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Avoid Costly Construction Rework
        </span>
        <h3 style={{ fontSize: '1.8rem', color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
          Walk Your Blueprint at 100% True Scale Before Building
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 1.75rem', fontSize: '1rem', lineHeight: '1.6' }}>
          Bring your 2D AutoCAD or PDF plan to Walk The Plan's projection studios in Gurugram, Dehradun, Varanasi, Hyderabad, or Madurai. Physically walk every room with your family and architect.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/services" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem', fontWeight: 700, borderRadius: '8px' }}>
            Book Studio Walkthrough →
          </Link>
          <a 
            href="https://wa.me/919711022075?text=Hi%20Walk%20The%20Plan!%20I%20would%20like%20to%20book%20a%201:1%20scale%20walkthrough%20session%20for%20my%20floor%20plan." 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.75rem', fontWeight: 600, borderRadius: '8px', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', color: '#25D366', textDecoration: 'none' }}
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* Author Bio Box */}
      <div style={{ marginTop: '3.5rem', padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-muted)', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-orange), #ff4d00)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#000000', flexShrink: 0 }}>
          {blog.author ? blog.author.charAt(0) : 'W'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Written by {blog.author}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>Walk The Plan • Spatial Engineering & Architecture Lead</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
            Helping homeowners, architects, and luxury builders eliminate construction regrets by providing real-world 1:1 scale true architectural projection across India.
          </p>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedBlogs.length > 0 && (
        <section style={{ marginTop: '5rem', borderTop: '1px solid var(--border-muted)', paddingTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Continue Reading</span>
              <h3 style={{ fontSize: '1.6rem', color: '#ffffff', margin: '0.25rem 0 0' }}>Related Architectural Insights</h3>
            </div>
            <Link to="/blog" style={{ color: 'var(--accent-orange)', fontSize: '0.9rem', fontWeight: 600 }}>
              View All Articles →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem' }}>
            {relatedBlogs.map((rel) => (
              <div 
                key={rel.id} 
                className="glass-card" 
                style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '10px' }}
              >
                <div style={{ height: '140px', overflow: 'hidden', background: '#070a12' }}>
                  <img src={rel.cover_image} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--accent-orange)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {rel.category}
                  </span>
                  <h4 style={{ fontSize: '1.05rem', color: '#ffffff', lineHeight: '1.4', marginBottom: '0.75rem' }}>
                    <Link to={`/blog/${rel.slug}`} style={{ color: 'inherit' }} className="blog-title-link">
                      {rel.title}
                    </Link>
                  </h4>
                  <Link to={`/blog/${rel.slug}`} style={{ marginTop: 'auto', color: 'var(--accent-orange)', fontSize: '0.82rem', fontWeight: 600 }}>
                    Read Guide →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Styles for Blog Detail Content */}
      <style>{`
        .blog-body h2 {
          font-size: 1.75rem;
          color: #ffffff;
          margin-top: 3rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.5rem;
        }
        .blog-body h3 {
          font-size: 1.35rem;
          color: #f8fafc;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .blog-body h4 {
          font-size: 1.15rem;
          color: #ffffff;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .blog-body p {
          margin-bottom: 1.5rem;
        }
        .blog-body ul, .blog-body ol {
          margin-bottom: 1.75rem;
          padding-left: 1.75rem;
        }
        .blog-body li {
          margin-bottom: 0.6rem;
          line-height: 1.7;
        }
        .blog-body strong {
          color: #ffffff;
          font-weight: 600;
        }
        .back-link:hover {
          color: var(--accent-orange) !important;
        }
        .blog-title-link:hover {
          color: var(--accent-orange) !important;
        }
      `}</style>

    </article>
  );
};

export default BlogPost;
