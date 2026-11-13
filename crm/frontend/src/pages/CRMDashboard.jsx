import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Users, UserPlus, Upload, Mic, MicOff, Play, Square, Trash2, Edit, Phone, Mail,
  MapPin, Calendar, TrendingUp, BarChart3, CheckCircle, XCircle, Clock, AlertCircle,
  Download, FileText, Search, Filter, ChevronLeft, ChevronRight, Plus, Activity,
  Volume2, Pause, RefreshCw, X, Check, Eye, Layers, Star, Home, LogOut,
  MoreVertical, ArrowUpRight, ArrowDownRight, Zap, Target, Award, Shield,
  ChevronDown, Database, Settings, Bell, Hash, Briefcase, DollarSign, List,
  PhoneCall, PhoneOff, Radio, Headphones, FileSpreadsheet, VolumeX,
  Link, Copy, ExternalLink, Sparkles, SlidersHorizontal, UserCheck, UserX
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const BACKEND_BASE = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const API = `${BACKEND_BASE}/api/crm`;
const LEADS_PER_PAGE = 25;

const STATUS_META = {
  'Hot Lead': { label: 'Hot Lead', color: '#ef4444', bg: 'rgba(239,68,68,0.18)', badge: '🔥' },
  'Warm Lead': { label: 'Warm Lead', color: '#f97316', bg: 'rgba(249,115,22,0.18)', badge: '☀️' },
  'Cold Lead': { label: 'Cold Lead', color: '#06b6d4', bg: 'rgba(6,182,212,0.18)', badge: '❄️' },
  'Interested': { label: 'Interested', color: '#10b981', bg: 'rgba(16,185,129,0.18)', badge: '👍' },
  'Design Related': { label: 'Design Related', color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)', badge: '📐' },
  'Details Shared': { label: 'Details Shared', color: '#3b82f6', bg: 'rgba(59,130,246,0.18)', badge: '📩' },
  '50/50': { label: '50/50', color: '#eab308', bg: 'rgba(234,179,8,0.18)', badge: '⚖️' },
  'Not Picked': { label: 'Not Picked', color: '#94a3b8', bg: 'rgba(148,163,184,0.18)', badge: '📵' },
  'Non Relevant': { label: 'Non Relevant', color: '#64748b', bg: 'rgba(100,116,139,0.18)', badge: '❌' },
  'Too Far': { label: 'Too Far', color: '#ec4899', bg: 'rgba(236,72,153,0.18)', badge: '📍' },
  'Too Early': { label: 'Too Early', color: '#a855f7', bg: 'rgba(168,85,247,0.18)', badge: '⏳' },
  'Too Late': { label: 'Too Late', color: '#475569', bg: 'rgba(71,85,105,0.18)', badge: '⏱️' },
  // Backward compatibility
  new: { label: 'New', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', badge: '⭐' },
  contacted: { label: 'Contacted', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: '📞' },
  qualified: { label: 'Qualified', color: '#a855f7', bg: 'rgba(168,85,247,0.15)', badge: '✓' },
  converted: { label: 'Converted', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', badge: '🏆' },
  lost: { label: 'Lost', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', badge: '✕' }
};

const PRIORITY_META = {
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  low: { label: 'Low', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
};

const ROLE_META = {
  admin: { label: 'Admin (All Depts)', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  sales: { label: 'Sales Executive', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  marketing: { label: 'Marketing (View-Only)', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  hr: { label: 'Human Resources', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  operations: { label: 'Operations', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  finance: { label: 'Finance', color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
  franchise: { label: 'Franchise Partner', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  manager: { label: 'Sales Manager', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  agent: { label: 'Sales Agent', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  sales_engineer: { label: 'Sales Engineer', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  field_agent: { label: 'Field Agent', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' }
};

const DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Human Resources',
  'Operations',
  'Finance',
  'Franchise',
  'Management'
];

const SOURCE_OPTIONS = [
  'Meta Ads (Facebook)', 'Meta Ads (Instagram)', 'Website Appointment',
  'Website Instant Inquiry', 'Franchise Application', 'WhatsApp Direct',
  'Google Search', 'Industrial Referral', 'Other'
];
const STATUS_OPTIONS = [
  'Hot Lead', 'Warm Lead', 'Cold Lead', 'Interested', 'Design Related',
  'Details Shared', '50/50', 'Not Picked', 'Non Relevant', 'Too Far',
  'Too Early', 'Too Late'
];
const PRIORITY_OPTIONS = Object.keys(PRIORITY_META);
const ROLE_OPTIONS = Object.keys(ROLE_META);

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg: '#09090b',
  card: '#111113',
  card2: '#18181b',
  border: '#27272a',
  border2: '#3f3f46',
  text: '#fafafa',
  muted: '#a1a1aa',
  gold: '#f59e0b',
  green: '#22c55e',
  blue: '#3b82f6',
  purple: '#a855f7',
  red: '#ef4444',
  accent: '#f59e0b',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const authHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('crm_token');
  if (!token) {
    window.location.href = '/crm/login';
    return null;
  }
  const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });
  if (res.status === 401) {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.location.href = '/crm/login';
    return null;
  }
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `HTTP ${res.status}`);
  }
  return res.json();
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtNum = (n) => (n ?? 0).toLocaleString('en-IN');
const fmtDuration = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Toast notification */
const Toast = ({ toasts, remove }) => (
  <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
    {toasts.map(t => (
      <div key={t.id} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: t.type === 'success' ? 'rgba(34,197,94,0.18)' : t.type === 'error' ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.18)',
        border: `1px solid ${t.type === 'success' ? P.green : t.type === 'error' ? P.red : P.gold}`,
        borderRadius: 10, padding: '12px 16px', minWidth: 280, maxWidth: 420,
        backdropFilter: 'blur(14px)', color: P.text, fontSize: 14, fontWeight: 500,
        animation: 'slideInRight 0.3s ease',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
      }}>
        {t.type === 'success' ? <CheckCircle size={16} color={P.green} /> : t.type === 'error' ? <XCircle size={16} color={P.red} /> : <AlertCircle size={16} color={P.gold} />}
        <span style={{ flex: 1 }}>{t.message}</span>
        <button onClick={() => remove(t.id)} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer', padding: 0 }}><X size={14} /></button>
      </div>
    ))}
  </div>
);

/** Status badge */
const StatusBadge = ({ status, onClick }) => {
  const m = STATUS_META[status] || STATUS_META['Hot Lead'] || STATUS_META.new;
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: m.bg, color: m.color, border: `1px solid ${m.color}40`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700,
      cursor: onClick ? 'pointer' : 'default', whiteSpace: 'nowrap',
      userSelect: 'none', letterSpacing: 0.3,
    }}>{m.badge ? `${m.badge} ` : ''}{m.label}</span>
  );
};

/** Priority badge */
const PriorityBadge = ({ priority }) => {
  const m = PRIORITY_META[priority] || PRIORITY_META.medium;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: m.bg, color: m.color, border: `1px solid ${m.color}40`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
    }}>{m.label}</span>
  );
};

/** Role badge */
const RoleBadge = ({ role }) => {
  const m = ROLE_META[role] || { label: role || 'Agent', color: P.blue, bg: `${P.blue}20` };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      background: m.bg, color: m.color, border: `1px solid ${m.color}40`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>{m.label}</span>
  );
};

/** Stat card */
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{
    background: P.card, border: `1px solid ${P.border}`, borderRadius: 14,
    padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.06 }}>
      <Icon size={90} color={color || P.gold} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ background: `${color || P.gold}20`, borderRadius: 8, padding: 7 }}>
        <Icon size={18} color={color || P.gold} />
      </div>
      <span style={{ color: P.muted, fontSize: 12, fontWeight: 500, letterSpacing: 0.4 }}>{label}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, color: P.text, letterSpacing: -0.5 }}>{fmtNum(value)}</div>
    {sub && <div style={{ fontSize: 11, color: P.muted }}>{sub}</div>}
  </div>
);

/** Loading skeleton row */
const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} style={{ padding: '14px 12px' }}>
        <div style={{ height: 14, background: '#1f1f23', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </td>
    ))}
  </tr>
);

/** Empty state */
const EmptyState = ({ icon: Icon, title, sub }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px', color: P.muted }}>
    <Icon size={48} color={P.border2} style={{ marginBottom: 16 }} />
    <div style={{ fontSize: 16, fontWeight: 600, color: P.text, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 13 }}>{sub}</div>
  </div>
);

