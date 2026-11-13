import React, { useState, useEffect } from 'react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  } catch {
    return iso;
  }
}

function getInquiryLabel(lead) {
  if (lead.package_name) return lead.package_name;
  if (lead.type === 'mail-inquiry') return 'Connect Inquiry';
  if (lead.type === 'booking') return 'Studio Booking';
  return 'Inquiry';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublicLeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [enabled, setEnabled] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let interval;
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/public/leads');
        const data = await res.json();
        if (data.enabled) {
          setEnabled(true);
          setLeads(data.leads || []);
          setError('');
        } else {
          setEnabled(false);
          setLeads([]);
        }
      } catch {
        setError('Unable to connect to server.');
        setEnabled(false);
      }
    };
    fetchLeads();
    interval = setInterval(fetchLeads, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filtered = leads.filter(l => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.name || '').toLowerCase().includes(q) ||
      (l.message || '').toLowerCase().includes(q) ||
      (l.package_name || '').toLowerCase().includes(q)
    );
  });

  // ─── Styles ────────────────────────────────────────────────────────────────

  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d0d0d 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#e0e0e0',
      paddingBottom: '3rem'
    },
    header: {
      background: 'linear-gradient(90deg, #1a1a1a 0%, #1e1c18 100%)',
      borderBottom: '1px solid rgba(229,184,66,0.2)',
      padding: '0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 2px 20px rgba(0,0,0,0.5)'
    },
    headerInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.1rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.75rem'
    },
    poweredBy: {
      fontSize: '0.72rem',
      color: '#888',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontWeight: 500
    },
    brandLink: {
      color: '#e5b842',
      textDecoration: 'none',
      fontWeight: 700,
      letterSpacing: '0.05em'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 700,
      color: '#fff',
      letterSpacing: '0.02em',
      margin: 0
    },
    badge: {
      background: 'rgba(229,184,66,0.12)',
      border: '1px solid rgba(229,184,66,0.3)',
      color: '#e5b842',
      padding: '0.2rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem'
    },
    searchWrap: {
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    searchInput: {
      flex: 1,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(229,184,66,0.2)',
      borderRadius: '8px',
      color: '#fff',
      padding: '0.6rem 1rem',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    countBadge: {
      fontSize: '0.8rem',
      color: '#aaa',
      whiteSpace: 'nowrap'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(229,184,66,0.12)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    thead: {
      background: 'rgba(229,184,66,0.08)'
    },
    th: {
      padding: '0.85rem 1rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: 700,
      color: '#e5b842',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(229,184,66,0.15)',
      whiteSpace: 'nowrap'
    },
    td: {
      padding: '0.85rem 1rem',
      fontSize: '0.875rem',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      verticalAlign: 'top'
    },
    trHover: {
      background: 'rgba(229,184,66,0.04)',
      transition: 'background 0.15s'
    },
    dateCell: {
      color: '#bbb',
      fontSize: '0.8rem',
      whiteSpace: 'nowrap'
    },
    nameCell: {
      color: '#fff',
      fontWeight: 600
    },
    inquiryPill: {
      display: 'inline-block',
      background: 'rgba(229,184,66,0.1)',
      border: '1px solid rgba(229,184,66,0.25)',
      color: '#e5b842',
      borderRadius: '6px',
      padding: '0.15rem 0.55rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      marginBottom: '0.35rem',
      letterSpacing: '0.02em'
    },
    notesText: {
      color: '#ccc',
      fontSize: '0.82rem',
      lineHeight: 1.5,
      marginTop: '0.2rem',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
      color: '#555'
    },
    disabledState: {
      textAlign: 'center',
      padding: '5rem 2rem',
      color: '#444'
    },
    disabledIcon: {
      fontSize: '3rem',
      marginBottom: '1rem'
    },
    disabledTitle: {
      fontSize: '1.3rem',
      fontWeight: 700,
      color: '#666',
      marginBottom: '0.5rem'
    },
    disabledSub: {
      color: '#444',
      fontSize: '0.9rem'
    },
    liveIndicator: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontSize: '0.75rem',
      color: '#4ade80'
    },
    liveDot: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: '#4ade80',
      animation: 'pulse 2s infinite',
      flexShrink: 0
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .leads-row:hover td { background: rgba(229,184,66,0.04); }
        .search-input:focus { border-color: rgba(229,184,66,0.5) !important; box-shadow: 0 0 0 3px rgba(229,184,66,0.07); }
      `}</style>

      {/* ── Header ─────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <h1 style={styles.title}>
              Powered by{' '}
              <a href="https://fitscalez.com/" target="_blank" rel="noreferrer" style={styles.brandLink}>
                Fitscalez
              </a>
            </h1>
            <div style={styles.poweredBy}>Walk The Plan — Leads &amp; Inquiries</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {enabled === true && (
              <div style={styles.liveIndicator}>
                <span style={styles.liveDot} />
                LIVE
              </div>
            )}
            <span style={styles.badge}>Admin Leads View</span>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────── */}
      <main style={styles.container}>
        {/* Loading */}
        {enabled === null && (
          <div style={styles.disabledState}>
            <div style={{ ...styles.disabledIcon, color: '#555' }}>⏳</div>
            <div style={styles.disabledTitle}>Loading…</div>
          </div>
        )}

        {/* Error */}
        {error && enabled === false && (
          <div style={styles.disabledState}>
            <div style={styles.disabledIcon}>⚠️</div>
            <div style={styles.disabledTitle}>Connection Error</div>
            <div style={styles.disabledSub}>{error}</div>
          </div>
        )}

        {/* Disabled */}
        {enabled === false && !error && (
          <div style={styles.disabledState}>
            <div style={styles.disabledIcon}>🔒</div>
            <div style={styles.disabledTitle}>Leads Panel is Not Active</div>
            <div style={styles.disabledSub}>
              Token Expired, Please contact to Fitscalez To Refresh.
            </div>
          </div>
        )}

        {/* Leads Table */}
        {enabled === true && (
          <>
            <div style={styles.searchWrap}>
              <input
                className="search-input"
                style={styles.searchInput}
                type="text"
                placeholder="Search by name, notes, or package…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span style={styles.countBadge}>{filtered.length} leads</span>
            </div>

            {filtered.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                <div>No leads found{search ? ' matching your search' : ''}.</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th style={{ ...styles.th, width: '170px' }}>Date & Time</th>
                      <th style={{ ...styles.th, width: '160px' }}>Name</th>
                      <th style={styles.th}>Inquiry / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead, idx) => (
                      <tr
                        key={lead.id}
                        className="leads-row"
                        style={idx % 2 === 0 ? {} : { background: 'rgba(255,255,255,0.01)' }}
                      >
                        <td style={{ ...styles.td, ...styles.dateCell }}>
                          {formatDateTime(lead.created_at)}
                        </td>
                        <td style={{ ...styles.td, ...styles.nameCell }}>
                          {lead.name || '—'}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.inquiryPill}>{getInquiryLabel(lead)}</div>
                          {lead.message && (
                            <div style={styles.notesText}>{lead.message}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
