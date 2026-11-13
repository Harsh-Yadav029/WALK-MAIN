import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, User, Send, CheckCircle } from 'lucide-react';

const Career = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'VR Unity Developer',
    portfolio: '',
    message: ''
  });

  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const jobs = [
    {
      title: 'VR Unity Developer',
      department: 'Technology',
      location: 'Gurugram Studio (On-site)',
      type: 'Full-time',
      description: 'Design and calibrate real-scale immersive architectural walk models. Map AutoCAD coordinates to interactive 3D assets in Unity/Unreal Engine.'
    },
    {
      title: 'Studio Host & Architect',
      department: 'Client Experience',
      location: 'Gurugram Studio (On-site)',
      type: 'Full-time',
      description: 'Host families and premium architects at our blackbox theatre. Explain spatial clearances, coordinate layouts, and document catch list revisions.'
    },
    {
      title: 'Business Development Specialist',
      department: 'Sales & Expansion',
      location: 'Delhi NCR (Hybrid)',
      type: 'Full-time',
      description: 'Drive tie-ups with premium architectural firms, luxury interior designers, and real estate developers. Accelerate B2B studio partnerships.'
    }
  ];

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
          message: `Job application for role: ${formData.position}. Portfolio/Resume Link: ${formData.portfolio}. Message: ${formData.message}`,
          type: 'career',
          device_id: localStorage.getItem('wtp_device_id') || '',
          visitor_id: localStorage.getItem('wtp_vid') || ''
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Application submission failed.');

      setStatus({
        loading: false,
        success: 'Your application has been received successfully! Our HR team will evaluate your portfolio and reach out.',
        error: null
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        position: 'VR Unity Developer',
        portfolio: '',
        message: ''
      });
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.message });
    }
  };

  return (
    <div className="careers-page container" style={{ padding: '4rem 0 8rem 0' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <span style={{ color: 'var(--accent-orange)', fontSize: '0.95rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shape the Future of Space</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
          Careers at Walk The Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem' }}>
          Join a multidisciplinary team combining architectural drawing systems, virtual reality engineering, and live scale staging.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'start' }}>
        
        {/* Jobs List Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Current Openings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {jobs.map((job, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>{job.title}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={14} /> {job.department}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14} /> {job.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14} /> {job.type}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Application Form Column */}
        <div className="glass-card" style={{ border: '1px solid var(--border-color)', boxShadow: '0 15px 35px rgba(0,0,0,0.5)' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Apply for a Position</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Submit your profile. We review all applications and portfolio links within 5 business days.
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
                placeholder="e.g. Rohan Malhotra" 
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
                  placeholder="rohan@example.com" 
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
                  placeholder="9811122233" 
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Role *</label>
              <select 
                name="position" 
                value={formData.position} 
                onChange={handleInputChange} 
                className="form-control"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              >
                <option value="VR Unity Developer">VR Unity Developer</option>
                <option value="Studio Host & Architect">Studio Host & Architect</option>
                <option value="Business Development Specialist">Business Development Specialist</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Resume / Portfolio Link (Google Drive / GitHub) *</label>
              <input 
                type="url" 
                name="portfolio" 
                value={formData.portfolio} 
                onChange={handleInputChange} 
                className="form-control" 
                placeholder="https://drive.google.com/your-resume-pdf" 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Why do you want to join Walk The Plan?</label>
              <textarea 
                name="message" 
                value={formData.message} 
                onChange={handleInputChange} 
                className="form-control" 
                style={{ minHeight: '80px' }}
                placeholder="Describe your background and spatial design or vr alignment."
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={status.loading}
            >
              {status.loading ? 'Submitting Application...' : 'Send Application →'}
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

    </div>
  );
};

export default Career;