/** Modal wrapper */
const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      backdropFilter: 'blur(5px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.card, border: `1px solid ${P.border}`, borderRadius: 16,
        width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${P.border}` }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: P.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer', padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

/** Form field */
const Field = ({ label, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontSize: 12, color: P.muted, fontWeight: 600, letterSpacing: 0.4 }}>
      {label}{required && <span style={{ color: P.red }}>*</span>}
    </label>
    {children}
  </div>
);

const inputStyle = {
  background: '#0f0f12', border: `1px solid ${P.border}`, borderRadius: 8,
  padding: '9px 12px', color: P.text, fontSize: 13, outline: 'none',
  transition: 'border-color 0.2s',
  width: '100%', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

/** Table wrapper */
const TableWrap = ({ children }) => (
  <div style={{ overflowX: 'auto', borderRadius: 12, border: `1px solid ${P.border}`, background: P.card }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
      {children}
    </table>
  </div>
);

const Th = ({ children, style: s }) => (
  <th style={{
    padding: '12px 14px', background: '#0f0f12', color: P.muted, fontSize: 11,
    fontWeight: 700, letterSpacing: 0.6, textAlign: 'left', whiteSpace: 'nowrap',
    borderBottom: `1px solid ${P.border}`, ...s,
  }}>{children}</th>
);

const Td = ({ children, style: s }) => (
  <td style={{
    padding: '12px 14px', fontSize: 13, color: P.text,
    borderBottom: `1px solid ${P.border}22`, verticalAlign: 'middle', ...s,
  }}>{children}</td>
);

const ActionBtn = ({ icon: Icon, color, title, onClick }) => (
  <button title={title} onClick={onClick} style={{
    background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 7,
    padding: '6px 8px', cursor: 'pointer', color: color, display: 'inline-flex',
    alignItems: 'center', transition: 'all 0.15s',
  }}
    onMouseEnter={e => { e.currentTarget.style.background = `${color}30`; }}
    onMouseLeave={e => { e.currentTarget.style.background = `${color}15`; }}
  >
    <Icon size={14} />
  </button>
);

// ─── Tab: Dashboard Overview ──────────────────────────────────────────────────
const TabOverview = ({ addToast, onTabChange }) => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyPreset = (type) => {
    setDateRange(type);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (type === 'today') {
      setStartDate(todayStr); setEndDate(todayStr);
    } else if (type === 'yesterday') {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr); setEndDate(yStr);
    } else if (type === '7d') {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]); setEndDate(todayStr);
    } else if (type === '30d') {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]); setEndDate(todayStr);
    } else if (type === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setStartDate(start); setEndDate(todayStr);
    } else {
      setStartDate(''); setEndDate('');
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      const query = params.toString() ? `?${params.toString()}` : '';

      const [s, r] = await Promise.all([
        apiFetch(`/stats${query}`),
        apiFetch(`/leads${query ? query + '&' : '?'}limit=10&page=1`),
      ]);
      setStats(s);
      setRecent(r?.leads || r?.data || []);
    } catch {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, addToast]);

  useEffect(() => { load(); }, [load]);

  const sc = stats?.statusCounts || {};
  const metaCount = stats?.categories?.meta || 0;
  const webCount = stats?.categories?.website || 0;

  const summaryCards = stats ? [
    { icon: Users, label: 'TOTAL LEADS', value: stats.total_leads || 0, color: P.gold, sub: `Meta: ${metaCount} · Website: ${webCount}` },
    { icon: Zap, label: 'HOT LEADS', value: sc['Hot Lead'] || 0, color: '#ef4444', sub: 'High closing intent' },
    { icon: Target, label: 'INTERESTED', value: sc['Interested'] || 0, color: '#10b981', sub: 'Engaged prospects' },
    { icon: PhoneCall, label: 'CALLS LOGGED', value: stats.total_calls || 0, color: '#38bdf8', sub: 'Dialer interactions' },
    { icon: Award, label: 'ACTIVE TEAM', value: stats.total_users || 0, color: P.accent, sub: 'All departments' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Filter Bar: According to Date ── */}
      <div style={{
        background: P.card, border: `1px solid ${P.border}`, borderRadius: 14,
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 14
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.gold, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 5, marginRight: 6 }}>
            <Calendar size={14} /> According to Date:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              style={{
                background: dateRange === p.id ? P.gold : P.card2,
                color: dateRange === p.id ? '#000' : P.text,
                border: `1px solid ${dateRange === p.id ? P.gold : P.border}`,
                borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: dateRange === p.id ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: P.muted }}>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => { setDateRange('custom'); setStartDate(e.target.value); }}
            style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }}
          />
          <span style={{ fontSize: 12, color: P.muted }}>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setDateRange('custom'); setEndDate(e.target.value); }}
            style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }}
          />
          {(startDate || endDate) && (
            <button
              onClick={() => applyPreset('all')}
              style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 6, color: P.muted, padding: '5px 8px', cursor: 'pointer', fontSize: 11 }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: P.card, borderRadius: 14, height: 110, border: `1px solid ${P.border}`, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
          : summaryCards.map((c, i) => <StatCard key={i} {...c} />)
        }
      </div>

      {/* ── 12 Qualification Stages Matrix ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            <SlidersHorizontal size={15} color={P.gold} />
            Lead Qualification Stages Breakdown ({STATUS_OPTIONS.length} Stages)
          </h3>
          <span style={{ fontSize: 12, color: P.muted }}>Filtered by selected dates</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12 }}>
          {STATUS_OPTIONS.map(stageKey => {
            const m = STATUS_META[stageKey] || {};
            const count = sc[stageKey] || 0;
            return (
              <div
                key={stageKey}
                onClick={() => onTabChange('leads', stageKey)}
                style={{
                  background: P.card, border: `1px solid ${m.color}35`, borderRadius: 12,
                  padding: '14px 16px', cursor: 'pointer', transition: 'transform 0.15s, border-color 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = m.color; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${m.color}35`; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>{m.badge || '📌'}</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: count > 0 ? m.color : P.muted }}>
                    {count}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: P.text }}>{m.label || stageKey}</div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Click to filter leads</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(17,17,19,0.9) 100%)',
        border: `1px solid ${P.gold}40`, borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: P.text }}>
            Industrial Telephony & Walkthrough Lead Engine
          </h4>
          <p style={{ margin: 0, fontSize: 13, color: P.muted }}>
            Direct browser-to-lead WebRTC calling with automatic encrypted audio recordings stored on private VPS disk.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => onTabChange('calls')} style={{
            background: P.gold, color: '#000', border: 'none', borderRadius: 8,
            padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <PhoneCall size={15} /> Open Call Studio
          </button>
          <button onClick={() => onTabChange('leads')} style={{
            background: P.card2, color: P.text, border: `1px solid ${P.border}`, borderRadius: 8,
            padding: '9px 18px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Users size={15} /> View Pipeline
          </button>
        </div>
      </div>

      {/* Recent Leads */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text }}>Recent Industrial Inquiries</h3>
          <button onClick={load} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <TableWrap>
          <thead>
            <tr>
              {['Name / Enterprise', 'Phone', 'Email', 'Source', 'Status', 'Priority', 'City / plan', 'Created'].map(h => <Th key={h}>{h}</Th>)}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
              : recent.length === 0
                ? <tr><td colSpan={8}><EmptyState icon={Users} title="No leads yet" sub="Industrial leads will appear here once ingested" /></td></tr>
                : recent.map(l => (
                  <tr key={l.id || l._id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Td><span style={{ fontWeight: 600, color: P.text }}>{l.name}</span></Td>
                    <Td><span style={{ color: P.muted }}>{l.phone || '—'}</span></Td>
                    <Td><span style={{ color: P.muted }}>{l.email || '—'}</span></Td>
                    <Td><span style={{ color: P.gold, fontSize: 12 }}>{l.source || '—'}</span></Td>
                    <Td><StatusBadge status={l.status} /></Td>
                    <Td><PriorityBadge priority={l.priority} /></Td>
                    <Td><span style={{ color: P.muted }}>{l.city || '—'}</span></Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{fmtDate(l.created_at || l.createdAt)}</span></Td>
                  </tr>
                ))
            }
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
};

// ─── Lead Form Modal ──────────────────────────────────────────────────────────
const LeadFormModal = ({ open, onClose, lead, onSaved, addToast }) => {
  const empty = {
    name: '', email: '', phone: '', source: 'Meta Ads (Instagram)', status: 'Hot Lead',
    priority: 'medium', city: '', state: '', budget: '', requirement: '', notes: '',
    follow_up_date: '', assigned_to: '', lead_category: 'meta', meta_platform: 'ig',
    floor_plan_status: 'floor_plan_is_ready', plot_size: 'less_than_200_sq._yards_(_1800_sq._ft_)',
    studio_location: 'Gurugram HQ', package_service: 'Appointment Inquiry', payment_status: 'Unpaid'
  };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) setForm({ ...empty, ...lead, follow_up_date: lead.follow_up_date ? lead.follow_up_date.split('T')[0] : '' });
    else setForm(empty);
  }, [lead, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const isEdit = !!(lead && (lead.id || lead._id));
      const id = isEdit ? (lead.id || lead._id) : null;
      await apiFetch(isEdit ? `/leads/${id}` : '/leads', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      addToast(isEdit ? 'Lead updated successfully!' : 'Lead created successfully!', 'success');
      onSaved();
      onClose();
    } catch (err) {
      addToast(err.message || 'Save failed. Check connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={lead ? 'Edit Sales Lead' : 'Create New Lead'} width={700}>
      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Lead Type / Classification" required>
          <select style={selectStyle} value={form.lead_category} onChange={e => set('lead_category', e.target.value)}>
            <option value="meta">Meta Ads Lead (Facebook / Instagram)</option>
            <option value="website">Website Portal Lead (Walk The Plan)</option>
          </select>
        </Field>

        <Field label="Qualification Stage (Status)" required>
          <select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.badge || ''} {STATUS_META[s]?.label || s}</option>)}
          </select>
        </Field>

        <Field label="Client / Prospect Full Name" required>
          <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Mayank Sharma / Tata Realty" />
        </Field>

        <Field label="Phone / WhatsApp Number">
          <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
        </Field>

        <Field label="Email Address">
          <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="client@domain.com" />
        </Field>

        <Field label="City / Location">
          <input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} placeholder="Gurugram / Rewa / Bhopal" />
        </Field>

        {form.lead_category === 'meta' ? (
          <>
            <Field label="Meta Ad Platform">
              <select style={selectStyle} value={form.meta_platform} onChange={e => set('meta_platform', e.target.value)}>
                <option value="ig">Instagram Ads (ig)</option>
                <option value="fb">Facebook Ads (fb)</option>
              </select>
            </Field>

            <Field label="Floor Plan Status">
              <select style={selectStyle} value={form.floor_plan_status} onChange={e => set('floor_plan_status', e.target.value)}>
                <option value="floor_plan_is_ready">Floor Plan is Ready</option>
                <option value="floor_plan_is_under_process">Floor Plan is Under Process</option>
                <option value="floor_plan_is_not_ready">Floor Plan is NOT Ready</option>
              </select>
            </Field>

            <Field label="Plot Size Range">
              <select style={selectStyle} value={form.plot_size} onChange={e => set('plot_size', e.target.value)}>
                <option value="less_than_200_sq._yards_(_1800_sq._ft_)">&lt; 200 sq. yards (&lt; 1,800 sq ft)</option>
                <option value="between_200-500_sq._yards_(_1800-4500_sq._ft_)">200–500 sq. yards (1,800–4,500 sq ft)</option>
                <option value="above_500_sq._yards_(_4500_sq._ft_)">&gt; 500 sq. yards (&gt; 4,500 sq ft)</option>
              </select>
            </Field>
          </>
        ) : (
          <>
            <Field label="Studio Location">
              <select style={selectStyle} value={form.studio_location} onChange={e => set('studio_location', e.target.value)}>
                <option value="Gurugram HQ">Gurugram HQ (Delhi NCR)</option>
                <option value="Dehradun">Dehradun Studio</option>
                <option value="Varanasi">Varanasi Studio</option>
                <option value="Hyderabad">Hyderabad Studio</option>
                <option value="Madurai">Madurai Studio</option>
                <option value="Other City">Other Upcoming City</option>
              </select>
            </Field>

            <Field label="Package / Service Type">
              <input style={inputStyle} value={form.package_service} onChange={e => set('package_service', e.target.value)} placeholder="Appointment / Luxury Villa / 1 Hour" />
            </Field>

            <Field label="Payment Status">
              <select style={selectStyle} value={form.payment_status} onChange={e => set('payment_status', e.target.value)}>
                <option value="Unpaid">Unpaid / Lead Inquiry</option>
                <option value="Token Paid">Token Amount Paid</option>
                <option value="Fully Paid">Fully Paid</option>
              </select>
            </Field>
          </>
        )}

        <Field label="Estimated Budget / Value">
          <input style={inputStyle} value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="₹50L - ₹1 Crore / ₹50,000" />
        </Field>

        <Field label="Priority Level">
          <select style={selectStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
          </select>
        </Field>

        <Field label="Follow-up Date">
          <input style={inputStyle} type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} />
        </Field>

        <Field label="Assigned Sales Agent">
          <input style={inputStyle} value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} placeholder="Agent / Engineer Name" />
        </Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field label="Requirement & Notes">
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Architectural details, 2D AutoCAD status, client preferences..." />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <button type="button" onClick={onClose} style={{ ...inputStyle, width: 'auto', padding: '9px 20px', cursor: 'pointer', color: P.muted }}>Cancel</button>
          <button type="submit" disabled={saving} style={{
            background: P.gold, border: 'none', borderRadius: 8, padding: '9px 26px',
            color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>{saving ? 'Saving…' : (lead ? 'Update Lead' : 'Save Lead')}</button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Tab: Leads Management ────────────────────────────────────────────────────
const TabLeads = ({ addToast, onAudio, onCallLead, isAgent, isAdmin, isManager, isMarketingView = false, initialCategory = 'meta', initialStatus = '' }) => {
  const [categoryTab, setCategoryTab] = useState(isMarketingView ? 'meta' : initialCategory);
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState(initialStatus || '');
  const [sourceF, setSourceF] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editLead, setEditLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const canDelete = (isAdmin || isManager) && !isMarketingView;
  const canEdit = !isMarketingView;
  const totalPages = Math.ceil(total / LEADS_PER_PAGE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LEADS_PER_PAGE });
      if (categoryTab && categoryTab !== 'all') params.set('lead_category', categoryTab);
      if (search) params.set('search', search);
      if (statusF) params.set('status', statusF);
      if (sourceF) params.set('source', sourceF);
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);

      const data = await apiFetch(`/leads?${params}`);
      setLeads(data?.leads || data?.data || []);
      setTotal(data?.total || 0);
    } catch {
      addToast('Failed to load leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, categoryTab, search, statusF, sourceF, startDate, endDate, addToast]);

  useEffect(() => { load(); }, [load]);

  const deleteLead = async (id, leadName) => {
    if (!window.confirm(`Delete lead "${leadName || 'Lead'}"? All attached audio recordings will also be permanently deleted from VPS.`)) return;
    try {
      await apiFetch(`/leads/${id}`, { method: 'DELETE' });
      addToast('Lead deleted successfully', 'success');
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      load();
    } catch (err) { addToast(err.message || 'Delete failed', 'error'); }
  };

  const deleteLeadAudio = async (id, leadName) => {
    if (!window.confirm(`Delete audio recording attached to "${leadName || 'Lead'}"?`)) return;
    try {
      await apiFetch(`/leads/${id}/audio`, { method: 'DELETE' });
      addToast('Audio note removed', 'success');
      load();
    } catch (err) { addToast(err.message || 'Failed to delete audio', 'error'); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length && leads.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(leads.map(l => l.id || l._id)));
  };

  const bulkDeleteLeads = async () => {
    if (!selectedIds.size) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} selected lead(s)? This cannot be undone.`)) return;
    try {
      const res = await apiFetch('/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      });
      addToast(res.message || `Deleted ${selectedIds.size} leads`, 'success');
      setSelectedIds(new Set());
      load();
    } catch (err) {
      addToast(err.message || 'Bulk delete failed', 'error');
    }
  };

  const cycleStatus = async (lead) => {
    if (!canEdit) return;
    const keys = STATUS_OPTIONS;
    const next = keys[(keys.indexOf(lead.status) + 1) % keys.length];
    try {
      await apiFetch(`/leads/${lead.id || lead._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...lead, status: next }) });
      setLeads(ls => ls.map(l => ((l.id || l._id) === (lead.id || lead._id) ? { ...l, status: next } : l)));
    } catch { addToast('Status update failed', 'error'); }
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', bulkFile);
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch(`${API}/leads/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      addToast(`Uploaded: ${data.inserted || 0} inserted, ${data.skipped || 0} skipped`, 'success');
      setBulkFile(null);
      load();
    } catch (err) { addToast(err.message || 'Upload failed', 'error'); } finally { setUploading(false); }
  };

  const tbBtn = { background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 14px', color: P.text, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ── Section Header & Sub-Tab Switcher ── */}
      {!isMarketingView ? (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: `1px solid ${P.border}`, paddingBottom: 12, flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => { setCategoryTab('meta'); setPage(1); }}
              style={{
                background: categoryTab === 'meta' ? 'rgba(168,85,247,0.18)' : P.card2,
                border: `1px solid ${categoryTab === 'meta' ? P.purple : P.border}`,
                borderRadius: 8, padding: '7px 16px', color: categoryTab === 'meta' ? '#c084fc' : P.muted,
                fontSize: 13, fontWeight: categoryTab === 'meta' ? 700 : 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Target size={14} /> A). Meta Leads (Facebook & Instagram Ads)
            </button>
            <button
              onClick={() => { setCategoryTab('website'); setPage(1); }}
              style={{
                background: categoryTab === 'website' ? 'rgba(59,130,246,0.18)' : P.card2,
                border: `1px solid ${categoryTab === 'website' ? P.blue : P.border}`,
                borderRadius: 8, padding: '7px 16px', color: categoryTab === 'website' ? '#60a5fa' : P.muted,
                fontSize: 13, fontWeight: categoryTab === 'website' ? 700 : 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Home size={14} /> B). Website Leads (Walk The Plan Portal)
            </button>
            <button
              onClick={() => { setCategoryTab('all'); setPage(1); }}
              style={{
                background: categoryTab === 'all' ? 'rgba(245,158,11,0.18)' : P.card2,
                border: `1px solid ${categoryTab === 'all' ? P.gold : P.border}`,
                borderRadius: 8, padding: '7px 16px', color: categoryTab === 'all' ? P.gold : P.muted,
                fontSize: 13, fontWeight: categoryTab === 'all' ? 700 : 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Users size={14} /> Combined All Leads
            </button>
          </div>

          <button
            onClick={() => setShowWebhookModal(true)}
            style={{
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)',
              borderRadius: 8, padding: '7px 14px', color: '#c084fc', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Sparkles size={13} /> Meta Ads Manager & Google Sheets Live Sync
          </button>
        </div>
      ) : (
        <div style={{
          background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)',
          borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={20} color="#c084fc" />
            <div>
              <strong style={{ color: '#c084fc', fontSize: 13 }}>Marketing Department — View-Only Meta Leads Portal</strong>
              <div style={{ fontSize: 12, color: P.muted }}>
                Authorized to inspect live Meta Ads (Facebook & Instagram) inquiries, floor plan readiness, and campaign attribution.
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowWebhookModal(true)}
            style={{
              background: '#c084fc20', border: '1px solid #c084fc40', borderRadius: 8,
              padding: '6px 14px', color: '#c084fc', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Link size={13} /> Webhook & Live Google Sheets Setup
          </button>
        </div>
      )}

      {/* ── Toolbar & Multi-Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} color={P.muted} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            style={{ ...inputStyle, paddingLeft: 32 }}
            placeholder="Search by client, phone, city, plot size, ad name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Status filter (12 stages) */}
        <select style={{ ...selectStyle, minWidth: 140 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1); }}>
          <option value="">All Statuses ({STATUS_OPTIONS.length})</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s]?.badge || ''} {STATUS_META[s]?.label || s}</option>)}
        </select>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="date"
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12 }}
            title="Start Date"
          />
          <span style={{ fontSize: 11, color: P.muted }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: 'auto', padding: '6px 10px', fontSize: 12 }}
            title="End Date"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
              style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 6, color: P.muted, padding: '5px 8px', cursor: 'pointer', fontSize: 11 }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Actions for Sales / Admin */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {selectedIds.size > 0 && canDelete && (
            <button
              style={{ ...tbBtn, background: P.red, color: '#fff', border: 'none', fontWeight: 700 }}
              onClick={bulkDeleteLeads}
            >
              <Trash2 size={14} /> Delete Selected ({selectedIds.size})
            </button>
          )}

          {canEdit && (
            <>
              <label style={{ ...tbBtn, position: 'relative' }} title="Upload Excel or CSV file">
                <Upload size={14} />
                {bulkFile ? <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bulkFile.name}</span> : 'Bulk Excel / CSV'}
                <input type="file" accept=".csv,.xlsx,.xls" style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={e => setBulkFile(e.target.files[0])} />
              </label>
              {bulkFile && (
                <button style={{ ...tbBtn, background: uploading ? P.card : P.gold, color: uploading ? P.text : '#000', border: 'none' }}
                  onClick={handleBulkUpload} disabled={uploading}>
                  {uploading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                  {uploading ? 'Uploading…' : 'Confirm Upload'}
                </button>
              )}

              <button
                style={{ ...tbBtn, background: P.gold, border: 'none', color: '#000', fontWeight: 700 }}
                onClick={() => { setEditLead(null); setShowForm(true); }}
              >
                <Plus size={14} /> Add Lead
              </button>
            </>
          )}
        </div>
      </div>

      {/* Count & Active Category Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: P.muted }}>
        <div>
          Showing {total > 0 ? `${(page - 1) * LEADS_PER_PAGE + 1}–${Math.min(page * LEADS_PER_PAGE, total)} of ${fmtNum(total)}` : '0'} {categoryTab === 'meta' ? 'Meta Ads' : categoryTab === 'website' ? 'Website Portal' : 'Total'} Leads
        </div>
        {categoryTab === 'meta' && (
          <span style={{ color: '#c084fc', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Target size={11} /> Format: Meta Ads Manager Export & Webhook Compatible
          </span>
        )}
      </div>

      {/* ── Table Representation ── */}
      <TableWrap>
        <thead>
          <tr>
            {canDelete && (
              <Th style={{ width: 36, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selectedIds.size === leads.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', accentColor: P.gold }}
                />
              </Th>
            )}

            {/* Dynamic Headers according to Category */}
            <Th>Prospect / Client</Th>
            <Th>Contact Details</Th>

            {categoryTab === 'meta' ? (
              <>
                <Th>Platform</Th>
                <Th>Floor Plan Status</Th>
                <Th>Plot Size Range</Th>
                <Th>City</Th>
                <Th>Ad Campaign</Th>
              </>
            ) : categoryTab === 'website' ? (
              <>
                <Th>Studio Location</Th>
                <Th>Project / Inquiry</Th>
                <Th>Service Package</Th>
                <Th>Est. Budget</Th>
                <Th>Payment Status</Th>
              </>
            ) : (
              <>
                <Th>Category</Th>
                <Th>Requirement / Scope</Th>
                <Th>City / Studio</Th>
                <Th>Est. Budget</Th>
              </>
            )}

            <Th>Status (Stage)</Th>
            <Th>Created</Th>
            {!isMarketingView && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} cols={11} />)
          ) : leads.length === 0 ? (
            <tr><td colSpan={12}><EmptyState icon={Users} title="No leads found" sub="Adjust date range or search filters" /></td></tr>
          ) : (
            leads.map(l => {
              const id = l.id || l._id;
              const isMetaLead = l.lead_category === 'meta' || (!l.lead_category && (l.meta_platform || l.floor_plan_status));
              return (
                <tr key={id} onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'} style={{ transition: 'background 0.15s' }}>
                  {canDelete && (
                    <Td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => toggleSelect(id)}
                        style={{ cursor: 'pointer', accentColor: P.gold }}
                      />
                    </Td>
                  )}

                  {/* Client Name */}
                  <Td>
                    <div style={{ fontWeight: 700, color: P.text }}>{l.name}</div>
                    {l.source && <span style={{ fontSize: 10, color: P.muted }}>{l.source}</span>}
                  </Td>

                  {/* Contact Details */}
                  <Td>
                    <div style={{ fontSize: 12, color: P.text, fontFamily: 'monospace' }}>{l.phone || '—'}</div>
                    <div style={{ fontSize: 11, color: P.muted }}>{l.email || '—'}</div>
                  </Td>

                  {/* Meta Leads Columns */}
                  {categoryTab === 'meta' ? (
                    <>
                      <Td>
                        <span style={{
                          background: l.meta_platform === 'fb' ? 'rgba(24,119,242,0.15)' : 'rgba(217,70,239,0.15)',
                          color: l.meta_platform === 'fb' ? '#60a5fa' : '#f472b6',
                          border: `1px solid ${l.meta_platform === 'fb' ? '#3b82f640' : '#ec489940'}`,
                          borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase'
                        }}>
                          {l.meta_platform || 'IG'}
                        </span>
                      </Td>
                      <Td>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: l.floor_plan_status?.includes('not') ? P.red : l.floor_plan_status?.includes('under') ? '#f59e0b' : P.green
                        }}>
                          {l.floor_plan_status?.replace(/_/g, ' ') || '—'}
                        </span>
                      </Td>
                      <Td>
                        <span style={{ fontSize: 11, color: P.muted, whiteSpace: 'nowrap' }}>
                          {l.plot_size ? l.plot_size.replace(/_/g, ' ') : '—'}
                        </span>
                      </Td>
                      <Td><span style={{ color: P.text, fontSize: 12 }}>{l.city || '—'}</span></Td>
                      <Td>
                        <span style={{ fontSize: 11, color: P.gold }}>
                          {l.meta_ad_name || l.meta_campaign_name || 'Walk The Plan Ads'}
                        </span>
                      </Td>
                    </>
                  ) : categoryTab === 'website' ? (
                    <>
                      <Td>
                        <span style={{ background: 'rgba(245,158,11,0.1)', color: P.gold, borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                          {l.studio_location || 'Gurugram HQ'}
                        </span>
                      </Td>
                      <Td><span style={{ fontSize: 12, color: P.text }}>{l.requirement || 'Architectural Inquiry'}</span></Td>
                      <Td><span style={{ fontSize: 11, color: P.muted }}>{l.package_service || 'Appointment'}</span></Td>
                      <Td><span style={{ fontSize: 12, color: P.green, fontWeight: 600 }}>{l.budget || '—'}</span></Td>
                      <Td>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: l.payment_status === 'Token Paid' ? P.green : P.muted
                        }}>
                          {l.payment_status || 'Unpaid Inquiry'}
                        </span>
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td>
                        <span style={{ fontSize: 11, color: isMetaLead ? '#c084fc' : P.blue, fontWeight: 600 }}>
                          {isMetaLead ? 'Meta Ads' : 'Website'}
                        </span>
                      </Td>
                      <Td><span style={{ fontSize: 12, color: P.text }}>{l.requirement || l.notes || '—'}</span></Td>
                      <Td><span style={{ fontSize: 12, color: P.muted }}>{l.city || l.studio_location || '—'}</span></Td>
                      <Td><span style={{ fontSize: 12, color: P.green }}>{l.budget || '—'}</span></Td>
                    </>
                  )}

                  {/* Status Badge */}
                  <Td>
                    <StatusBadge status={l.status} onClick={canEdit ? () => cycleStatus(l) : undefined} />
                  </Td>

                  {/* Created Date */}
                  <Td><span style={{ color: P.muted, fontSize: 11 }}>{fmtDate(l.created_at || l.createdAt)}</span></Td>

                  {/* Actions for Sales / Admin */}
                  {!isMarketingView && (
                    <Td>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <ActionBtn icon={PhoneCall} color={P.green} title="VoIP WebRTC Call" onClick={() => onCallLead(l)} />
                        <ActionBtn icon={Edit} color={P.blue} title="Edit Details" onClick={() => { setEditLead(l); setShowForm(true); }} />
                        <ActionBtn icon={Volume2} color={l.audio_url ? P.gold : P.purple} title="Audio Notes" onClick={() => onAudio(l)} />
                        {canDelete && (
                          <ActionBtn icon={Trash2} color={P.red} title="Delete Lead" onClick={() => deleteLead(id, l.name)} />
                        )}
                      </div>
                    </Td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </TableWrap>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ ...tbBtn, opacity: page <= 1 ? 0.4 : 1 }}><ChevronLeft size={14} /></button>
          <span style={{ fontSize: 12, color: P.muted }}>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ ...tbBtn, opacity: page >= totalPages ? 0.4 : 1 }}><ChevronRight size={14} /></button>
        </div>
      )}

      {/* Lead Form Modal */}
      <LeadFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditLead(null); }}
        lead={editLead}
        onSaved={load}
        addToast={addToast}
      />

      {/* Meta Ads & Google Sheets Webhook Modal */}
      <Modal open={showWebhookModal} onClose={() => setShowWebhookModal(false)} title="Meta Ads & Google Sheets Live Ingestion Webhook" width={640}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13, color: P.muted, lineHeight: 1.6 }}>
            Connect your Facebook & Instagram Lead Ads or Google Sheet directly to Walk The Plan CRM without manual Excel uploads.
          </p>

          <div style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              Your Live Ingestion Webhook URL
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                readOnly
                value={`${window.location.origin}/api/crm/leads/meta-webhook`}
                style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: 12, color: '#c084fc' }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/crm/leads/meta-webhook`);
                  addToast('Webhook URL copied to clipboard!', 'success');
                }}
                style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '9px 16px', color: '#000', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
              >
                <Copy size={13} /> Copy URL
              </button>
            </div>
          </div>

          <div style={{ background: '#18181b', border: `1px solid ${P.border}`, borderRadius: 10, padding: '14px 16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700, color: P.text }}>
              How to connect live Google Sheets / Zapier / Meta:
            </h4>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: P.muted, lineHeight: 1.7 }}>
              <li>Open your live Google Sheet collecting Meta Leads.</li>
              <li>Go to <strong>Extensions ➔ Apps Script</strong>.</li>
              <li>Create a simple post function targeting the Webhook URL on row insert.</li>
              <li>Every new lead dropping from Facebook or Instagram will instantly drop into the CRM in real time!</li>
            </ol>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── Tab: Upload Leads ────────────────────────────────────────────────────────
const TabUpload = ({ addToast, onUploadComplete }) => {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [manualForm, setManualForm] = useState(false);
  const fileRef = useRef();

  const empty = { name: '', email: '', phone: '', source: 'Industrial Walkthrough', status: 'new', priority: 'medium', city: '', state: '', budget: '', requirement: '', notes: '', follow_up_date: '', assigned_to: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) setFile(f);
    else addToast('Please upload a CSV or Excel file', 'error');
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true); setResult(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const token = localStorage.getItem('crm_token');
      const res = await fetch(`${API}/leads/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setResult(data);
      addToast(`Bulk ingest: ${data.inserted || 0} inserted, ${data.skipped || 0} skipped`, 'success');
      setFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (err) { addToast(err.message || 'Upload failed', 'error'); } finally { setUploading(false); }
  };

  const downloadTemplate = (format = 'xlsx') => {
    if (format === 'csv') {
      const csv = 'Client Name,Phone,Email,City,State,Requirement,Budget,Source,Status,Priority,Notes,Follow-up Date,Assigned Engineer\nAcme Manufacturing,9876543210,ops@acme.com,Pune,Maharashtra,Full Plant 3D Walkthrough,1200000,Industrial Walkthrough,new,high,Hazard assessment needed,2026-11-20,Lead Engineer';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'walk_the_plan_bulk_import_template.csv' });
      a.click();
      return;
    }
    const templateData = [
      {
        'Client Name': 'Acme Manufacturing',
        'Phone Number': '9876543210',
        'Email ID': 'ops@acme.com',
        'City': 'Pune',
        'State': 'Maharashtra',
        'Requirement': 'Full Plant 3D Walkthrough & Digital Twin',
        'Est. Budget': '12,00,000',
        'Source': 'Industrial Walkthrough',
        'Status': 'new',
        'Priority': 'high',
        'Follow-up Date': '2026-11-20',
        'Assigned Engineer': 'Lead Engineer',
        'Technical Notes': 'Hazard assessment and thermal scan needed'
      },
      {
        'Client Name': 'Tata Steel Ltd',
        'Phone Number': '9811223344',
        'Email ID': 'procurement@tatasteel.com',
        'City': 'Jamshedpur',
        'State': 'Jharkhand',
        'Requirement': 'Drone LiDAR 3D Walkthrough Scan',
        'Est. Budget': '25,00,000',
        'Source': 'Plant Inspection',
        'Status': 'new',
        'Priority': 'medium',
        'Follow-up Date': '2026-11-25',
        'Assigned Engineer': 'Senior Sales Engineer',
        'Technical Notes': 'Blast furnace safety clearance required'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 22 }, { wch: 15 }, { wch: 26 }, { wch: 14 }, { wch: 14 },
      { wch: 36 }, { wch: 14 }, { wch: 22 }, { wch: 10 }, { wch: 10 },
      { wch: 14 }, { wch: 22 }, { wch: 36 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads_Template');
    XLSX.writeFile(wb, 'walk_the_plan_bulk_import_template.xlsx');
  };

  const submitManual = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { addToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      await apiFetch('/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      addToast('plan inquiry logged successfully!', 'success');
      setForm(empty);
      if (onUploadComplete) onUploadComplete();
    } catch (err) { addToast(err.message || 'Failed to add lead', 'error'); } finally { setSaving(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Drag & Drop */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FileSpreadsheet size={20} color={P.gold} />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.text }}>Bulk Data Ingestion (CSV / Excel)</h3>
        </div>
        <p style={{ color: P.muted, fontSize: 13, margin: '0 0 20px', lineHeight: 1.5 }}>
          Upload high-volume plan walkthrough inquiries, industrial leads, or exhibition contacts directly to your private VPS pipeline.
        </p>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? P.gold : file ? P.green : P.border2}`,
            borderRadius: 14, padding: '48px 24px', textAlign: 'center',
            cursor: 'pointer', transition: 'all 0.25s',
            background: dragging ? 'rgba(245,158,11,0.05)' : file ? 'rgba(34,197,94,0.05)' : '#0f0f12',
          }}
        >
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) setFile(f); }} />
          {file
            ? <>
              <CheckCircle size={40} color={P.green} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: P.text }}>{file.name}</div>
              <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB — Click to change file</div>
            </>
            : <>
              <Upload size={40} color={dragging ? P.gold : P.border2} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: dragging ? P.gold : P.text }}>Drag & Drop CSV / Excel Spreadsheet</div>
              <div style={{ fontSize: 12, color: P.muted, marginTop: 6 }}>or click to browse from your computer</div>
            </>
          }
        </div>

        {file && (
          <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: P.gold, background: 'rgba(245,158,11,0.08)', padding: '6px 12px', borderRadius: 8, border: `1px solid ${P.gold}30` }}>
              <Shield size={14} /> Smart Field Filtering: Only important CRM fields (Name, Phone, Email, Location, Budget, Requirement) are extracted. Any wrong or extra columns are safely ignored.
            </div>
            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
              <button onClick={() => setFile(null)} style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 18px', color: P.muted, cursor: 'pointer', fontSize: 13 }}>Clear</button>
              <button onClick={uploadFile} disabled={uploading} style={{
                background: uploading ? P.card2 : P.gold, border: 'none', borderRadius: 8,
                padding: '9px 24px', color: uploading ? P.text : '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {uploading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                {uploading ? 'Processing & Ingesting…' : 'Ingest Leads to Pipeline'}
              </button>
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: 18, background: 'rgba(34,197,94,0.08)', border: `1px solid ${P.green}40`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontWeight: 700, color: P.green, marginBottom: 8 }}>Ingestion Complete</div>
            <div style={{ display: 'flex', gap: 24, fontSize: 14, flexWrap: 'wrap' }}>
              <span style={{ color: P.text }}><span style={{ color: P.green, fontWeight: 700 }}>{result.inserted || 0}</span> Successfully Added</span>
              <span style={{ color: P.text }}><span style={{ color: P.gold, fontWeight: 700 }}>{result.skipped || 0}</span> Skipped / Empty Rows</span>
              {result.errors?.length > 0 && <span style={{ color: P.text }}><span style={{ color: P.red, fontWeight: 700 }}>{result.errors.length}</span> Errors</span>}
            </div>
          </div>
        )}

        {/* Format guide */}
        <div style={{ marginTop: 20, background: '#0f0f12', borderRadius: 10, padding: 16, border: `1px solid ${P.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: P.muted, letterSpacing: 0.5 }}>IMPORTANT SUPPORTED FIELDS</span>
              <div style={{ fontSize: 11, color: P.muted, marginTop: 2 }}>Upload with any column order or custom names. Unrecognized/extra columns are automatically discarded.</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => downloadTemplate('xlsx')} style={{
                background: 'rgba(245,158,11,0.1)', border: `1px solid ${P.gold}40`, borderRadius: 7, padding: '5px 12px',
                color: P.gold, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600
              }}><Download size={12} /> Excel Template (.xlsx)</button>
              <button onClick={() => downloadTemplate('csv')} style={{
                background: 'none', border: `1px solid ${P.border}`, borderRadius: 7, padding: '5px 12px',
                color: P.muted, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5,
              }}><Download size={12} /> CSV Template</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { key: 'name', label: 'Client / Person Name' },
              { key: 'phone', label: 'Mobile / WhatsApp' },
              { key: 'email', label: 'Email ID' },
              { key: 'city', label: 'City / Location' },
              { key: 'state', label: 'State' },
              { key: 'budget', label: 'Est. Budget' },
              { key: 'requirement', label: 'Walkthrough Requirement' },
              { key: 'source', label: 'Source' },
              { key: 'status', label: 'Status' },
              { key: 'priority', label: 'Priority' },
              { key: 'notes', label: 'Technical Notes' },
              { key: 'follow_up_date', label: 'Follow-up Date' },
              { key: 'assigned_to', label: 'Assigned Engineer' },
            ].map(col => (
              <span key={col.key} style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: P.gold, fontSize: 11, padding: '4px 9px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{col.key}</span>
                <span style={{ color: P.muted, fontSize: 10 }}>({col.label})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Entry */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 28 }}>
        <button onClick={() => setManualForm(f => !f)} style={{
          background: 'none', border: 'none', color: P.text, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: 0,
        }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Direct Single Ingestion Form</h3>
          <ChevronDown size={16} color={P.muted} style={{ transform: manualForm ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: 'auto' }} />
        </button>

        {manualForm && (
          <form onSubmit={submitManual} style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="plan / Enterprise Name" required><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Jindal Steel" /></Field>
            <Field label="Phone Number"><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" /></Field>
            <Field label="Email Address"><input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} /></Field>
            <Field label="Source"><select style={selectStyle} value={form.source} onChange={e => set('source', e.target.value)}>{SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></Field>
            <Field label="Pipeline Status"><select style={selectStyle} value={form.status} onChange={e => set('status', e.target.value)}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}</select></Field>
            <Field label="Priority"><select style={selectStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>{PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}</select></Field>
            <Field label="City / Region"><input style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} /></Field>
            <Field label="State"><input style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} /></Field>
            <Field label="Project Budget Scope"><input style={inputStyle} value={form.budget} onChange={e => set('budget', e.target.value)} /></Field>
            <Field label="Scheduled Follow-up Date"><input style={inputStyle} type="date" value={form.follow_up_date} onChange={e => set('follow_up_date', e.target.value)} /></Field>
            <Field label="Assigned Engineer"><input style={inputStyle} value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} /></Field>
            <Field label="Walkthrough Requirement"><input style={inputStyle} value={form.requirement} onChange={e => set('requirement', e.target.value)} placeholder="e.g. Drone + Lidar 3D Scan" /></Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Technical Notes"><textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} /></Field>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={saving} style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '10px 28px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {saving ? 'Adding…' : 'Ingest Lead'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── Tab: Call Studio (Integrated WebRTC Telephony & VPS Recording) ────────────
const TabCallStudio = ({ initialLead, addToast, isAdmin, isAgent }) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(initialLead || null);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'active' | 'ended'
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callLogs, setCallLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [callNotes, setCallNotes] = useState('');
  const [activeTab, setActiveTab] = useState('dialer'); // 'dialer' | 'logs'
  const [bars, setBars] = useState(Array(24).fill(4));

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const roomIdRef = useRef(null);

  const canDelete = isAdmin || !isAgent;

  const deleteCallRecording = async (callId) => {
    if (!window.confirm('Delete this WebRTC call audio recording from VPS storage?')) return;
    try {
      await apiFetch(`/calls/${callId}/recording`, { method: 'DELETE' });
      addToast('Call audio recording deleted from VPS', 'success');
      loadCallLogs();
    } catch (err) {
      addToast(err.message || 'Failed to delete recording', 'error');
    }
  };

  const deleteCallLog = async (callId) => {
    if (!window.confirm('Permanently delete this call log record and its audio from VPS?')) return;
    try {
      await apiFetch(`/calls/${callId}`, { method: 'DELETE' });
      addToast('Call log deleted', 'success');
      loadCallLogs();
    } catch (err) {
      addToast(err.message || 'Failed to delete call log', 'error');
    }
  };

  useEffect(() => {
    if (initialLead) setSelectedLead(initialLead);
  }, [initialLead]);

  // Load leads for dialer
  useEffect(() => {
    apiFetch('/leads?limit=150').then(d => {
      if (d?.leads) setLeads(d.leads);
    }).catch(() => { });
    loadCallLogs();
  }, []);

  const loadCallLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await apiFetch('/calls?limit=50');
      setCallLogs(data?.calls || []);
    } catch {
      // Non-blocking
    } finally {
      setLogsLoading(false);
    }
  };

  // Start outbound WebRTC call with auto-recording
  const startCall = async () => {
    if (!selectedLead) {
      addToast('Please select a plan/lead to dial.', 'error');
      return;
    }
    setCallState('calling');
    setCallSeconds(0);
    chunksRef.current = [];

    try {
      // 1. Get audio input from browser microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      localStreamRef.current = stream;

      // 2. Set up Web Audio Analyser for live frequency visualization
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const sourceNode = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        sourceNode.connect(analyser);
        analyserRef.current = { audioCtx, analyser };

        const updateBars = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          setBars(Array.from({ length: 24 }, (_, i) => Math.max(4, (dataArray[i] || 0) / 255 * 52)));
          animRef.current = requestAnimationFrame(updateBars);
        };
        updateBars();
      } catch (audioErr) {
        console.warn('Audio visualization unavailable:', audioErr);
      }

      // 3. Set up MediaRecorder for mandatory call recording
      let options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options = MediaRecorder.isTypeSupported('audio/mp4') ? { mimeType: 'audio/mp4' } : {};
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.start(1000); // 1-second chunks
      mediaRecorderRef.current = mediaRecorder;

      // 4. Log call initiation in backend
      const callInit = await apiFetch('/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id || selectedLead._id,
          direction: 'outbound',
          status: 'in-progress',
          duration_seconds: 0,
          notes: `WebRTC call to ${selectedLead.name} (${selectedLead.phone || 'No phone'})`,
        }),
      });
      const callId = callInit?.id;
      setCurrentCallId(callId);

      // 5. Establish WebRTC PeerConnection & Pion signaling
      const roomId = `call-${callId || Date.now()}-${Math.floor(Math.random() * 10000)}`;
      roomIdRef.current = roomId;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      });
      peerRef.current = pc;

      // Add local audio track
      stream.getAudioTracks().forEach(track => pc.addTrack(track, stream));

      // Handle ICE Candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const token = localStorage.getItem('crm_token');
          await fetch('/api/crm/signal/candidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ room_id: roomId, candidate: event.candidate, side: 'offer' })
          }).catch(() => { });
        }
      };

      // Create Offer and dispatch to VPS Pion/Node signaling server
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const token = localStorage.getItem('crm_token');
      await fetch('/api/crm/signal/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ room_id: roomId, sdp: offer })
      });

      // Call is now active
      setCallState('active');
      timerRef.current = setInterval(() => {
        setCallSeconds(s => s + 1);
      }, 1000);

      addToast(`Connected: Calling ${selectedLead.name} (Auto-recording enabled)`, 'info');

    } catch (err) {
      console.error('Telephony error:', err);
      setCallState('idle');
      addToast(`Could not start call: ${err.message || 'Check microphone permission.'}`, 'error');
    }
  };

  // End Call & automatically persist recording directly onto VPS disk
  const endCall = async () => {
    clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (analyserRef.current?.audioCtx) {
      try { analyserRef.current.audioCtx.close(); } catch (_) { }
    }
    setBars(Array(24).fill(4));

    const finalDuration = callSeconds;
    const callIdToSave = currentCallId;
    setCallState('ended');

    // 1. Stop WebRTC PeerConnection
    if (peerRef.current) {
      try { peerRef.current.close(); } catch (_) { }
      peerRef.current = null;
    }

    // 2. Stop Microphone input stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    // 3. Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) { }
    }

    addToast('Call ended. Uploading encrypted recording to VPS storage…', 'info');

    // 4. Upload recording buffer directly to VPS
    setTimeout(async () => {
      try {
        if (chunksRef.current.length > 0 && callIdToSave) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const fd = new FormData();
          fd.append('recording', blob, `call-${callIdToSave}-${Date.now()}.webm`);

          const token = localStorage.getItem('crm_token');
          const recRes = await fetch(`${API}/calls/${callIdToSave}/recording`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: fd,
          });
          const recData = await recRes.json();

          // Update call log duration & final notes
          await apiFetch(`/calls/${callIdToSave}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'completed',
              duration_seconds: finalDuration,
              notes: callNotes ? `${callNotes} (Recorded)` : 'WebRTC call recorded directly on VPS.',
            }),
          });

          addToast(`Call recording securely saved on VPS (${fmtDuration(finalDuration)})`, 'success');
        } else if (callIdToSave) {
          await apiFetch(`/calls/${callIdToSave}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'completed',
              duration_seconds: finalDuration,
              notes: callNotes || 'Call completed.',
            }),
          });
        }
      } catch (err) {
        console.error('Failed to save call recording:', err);
        addToast('Failed to upload recording to VPS: ' + err.message, 'error');
      } finally {
        setCallState('idle');
        setCallSeconds(0);
        setCurrentCallId(null);
        setCallNotes('');
        loadCallLogs();
      }
    }, 1200);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Selector / Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${P.border}`, paddingBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('dialer')}
            style={{
              background: activeTab === 'dialer' ? `${P.gold}20` : 'transparent',
              color: activeTab === 'dialer' ? P.gold : P.muted,
              border: `1px solid ${activeTab === 'dialer' ? P.gold : P.border}`,
              borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <PhoneCall size={14} /> VoIP Dialer
          </button>
          <button
            onClick={() => { setActiveTab('logs'); loadCallLogs(); }}
            style={{
              background: activeTab === 'logs' ? `${P.gold}20` : 'transparent',
              color: activeTab === 'logs' ? P.gold : P.muted,
              border: `1px solid ${activeTab === 'logs' ? P.gold : P.border}`,
              borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Radio size={14} /> Call Logs & VPS Recordings ({callLogs.length})
          </button>
        </div>

        {/* VPS Audio Storage Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: `1px solid ${P.green}30`, borderRadius: 20, padding: '4px 12px' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: P.green }} />
          <span style={{ fontSize: 11, color: P.green, fontWeight: 600 }}>VPS Media Server Active</span>
        </div>
      </div>

      {activeTab === 'dialer' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: 24 }}>
          {/* Dialer Console */}
          <div style={{
            background: P.card, border: `1px solid ${P.border}`, borderRadius: 16,
            padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
            boxShadow: '0 15px 35px rgba(0,0,0,0.4)', position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Headphones size={18} color={P.gold} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text }}>Industrial VoIP Softphone</h3>
              </div>
              <span style={{ fontSize: 11, background: `${P.gold}20`, color: P.gold, padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                WebRTC · Opus Codec
              </span>
            </div>

            {/* Target Lead Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, color: P.muted, fontWeight: 600 }}>SELECT CALL TARGET</label>
              <select
                disabled={callState === 'calling' || callState === 'active'}
                value={selectedLead ? (selectedLead.id || selectedLead._id) : ''}
                onChange={e => {
                  const lead = leads.find(l => String(l.id || l._id) === e.target.value);
                  setSelectedLead(lead || null);
                }}
                style={{
                  ...selectStyle,
                  padding: '11px 14px', fontSize: 13, background: P.card2,
                  borderColor: selectedLead ? P.gold : P.border
                }}
              >
                <option value="">-- Select plan Lead ({leads.length} available) --</option>
                {leads.map(l => (
                  <option key={l.id || l._id} value={l.id || l._id}>
                    {l.name} — {l.phone || 'No direct phone'} ({l.city || 'plan Location'})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Preview Banner */}
            {selectedLead && (
              <div style={{
                background: '#0c0c0e', border: `1px solid ${P.border}`, borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', background: `${P.gold}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ color: P.gold, fontWeight: 800, fontSize: 16 }}>
                    {selectedLead.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedLead.name}
                  </div>
                  <div style={{ fontSize: 12, color: P.muted }}>
                    {selectedLead.phone || 'No phone'} · {selectedLead.city || 'Industrial Region'}
                  </div>
                </div>
              </div>
            )}

            {/* Live Audio Frequency Waveform */}
            <div style={{
              background: '#0a0a0c', border: `1px solid ${P.border}`, borderRadius: 12,
              padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 16, minHeight: 140
            }}>
              {/* Animated Bars */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 55 }}>
                {bars.map((h, i) => (
                  <div key={i} style={{
                    width: 4, height: `${h}px`, borderRadius: 2,
                    background: callState === 'active' ? (isMuted ? P.red : P.green) : P.border2,
                    transition: callState === 'active' ? 'height 0.05s' : 'height 0.3s, background 0.3s'
                  }} />
                ))}
              </div>

              {/* Call Timer / Status */}
              <div style={{ textAlign: 'center' }}>
                {callState === 'idle' && (
                  <span style={{ fontSize: 13, color: P.muted }}>Ready for outbound call</span>
                )}
                {callState === 'calling' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: P.gold }}>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Establishing WebRTC Audio Link…</span>
                  </div>
                )}
                {callState === 'active' && (
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: P.green, fontFamily: 'monospace', letterSpacing: 2 }}>
                      {fmtDuration(callSeconds)}
                    </div>
                    <div style={{ fontSize: 11, color: P.muted, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: P.red, animation: 'pulse 1s infinite' }} />
                      RECORDING TO PRIVATE VPS STORAGE
                    </div>
                  </div>
                )}
                {callState === 'ended' && (
                  <span style={{ fontSize: 13, color: P.gold, fontWeight: 600 }}>Finalizing call file & saving…</span>
                )}
              </div>
            </div>

            {/* Call Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              {callState === 'idle' && (
                <button
                  disabled={!selectedLead}
                  onClick={startCall}
                  style={{
                    background: selectedLead ? P.green : P.card2,
                    color: selectedLead ? '#000' : P.muted,
                    border: 'none', borderRadius: 50, height: 56, padding: '0 32px',
                    fontWeight: 800, fontSize: 15, cursor: selectedLead ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: selectedLead ? '0 8px 25px rgba(34,197,94,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <PhoneCall size={20} /> Start Walkthrough Call
                </button>
              )}

              {callState === 'active' && (
                <>
                  <button
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute' : 'Mute'}
                    style={{
                      background: isMuted ? P.red : P.card2,
                      border: `1px solid ${isMuted ? P.red : P.border}`,
                      borderRadius: '50%', width: 50, height: 50,
                      color: isMuted ? '#fff' : P.text,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button
                    onClick={endCall}
                    style={{
                      background: P.red, color: '#fff',
                      border: 'none', borderRadius: 50, height: 56, padding: '0 32px',
                      fontWeight: 800, fontSize: 15, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: '0 8px 25px rgba(239,68,68,0.4)',
                    }}
                  >
                    <PhoneOff size={20} /> End Call & Save
                  </button>
                </>
              )}
            </div>

            {/* Call Notes Input */}
            {callState === 'active' && (
              <div style={{ marginTop: 4 }}>
                <Field label="Live Call Notes / Disposition">
                  <textarea
                    rows={2}
                    value={callNotes}
                    onChange={e => setCallNotes(e.target.value)}
                    placeholder="Enter meeting notes, client requirements, next steps..."
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* Architecture / Storage Compliance Note */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: P.gold, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} /> VPS Storage & Data Sovereignty Guarantee
              </h4>
              <p style={{ fontSize: 13, color: P.muted, lineHeight: 1.6, margin: '0 0 12px' }}>
                In accordance with Walk The plan security protocols:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: P.text, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>No 3rd-Party Clouds:</strong> Audio streams and recorded files bypass AWS, Google Cloud, and external telecom APIs.</li>
                <li><strong>Private VPS Storage:</strong> Call audio records in raw WebM/Opus and saves strictly to your server at <code>/uploads/crm-calls/</code>.</li>
                <li><strong>Direct In-Browser Audio:</strong> WebRTC establishes browser media streams directly with end-to-end local hardware access.</li>
                <li><strong>Mandatory Audit Trail:</strong> Every session duration, caller identity, and timestamp is permanently recorded.</li>
              </ul>
            </div>

            {/* Recent Quick Recordings */}
            <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: P.text }}>Latest VPS Call Recordings</h4>
                <button onClick={loadCallLogs} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer', fontSize: 12 }}>
                  Refresh
                </button>
              </div>

              {callLogs.filter(c => c.recording_url).slice(0, 4).length === 0 ? (
                <div style={{ fontSize: 12, color: P.muted, textAlign: 'center', padding: '30px 0' }}>
                  No call recordings stored yet. Make a call to test auto-recording.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {callLogs.filter(c => c.recording_url).slice(0, 4).map(c => (
                    <div key={c.id} style={{
                      background: P.card2, border: `1px solid ${P.border}`, borderRadius: 10,
                      padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: P.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.lead_name || 'Industrial Lead #' + c.lead_id}
                        </div>
                        <div style={{ fontSize: 11, color: P.muted }}>
                          {fmtDuration(c.duration_seconds || 0)} · {fmtDate(c.created_at)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <audio controls src={c.recording_url} style={{ height: 32, maxWidth: 170 }} />
                        {canDelete && (
                          <button
                            onClick={() => deleteCallRecording(c.id)}
                            title="Delete audio recording from VPS"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.red, padding: 4, display: 'inline-flex' }}
                          >
                            <VolumeX size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Call Logs Table */
        <div>
          <TableWrap>
            <thead>
              <tr>
                {['ID', 'Lead / Enterprise', 'Phone', 'Direction', 'Duration', 'Caller', 'Status', 'Recording (VPS Hosted)', 'Date', ...(canDelete ? ['Actions'] : [])].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={canDelete ? 10 : 9} />)
              ) : callLogs.length === 0 ? (
                <tr>
                  <td colSpan={canDelete ? 10 : 9}>
                    <EmptyState icon={PhoneCall} title="No calls recorded yet" sub="Use the VoIP dialer above to place plan inquiry calls" />
                  </td>
                </tr>
              ) : (
                callLogs.map(c => (
                  <tr key={c.id} style={{ transition: 'background 0.15s' }}>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>#{c.id}</span></Td>
                    <Td><span style={{ fontWeight: 600 }}>{c.lead_name || 'Lead #' + c.lead_id}</span></Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{c.lead_phone || '—'}</span></Td>
                    <Td>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600,
                        background: c.direction === 'outbound' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                        color: c.direction === 'outbound' ? P.blue : P.green
                      }}>
                        {c.direction?.toUpperCase() || 'OUTBOUND'}
                      </span>
                    </Td>
                    <Td><span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{fmtDuration(c.duration_seconds || 0)}</span></Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{c.caller_name || 'Agent'}</span></Td>
                    <Td>
                      <span style={{ color: c.status === 'completed' ? P.green : P.gold, fontSize: 12, fontWeight: 600 }}>
                        {c.status || 'completed'}
                      </span>
                    </Td>
                    <Td>
                      {c.recording_url ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <audio controls src={c.recording_url} style={{ height: 30, maxWidth: 180 }} />
                          <a
                            href={c.recording_url}
                            download
                            title="Download VPS Audio"
                            style={{ color: P.gold, padding: 4, display: 'inline-flex' }}
                          >
                            <Download size={14} />
                          </a>
                          {canDelete && (
                            <button
                              onClick={() => deleteCallRecording(c.id)}
                              title="Delete recording from VPS disk"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.red, padding: 4, display: 'inline-flex' }}
                            >
                              <VolumeX size={15} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: P.muted, fontSize: 11 }}>No media</span>
                      )}
                    </Td>
                    <Td><span style={{ color: P.muted, fontSize: 11 }}>{fmtDate(c.created_at)}</span></Td>
                    {canDelete && (
                      <Td>
                        <button
                          onClick={() => deleteCallLog(c.id)}
                          title="Delete call log and recording"
                          style={{
                            background: 'none', border: `1px solid ${P.red}40`, borderRadius: 6,
                            color: P.red, padding: '4px 8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </Td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  );
};

// ─── Tab: Audio Notes ─────────────────────────────────────────────────────────
const TabAudio = ({ selectedLead, setSelectedLead, addToast, isAdmin, isAgent }) => {
  const [recordings, setRecordings] = useState([]);
  const [selectedAudioIds, setSelectedAudioIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bars, setBars] = useState(Array(20).fill(4));
  const [uploadFile, setUploadFile] = useState(null);
  const [leadOptions, setLeadOptions] = useState([]);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animRef = useRef(null);
  const fileRef = useRef();

  const canDelete = isAdmin || !isAgent;

  useEffect(() => {
    apiFetch('/leads?limit=150').then(d => {
      if (d?.leads) setLeadOptions(d.leads);
    }).catch(() => { });
  }, []);

  const loadRecordings = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedLead) {
        const id = selectedLead.id || selectedLead._id;
        const data = await apiFetch(`/leads/${id}/audio`);
        setRecordings(data.recordings || data || []);
      } else {
        const data = await apiFetch('/audio');
        setRecordings(Array.isArray(data) ? data : []);
      }
    } catch { setRecordings([]); } finally { setLoading(false); }
  }, [selectedLead]);

  useEffect(() => { loadRecordings(); }, [loadRecordings]);

  const toggleSelectAudio = (id) => {
    setSelectedAudioIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAllAudio = () => {
    if (selectedAudioIds.length === recordings.length) {
      setSelectedAudioIds([]);
    } else {
      setSelectedAudioIds(recordings.map(r => r.id));
    }
  };

  const bulkDeleteAudio = async () => {
    if (selectedAudioIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedAudioIds.length} audio notes from VPS disk?`)) return;
    try {
      const res = await apiFetch('/audio/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedAudioIds }),
      });
      addToast(res.message || `Deleted ${selectedAudioIds.length} audio files`, 'success');
      setSelectedAudioIds([]);
      loadRecordings();
    } catch (err) {
      addToast(err.message || 'Bulk delete failed', 'error');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        ctx.close();
        cancelAnimationFrame(animRef.current);
        setBars(Array(20).fill(4));
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true); setPaused(false); setSeconds(0); setAudioURL(null); setAudioBlob(null);

      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

      const animate = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        setBars(Array.from({ length: 20 }, (_, i) => Math.max(4, (data[i] || 0) / 255 * 60)));
        animRef.current = requestAnimationFrame(animate);
      };
      animate();
    } catch { addToast('Microphone access denied', 'error'); }
  };

  const stopRecording = () => {
    if (mediaRef.current && recording) {
      mediaRef.current.stop();
      clearInterval(timerRef.current);
      setRecording(false); setPaused(false);
    }
  };

  const pauseRecording = () => {
    if (!mediaRef.current) return;
    if (paused) { mediaRef.current.resume(); setPaused(false); timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000); }
    else { mediaRef.current.pause(); setPaused(true); clearInterval(timerRef.current); }
  };

  const uploadRecording = async () => {
    if (!audioBlob || !selectedLead) { addToast('No recording to upload', 'error'); return; }
    setUploading(true);
    const fd = new FormData();
    const id = selectedLead.id || selectedLead._id;
    fd.append('audio', audioBlob, `recording-${Date.now()}.webm`);
    fd.append('lead_id', id);
    try {
      const token = localStorage.getItem('crm_token');
      await fetch(`${API}/leads/${id}/audio`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      addToast('Audio note securely saved to VPS storage!', 'success');
      setAudioURL(null); setAudioBlob(null); setSeconds(0);
      loadRecordings();
    } catch { addToast('Upload failed', 'error'); } finally { setUploading(false); }
  };

  const uploadExistingFile = async () => {
    if (!uploadFile || !selectedLead) return;
    setUploading(true);
    const fd = new FormData();
    const id = selectedLead.id || selectedLead._id;
    fd.append('audio', uploadFile);
    fd.append('lead_id', id);
    try {
      const token = localStorage.getItem('crm_token');
      await fetch(`${API}/leads/${id}/audio`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      addToast('Audio file uploaded to VPS!', 'success');
      setUploadFile(null);
      loadRecordings();
    } catch { addToast('Upload failed', 'error'); } finally { setUploading(false); }
  };

  const deleteRecording = async (recId, name = '') => {
    if (!window.confirm(`Delete audio recording${name ? ` for "${name}"` : ''} from VPS storage?`)) return;
    try {
      await apiFetch(`/audio/${recId}`, { method: 'DELETE' });
      addToast('Audio note deleted from VPS storage', 'success');
      loadRecordings();
    } catch (err) { addToast(err.message || 'Delete failed', 'error'); }
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Lead selector */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: P.text }}>Target plan Ingestion Record</h3>
        {selectedLead ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${P.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: P.gold, fontWeight: 800, fontSize: 18 }}>{selectedLead.name?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: P.text }}>{selectedLead.name}</div>
              <div style={{ fontSize: 12, color: P.muted }}>{selectedLead.phone} · {selectedLead.email}</div>
            </div>
            <button onClick={() => { setSelectedLead(null); setSelectedAudioIds([]); }} style={{ marginLeft: 'auto', background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 14px', color: P.muted, cursor: 'pointer', fontSize: 12 }}>
              View All Audio Memos
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ color: P.muted, fontSize: 13 }}>
              Select an industrial client to record or upload plan site audio notes:
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value=""
                onChange={e => {
                  const l = leadOptions.find(x => String(x.id || x._id) === e.target.value);
                  if (l) setSelectedLead(l);
                }}
                style={{
                  background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8,
                  padding: '10px 14px', color: P.text, fontSize: 13, minWidth: 320, cursor: 'pointer'
                }}
              >
                <option value="">-- Choose plan / Client ({leadOptions.length} available) --</option>
                {leadOptions.map(l => (
                  <option key={l.id || l._id} value={l.id || l._id}>
                    {l.name} — {l.phone || l.email || 'No contact'} ({l.city || 'Lead'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── When No Specific Lead Selected: Show All VPS Site Audio Notes ── */}
      {!selectedLead && (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: P.text }}>
                All VPS Site Audio Notes ({recordings.length})
              </h3>
              <div style={{ fontSize: 12, color: P.muted }}>
                Field inspection memos and client voice notes stored directly on VPS storage
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {canDelete && selectedAudioIds.length > 0 && (
                <button
                  onClick={bulkDeleteAudio}
                  style={{
                    background: `${P.red}20`, border: `1px solid ${P.red}60`, color: P.red,
                    borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={13} /> Delete Selected ({selectedAudioIds.length})
                </button>
              )}
              <button
                onClick={loadRecordings}
                style={{ background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '6px 12px', color: P.muted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ color: P.muted, fontSize: 13, padding: 20 }}>Loading audio recordings…</div>
          ) : recordings.length === 0 ? (
            <EmptyState icon={Volume2} title="No site audio notes stored" sub="Select a client above to record or upload voice inspection notes" />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  {canDelete && (
                    <Th style={{ width: 36, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={recordings.length > 0 && selectedAudioIds.length === recordings.length}
                        onChange={toggleSelectAllAudio}
                        style={{ cursor: 'pointer', accentColor: P.gold }}
                      />
                    </Th>
                  )}
                  {['Lead / Enterprise', 'Contact Phone', 'Audio Note (VPS Hosted)', 'Date Recorded', ...(canDelete ? ['Actions'] : [])].map(h => <Th key={h}>{h}</Th>)}
                </tr>
              </thead>
              <tbody>
                {recordings.map((rec, i) => (
                  <tr key={rec.id || i} style={{ transition: 'background 0.15s' }}>
                    {canDelete && (
                      <Td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedAudioIds.includes(rec.id)}
                          onChange={() => toggleSelectAudio(rec.id)}
                          style={{ cursor: 'pointer', accentColor: P.gold }}
                        />
                      </Td>
                    )}
                    <Td>
                      <div style={{ fontWeight: 600, color: P.text }}>{rec.lead_name || rec.name || `Lead #${rec.lead_id || rec.id}`}</div>
                    </Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{rec.lead_phone || '—'}</span></Td>
                    <Td>
                      {rec.url ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <audio controls src={rec.url} style={{ height: 32, maxWidth: 220 }} />
                          <a href={rec.url} download title="Download Audio" style={{ color: P.gold, display: 'inline-flex' }}>
                            <Download size={14} />
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: P.muted, fontSize: 11 }}>No media URL</span>
                      )}
                    </Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{fmtDate(rec.created_at || rec.createdAt)}</span></Td>
                    {canDelete && (
                      <Td>
                        <button
                          onClick={() => deleteRecording(rec.id, rec.lead_name || rec.name)}
                          title="Delete audio note from VPS"
                          style={{
                            background: 'none', border: `1px solid ${P.red}40`, borderRadius: 6,
                            color: P.red, padding: '4px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600
                          }}
                        >
                          <Trash2 size={13} /> Delete Audio
                        </button>
                      </Td>
                    )}
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      )}

      {/* ── When A Lead Is Selected: Record & View Notes For This Lead ── */}
      {selectedLead && (
        <>
          {/* Recorder */}
          <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 28, textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 700, color: P.text }}>Site Inspection Voice Memo</h3>

            {/* Waveform */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, height: 70, marginBottom: 20 }}>
              {bars.map((h, i) => (
                <div key={i} style={{
                  width: 5, height: `${h}px`, borderRadius: 3,
                  background: recording && !paused ? P.gold : P.border2,
                  transition: recording ? 'height 0.05s' : 'height 0.3s, background 0.3s',
                }} />
              ))}
            </div>

            {/* Timer */}
            <div style={{ fontSize: 36, fontWeight: 800, color: recording ? P.gold : P.muted, letterSpacing: 2, fontFamily: 'monospace', marginBottom: 24 }}>
              {fmt(seconds)}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              {!recording && !audioURL && (
                <button onClick={startRecording} style={{
                  background: P.gold, border: 'none', borderRadius: 50, width: 64, height: 64,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <Mic size={26} color="#000" />
                </button>
              )}
              {recording && (
                <>
                  <button onClick={pauseRecording} style={{ background: paused ? P.gold : P.card2, border: `1px solid ${P.border}`, borderRadius: 50, width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    {paused ? <Play size={22} color="#000" /> : <Pause size={22} color={P.text} />}
                  </button>
                  <button onClick={stopRecording} style={{ background: P.red, border: 'none', borderRadius: 50, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Square size={24} color="#fff" />
                  </button>
                </>
              )}
              {audioURL && (
                <>
                  <audio controls src={audioURL} style={{ width: '100%', maxWidth: 380, marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', width: '100%' }}>
                    <button onClick={() => { setAudioURL(null); setAudioBlob(null); setSeconds(0); }} style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 18px', color: P.muted, cursor: 'pointer', fontSize: 13 }}>Discard</button>
                    <button onClick={uploadRecording} disabled={uploading} style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '9px 24px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      {uploading ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={14} />}
                      {uploading ? 'Uploading…' : 'Save to VPS'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upload existing file */}
          <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: P.text }}>Or Upload External Voice Audio File</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8, padding: '9px 16px', color: P.text, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <FileText size={14} color={P.muted} />
                {uploadFile ? uploadFile.name : 'Choose audio file…'}
                <input ref={fileRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => setUploadFile(e.target.files[0])} />
              </label>
              {uploadFile && (
                <button onClick={uploadExistingFile} disabled={uploading} style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '9px 20px', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  {uploading ? 'Uploading…' : 'Save to VPS'}
                </button>
              )}
            </div>
          </div>

          {/* Recordings list for selected lead */}
          <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: P.text }}>Recordings for {selectedLead.name}</h3>
              <button onClick={loadRecordings} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}><RefreshCw size={13} /> Refresh</button>
            </div>
            {loading
              ? <div style={{ color: P.muted, fontSize: 13 }}>Loading…</div>
              : recordings.length === 0
                ? <EmptyState icon={Volume2} title="No recordings yet" sub="Record or upload voice notes above" />
                : recordings.map((rec, i) => (
                  <div key={rec.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < recordings.length - 1 ? `1px solid ${P.border}22` : 'none' }}>
                    <Volume2 size={16} color={P.gold} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: P.text }}>{rec.name || `Recording ${i + 1}`}</div>
                      <div style={{ fontSize: 11, color: P.muted }}>{fmtDate(rec.created_at || rec.createdAt)}</div>
                    </div>
                    {rec.url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <audio controls src={rec.url} style={{ height: 32, maxWidth: 220 }} />
                        <a href={rec.url} download title="Download Audio" style={{ color: P.gold, display: 'inline-flex' }}>
                          <Download size={14} />
                        </a>
                      </div>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteRecording(rec.id || rec._id, selectedLead.name)}
                        title="Delete audio note from VPS"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.red, padding: 4 }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))
            }
          </div>
        </>
      )}
    </div>
  );
};

// ─── Tab: Human Resources ───────────────────────────────────────────────────
const TabHR = ({ addToast, onRegisterEmployee, activeSubTab = 'headcount' }) => {
  const [hrData, setHrData] = useState({ totalEmployees: 0, departmentBreakdown: {}, employees: [] });
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('all');

  const loadHR = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/hr/stats');
      setHrData(data || { totalEmployees: 0, departmentBreakdown: {}, employees: [] });
    } catch (err) {
      addToast('Failed to load HR stats: ' + (err.message || 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadHR(); }, [loadHR]);

  const bd = hrData.departmentBreakdown || {};

  const filteredEmployees = (hrData.employees || []).filter(e => {
    if (deptFilter === 'all') return true;
    const d = (e.department || '').toLowerCase();
    return d.includes(deptFilter.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{
        background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.gold, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Department 04
            </span>
            <span style={{ background: 'rgba(16,185,129,0.15)', color: P.green, border: `1px solid ${P.green}30`, borderRadius: 12, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
              Live Telemetry
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: P.text }}>
            Human Resources — {activeSubTab === 'roster' ? 'Personnel Roster' : 'Headcount Telemetry'}
          </h2>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>
            Total workforce distribution, active organizational headcount, and department roster
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={loadHR}
            style={{
              background: 'none', border: `1px solid ${P.border}`, borderRadius: 8, padding: '8px 14px',
              color: P.muted, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <RefreshCw size={13} /> Refresh HR
          </button>
          {onRegisterEmployee && (
            <button
              onClick={onRegisterEmployee}
              style={{
                background: P.gold, border: 'none', borderRadius: 8, padding: '8px 18px',
                color: '#000', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <UserPlus size={13} /> Provision Staff Account
            </button>
          )}
        </div>
      </div>

      {/* Headcount Breakdown Cards (As requested by Client) */}
      {(activeSubTab === 'headcount' || !activeSubTab) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total Current Employees', count: hrData.totalEmployees || 0, icon: Users, color: P.gold, deptKey: 'all' },
            { label: 'Sales Department', count: bd.sales || 0, icon: TrendingUp, color: '#3b82f6', deptKey: 'sales' },
            { label: 'Marketing Department', count: bd.marketing || 0, icon: Eye, color: '#a855f7', deptKey: 'marketing' },
            { label: 'Operations Department', count: bd.operations || 0, icon: Activity, color: '#06b6d4', deptKey: 'operations' },
            { label: 'HR Department', count: bd.hr || 0, icon: Shield, color: '#10b981', deptKey: 'hr' },
            { label: 'Finance Department', count: bd.finance || 0, icon: DollarSign, color: '#eab308', deptKey: 'finance' },
          ].map((c, i) => {
            const isSelected = deptFilter === c.deptKey;
            return (
              <div
                key={i}
                onClick={() => setDeptFilter(c.deptKey)}
                style={{
                  background: P.card,
                  border: `1px solid ${isSelected ? c.color : P.border}`,
                  borderRadius: 14, padding: 18, cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? `0 0 16px ${c.color}25` : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: isSelected ? c.color : P.muted, fontWeight: 600 }}>{c.label}</span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={16} color={c.color} />
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: P.text, lineHeight: 1 }}>
                  {loading ? '…' : c.count}
                </div>
                <div style={{ fontSize: 11, color: P.muted, marginTop: 8 }}>
                  {c.deptKey === 'all' ? 'Across all company units' : 'Active personnel'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Staff Roster Table */}
      {(activeSubTab === 'roster' || !activeSubTab) && (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: P.text }}>
                Department Personnel Roster ({filteredEmployees.length})
              </h3>
              <div style={{ fontSize: 12, color: P.muted }}>
                Filter by department card above or view company-wide staff directory
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['all', 'sales', 'marketing', 'operations', 'hr', 'finance'].map(d => (
                <button
                  key={d}
                  onClick={() => setDeptFilter(d)}
                  style={{
                    background: deptFilter === d ? `${P.gold}20` : P.card2,
                    border: `1px solid ${deptFilter === d ? P.gold : P.border}`,
                    color: deptFilter === d ? P.gold : P.muted,
                    borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <TableWrap>
            <thead>
              <tr>
                {['Employee Name', 'Department / Division', 'Contact Email', 'Phone', 'Assigned Role', 'Status', 'Joined Date'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon={Users} title="No employees found" sub={`No active personnel found for department: ${deptFilter}`} />
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(e => (
                  <tr key={e.id} style={{ transition: 'background 0.15s' }}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${P.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: P.gold, fontSize: 13 }}>
                          {e.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: P.text }}>{e.name}</div>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span style={{
                        background: 'rgba(255,255,255,0.06)', border: `1px solid ${P.border}`,
                        borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, color: P.text
                      }}>
                        {e.department || 'General'}
                      </span>
                    </Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{e.email}</span></Td>
                    <Td><span style={{ color: P.muted, fontSize: 12 }}>{e.phone || '—'}</span></Td>
                    <Td><RoleBadge role={e.role} /></Td>
                    <Td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: e.is_active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: e.is_active ? P.green : P.red,
                        border: `1px solid ${e.is_active ? P.green : P.red}30`,
                        borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600
                      }}>
                        {e.is_active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {e.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td><span style={{ color: P.muted, fontSize: 11 }}>{fmtDate(e.created_at)}</span></Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableWrap>
        </div>
      )}
    </div>
  );
};

// ─── Tab: Coming Soon Departments (Operations, Finance, Franchise) ───────────
const TabComingSoon = ({ deptKey, subTab }) => {
  const meta = {
    operations: {
      number: '03',
      name: 'Operations Department',
      icon: Activity,
      color: '#06b6d4',
      badge: 'Coming Soon',
      subtitle: subTab === 'calibrations'
        ? 'Physical 1:1 Scale Projector Grid Laser Calibration & Throw Ratio Matrix'
        : subTab === 'roadmap'
          ? 'Operations Rollout Milestones & Equipment Deployment Schedule'
          : 'Walk The Plan 1:1 Scale Physical Projector Studio Infrastructure',
      features: subTab === 'calibrations' ? [
        '1mm = 1px Laser Coordinate Floor Calibration Ratio',
        'Ceiling Projector Array Keystone & Throw Alignment',
        'Physical Walkthrough Boundary Safety Sensor Matrix',
        'Multi-Projector Edge Blending & High Lumen Lumens Output Calibration',
      ] : subTab === 'roadmap' ? [
        'Milestone Q1: High Lumen Ultra Short Throw Studio Testing',
        'Milestone Q2: Dynamic CAD Ingest & Layer Projection Calibration',
        'Milestone Q3: On-Site Architect Experience Booking & Staging Automation',
      ] : [
        'Projection Grid Calibration & Throw Distance Tuning',
        'Physical Wall Model Placement & Staging Workflows',
        'Architectural CAD File Ingest (DWG / DXF / Revit)',
        'On-Site Client Studio Session Booking & Time Slots',
        'Site Hardware Sensor & Projector Health Diagnostics'
      ],
      notice: null,
    },
    finance: {
      number: '05',
      name: 'Finance & Accounts Department',
      icon: DollarSign,
      color: '#eab308',
      badge: 'Coming Soon',
      subtitle: subTab === 'invoicing'
        ? 'Automated GST Tax Invoicing & Razorpay Settlement Reconciliation'
        : 'Token Advance Settlements, Invoicing & Financial Health',
      features: subTab === 'invoicing' ? [
        'Automated B2B GST Invoicing with SAC 9983 Architectural Codes',
        'Client Payment Gateway Webhook Instant Reconciliation',
        'Digital Tax Receipts & TDS Deduction Statement Tracking',
        'Credit Notes & Refund Adjustments Log',
      ] : [
        'Razorpay Payment Gateway Automated Settlement Reconciliation',
        'Token Advance vs Balance Pending Collection Pipeline',
        'Automated GST Invoicing & Client Tax Receipts',
        'Sales Commission & Team Payout Calculations',
        'Studio Revenue Telemetry & Financial Forecasting'
      ],
      notice: null,
    },
    franchise: {
      number: '06',
      name: 'Franchise Partner Portal',
      icon: Briefcase,
      color: '#ec4899',
      badge: 'Sales CRM Only',
      subtitle: subTab === 'policy'
        ? 'Franchise Isolation Policy: Marketing, HR, Finance, and Operations Eliminated'
        : 'Exclusive Sales CRM Pipeline For Authorized Franchise Walk The Plan Studios',
      features: subTab === 'policy' ? [
        'Marketing Module: Eliminated (Handled exclusively by Walk The Plan HQ)',
        'Human Resources: Eliminated (Confidential corporate personnel data)',
        'Finance & Invoicing: Eliminated (HQ automated financial clearing)',
        'Operations Grid: Eliminated (Standardized studio layout specs supplied by HQ)',
        'Sales CRM: 100% Fully Enabled for local lead capture and walkthroughs',
      ] : [
        'Franchise Territory Studio Lead Ingest (Meta Ads & Website)',
        'Localized Walk The Plan 1:1 Experience Center Pipeline',
        'In-Studio Client Booking & Walkthrough Scheduling',
        'VoIP Audio Notes & Site Survey Recordings',
        'Franchise Territory Revenue & Token Reporting'
      ],
      notice: 'Client Policy: Franchise access is strictly restricted to the Sales CRM module. Marketing, Human Resources, Finance, and Operations modules are eliminated for Franchise partners.',
    }
  }[deptKey] || {
    number: 'XX',
    name: 'Department Portal',
    icon: Sparkles,
    color: P.gold,
    badge: 'Coming Soon',
    subtitle: 'Upcoming Portal Module',
    features: ['Modular expansion in progress'],
    notice: null,
  };

  const Icon = meta.icon;

  return (
    <div style={{ maxWidth: 900, margin: '40px auto 0', textAlign: 'center' }}>
      <div style={{
        background: P.card, border: `1px solid ${P.border}`, borderRadius: 20, padding: '48px 36px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 200, background: `${meta.color}15`, filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `${meta.color}15`, border: `1px solid ${meta.color}40`, borderRadius: 30, padding: '4px 14px', marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Department {meta.number}
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: meta.color }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: P.text }}>{meta.badge}</span>
        </div>

        <div style={{ width: 68, height: 68, borderRadius: 18, background: `${meta.color}20`, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <Icon size={32} color={meta.color} />
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 800, color: P.text, margin: '0 0 10px', letterSpacing: -0.5 }}>
          {meta.name}
        </h2>
        <p style={{ fontSize: 14, color: P.muted, maxWidth: 580, margin: '0 auto 30px', lineHeight: 1.6 }}>
          {meta.subtitle}
        </p>

        {meta.notice && (
          <div style={{
            background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.3)',
            borderRadius: 12, padding: '14px 18px', margin: '0 auto 30px', maxWidth: 640,
            textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
            <Shield size={18} color="#ec4899" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: P.text, lineHeight: 1.6 }}>
              <strong style={{ color: '#ec4899' }}>Access Control Policy:</strong> {meta.notice}
            </div>
          </div>
        )}

        <div style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 14, padding: 24, textAlign: 'left', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: P.gold, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>
            Upcoming Capabilities Roadmap
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {meta.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: P.text }}>
                <Clock size={14} color={meta.color} style={{ flexShrink: 0 }} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Marketing Meta & Google Sheets Live Integration ─────────────────────
const TabMarketingIntegration = ({ addToast }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [testing, setTesting] = useState(false);

  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/crm/leads/meta-webhook`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
      addToast('Webhook URL copied to clipboard!', 'success');
    } else {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
      addToast('Google Apps Script code copied to clipboard!', 'success');
    }
  };

  const handleTestLead = async () => {
    setTesting(true);
    try {
      const sample = {
        full_name: 'Aditya Birla (Live Meta Test)',
        phone_number: '+91 98200 12345',
        email: 'aditya.test@walktheplan.com',
        city: 'Mumbai',
        platform: 'ig',
        'what_is_your_floor_plan_status_?': 'Ready CAD Drawing',
        'what_is_your_plot_size_?': '3200 sq.ft Villa',
        ad_name: 'Instagram Video - 1:1 Scale Floor Walk',
        campaign_name: 'Q4 Walkthrough Booking Drive',
        status: 'Hot Lead'
      };

      const res = await fetch('/api/crm/leads/meta-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sample)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Test webhook failed');
      addToast('Success! Live test Meta Lead ingested into CRM database.', 'success');
    } catch (err) {
      addToast('Failed to send test lead: ' + err.message, 'error');
    } finally {
      setTesting(false);
    }
  };

  const sampleAppsScript = `// Walk The Plan CRM — Google Sheets Live Sync Script
// Paste this inside Extensions > Apps Script in your Google Sheet
function onEditTrigger(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row = e.range.getRow();
  if (row <= 1) return; // Skip headers

  var values = sheet.getRange(row, 1, 1, 8).getValues()[0];
  var payload = {
    full_name: values[0] || 'Sheet Lead',
    phone_number: String(values[1] || ''),
    email: values[2] || '',
    city: values[3] || 'India',
    platform: 'meta_sheet',
    'what_is_your_floor_plan_status_?': values[4] || 'Pending',
    'what_is_your_plot_size_?': values[5] || 'Residential',
    ad_name: values[6] || 'Google Sheet Live Sync',
    campaign_name: values[7] || 'Meta Ad Manager Live Sync',
    status: 'Hot Lead'
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch("${webhookUrl}", options);
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{
        background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: '24px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Department 02 Integration
            </span>
            <span style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 12, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>
              Live Webhook Active
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: P.text }}>
            Meta Ads Manager & Google Sheets Webhook Gateway
          </h2>
          <div style={{ fontSize: 13, color: P.muted, marginTop: 4 }}>
            Direct real-time HTTP ingestion endpoint for Meta Lead Ads, Zapier, Make.com, and live Google Sheets
          </div>
        </div>
        <button
          onClick={handleTestLead}
          disabled={testing}
          style={{
            background: 'rgba(168,85,247,0.18)', border: '1px solid #c084fc', borderRadius: 8,
            color: '#c084fc', fontWeight: 700, fontSize: 13, padding: '10px 18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.15s'
          }}
        >
          <Zap size={15} /> {testing ? 'Ingesting Test Lead…' : 'Simulate Incoming Meta Lead'}
        </button>
      </div>

      {/* Webhook Endpoint Box */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(168,85,247,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Link size={18} color="#c084fc" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>Live Webhook Listener URL</div>
            <div style={{ fontSize: 12, color: P.muted }}>Provide this URL to Meta Ads Manager or Google Apps Script</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            flex: 1, background: '#09090b', border: `1px solid ${P.border}`, borderRadius: 8,
            padding: '10px 14px', fontFamily: 'monospace', fontSize: 13, color: '#c084fc', overflowX: 'auto', whiteSpace: 'nowrap'
          }}>
            {webhookUrl}
          </div>
          <button
            onClick={() => copyToClipboard(webhookUrl, 'url')}
            style={{
              background: copiedUrl ? P.green : P.card2, border: `1px solid ${copiedUrl ? P.green : P.border}`,
              color: copiedUrl ? '#000' : P.text, borderRadius: 8, padding: '10px 18px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0
            }}
          >
            {copiedUrl ? <Check size={14} /> : <Copy size={14} />} {copiedUrl ? 'Copied!' : 'Copy URL'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 18 }}>
          <div style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: P.muted, fontWeight: 600, textTransform: 'uppercase' }}>HTTP Method</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginTop: 4 }}>POST (application/json)</div>
          </div>
          <div style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: P.muted, fontWeight: 600, textTransform: 'uppercase' }}>Verification Token</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.gold, marginTop: 4, fontFamily: 'monospace' }}>walktheplan_meta_secret_2026</div>
          </div>
          <div style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, color: P.muted, fontWeight: 600, textTransform: 'uppercase' }}>Challenge Handshake</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.green, marginTop: 4 }}>hub.challenge Auto-Responder</div>
          </div>
        </div>
      </div>

      {/* Google Sheets Live Sync Guide */}
      <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(34,197,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileSpreadsheet size={18} color={P.green} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>Google Sheets Direct Live Connector</div>
              <div style={{ fontSize: 12, color: P.muted }}>Stream every row inserted into your Google Sheet directly into Walk The Plan CRM</div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(sampleAppsScript, 'script')}
            style={{
              background: copiedScript ? P.green : P.card2, border: `1px solid ${copiedScript ? P.green : P.border}`,
              color: copiedScript ? '#000' : P.text, borderRadius: 8, padding: '8px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {copiedScript ? <Check size={14} /> : <Copy size={14} />} {copiedScript ? 'Copied Code!' : 'Copy Apps Script'}
          </button>
        </div>

        <pre style={{
          background: '#09090b', border: `1px solid ${P.border}`, borderRadius: 10, padding: 16,
          fontSize: 12, color: '#a1a1aa', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.5, margin: 0
        }}>
          {sampleAppsScript}
        </pre>
      </div>
    </div>
  );
};

// ─── RBAC Matrix Definitions ────────────────────────────────────────────────
const RBAC_MATRIX_ROWS = [
  {
    dept: '01) Sales',
    role: 'Sales Executive / Agent',
    badge: 'Full CRM',
    color: P.gold,
    metaLeads: 'Full Access (View, Edit, Stage, Qualify)',
    websiteLeads: 'Full Access (Inquiries & Bookings)',
    voip: 'WebRTC In-Browser VoIP Enabled',
    audio: 'Inspection Voice Notes Active',
    roster: 'View-Only Team List',
    restrictions: 'No access to HR headcount salaries or Finance invoices',
  },
  {
    dept: '02) Marketing',
    role: 'Marketing Lead Analyst',
    badge: 'View-Only',
    color: '#a855f7',
    metaLeads: 'View-Only Stream (FB & IG Leads)',
    websiteLeads: 'Eliminated (Hidden by RBAC)',
    voip: 'Disabled',
    audio: 'Disabled',
    roster: 'Hidden',
    restrictions: 'View-only Meta leads. Cannot edit, delete, or call leads.',
  },
  {
    dept: '03) Operations',
    role: 'Studio Ops Specialist',
    badge: 'Coming Soon',
    color: '#06b6d4',
    metaLeads: 'Coming Soon',
    websiteLeads: 'Coming Soon',
    voip: 'Studio Calibration Audio Mode',
    audio: 'Physical Walkthrough Recordings',
    roster: 'Operations Unit Only',
    restrictions: 'Dedicated strictly to 1:1 projector calibrations & staging.',
  },
  {
    dept: '04) Human Resources',
    role: 'HR Coordinator / Officer',
    badge: 'Staff Roster',
    color: '#10b981',
    metaLeads: 'Eliminated (Hidden by RBAC)',
    websiteLeads: 'Eliminated (Hidden by RBAC)',
    voip: 'Disabled',
    audio: 'Disabled',
    roster: 'Full Management (6 Department Units)',
    restrictions: 'Staff management only. Sales lead data eliminated.',
  },
  {
    dept: '05) Finance',
    role: 'Finance & Invoicing Officer',
    badge: 'Coming Soon',
    color: '#eab308',
    metaLeads: 'Coming Soon',
    websiteLeads: 'Coming Soon',
    voip: 'Disabled',
    audio: 'Disabled',
    roster: 'Payroll Staff Directory',
    restrictions: 'Token advance collections & Razorpay reconciliation.',
  },
  {
    dept: '06) Franchise',
    role: 'Franchise Studio Partner',
    badge: 'Sales CRM Only',
    color: '#ec4899',
    metaLeads: 'Territory Leads Only',
    websiteLeads: 'Studio Appointments Only',
    voip: 'In-Studio Calling Enabled',
    audio: 'Enabled',
    roster: 'Eliminated',
    restrictions: 'Marketing, HR, Finance, Operations modules strictly eliminated.',
  },
  {
    dept: '07) Administration',
    role: 'Global Administrator',
    badge: 'Admin Master',
    color: P.gold,
    metaLeads: 'Full Master Access',
    websiteLeads: 'Full Master Access',
    voip: 'Full Access',
    audio: 'Full Access',
    roster: 'Full Provisioning & Deletion',
    restrictions: 'None. Global administrative control across all 7 departments.',
  },
];

// ─── Tab: Users Management ──────────────────────────────────────────────────
const TabUsers = ({ addToast, currentUser, activeSubTab = 'directory', onSubTabChange }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(activeSubTab === 'register');
  const empty = { name: '', email: '', phone: '', role: 'sales', department: 'Sales', password: '' };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'register') setShowForm(true);
  }, [activeSubTab]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/users');
      setUsers(data?.users || data || []);
    } catch { addToast('Failed to load users', 'error'); } finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (user) => {
    try {
      const nextActive = user.is_active ? 0 : 1;
      await apiFetch(`/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive })
      });
      setUsers(us => us.map(u => (u.id || u._id) === (user.id || user._id) ? { ...u, is_active: nextActive } : u));
      addToast(nextActive ? 'User account activated.' : 'User account deactivated.', 'info');
    } catch (err) { addToast(err.message || 'Failed to update user status', 'error'); }
  };

  const deleteUser = async (user) => {
    const isSelf = currentUser && ((currentUser.id && currentUser.id === user.id) || (currentUser.email && currentUser.email.toLowerCase() === user.email?.toLowerCase()));
    if (isSelf) {
      addToast('Cannot delete your own active administrator account.', 'error');
      return;
    }
    if (!window.confirm(`Permanently delete team member "${user.name}" (${user.email}) from CRM users?`)) return;
    try {
      const res = await apiFetch(`/users/${user.id || user._id}`, { method: 'DELETE' });
      addToast(res.message || 'User deleted successfully', 'success');
      setUsers(us => us.filter(u => (u.id || u._id) !== (user.id || user._id)));
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { addToast('Name, email, and password required', 'error'); return; }
    setSaving(true);
    try {
      await apiFetch('/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      addToast('Team member created successfully!', 'success');
      setForm(empty); setShowForm(false); load();
      if (onSubTabChange) onSubTabChange('directory');
    } catch (err) { addToast(err.message || 'Failed to create user', 'error'); } finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Notice Banner */}
      <div style={{
        background: 'rgba(245,158,11,0.08)', border: `1px solid ${P.gold}40`,
        borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12
      }}>
        <Shield size={18} color={P.gold} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: P.text, lineHeight: 1.5 }}>
          <strong>User Access Management:</strong> Administrators can provision accounts, manage permissions, toggle active status, or permanently delete user records.
        </span>
      </div>

      {/* RBAC Matrix Subtab View */}
      {activeSubTab === 'matrix' ? (
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 16, padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: P.text }}>
              Organizational RBAC Access Control Matrix (7 Units)
            </h3>
            <div style={{ fontSize: 12, color: P.muted, marginTop: 4 }}>
              Role-based permissions enforcement across Sales, Marketing, Operations, HR, Finance, Franchise, and Admin
            </div>
          </div>

          <TableWrap>
            <thead>
              <tr>
                {['Department', 'Role Title', 'Access Badge', 'Meta Ads Leads', 'Website Leads', 'Dialer VoIP', 'Audio Notes', 'HR Roster', 'RBAC Enforcement & Restrictions'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {RBAC_MATRIX_ROWS.map((r, i) => (
                <tr key={i} style={{ transition: 'background 0.15s' }}>
                  <Td><strong style={{ color: r.color }}>{r.dept}</strong></Td>
                  <Td><span style={{ color: P.text, fontWeight: 600 }}>{r.role}</span></Td>
                  <Td>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                      background: `${r.color}20`, color: r.color, textTransform: 'uppercase', letterSpacing: 0.5
                    }}>
                      {r.badge}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: 12, color: P.text }}>{r.metaLeads}</span></Td>
                  <Td><span style={{ fontSize: 12, color: r.websiteLeads.includes('Eliminated') ? P.red : P.text }}>{r.websiteLeads}</span></Td>
                  <Td><span style={{ fontSize: 12, color: r.voip.includes('Disabled') ? P.muted : P.green }}>{r.voip}</span></Td>
                  <Td><span style={{ fontSize: 12, color: r.audio.includes('Disabled') ? P.muted : P.green }}>{r.audio}</span></Td>
                  <Td><span style={{ fontSize: 12, color: r.roster.includes('Eliminated') || r.roster.includes('Hidden') ? P.muted : P.text }}>{r.roster}</span></Td>
                  <Td><span style={{ fontSize: 11, color: P.muted, lineHeight: 1.4 }}>{r.restrictions}</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      ) : activeSubTab === 'register' || showForm ? (
        /* Register User Form */
        <div style={{ background: P.card, border: `1px solid ${P.border}`, borderRadius: 14, padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text }}>Register Pre-Authorized Team Member</h3>
            {activeSubTab !== 'register' && (
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: P.muted, cursor: 'pointer' }}><X size={16} /></button>
            )}
          </div>
          <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Full Name" required><input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ramesh Sharma" /></Field>
            <Field label="Email Address" required><input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ramesh@walktheplan.com" /></Field>
            <Field label="Phone Number"><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" /></Field>
            <Field label="Department / Division" required>
              <select style={selectStyle} value={form.department} onChange={e => set('department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="RBAC Role" required>
              <select style={selectStyle} value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
              </select>
            </Field>
            <Field label="Initial Password" required><input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" /></Field>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: 6, gap: 10 }}>
              {activeSubTab === 'register' && onSubTabChange && (
                <button type="button" onClick={() => onSubTabChange('directory')} style={{ background: P.card2, border: `1px solid ${P.border}`, borderRadius: 8, padding: '10px 20px', color: P.muted, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Back to Directory
                </button>
              )}
              <button type="submit" disabled={saving} style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '10px 28px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {saving ? 'Creating…' : 'Create & Authorize Account'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Users Directory Table */}
      {activeSubTab !== 'matrix' && (activeSubTab === 'directory' || !showForm) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.text }}>Registered Operations & Sales Personnel</h3>
            {activeSubTab === 'directory' && onSubTabChange && (
              <button onClick={() => onSubTabChange('register')} style={{ background: P.gold, border: 'none', borderRadius: 8, padding: '9px 20px', color: '#000', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                <UserPlus size={15} /> Register New Member
              </button>
            )}
          </div>

          <TableWrap>
            <thead>
              <tr>
                {['User', 'Email', 'Phone', 'Role', 'Access Status', 'Created', 'Account Management'].map(h => <Th key={h}>{h}</Th>)}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                : users.length === 0
                  ? <tr><td colSpan={7}><EmptyState icon={Users} title="No users found" sub="Register your first CRM team member" /></td></tr>
                  : users.map(u => {
                    const id = u.id || u._id;
                    const active = Boolean(u.is_active);
                    const isSelf = currentUser && ((currentUser.id && currentUser.id === id) || (currentUser.email && currentUser.email.toLowerCase() === u.email?.toLowerCase()));
                    return (
                      <tr key={id}
                        onMouseEnter={e => e.currentTarget.style.background = '#ffffff05'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{ transition: 'background 0.15s' }}
                      >
                        <Td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.avatar_color || `${P.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ color: '#000', fontWeight: 800, fontSize: 14 }}>{u.name?.[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                              {u.department && <div style={{ fontSize: 11, color: P.muted }}>{u.department}</div>}
                            </div>
                          </div>
                        </Td>
                        <Td><span style={{ color: P.muted, fontSize: 12 }}>{u.email}</span></Td>
                        <Td><span style={{ color: P.muted, fontSize: 12 }}>{u.phone || '—'}</span></Td>
                        <Td><RoleBadge role={u.role} /></Td>
                        <Td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: active ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                            color: active ? P.green : P.red,
                            border: `1px solid ${active ? P.green : P.red}40`,
                            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                          }}>
                            {active ? <CheckCircle size={10} /> : <XCircle size={10} />}
                            {active ? 'Active' : 'Deactivated'}
                          </span>
                        </Td>
                        <Td><span style={{ color: P.muted, fontSize: 11 }}>{fmtDate(u.created_at || u.createdAt)}</span></Td>
                        <Td>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              onClick={() => toggle(u)}
                              style={{
                                background: active ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                                border: `1px solid ${active ? P.red : P.green}40`,
                                color: active ? P.red : P.green,
                                borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5
                              }}
                            >
                              {active ? <XCircle size={12} /> : <CheckCircle size={12} />}
                              {active ? 'Deactivate' : 'Reactivate'}
                            </button>
                            {isSelf ? (
                              <span style={{ fontSize: 11, color: P.gold, padding: '4px 8px', fontWeight: 600 }}>
                                (You)
                              </span>
                            ) : (
                              <button
                                onClick={() => deleteUser(u)}
                                title="Permanently remove user"
                                style={{
                                  background: 'rgba(239,68,68,0.1)',
                                  border: `1px solid ${P.red}40`,
                                  color: P.red,
                                  borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                                }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
                        </Td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </TableWrap>
        </>
      )}
    </div>
  );
};

// ─── Main CRM Dashboard Component ────────────────────────────────────────────
export default function CRMDashboard() {
  const [tab, setTab] = useState('overview');
  const [selectedLead, setSelectedLead] = useState(null);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Authenticated user from local storage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('crm_user') || '{}');
    } catch {
      return {};
    }
  });

  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager' || isAdmin;
  const isAgent = currentUser.role === 'agent' || currentUser.role === 'field_agent';

  // Determine active department (Admin defaults to 'sales' and can switch between all depts)
  const [activeDept, setActiveDept] = useState(() => {
    if (currentUser.role === 'admin') return 'sales';
    const dept = (currentUser.department || '').toLowerCase();
    const role = (currentUser.role || '').toLowerCase();
    if (role === 'marketing' || dept.includes('market')) return 'marketing';
    if (role === 'hr' || dept.includes('hr') || dept.includes('human')) return 'hr';
    if (role === 'operations' || dept.includes('operat')) return 'operations';
    if (role === 'finance' || dept.includes('finan')) return 'finance';
    if (role === 'franchise' || dept.includes('franch')) return 'sales';
    return 'sales';
  });

  // Track active sub-tab for each respective department
  const [deptSubTabs, setDeptSubTabs] = useState({
    sales: 'overview',
    marketing: 'leads',
    operations: 'infrastructure',
    hr: 'headcount',
    finance: 'telemetry',
    franchise: 'pipeline',
    team: 'directory',
  });

  // Stage filter for jumping from Overview stage cards to Leads tab
  const [leadFilterStatus, setLeadFilterStatus] = useState('');

  const handleTabChange = useCallback((targetTab, stage = '') => {
    setActiveDept('sales');
    setTab(targetTab);
    setDeptSubTabs(prev => ({ ...prev, sales: targetTab }));
    if (stage) setLeadFilterStatus(stage);
  }, []);

  // Client Department Switcher navigation list with compact badges
  const DEPARTMENT_TABS = [
    { id: 'sales', num: '01', name: 'Sales', icon: TrendingUp, badge: 'Full CRM', color: P.gold },
    { id: 'marketing', num: '02', name: 'Marketing', icon: Eye, badge: 'View-Only', color: '#c084fc' },
    { id: 'operations', num: '03', name: 'Operations', icon: Activity, badge: 'Coming Soon', color: '#22d3ee' },
    { id: 'hr', num: '04', name: 'HR', icon: Users, badge: 'Staff', color: P.green },
    { id: 'finance', num: '05', name: 'Finance', icon: DollarSign, badge: 'Coming Soon', color: '#facc15' },
    { id: 'franchise', num: '06', name: 'Franchise', icon: Briefcase, badge: 'Sales CRM', color: '#f472b6' },
    ...(isAdmin ? [{ id: 'team', num: '07', name: 'Team & RBAC', icon: Shield, badge: 'Admin', color: P.gold }] : []),
  ];

  // Respective sub-tabs for each department
  const DEPT_SUB_TABS = {
    sales: [
      { id: 'overview', label: 'Dashboard', icon: BarChart3 },
      { id: 'leads', label: 'Leads (Meta & Web)', icon: Users },
      { id: 'calls', label: 'Call Studio', icon: PhoneCall },
      { id: 'upload', label: 'Data Ingest', icon: Upload },
      { id: 'audio', label: 'Site Audio', icon: Mic },
    ],
    marketing: [
      { id: 'leads', label: 'Meta Leads (View-Only)', icon: Eye },
      { id: 'integration', label: 'Meta Ads & Sheets Sync', icon: Zap },
    ],
    operations: [
      { id: 'infrastructure', label: 'Studio Infrastructure', icon: Activity },
      { id: 'calibrations', label: 'Projection Calibrations', icon: SlidersHorizontal },
      { id: 'roadmap', label: 'Operations Roadmap', icon: Clock },
    ],
    hr: [
      { id: 'headcount', label: 'Headcount Telemetry', icon: Users },
      { id: 'roster', label: 'Personnel Roster', icon: List },
    ],
    finance: [
      { id: 'telemetry', label: 'Financial Telemetry', icon: DollarSign },
      { id: 'invoicing', label: 'GST Invoicing & Payouts', icon: FileText },
    ],
    franchise: [
      { id: 'pipeline', label: 'Franchise Sales CRM', icon: Briefcase },
      { id: 'policy', label: 'Access Policy (Sales Only)', icon: Shield },
    ],
    team: [
      { id: 'directory', label: 'Team Directory', icon: Users },
      { id: 'register', label: 'Register New Member', icon: UserPlus },
      { id: 'matrix', label: 'RBAC Roles Matrix', icon: Shield },
    ],
  };

  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastId.current;
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id) => setToasts(ts => ts.filter(t => t.id !== id)), []);

  const onAudio = useCallback((lead) => {
    setSelectedLead(lead);
    setActiveDept('sales');
    setTab('audio');
    setDeptSubTabs(prev => ({ ...prev, sales: 'audio' }));
  }, []);

  const onCallLead = useCallback((lead) => {
    setSelectedLead(lead);
    setActiveDept('sales');
    setTab('calls');
    setDeptSubTabs(prev => ({ ...prev, sales: 'calls' }));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    window.location.href = '/crm/login';
  };

  return (
    <div style={{ minHeight: '100vh', background: P.bg, color: P.text, fontFamily: 'Inter,system-ui,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes slideInRight { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        ::-webkit-scrollbar      { width:6px; height:6px; }
        ::-webkit-scrollbar-track{ background:#0f0f12; }
        ::-webkit-scrollbar-thumb{ background:#3f3f46; border-radius:3px; }
        audio { accent-color: ${P.gold}; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor:pointer; }
      `}</style>

      {/* ── Unified Sticky Navigation (One Solid Atomic Header — Zero Overlap) ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#0d0d10',
        borderBottom: `1px solid ${P.border}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Row 1: Brand Logo, Active Department Respective Subnav, User Profile & Actions */}
        <header style={{
          display: 'flex', alignItems: 'center', padding: '0 24px', height: 60,
          borderBottom: `1px solid ${P.border}25`,
        }}>
          {/* Logo & Platform Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${P.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color={P.gold} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: P.text, letterSpacing: -0.3, lineHeight: 1.1 }}>
                Walk The plan CRM
              </div>
              <div style={{ fontSize: 10, color: P.muted, fontWeight: 600, letterSpacing: 0.5 }}>
                INDUSTRIAL B2B PORTAL
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs based on Active Department (Respective Sub-Tabs Only) */}
          <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', alignItems: 'center' }}>
            {(DEPT_SUB_TABS[activeDept] || []).map(t => {
              const activeSub = deptSubTabs[activeDept] || DEPT_SUB_TABS[activeDept]?.[0]?.id;
              const isCurrentActive = activeSub === t.id;
              const currentDeptMeta = DEPARTMENT_TABS.find(d => d.id === activeDept);
              const activeColor = currentDeptMeta?.color || P.gold;

              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setDeptSubTabs(prev => ({ ...prev, [activeDept]: t.id }));
                    if (activeDept === 'sales') {
                      setTab(t.id);
                    }
                  }}
                  style={{
                    background: isCurrentActive ? `${activeColor}15` : 'none',
                    border: 'none',
                    borderBottom: `2px solid ${isCurrentActive ? activeColor : 'transparent'}`,
                    color: isCurrentActive ? activeColor : P.muted,
                    padding: '19px 16px 17px',
                    cursor: 'pointer', fontSize: 13, fontWeight: isCurrentActive ? 700 : 500,
                    display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrentActive) e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    if (!isCurrentActive) e.currentTarget.style.color = P.muted;
                  }}
                >
                  <t.icon size={15} color={isCurrentActive ? activeColor : P.muted} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Profile Pill & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
            {currentUser?.name && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: P.card2, border: `1px solid ${P.border}`, borderRadius: 20,
                padding: '4px 12px 4px 6px'
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: currentUser.avatar_color || P.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ color: '#000', fontWeight: 800, fontSize: 11 }}>
                    {currentUser.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.text, lineHeight: 1.1 }}>
                    {currentUser.name}
                  </span>
                  <span style={{ fontSize: 10, color: P.gold, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {currentUser.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            )}

            {/* Main Website Link */}
            <a
              href={import.meta.env.VITE_MAIN_SITE_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5173' : 'https://frontend-main-phi-vert.vercel.app')}
              style={{
                background: 'none', border: `1px solid ${P.border}`, borderRadius: 8,
                padding: '6px 12px', color: P.gold, cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                textDecoration: 'none', transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = P.border; }}
            >
              <Home size={13} /> Main Site
            </a>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                background: 'none', border: `1px solid ${P.border}`, borderRadius: 8,
                padding: '6px 12px', color: P.muted, cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = P.red; e.currentTarget.style.borderColor = P.red; }}
              onMouseLeave={e => { e.currentTarget.style.color = P.muted; e.currentTarget.style.borderColor = P.border; }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {/* Row 2: Department Switcher Ribbon */}
        {isAdmin ? (
          <div style={{
            background: '#121217',
            padding: '7px 20px', display: 'flex', alignItems: 'center', gap: 6,
            overflowX: 'auto', scrollbarWidth: 'thin',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: P.gold, textTransform: 'uppercase',
              letterSpacing: 0.8, marginRight: 8, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0
            }}>
              <SlidersHorizontal size={13} />
              <span>Executive Switcher:</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, overflowX: 'auto' }}>
              {DEPARTMENT_TABS.map(d => {
                const active = activeDept === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDept(d.id);
                      if (d.id === 'sales') {
                        setTab(deptSubTabs.sales || 'overview');
                      }
                    }}
                    style={{
                      background: active ? (d.color || P.gold) : 'rgba(255,255,255,0.03)',
                      color: active ? '#000' : P.muted,
                      border: `1px solid ${active ? (d.color || P.gold) : P.border}`,
                      borderRadius: 6, padding: '5px 11px', fontSize: 12, fontWeight: active ? 700 : 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                      flexShrink: 0, transition: 'all 0.15s'
                    }}
                  >
                    <d.icon size={13} color={active ? '#000' : d.color || P.muted} />
                    <span><strong>{d.num})</strong> {d.name}</span>
                    {d.badge && (
                      <span style={{
                        fontSize: 9, padding: '1px 5px', borderRadius: 4,
                        background: active ? '#00000030' : `${d.color || P.gold}20`,
                        color: active ? '#000' : d.color || P.gold,
                        fontWeight: 800, textTransform: 'uppercase'
                      }}>{d.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#121217',
            padding: '6px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 12, color: P.muted
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Briefcase size={13} color={P.gold} />
              <span>Assigned Department: <strong style={{ color: P.text }}>{currentUser.department || 'Sales Department'}</strong></span>
            </span>
            <span style={{ fontSize: 11, background: `${P.gold}15`, color: P.gold, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
              Role: {currentUser.role?.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* ── Main Content Area ── */}
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 60px' }}>
        {/* ── 01) Sales Department ── */}
        {activeDept === 'sales' && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  {DEPT_SUB_TABS.sales.find(t => t.id === (deptSubTabs.sales || tab))?.label || 'Dashboard'}
                </h1>
                <span style={{ fontSize: 11, background: `${P.gold}18`, color: P.gold, border: `1px solid ${P.gold}35`, borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  01 • SALES CRM
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                {(deptSubTabs.sales || tab) === 'overview' && 'Live industrial operations telemetry, conversion pipeline, and team metrics'}
                {(deptSubTabs.sales || tab) === 'leads' && 'Filter, qualify, and execute on plan walkthrough sales opportunities (Meta Ads & Website Leads)'}
                {(deptSubTabs.sales || tab) === 'calls' && 'In-browser WebRTC VoIP calling with automatic direct-to-VPS encrypted audio recordings'}
                {(deptSubTabs.sales || tab) === 'upload' && 'Bulk import leads via CSV / Excel or manually log single plan inquiries'}
                {(deptSubTabs.sales || tab) === 'audio' && 'Record and review plan walk inspection audio notes'}
              </div>
            </div>

            {(deptSubTabs.sales || tab) === 'overview' && <TabOverview addToast={addToast} onTabChange={handleTabChange} />}
            {(deptSubTabs.sales || tab) === 'leads' && <TabLeads addToast={addToast} onAudio={onAudio} onCallLead={onCallLead} isAgent={isAgent} isAdmin={isAdmin} isManager={isManager} isMarketingView={false} initialCategory="all" initialStatus={leadFilterStatus} />}
            {(deptSubTabs.sales || tab) === 'calls' && <TabCallStudio initialLead={selectedLead} addToast={addToast} isAdmin={isAdmin} isAgent={isAgent} />}
            {(deptSubTabs.sales || tab) === 'upload' && <TabUpload addToast={addToast} onUploadComplete={() => { setTab('leads'); setDeptSubTabs(p => ({ ...p, sales: 'leads' })); }} />}
            {(deptSubTabs.sales || tab) === 'audio' && <TabAudio selectedLead={selectedLead} setSelectedLead={setSelectedLead} addToast={addToast} isAdmin={isAdmin} isAgent={isAgent} />}
          </>
        )}

        {/* ── 02) Marketing Department ── */}
        {activeDept === 'marketing' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  {deptSubTabs.marketing === 'integration' ? 'Meta Ads & Google Sheets Integration' : 'Marketing Lead Stream'}
                </h1>
                <span style={{ fontSize: 11, background: 'rgba(168,85,247,0.18)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.35)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  02 • MARKETING ({deptSubTabs.marketing === 'integration' ? 'INTEGRATION HUB' : 'VIEW-ONLY'})
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                {deptSubTabs.marketing === 'integration'
                  ? 'Connect Meta Ads Manager Webhooks & Live Google Sheets directly to Walk The Plan CRM'
                  : 'View-Only access to Meta Leads (Facebook & Instagram) with real-time Meta Ads Manager & Google Sheets webhook integration'
                }
              </div>
            </div>

            {deptSubTabs.marketing === 'integration' ? (
              <TabMarketingIntegration addToast={addToast} />
            ) : (
              <>
                <div style={{
                  background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 14, padding: '16px 22px', marginBottom: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(168,85,247,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Eye size={20} color="#a855f7" />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: P.text }}>
                        Marketing RBAC Policy Active
                      </div>
                      <div style={{ fontSize: 12, color: P.muted, marginTop: 2 }}>
                        Per RBAC access policy: Marketing personnel are restricted strictly to view-only access for Meta Leads. Lead editing, deletions, and website lead operations are disabled.
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, color: '#c084fc' }}>
                    <Shield size={12} /> RBAC ENFORCED
                  </div>
                </div>

                <TabLeads
                  addToast={addToast}
                  onAudio={onAudio}
                  onCallLead={onCallLead}
                  isAgent={false}
                  isAdmin={false}
                  isManager={false}
                  isMarketingView={true}
                  initialCategory="meta"
                />
              </>
            )}
          </div>
        )}

        {/* ── 03) Operations Department ── */}
        {activeDept === 'operations' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  Operations & Studio Grid
                </h1>
                <span style={{ fontSize: 11, background: 'rgba(6,182,212,0.18)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.35)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  03 • OPERATIONS (COMING SOON)
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                1:1 physical projector scale layout calibrations, physical staging models, and on-site walkthrough scheduling
              </div>
            </div>
            <TabComingSoon deptKey="operations" subTab={deptSubTabs.operations} />
          </div>
        )}

        {/* ── 04) Human Resources Department ── */}
        {activeDept === 'hr' && (
          <TabHR
            addToast={addToast}
            activeSubTab={deptSubTabs.hr}
            onRegisterEmployee={isAdmin ? () => {
              setActiveDept('team');
              setDeptSubTabs(p => ({ ...p, team: 'register' }));
            } : null}
          />
        )}

        {/* ── 05) Finance Department ── */}
        {activeDept === 'finance' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  Finance & Invoicing
                </h1>
                <span style={{ fontSize: 11, background: 'rgba(234,179,8,0.18)', color: '#facc15', border: '1px solid rgba(234,179,8,0.35)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  05 • FINANCE (COMING SOON)
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                Razorpay automated settlement reconciliations, token advances, pending collections, and GST invoicing
              </div>
            </div>
            <TabComingSoon deptKey="finance" subTab={deptSubTabs.finance} />
          </div>
        )}

        {/* ── 06) Franchise Department ── */}
        {activeDept === 'franchise' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  Franchise Studio Portal
                </h1>
                <span style={{ fontSize: 11, background: 'rgba(236,72,153,0.18)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.35)', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  06 • FRANCHISE (SALES CRM ONLY)
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                Authorized franchise partner walkthrough lead capture and localized studio client pipelines
              </div>
            </div>
            <TabComingSoon deptKey="franchise" subTab={deptSubTabs.franchise} />
          </div>
        )}

        {/* ── 07) Team & RBAC Provisioning (Admin Only) ── */}
        {activeDept === 'team' && isAdmin && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: P.text, letterSpacing: -0.5 }}>
                  Team & Access Control (RBAC)
                </h1>
                <span style={{ fontSize: 11, background: `${P.gold}18`, color: P.gold, border: `1px solid ${P.gold}35`, borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
                  ADMINISTRATION
                </span>
              </div>
              <div style={{ fontSize: 13, color: P.muted }}>
                Provision accounts, configure department division assignments, and manage access permissions for Sales, Marketing, HR, Operations, Finance, and Franchise partners.
              </div>
            </div>
            <TabUsers
              addToast={addToast}
              currentUser={currentUser}
              activeSubTab={deptSubTabs.team}
              onSubTabChange={(sub) => setDeptSubTabs(p => ({ ...p, team: sub }))}
            />
          </div>
        )}
      </main>

      {/* Toast notifications */}
      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
