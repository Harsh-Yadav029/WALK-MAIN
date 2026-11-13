import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Plus, Trash2, Mail, Phone, Clock, FileText, Image, Users, CheckSquare, ListPlus, Edit, X, Video, MapPin, Building, Download, FileSpreadsheet, Settings, MessageSquare, ExternalLink, Search, ChevronLeft, ChevronRight, MessageCircle, RefreshCw, Smartphone, Monitor, Tablet, Eye, Globe, BarChart3, TrendingUp, Activity, Map, Layers, Compass, PieChart, Zap, ArrowUpRight, Clock3, Hash, Share2, Copy, Check, History, UserCheck, UserPlus, Repeat, CheckCircle2, Bot, ShieldCheck, ShieldAlert, Bell, Send, Briefcase } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSettings, getWhatsAppLink } from '@/shared/context/SettingsContext';
import AdminSuspendedNotice from '@/admin/components/AdminSuspendedNotice';
import { IS_ADMIN_PANEL_STOPPED } from '@/shared/config/adminLock';
import { subscribeAdminToPush, unsubscribeAdminPush, isAdminPushSubscribed, playAlertChime, resetAndSubscribeAdminPush } from '@/shared/utils/pushNotifications';

export const INDIAN_STATES_AND_UTS = [
  // 28 States (Alphabetical)
  { key: 'AndhraPradesh', name: 'Andhra Pradesh', type: 'State' },
  { key: 'ArunachalPradesh', name: 'Arunachal Pradesh', type: 'State' },
  { key: 'Assam', name: 'Assam', type: 'State' },
  { key: 'Bihar', name: 'Bihar', type: 'State' },
  { key: 'Chhattisgarh', name: 'Chhattisgarh', type: 'State' },
  { key: 'Goa', name: 'Goa', type: 'State' },
  { key: 'Gujarat', name: 'Gujarat', type: 'State' },
  { key: 'Haryana', name: 'Haryana', type: 'State' },
  { key: 'HimachalPradesh', name: 'Himachal Pradesh', type: 'State' },
  { key: 'Jharkhand', name: 'Jharkhand', type: 'State' },
  { key: 'Karnataka', name: 'Karnataka', type: 'State' },
  { key: 'Kerala', name: 'Kerala', type: 'State' },
  { key: 'MadhyaPradesh', name: 'Madhya Pradesh', type: 'State' },
  { key: 'Maharashtra', name: 'Maharashtra', type: 'State' },
  { key: 'Manipur', name: 'Manipur', type: 'State' },
  { key: 'Meghalaya', name: 'Meghalaya', type: 'State' },
  { key: 'Mizoram', name: 'Mizoram', type: 'State' },
  { key: 'Nagaland', name: 'Nagaland', type: 'State' },
  { key: 'Odisha', name: 'Odisha', type: 'State' },
  { key: 'Punjab', name: 'Punjab', type: 'State' },
  { key: 'Rajasthan', name: 'Rajasthan', type: 'State' },
  { key: 'Sikkim', name: 'Sikkim', type: 'State' },
  { key: 'TamilNadu', name: 'Tamil Nadu', type: 'State' },
  { key: 'Telangana', name: 'Telangana', type: 'State' },
  { key: 'Tripura', name: 'Tripura', type: 'State' },
  { key: 'UttarPradesh', name: 'Uttar Pradesh', type: 'State' },
  { key: 'Uttarakhand', name: 'Uttarakhand', type: 'State' },
  { key: 'WestBengal', name: 'West Bengal', type: 'State' },

  // 8 Union Territories (Alphabetical)
  { key: 'AndamanAndNicobar', name: 'Andaman and Nicobar Islands', type: 'Union Territory' },
  { key: 'Chandigarh', name: 'Chandigarh', type: 'Union Territory' },
  { key: 'DadraAndNagarHaveliAndDamanAndDiu', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory' },
  { key: 'Delhi', name: 'Delhi (NCT)', type: 'Union Territory' },
  { key: 'JammuAndKashmir', name: 'Jammu and Kashmir', type: 'Union Territory' },
  { key: 'Ladakh', name: 'Ladakh', type: 'Union Territory' },
  { key: 'Lakshadweep', name: 'Lakshadweep', type: 'Union Territory' },
  { key: 'Puducherry', name: 'Puducherry', type: 'Union Territory' }
];

const AdminDashboard = ({ onLogout }) => {
  if (IS_ADMIN_PANEL_STOPPED) {
    return <AdminSuspendedNotice />;
  }

  const navigate = useNavigate();
  const { refreshSettings } = useSettings();
  const [currentTab, setCurrentTab] = useState('bookings');

  // 20-minute Session Inactivity Duration (runs silently in background)
  const SESSION_DURATION_MS = 20 * 60 * 1000;

  // Data lists
  const [bookings, setBookings] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [locations, setLocations] = useState([]);

  // Loading & error statuses
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  // Forms state
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', category: 'Planning Tips', author: 'Parth Khanna', cover_image: null });
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', category: 'Architect', type: 'photo', file: null, external_url: '' });
  const [testimonialForm, setTestimonialForm] = useState({ title: '', name: '', role: '', desc: '', video_file: null, external_video_url: '' });
  const [locationForm, setLocationForm] = useState({ state_key: 'Haryana', name: '', city: '', address: '', details: '', phone: '', image_file: null });
  const [settings, setSettings] = useState({ hero_video: '', test_drive_video: '', about_video: '', whatsapp_number: '+91 97110 22075', show_leads_public: '0' });
  const [whatsappInput, setWhatsappInput] = useState('+91 97110 22075');
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [togglingShowLeadsPublic, setTogglingShowLeadsPublic] = useState(false);
  const [heroForm, setHeroForm] = useState({ file: null, external_url: '' });
  const [testDriveForm, setTestDriveForm] = useState({ file: null, external_url: '' });
  const [aboutForm, setAboutForm] = useState({ file: null, external_url: '' });
  const [uploadingSettingKey, setUploadingSettingKey] = useState(null);
  const [servicesList, setServicesList] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [franchiseList, setFranchiseList] = useState([]);
  const [editingFranchise, setEditingFranchise] = useState(null);

  // Push Notification Reminders, Site-Wide Broadcast & Admin Instant Lead Alerts State
  const [pushStats, setPushStats] = useState({
    total_subscribers: 0,
    not_booked: 0,
    has_booked: 0,
    admin_devices: 0,
    notified_today: 0,
    total_past_visitors: 0,
    total_views: 0,
    site_notification: { enabled: false, title: '', body: '', url: '/contact', badge: 'LIVE ANNOUNCEMENT', updated_at: null }
  });
  const [sendingPush, setSendingPush] = useState(false);
  const [pushResult, setPushResult] = useState(null);
  const [adminPushEnabled, setAdminPushEnabled] = useState(false);
  const [togglingAdminPush, setTogglingAdminPush] = useState(false);
  const [testingAdminAlert, setTestingAdminAlert] = useState(false);
  const [resettingAdminPush, setResettingAdminPush] = useState(false);
  const [togglingSiteNotif, setTogglingSiteNotif] = useState(false);
  const [customBroadcast, setCustomBroadcast] = useState({
    title: '🏠 Walk Your Floor Plan at 1:1 Scale!',
    body: 'Don\'t start construction without walking your layout first. Book your full-scale blueprint projection session today!',
    url: '/contact',
    target_audience: 'unbooked',
    force_immediate: true,
    publish_to_site: true,
    send_device_push: true
  });
  const [liveBookingAlert, setLiveBookingAlert] = useState(null);

  // Visitor & Device Analytics State
  const [analytics, setAnalytics] = useState({
    overview: {
      total_views: 0,
      total_visitors: 0,
      human_views: 0,
      human_visitors: 0,
      bot_views: 0,
      bot_visitors: 0,
      today_views: 0,
      today_visitors: 0,
      today_human_views: 0,
      today_human_visitors: 0,
      week_views: 0,
      week_visitors: 0,
      month_views: 0,
      month_visitors: 0,
      avg_views_per_visitor: 0,
      avg_sessions_per_visitor: 0
    },
    platforms: [],
    bots: [],
    devices: {
      mobile: { views: 0, visitors: 0, pct: 75 },
      desktop: { views: 0, visitors: 0, pct: 21 },
      tablet: { views: 0, visitors: 0, pct: 4 }
    },
    topPages: [],
    dailyTrend: [],
    recentVisits: [],
    browsers: [],
    operatingSystems: [],
    referrers: [],
    locations: { countries: [], cities: [], regions: [] },
    retention: {
      total_unique_visitors: 0,
      one_time_visitors: 0,
      returning_visitors: 0,
      returning_rate_pct: 0
    },
    hourlyHeatmap: new Array(24).fill(0)
  });
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [visitorChartMode, setVisitorChartMode] = useState('stacked'); // 'stacked', 'grouped'
  const [analyticsSubTab, setAnalyticsSubTab] = useState('overview'); // 'overview', 'locations', 'technology', 'activity'

  // Daily Trend Charts scroll references & interactive drag handles
  const dailyTrendScrollRef = useRef(null);
  const visitorTrendScrollRef = useRef(null);

  const scrollChart = (ref, amount) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleChartMouseDown = (ref) => (e) => {
    const el = ref.current;
    if (!el) return;
    el.isDown = true;
    el.startX = e.pageX - el.offsetLeft;
    el.scrollLeftStart = el.scrollLeft;
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  };

  const handleChartMouseLeave = (ref) => () => {
    const el = ref.current;
    if (!el) return;
    el.isDown = false;
    el.style.cursor = 'grab';
    el.style.removeProperty('user-select');
  };

  const handleChartMouseUp = (ref) => () => {
    const el = ref.current;
    if (!el) return;
    el.isDown = false;
    el.style.cursor = 'grab';
    el.style.removeProperty('user-select');
  };

  const handleChartMouseMove = (ref) => (e) => {
    const el = ref.current;
    if (!el || !el.isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - el.startX) * 1.5;
    el.scrollLeft = el.scrollLeftStart - walk;
  };

  // Automatically scroll both charts to the latest days (Today / rightmost) on load and updates
  useEffect(() => {
    if (analytics && analytics.dailyTrend && analytics.dailyTrend.length > 0) {
      const timer = setTimeout(() => {
        if (dailyTrendScrollRef.current) {
          dailyTrendScrollRef.current.scrollLeft = dailyTrendScrollRef.current.scrollWidth;
        }
        if (visitorTrendScrollRef.current) {
          visitorTrendScrollRef.current.scrollLeft = visitorTrendScrollRef.current.scrollWidth;
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [analytics?.dailyTrend]);

  // Filter, Search & Pagination states for Leads
  const [bookingFilter, setBookingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Notifications
  const [notif, setNotif] = useState({ type: '', msg: '' });
  const [showCustomCategoryInput, setShowCustomCategoryInput] = useState(false);

  // Live Recent Visitors Filtering & Inspection State
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorDeviceFilter, setVisitorDeviceFilter] = useState('all'); // all, new, returning, mobile, desktop, tablet
  const [visitorPage, setVisitorPage] = useState(1);
  const [visitorPageSize, setVisitorPageSize] = useState(25);
  const [copiedId, setCopiedId] = useState('');
  const [inspectingVisitor, setInspectingVisitor] = useState(null);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [loadingDeviceHistory, setLoadingDeviceHistory] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState('blocks');

  // Accelerated Mousewheel / Trackpad Scroll Engine (Default 1.5x Speed)
  const [scrollSpeed, setScrollSpeed] = useState(() => {
    try {
      return localStorage.getItem('admin_scroll_speed') || '1.5';
    } catch (e) {
      return '1.5';
    }
  });

  const toggleScrollSpeed = () => {
    setScrollSpeed(prev => {
      const next = prev === '1.5' ? '2.0' : prev === '2.0' ? '1.0' : '1.5';
      try {
        localStorage.setItem('admin_scroll_speed', next);
      } catch (e) { }
      return next;
    });
  };

  const isLeadsAllowedInAdmin = settings.show_leads_public === '1' || settings.show_leads_public === 1 || settings.show_leads_public === true || settings.show_leads_public === 'true' || settings.show_leads_public === undefined;

  useEffect(() => {
    const speed = parseFloat(scrollSpeed) || 1.5;
    if (speed <= 1.0) return;

    const handleWheel = (e) => {
      // Don't interfere if user is pressing modifier keys (zoom, etc.)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (Math.abs(e.deltaY) < 1) return;

      // Find inner scrollable element if wheel was triggered inside one
      let target = e.target;
      let scrollableContainer = null;
      while (target && target !== document.body && target !== document.documentElement) {
        try {
          const style = window.getComputedStyle(target);
          const overflowY = style.overflowY;
          if ((overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight) {
            scrollableContainer = target;
            break;
          }
        } catch (err) { }
        target = target.parentElement;
      }

      const extraDelta = e.deltaY * (speed - 1.0);

      if (scrollableContainer) {
        scrollableContainer.scrollTop += extraDelta;
      } else {
        window.scrollBy({ top: extraDelta, behavior: 'auto' });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollSpeed]);

  useEffect(() => {
    if (localStorage.getItem('adminUser') === 'parth') {
      localStorage.setItem('adminUser', 'fitscalez');
    }
    const token = localStorage.getItem('adminToken');
    if (!token) {
      if (onLogout) onLogout();
      else navigate('/fitscalez');
    } else {
      fetchDashboardData(token);
    }
  }, []);

  // Real-time background auto-refresh for live visitor analytics every 15s
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.overview) {
            setAnalytics(data);
          }
        }
      } catch (e) {
        // Silent background sync
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const visitorModalBodyRef = useRef(null);

  // Lock body scroll and enable Escape key to close modals
  useEffect(() => {
    if (inspectingVisitor || editingService || editingFranchise || editingLocation) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (inspectingVisitor) setInspectingVisitor(null);
          if (editingService) setEditingService(null);
          if (editingFranchise) setEditingFranchise(null);
          if (editingLocation) setEditingLocation(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [inspectingVisitor, editingService, editingFranchise, editingLocation]);

  // Ensure modal body resets scroll to top on opening visitor intelligence
  useEffect(() => {
    if (inspectingVisitor && visitorModalBodyRef.current) {
      visitorModalBodyRef.current.scrollTop = 0;
    }
  }, [inspectingVisitor]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);

      // Verify token first
      const verifyRes = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!verifyRes.ok) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminSessionExpiry');
        setAuthError(true);
        if (onLogout) onLogout();
        else navigate('/fitscalez');
        return;
      }

      // Fetch bookings, blogs, gallery items, testimonials, studio locations, settings, services, franchise models, and visitor analytics
      const [bookRes, blogRes, galRes, testRes, locRes, settingsRes, servRes, franRes, analyticsRes] = await Promise.allSettled([
        fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/blogs'),
        fetch('/api/gallery'),
        fetch('/api/testimonials'),
        fetch('/api/studio-locations'),
        fetch('/api/settings'),
        fetch('/api/services'),
        fetch('/api/franchise-models'),
        fetch('/api/admin/analytics', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const safeJson = async (result, defaultVal) => {
        if (result.status === 'fulfilled' && result.value.ok) {
          try {
            return await result.value.json();
          } catch (e) {
            return defaultVal;
          }
        }
        return defaultVal;
      };

      const bookData = await safeJson(bookRes, []);
      const blogData = await safeJson(blogRes, []);
      const galData = await safeJson(galRes, []);
      const testData = await safeJson(testRes, []);
      const locData = await safeJson(locRes, []);
      const settingsData = await safeJson(settingsRes, {});
      const servData = await safeJson(servRes, []);
      const franData = await safeJson(franRes, []);
      const analyticsData = await safeJson(analyticsRes, null);

      setBookings(Array.isArray(bookData) ? bookData : []);
      setBlogs(Array.isArray(blogData) ? blogData : []);
      setGallery(Array.isArray(galData) ? galData : []);
      setTestimonials(Array.isArray(testData) ? testData : []);
      setLocations(Array.isArray(locData) ? locData : []);
      setSettings(settingsData || {});
      setWhatsappInput(settingsData.whatsapp_number || '+91 97110 22075');
      setServicesList(Array.isArray(servData) ? servData : []);
      setFranchiseList(Array.isArray(franData) ? franData : []);
      if (analyticsData && analyticsData.overview) {
        setAnalytics(analyticsData);
      }

      // Fetch push subscriber stats
      fetchPushStats(token);

      setLoading(false);
    } catch (err) {
      console.error('Dashboard load warning:', err);
      setLoading(false);
    }
  };

  const fetchPushStats = async (passedToken) => {
    const token = passedToken || localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/push/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPushStats(data);
      }
    } catch (e) {
      console.warn('Failed to fetch push stats:', e);
    }
  };

  const handleTriggerPushReminders = async (overrideOptions = null) => {
    const opts = overrideOptions || customBroadcast;
    const isSitePublish = opts.publish_to_site !== false;
    const isDevicePush = opts.send_device_push !== false;

    if (!isSitePublish && !isDevicePush) {
      alert('Please select at least one delivery channel (Post to Website or Device Push).');
      return;
    }

    const audienceLabel = opts.target_audience === 'all'
      ? `ALL registered device subscribers (${pushStats.total_subscribers || 0} devices)`
      : `pending unbooked visitors (${pushStats.not_booked || 0} devices)`;

    let confirmMsg = `Send Notification Broadcast now?\n\nTitle: "${opts.title}"\nDestination: ${opts.url}\n\nDelivery Channels:\n`;
    if (isSitePublish) {
      confirmMsg += `✓ Site-Wide Live Banner: Will display on walktheplan.in to 100% of website visitors (${pushStats.total_past_visitors || analytics.overview?.total_visitors || 1526}+ visitors & non-subscribers)\n`;
    }
    if (isDevicePush) {
      confirmMsg += `✓ Device OS Push: Will send background OS notification to ${audienceLabel}\n`;
    }

    if (!window.confirm(confirmMsg)) {
      return;
    }
    setSendingPush(true);
    setPushResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        title: opts.title,
        body: opts.body,
        url: opts.url,
        target_audience: opts.target_audience || 'unbooked',
        force_immediate: opts.force_immediate !== false,
        publish_to_site: isSitePublish,
        send_device_push: isDevicePush
      };
      const res = await fetch('/api/admin/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setPushResult(data);
        const parts = [];
        if (data.published_to_site) parts.push('published live to website for 100% of visitors');
        if (data.send_device_push) parts.push(`${data.sent} device notifications delivered`);
        setNotif({ type: 'success', msg: `Broadcast complete: ${parts.join(', ')}!` });
        fetchPushStats(token);
        if (refreshSettings) refreshSettings();
      } else {
        setNotif({ type: 'error', msg: data.error || 'Failed to dispatch broadcast' });
      }
    } catch (err) {
      setNotif({ type: 'error', msg: err.message || 'Error sending broadcast' });
    } finally {
      setSendingPush(false);
    }
  };

  const handleToggleSiteNotification = async () => {
    setTogglingSiteNotif(true);
    try {
      const token = localStorage.getItem('adminToken');
      const nextState = !pushStats.site_notification?.enabled;
      const res = await fetch('/api/admin/push/site-notification/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });
      if (res.ok) {
        setPushStats(prev => ({
          ...prev,
          site_notification: {
            ...(prev.site_notification || {}),
            enabled: nextState
          }
        }));
        setNotif({
          type: 'success',
          msg: nextState
            ? '📢 Site-wide notification banner is now LIVE for 100% of visitors!'
            : 'Site-wide notification banner has been hidden from the website.'
        });
        fetchPushStats(token);
        if (refreshSettings) refreshSettings();
      }
    } catch (err) {
      setNotif({ type: 'error', msg: 'Failed to toggle site banner: ' + err.message });
    } finally {
      setTogglingSiteNotif(false);
    }
  };

  // Check and auto-register admin device on dashboard mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    if (isAdminPushSubscribed()) {
      setAdminPushEnabled(true);
    } else if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        subscribeAdminToPush(token).then((r) => {
          if (r.success) setAdminPushEnabled(true);
        });
      } else if (Notification.permission === 'default') {
        // Auto-request permission on dashboard load so logged-in admin device gets instant alerts
        subscribeAdminToPush(token).then((r) => {
          if (r.success) {
            setAdminPushEnabled(true);
            setNotif({ type: 'success', msg: '🔔 Instant lead push alerts active on this device!' });
          }
        });
      }
    }
  }, []);

  // Real-time live polling for new bookings every 12 seconds with audio chime
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const latestBookings = await res.json();
          if (Array.isArray(latestBookings) && latestBookings.length > 0) {
            setBookings((prevBookings) => {
              if (prevBookings.length > 0 && latestBookings.length > prevBookings.length) {
                const prevIds = new Set(prevBookings.map(b => b.id));
                const newLeads = latestBookings.filter(b => !prevIds.has(b.id));
                if (newLeads.length > 0) {
                  const newest = newLeads[0];
                  // Play pleasant synthesized chime
                  playAlertChime();
                  setLiveBookingAlert(newest);
                  setNotif({
                    type: 'success',
                    msg: `🚨 New Booking: ${newest.name} (${newest.package_name || 'Studio Session'}) just submitted a lead!`
                  });
                }
              }
              return latestBookings;
            });
          }
        }
      } catch (e) {
        // Background check
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAdminPush = async () => {
    setTogglingAdminPush(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (adminPushEnabled) {
        await unsubscribeAdminPush(token);
        setAdminPushEnabled(false);
        setNotif({ type: 'success', msg: 'Lead push alerts disabled on this device.' });
        fetchPushStats(token);
      } else {
        const result = await subscribeAdminToPush(token);
        if (result.success) {
          setAdminPushEnabled(true);
          setNotif({ type: 'success', msg: '🔔 Instant lead alerts activated on this device! You will get push alerts whenever a new lead arrives.' });
          fetchPushStats(token);
        } else if (result.permission === 'denied') {
          setNotif({ type: 'error', msg: 'Notification permission was blocked in browser settings. Please allow notifications in your browser address bar.' });
        } else {
          setNotif({ type: 'error', msg: result.error || 'Failed to enable notifications.' });
        }
      }
    } catch (err) {
      setNotif({ type: 'error', msg: err.message || 'Error configuring admin notifications.' });
    } finally {
      setTogglingAdminPush(false);
    }
  };

  const handleResetAndSendPush = async () => {
    setResettingAdminPush(true);
    try {
      const token = localStorage.getItem('adminToken');
      // Reset server subscriptions and re-subscribe cleanly
      const result = await resetAndSubscribeAdminPush(token);
      if (result.success) {
        setAdminPushEnabled(true);
        playAlertChime();
        // Immediately trigger test lead alert
        await fetch('/api/admin/push/test-admin-alert', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotif({
          type: 'success',
          msg: '🔔 Device alerts successfully reset & activated! Instant test notification sent to your device.'
        });
        fetchPushStats(token);
      } else if (result.permission === 'denied') {
        setNotif({
          type: 'error',
          msg: 'Notification permission is blocked in browser settings. Please click the lock or tune icon near the URL address bar and allow Notifications.'
        });
      } else {
        setNotif({ type: 'error', msg: result.error || 'Failed to reset device alerts.' });
      }
    } catch (err) {
      setNotif({ type: 'error', msg: err.message || 'Error resetting push notifications.' });
    } finally {
      setResettingAdminPush(false);
    }
  };

  const handleTestAdminAlert = async () => {
    setTestingAdminAlert(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/push/test-admin-alert', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotif({ type: 'success', msg: 'Test alert sent! Check your device notifications now.' });
      } else {
        setNotif({ type: 'error', msg: data.error || 'Failed to dispatch test alert.' });
      }
    } catch (err) {
      setNotif({ type: 'error', msg: err.message || 'Error triggering test alert.' });
    } finally {
      setTestingAdminAlert(false);
    }
  };

  const refreshAnalytics = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      setLoadingAnalytics(true);
      const res = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.overview) {
          setAnalytics(data);
          setNotif({ type: 'success', msg: 'Analytics refreshed with latest real-time visitor numbers.' });
          setTimeout(() => setNotif({ type: '', msg: '' }), 3000);
        }
      }
    } catch (e) {
      console.error('Failed to refresh analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const showNotification = (type, msg) => {
    setNotif({ type, msg });
    setTimeout(() => setNotif({ type: '', msg: '' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminSessionExpiry');
    if (onLogout) onLogout();
    else navigate('/fitscalez');
  };

  // 20-minute Session Inactivity & Auto-Logout Tracker (Runs quietly in background)
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    let expiry = Number(localStorage.getItem('adminSessionExpiry'));
    const now = Date.now();
    if (!expiry || isNaN(expiry)) {
      expiry = now + SESSION_DURATION_MS;
      localStorage.setItem('adminSessionExpiry', expiry.toString());
    } else if (expiry <= now) {
      handleLogout();
      return;
    }

    const timer = setInterval(() => {
      const exp = Number(localStorage.getItem('adminSessionExpiry'));
      const current = Date.now();
      if (!exp || isNaN(exp) || exp <= current) {
        clearInterval(timer);
        handleLogout();
      }
    }, 2000);

    // Background activity tracking: user activity keeps the session alive quietly
    // Throttled to at most once every 30 seconds
    let lastActivityTime = Date.now();
    const handleUserActivity = () => {
      const current = Date.now();
      if (current - lastActivityTime > 30000) {
        lastActivityTime = current;
        const currentExp = Number(localStorage.getItem('adminSessionExpiry'));
        if (currentExp && currentExp > current) {
          const nextExpiry = current + SESSION_DURATION_MS;
          localStorage.setItem('adminSessionExpiry', nextExpiry.toString());
        }
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      clearInterval(timer);
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
    };
  }, []);

  // --- EXPORT LEADS TO EXCEL ---
  const exportLeadsToExcel = (mode = 'all', customList = null) => {
    let filtered = customList ? [...customList] : [...bookings];
    let label = 'All_Leads';

    if (mode === 'date_range') {
      if (!startDate && !endDate) {
        showNotification('error', 'Please select a Start Date or End Date from the calendar.');
        return;
      }

      const start = startDate ? new Date(`${startDate}T00:00:00+05:30`) : new Date(0);
      const end = endDate ? new Date(`${endDate}T23:59:59.999+05:30`) : new Date();

      if (startDate && endDate && start > end) {
        showNotification('error', 'Start Date cannot be after End Date.');
        return;
      }

      filtered = bookings.filter(b => {
        if (!b.created_at) return false;
        const d = new Date(ensureUtcIso(b.created_at));
        return !isNaN(d.getTime()) && d >= start && d <= end;
      });

      label = `Leads_${startDate || 'start'}_to_${endDate || 'end'}`;
    } else if (mode === 'filtered') {
      label = `Filtered_Leads_${bookingFilter}${searchQuery ? '_searched' : ''}`;
    }

    if (filtered.length === 0) {
      showNotification('error', `No leads found for the selected criteria.`);
      return;
    }

    const exportData = filtered.map((b, index) => ({
      'S.No': index + 1,
      'Date & Time': formatDate(b.created_at),
      'Client Name': b.name || 'N/A',
      'Email Address': b.email || 'N/A',
      'Phone Number': b.phone || 'N/A',
      'Lead Type': (b.type || 'inquiry').toUpperCase(),
      'Package / Service': b.package_name || 'N/A',
      'Estimated Budget': b.budget || (b.message && b.message.match(/Budget:\s*([^\r\n]+)/) ? b.message.match(/Budget:\s*([^\r\n]+)/)[1].trim() : 'N/A'),
      'Total Package Price (₹)': b.price ? `₹${b.price}` : 'N/A',
      'Payment Status': b.payment_status || 'Unpaid / Payment Pending',
      'Token Amount Paid (₹)': b.amount_paid ? `₹${b.amount_paid}` : '₹0',
      'Balance Pending (₹)': b.balance_pending ? `₹${b.balance_pending}` : (b.price ? `₹${Math.max(0, b.price - (b.amount_paid || 0))}` : '₹0'),
      'Razorpay Payment ID': b.razorpay_payment_id || 'N/A',
      'Inquiry / Message Details': b.message || '',
      'Acquisition Platform': b.platform || 'Direct',
      'Campaign / Source': [b.utm_campaign, b.utm_source].filter(Boolean).join(' / ') || 'Direct / Organic',
      'Status': (b.status || 'pending').toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 22 },
      { wch: 30 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 24 },
      { wch: 50 },
      { wch: 12 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

    const fileName = `${label}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    showNotification('success', `Successfully exported ${filtered.length} lead(s) to ${fileName}`);
  };

  // --- BOOKINGS ACTIONS ---
  const toggleBookingStatus = async (id, currentStatus) => {
    const token = localStorage.getItem('adminToken');
    const newStatus = currentStatus === 'pending' ? 'replied' : 'pending';

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status.');

      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      showNotification('success', 'Lead status updated.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const toggleLeadShowInAdmin = async (id, checked) => {
    const token = localStorage.getItem('adminToken');
    const val = checked ? 1 : 0;
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === id ? { ...b, show_in_admin: val } : b));

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ show_in_admin: val })
      });

      if (!res.ok) throw new Error('Failed to update lead admin visibility.');

      showNotification('success', checked ? 'Lead is now visible in /admin panel.' : 'Lead hidden from /admin panel.');
    } catch (err) {
      showNotification('error', err.message);
      // Revert on error
      setBookings(prev => prev.map(b => b.id === id ? { ...b, show_in_admin: checked ? 0 : 1 } : b));
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking lead?')) return;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete lead.');

      setBookings(bookings.filter(b => b.id !== id));
      showNotification('success', 'Lead record deleted.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- BLOG ACTIONS ---
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('title', blogForm.title);
    formData.append('excerpt', blogForm.excerpt);
    formData.append('content', blogForm.content);
    formData.append('category', blogForm.category);
    formData.append('author', blogForm.author);
    if (blogForm.cover_image) {
      formData.append('cover_image', blogForm.cover_image);
    }

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create blog post.');

      showNotification('success', 'Blog post published successfully!');
      setBlogForm({ title: '', excerpt: '', content: '', category: 'Planning Tips', author: 'Parth Khanna', cover_image: null });
      // Refresh listings
      const blogListRes = await fetch('/api/blogs');
      const blogListData = await blogListRes.json();
      setBlogs(blogListData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post forever?')) return;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete blog.');

      setBlogs(blogs.filter(b => b.id !== id));
      showNotification('success', 'Blog post removed.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleBlogUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('title', editingBlog.title);
    formData.append('excerpt', editingBlog.excerpt);
    formData.append('content', editingBlog.content);
    formData.append('category', editingBlog.category);
    formData.append('author', editingBlog.author);
    if (editingBlog.cover_image_file) {
      formData.append('cover_image', editingBlog.cover_image_file);
    }

    try {
      const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update blog post.');

      showNotification('success', 'Blog post updated successfully!');
      setEditingBlog(null);
      // Refresh listings
      const blogListRes = await fetch('/api/blogs');
      const blogListData = await blogListRes.json();
      setBlogs(blogListData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- GALLERY ACTIONS ---
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('title', galleryForm.title);
    formData.append('description', galleryForm.description);
    formData.append('category', galleryForm.category);
    formData.append('type', galleryForm.type);

    if (galleryForm.type === 'photo' && galleryForm.file) {
      formData.append('file', galleryForm.file);
    } else if (galleryForm.type === 'video') {
      if (galleryForm.file) {
        formData.append('file', galleryForm.file);
      } else if (galleryForm.external_url) {
        formData.append('external_url', galleryForm.external_url);
      } else {
        showNotification('error', 'Please upload a video or provide a link.');
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add gallery item.');

      showNotification('success', 'Gallery item uploaded successfully!');
      setGalleryForm({ title: '', description: '', category: 'Architect', type: 'photo', file: null, external_url: '' });
      setShowCustomCategoryInput(false);

      // Refresh gallery
      const galListRes = await fetch('/api/gallery');
      const galListData = await galListRes.json();
      setGallery(galListData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const deleteGallery = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete gallery item.');

      setGallery(gallery.filter(g => g.id !== id));
      showNotification('success', 'Gallery item removed.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- TESTIMONIAL ACTIONS ---
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('title', testimonialForm.title);
    formData.append('name', testimonialForm.name);
    formData.append('role', testimonialForm.role);
    formData.append('desc', testimonialForm.desc);

    if (testimonialForm.video_file) {
      formData.append('video_file', testimonialForm.video_file);
    } else if (testimonialForm.external_video_url) {
      formData.append('external_video_url', testimonialForm.external_video_url);
    } else {
      showNotification('error', 'Please upload a video file or provide an external video URL.');
      return;
    }

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create testimonial.');

      showNotification('success', 'Testimonial added successfully!');
      setTestimonialForm({ title: '', name: '', role: '', desc: '', video_file: null, external_video_url: '' });

      const tRes = await fetch('/api/testimonials');
      const tData = await tRes.json();
      setTestimonials(tData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleTestimonialUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('title', editingTestimonial.title);
    formData.append('name', editingTestimonial.name);
    formData.append('role', editingTestimonial.role);
    formData.append('desc', editingTestimonial.desc);

    if (editingTestimonial.video_file_new) {
      formData.append('video_file', editingTestimonial.video_file_new);
    } else if (editingTestimonial.external_video_url_new) {
      formData.append('external_video_url', editingTestimonial.external_video_url_new);
    }

    try {
      const res = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update testimonial.');

      showNotification('success', 'Testimonial updated successfully!');
      setEditingTestimonial(null);

      const tRes = await fetch('/api/testimonials');
      const tData = await tRes.json();
      setTestimonials(tData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete testimonial.');

      setTestimonials(testimonials.filter(t => t.id !== id));
      showNotification('success', 'Testimonial removed.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  // --- STUDIO LOCATION ACTIONS ---
  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('state_key', locationForm.state_key);
    formData.append('name', locationForm.name);
    formData.append('city', locationForm.city);
    formData.append('address', locationForm.address);
    formData.append('details', locationForm.details);
    formData.append('phone', locationForm.phone);

    if (locationForm.image_file) {
      formData.append('image_file', locationForm.image_file);
    } else {
      showNotification('error', 'Please upload a location image file.');
      return;
    }

    try {
      const res = await fetch('/api/admin/studio-locations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add studio location.');

      showNotification('success', 'Studio location added successfully!');
      setLocationForm({ state_key: 'Haryana', name: '', city: '', address: '', details: '', phone: '', image_file: null });

      const lRes = await fetch('/api/studio-locations');
      const lData = await lRes.json();
      setLocations(lData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleLocationUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const formData = new FormData();
    formData.append('state_key', editingLocation.state_key);
    formData.append('name', editingLocation.name);
    formData.append('city', editingLocation.city);
    formData.append('address', editingLocation.address);
    formData.append('details', editingLocation.details);
    formData.append('phone', editingLocation.phone);

    if (editingLocation.image_file_new) {
      formData.append('image_file', editingLocation.image_file_new);
    }

    try {
      const res = await fetch(`/api/admin/studio-locations/${editingLocation.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update studio location.');

      showNotification('success', 'Studio location updated successfully!');
      setEditingLocation(null);

      const lRes = await fetch('/api/studio-locations');
      const lData = await lRes.json();
      setLocations(lData);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm('Delete this studio location?')) return;
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/studio-locations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete studio location.');

      setLocations(locations.filter(l => l.id !== id));
      showNotification('success', 'Studio location removed.');
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleWhatsAppUpdate = async (e) => {
    e.preventDefault();
    if (!whatsappInput.trim()) {
      showNotification('error', 'Please enter a valid WhatsApp number.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      setSavingWhatsApp(true);
      const res = await fetch('/api/admin/settings/whatsapp_number', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: whatsappInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update WhatsApp number.');

      showNotification('success', 'WhatsApp Support Number updated successfully!');

      // Refresh local settings & global context
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      setWhatsappInput(settingsData.whatsapp_number || whatsappInput.trim());
      if (refreshSettings) refreshSettings();
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setSavingWhatsApp(false);
    }
  };

  const handleToggleShowLeadsPublic = async (checked) => {
    const token = localStorage.getItem('adminToken');
    const newValue = checked ? '1' : '0';
    setTogglingShowLeadsPublic(true);
    try {
      const res = await fetch('/api/admin/settings/show_leads_public', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: newValue })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update setting');
      setSettings(prev => ({ ...prev, show_leads_public: newValue }));
      showNotification('success', checked ? 'Enabled: Public leads are now visible at /admin' : 'Disabled: /admin leads panel is now hidden');
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setTogglingShowLeadsPublic(false);
    }
  };

  const handleSettingUpdate = async (e, key, form) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    if (form.file && form.file.size > 300 * 1024 * 1024) {
      showNotification('error', 'Video file is too large. Maximum allowed size is 300MB.');
      return;
    }

    const formData = new FormData();
    if (form.file) {
      formData.append('file', form.file);
    } else if (form.external_url) {
      formData.append('external_url', form.external_url);
    } else {
      showNotification('error', 'Please upload a video file or provide an external URL.');
      return;
    }

    try {
      setUploadingSettingKey(key);
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        if (res.status === 413) throw new Error('Video file exceeds server size limit (Max 300MB).');
        if (res.status === 504 || res.status === 408) throw new Error('Upload timed out. Please try a smaller video file.');
        throw new Error(`Server returned HTTP ${res.status}.`);
      }

      if (!res.ok) throw new Error(data.message || 'Failed to update setting.');

      showNotification('success', 'Website video updated successfully!');

      if (e.target && typeof e.target.reset === 'function') {
        e.target.reset();
      }

      // Refresh settings
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData);

      // Clear forms
      if (key === 'hero_video') {
        setHeroForm({ file: null, external_url: '' });
      } else if (key === 'about_video') {
        setAboutForm({ file: null, external_url: '' });
      } else {
        setTestDriveForm({ file: null, external_url: '' });
      }
    } catch (err) {
      showNotification('error', err.message);
    } finally {
      setUploadingSettingKey(null);
    }
  };

  const handleServiceUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingService.title,
          subtitle: editingService.subtitle,
          price: parseInt(editingService.price),
          duration: editingService.duration,
          description: editingService.description,
          features: editingService.features_raw ? editingService.features_raw.split('\n').filter(f => f.trim() !== '') : editingService.features,
          badge: editingService.badge
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update service.');

      showNotification('success', 'Service plan updated successfully!');

      // Refresh services
      const servRes = await fetch('/api/services');
      const servData = await servRes.json();
      setServicesList(servData);
      setEditingService(null);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const handleFranchiseUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    try {
      const res = await fetch(`/api/admin/franchise-models/${editingFranchise.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editingFranchise.title,
          charges: editingFranchise.charges,
          tc: editingFranchise.tc_raw ? editingFranchise.tc_raw.split('\n').filter(f => f.trim() !== '') : editingFranchise.tc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update franchise model.');

      showNotification('success', 'Franchise model updated successfully!');

      // Refresh franchise models
      const franRes = await fetch('/api/franchise-models');
      const franData = await franRes.json();
      setFranchiseList(franData);
      setEditingFranchise(null);
    } catch (err) {
      showNotification('error', err.message);
    }
  };

  const ensureUtcIso = (str) => {
    if (!str) return '';
    let s = String(str).trim();
    if (!s) return '';
    if (s.endsWith('Z')) return s;
    s = s.replace(' ', 'T');
    const timePart = s.includes('T') ? s.split('T')[1] : '';
    const hasTimezone = timePart.includes('+') || timePart.includes('-') || timePart.endsWith('Z');
    if (!hasTimezone) s += 'Z';
    return s;
  };

  const getTodayISTString = () => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const iso = ensureUtcIso(dateStr);
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const iso = ensureUtcIso(dateStr);
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 0) return 'Just now';
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateStr);
  };

  const simplifyDeviceId = (raw) => {
    if (!raw) return 'DEV-1001';
    const str = String(raw).trim();
    const match = str.match(/DEV-(\d{4,5})/i);
    if (match) return `DEV-${match[1]}`;
    if (/^\d{4,5}$/.test(str)) return `DEV-${str}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    return `DEV-${1000 + (Math.abs(hash) % 9000)}`;
  };

  const copyToClipboard = (text, idKey, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
    setCopiedId(idKey);
    showNotification('success', `Copied "${text}" to clipboard.`);
    setTimeout(() => setCopiedId(''), 2500);
  };

  const openGoogleMaps = (v, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (v.latitude && v.longitude) {
      window.open(`https://www.google.com/maps?q=${v.latitude},${v.longitude}`, '_blank', 'noopener,noreferrer');
    } else {
      const locationStr = [v.city, v.region, v.country].filter(Boolean).join(', ');
      if (locationStr) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationStr)}`, '_blank', 'noopener,noreferrer');
      } else {
        window.open(`https://www.google.com/maps`, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const getCountryFlag = (country) => {
    if (!country) return '🌐';
    const c = String(country).toLowerCase();
    if (c.includes('india')) return '🇮🇳';
    if (c.includes('united states') || c === 'us' || c === 'usa') return '🇺🇸';
    if (c.includes('united kingdom') || c === 'uk' || c.includes('britain')) return '🇬🇧';
    if (c.includes('united arab emirates') || c.includes('uae') || c.includes('dubai')) return '🇦🇪';
    if (c.includes('canada')) return '🇨🇦';
    if (c.includes('australia')) return '🇦🇺';
    if (c.includes('singapore')) return '🇸🇬';
    if (c.includes('germany')) return '🇩🇪';
    if (c.includes('france')) return '🇫🇷';
    if (c.includes('saudi')) return '🇸🇦';
    if (c.includes('qatar')) return '🇶🇦';
    return '🌐';
  };

  const getPlatformDetails = (platform) => {
    const raw = String(platform || '').trim();
    const p = raw.toLowerCase();
    if (p.includes('whatsapp')) {
      return { key: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25D366', bg: 'rgba(37, 211, 102, 0.12)', border: 'rgba(37, 211, 102, 0.35)', badge: 'WhatsApp Chat/Share' };
    }
    if (p.includes('facebook') || p.includes('fb')) {
      return { key: 'facebook', name: 'Facebook', icon: '👥', color: '#1877F2', bg: 'rgba(24, 119, 242, 0.12)', border: 'rgba(24, 119, 242, 0.35)', badge: 'Facebook Post/Ad' };
    }
    if (p.includes('instagram') || p.includes('ig')) {
      return { key: 'instagram', name: 'Instagram', icon: '📸', color: '#E4405F', bg: 'rgba(228, 64, 95, 0.12)', border: 'rgba(228, 64, 95, 0.35)', badge: 'Instagram Story/Bio' };
    }
    if (p.includes('google')) {
      return { key: 'google', name: 'Google Search / Ads', icon: '🔍', color: '#4285F4', bg: 'rgba(66, 133, 244, 0.12)', border: 'rgba(66, 133, 244, 0.35)', badge: 'Google Organic / Ads' };
    }
    if (p.includes('youtube')) {
      return { key: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000', bg: 'rgba(255, 0, 0, 0.12)', border: 'rgba(255, 0, 0, 0.35)', badge: 'YouTube Video Link' };
    }
    if (p.includes('linkedin')) {
      return { key: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0A66C2', bg: 'rgba(10, 102, 194, 0.12)', border: 'rgba(10, 102, 194, 0.35)', badge: 'LinkedIn Profile/Post' };
    }
    if (p.includes('twitter') || p.includes('x.com')) {
      return { key: 'twitter', name: 'Twitter / X', icon: '🐦', color: '#1DA1F2', bg: 'rgba(29, 161, 242, 0.12)', border: 'rgba(29, 161, 242, 0.35)', badge: 'Twitter / X' };
    }
    if (p.includes('telegram')) {
      return { key: 'telegram', name: 'Telegram', icon: '✈️', color: '#229ED9', bg: 'rgba(34, 158, 217, 0.12)', border: 'rgba(34, 158, 217, 0.35)', badge: 'Telegram Message' };
    }
    if (p.includes('pinterest')) {
      return { key: 'pinterest', name: 'Pinterest', icon: '📌', color: '#BD081C', bg: 'rgba(189, 8, 28, 0.12)', border: 'rgba(189, 8, 28, 0.35)', badge: 'Pinterest Pin' };
    }
    if (p.includes('referral')) {
      return { key: 'referral', name: 'Referral Link', icon: '🔗', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.35)', badge: 'Partner / Referral' };
    }
    return { key: 'direct', name: 'Direct Traffic', icon: '🌐', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', badge: 'Direct / Bookmarked' };
  };

  const getBotDetails = (v) => {
    if (!v) return { isBot: false, name: 'Verified Human Prospect', icon: '👤', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.35)', label: 'Verified Human' };
    if (v.is_bot || v.bot_name) {
      return {
        isBot: true,
        name: v.bot_name || 'Web Crawler / Preview Bot',
        icon: '🤖',
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.14)',
        border: 'rgba(249, 115, 22, 0.35)',
        label: `Bot: ${v.bot_name || 'Crawler'}`
      };
    }
    return {
      isBot: false,
      name: 'Verified Human Prospect',
      icon: '👤',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.35)',
      label: 'Verified Human'
    };
  };

  const getVisitorBooking = (v) => {
    if (!v) return null;
    if (v.booking) return v.booking;
    const simpleDevId = simplifyDeviceId(v.device_id || v.visitor_id);
    return (bookings || []).find(b => {
      if (b.device_id && (simplifyDeviceId(b.device_id) === simpleDevId || b.device_id === v.device_id || b.device_id === v.raw_device_id)) return true;
      if (b.visitor_id && v.visitor_id && b.visitor_id === v.visitor_id) return true;
      if (b.ip_address && v.ip_address && b.ip_address === v.ip_address) return true;
      return false;
    }) || null;
  };

  const generateVisitorDossier = (v, historyList = []) => {
    if (!v) return '';
    const devId = simplifyDeviceId(v.device_id || v.visitor_id);
    const b = v.booking || getVisitorBooking(v);
    const isNew = (!v.past_visits || v.past_visits === 0);
    const totalVisits = v.total_visits || ((v.past_visits || 0) + 1);
    const locationStr = [v.city, v.region, v.country].filter(Boolean).join(', ');
    const flag = getCountryFlag(v.country);
    const ispStr = v.isp || 'Broadband / Cellular Network';
    const ipStr = v.ip_address || 'Not Recorded';
    const mapUrl = v.latitude && v.longitude ? `https://maps.google.com/?q=${v.latitude},${v.longitude}` : (locationStr ? `https://maps.google.com/?q=${encodeURIComponent(locationStr)}` : 'https://maps.google.com');
    const deviceType = (v.device_type || 'Mobile').charAt(0).toUpperCase() + (v.device_type || 'Mobile').slice(1);
    const os = v.os || 'Web OS';
    const browser = v.browser || 'Web Browser';
    const screen = v.screen_resolution || 'Standard Viewport';
    const firstSeen = formatDate(v.first_visit_at || v.created_at);
    const lastActive = formatDate(v.created_at);
    const platInfo = getPlatformDetails(v.platform);
    const botInfo = getBotDetails(v);
    const campaignStr = [v.utm_campaign, v.utm_source, v.utm_medium].filter(Boolean).join(' / ');

    let journeyText = '';
    if (historyList && historyList.length > 0) {
      journeyText = historyList.map((h, i) => `• ${historyList.length - i}. ${h.path === '/' ? 'Home Page' : h.path} (${formatDate(h.created_at)})`).join('\n');
    } else {
      journeyText = `• 1. ${v.path === '/' ? 'Home Page' : v.path} (${lastActive})`;
    }

    let bookingSection = '';
    if (b) {
      bookingSection = `
💼 SUBMITTED BOOKING INQUIRY:
• Reference ID: #WTP-${b.id}
• Status: ${b.payment_status || 'Inquiry / Pending'}
• Service / Package: ${b.package_name || b.type || 'General Consultation'}
• Preferred Date: ${b.booking_date || 'N/A'}${b.time_slot ? ` at ${b.time_slot}` : ''}
• Budget: ${b.budget || (b.price ? '₹' + b.price : 'N/A')}
• Message: ${b.message || 'No additional comments'}
`;
    }

    return `📋 FITSCALEZ VISITOR INTELLIGENCE DOSSIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🆔 Device ID: ${devId}
👤 Prospect: ${b ? b.name : 'Anonymous Visitor'}
📞 Phone: ${b?.phone || 'Not Submitted'}
📧 Email: ${b?.email || 'Not Submitted'}

🌐 CUSTOMER REACH & ATTRIBUTION:
• Reached via Platform: ${platInfo.icon} ${platInfo.name} (${v.platform || 'Direct'})
• Attribution Campaign: ${campaignStr || 'Organic / Unspecified'}
• Traffic Classification: ${botInfo.icon} ${botInfo.name}

📍 LOCATION & NETWORK:
• City: ${locationStr || 'Unknown City'} ${flag}
• Network / ISP: ${ispStr}
• IP Address: ${ipStr}
• Google Maps: ${mapUrl}

💻 DEVICE SPECIFICATIONS:
• Type: ${deviceType} (${os})
• Browser: ${browser}
• Screen: ${screen}

🔁 ENGAGEMENT & HISTORY:
• Total Visits: ${totalVisits} sessions (${isNew ? '🌟 New Visitor' : '🔁 Returning Visitor'})
• First Seen: ${firstSeen}
• Last Active: ${lastActive}
${bookingSection}
🧭 BROWSING JOURNEY:
${journeyText}
`;
  };

  const copyDossier = (v) => {
    const text = generateVisitorDossier(v, deviceHistory);
    copyToClipboard(text, 'dossier_copy');
  };

  const openVisitorInspector = async (v) => {
    const b = getVisitorBooking(v);
    setInspectingVisitor(b ? { ...v, booking: b } : v);
    setDeviceHistory([]);
    const devId = v.device_id || v.raw_device_id || v.visitor_id;
    if (!devId) return;
    const token = localStorage.getItem('adminToken');
    try {
      setLoadingDeviceHistory(true);
      const res = await fetch(`/api/admin/analytics/device/${encodeURIComponent(devId)}?vid=${encodeURIComponent(v.visitor_id || '')}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        setDeviceHistory(json.history || []);
        if (json.booking) {
          setInspectingVisitor(prev => prev ? { ...prev, booking: json.booking } : prev);
        }
      }
    } catch (err) {
      console.warn('Failed to load device history:', err);
    } finally {
      setLoadingDeviceHistory(false);
    }
  };

  const filteredVisits = (analytics.recentVisits || []).filter(v => {
    const pastCount = typeof v.past_visits === 'number' ? v.past_visits : 0;
    const b = getVisitorBooking(v);

    if (visitorDeviceFilter === 'new') {
      if (pastCount > 0) return false;
    } else if (visitorDeviceFilter === 'returning') {
      if (pastCount === 0) return false;
    } else if (visitorDeviceFilter === 'booked') {
      if (!b) return false;
    } else if (visitorDeviceFilter === 'humans') {
      if (v.is_bot) return false;
    } else if (visitorDeviceFilter === 'bots') {
      if (!v.is_bot) return false;
    } else if (visitorDeviceFilter === 'whatsapp') {
      if ((v.platform || '').toLowerCase() !== 'whatsapp') return false;
    } else if (visitorDeviceFilter === 'facebook') {
      if ((v.platform || '').toLowerCase() !== 'facebook') return false;
    } else if (visitorDeviceFilter === 'instagram') {
      if ((v.platform || '').toLowerCase() !== 'instagram') return false;
    } else if (visitorDeviceFilter === 'google') {
      if (!(v.platform || '').toLowerCase().includes('google')) return false;
    } else if (visitorDeviceFilter === 'mobile') {
      if (v.device_type !== 'mobile') return false;
    } else if (visitorDeviceFilter === 'desktop') {
      if (v.device_type !== 'desktop') return false;
    } else if (visitorDeviceFilter === 'tablet') {
      if (v.device_type !== 'tablet') return false;
    }

    if (visitorSearch.trim()) {
      const q = visitorSearch.toLowerCase();
      const simpleId = simplifyDeviceId(v.device_id || v.visitor_id).toLowerCase();
      const numOnly = simpleId.replace('dev-', '');
      const matchBookName = b && (b.name || '').toLowerCase().includes(q);
      const matchBookPhone = b && String(b.phone || '').includes(q);
      const matchBookEmail = b && (b.email || '').toLowerCase().includes(q);
      const matchBookPkg = b && (b.package_name || b.type || '').toLowerCase().includes(q);
      const matchDev = (v.device_id || '').toLowerCase().includes(q) || simpleId.includes(q) || numOnly.includes(q);
      const matchVid = (v.visitor_id || '').toLowerCase().includes(q);
      const matchPath = (v.path || '').toLowerCase().includes(q);
      const matchCity = (v.city || '').toLowerCase().includes(q);
      const matchRegion = (v.region || '').toLowerCase().includes(q);
      const matchCountry = (v.country || '').toLowerCase().includes(q);
      const matchIp = (v.ip_address || '').toLowerCase().includes(q);
      const matchIsp = (v.isp || '').toLowerCase().includes(q);
      const matchBrowser = (v.browser || '').toLowerCase().includes(q);
      const matchOs = (v.os || '').toLowerCase().includes(q);
      const matchPlatform = (v.platform || '').toLowerCase().includes(q);
      const matchBot = (v.bot_name || '').toLowerCase().includes(q);
      const matchUtm = (v.utm_campaign || '').toLowerCase().includes(q) || (v.utm_source || '').toLowerCase().includes(q);
      return matchDev || matchVid || matchPath || matchCity || matchRegion || matchCountry || matchIp || matchIsp || matchBrowser || matchOs || matchBookName || matchBookPhone || matchBookEmail || matchBookPkg || matchPlatform || matchBot || matchUtm;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: '8rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          Initializing Secure Dashboard Panel...
        </h2>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container" style={{ padding: '3rem 0 8rem 0' }}>

      {/* Top Banner */}
      <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-muted)', paddingBottom: '2.5rem', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem' }}>Dashboard Control Center</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Welcome back, {localStorage.getItem('adminUser') && localStorage.getItem('adminUser') !== 'parth' ? localStorage.getItem('adminUser') : 'fitscalez'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* 1.5x Fast Scroll Engine Speed Toggle */}
          <button
            type="button"
            onClick={toggleScrollSpeed}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '8px',
              background: scrollSpeed === '1.5' ? 'rgba(239, 199, 25, 0.15)' : scrollSpeed === '2.0' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${scrollSpeed === '1.5' ? 'var(--accent-orange)' : scrollSpeed === '2.0' ? '#22c55e' : 'var(--border-muted)'}`,
              color: scrollSpeed === '1.5' ? 'var(--accent-orange)' : scrollSpeed === '2.0' ? '#4ade80' : 'var(--text-secondary)',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: scrollSpeed === '1.5' ? '0 0 12px rgba(239, 199, 25, 0.2)' : 'none'
            }}
            title="Click to toggle scroll speed: 1.5x (Fast), 2.0x (Ultra), or 1.0x (Normal)"
          >
            <Zap size={15} />
            <span>⚡ Scroll: {scrollSpeed}x Speed {scrollSpeed === '1.5' ? '(Fast)' : scrollSpeed === '2.0' ? '(Ultra)' : '(Normal)'}</span>
          </button>

          {/* Admin Push Alert Toggle Button */}
          <button
            type="button"
            onClick={handleToggleAdminPush}
            disabled={togglingAdminPush}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              background: adminPushEnabled ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 199, 25, 0.12)',
              border: `1px solid ${adminPushEnabled ? '#22c55e' : 'rgba(239, 199, 25, 0.4)'}`,
              color: adminPushEnabled ? '#4ade80' : '#efc719',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: togglingAdminPush ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: adminPushEnabled ? '0 0 12px rgba(34, 197, 94, 0.25)' : 'none'
            }}
            title={adminPushEnabled ? 'Push alerts active on this device: click to disable' : 'Click to enable instant push notifications on this device when new leads arrive'}
          >
            <Bell size={15} />
            <span>{adminPushEnabled ? '🔔 Lead Alerts: Active' : '🔔 Enable Lead Alerts'}</span>
          </button>

          {/* Allow Leads in /admin Quick Header Action */}
          <button
            type="button"
            onClick={() => !togglingShowLeadsPublic && handleToggleShowLeadsPublic(!isLeadsAllowedInAdmin)}
            disabled={togglingShowLeadsPublic}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '8px',
              background: isLeadsAllowedInAdmin ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 199, 25, 0.12)',
              border: `1px solid ${isLeadsAllowedInAdmin ? '#22c55e' : 'rgba(239, 199, 25, 0.4)'}`,
              color: isLeadsAllowedInAdmin ? '#4ade80' : '#efc719',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: togglingShowLeadsPublic ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isLeadsAllowedInAdmin ? '0 0 12px rgba(34, 197, 94, 0.25)' : 'none'
            }}
            title={isLeadsAllowedInAdmin ? 'Leads currently allowed at /admin. Click to turn off.' : 'Click to allow leads at /admin'}
          >
            <input
              type="checkbox"
              id="header_allow_leads_admin"
              checked={isLeadsAllowedInAdmin}
              onChange={(e) => handleToggleShowLeadsPublic(e.target.checked)}
              disabled={togglingShowLeadsPublic}
              onClick={(e) => e.stopPropagation()}
              style={{ cursor: 'pointer', accentColor: '#22c55e', width: '15px', height: '15px', margin: 0 }}
            />
            <span style={{ cursor: 'pointer' }}>
              {isLeadsAllowedInAdmin ? '✓ Allowed in /admin' : 'Allow leads in /admin'}
            </span>
            {isLeadsAllowedInAdmin && (
              <a
                href="/admin"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#e5b842', display: 'inline-flex', alignItems: 'center', marginLeft: '0.2rem' }}
                title="Open https://walktheplan.in/admin"
              >
                <ExternalLink size={13} />
              </a>
            )}
          </button>

          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', color: '#ff6b6b', borderColor: 'rgba(255, 107, 107, 0.2)' }}>
            <LogOut size={16} /> Logout Session
          </button>
        </div>
      </header>

      {/* Real-Time Floating Booking Alert Banner with Audio Notification */}
      {liveBookingAlert && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 99999,
          maxWidth: '440px',
          width: 'calc(100vw - 32px)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(11, 19, 43, 0.98) 100%)',
          border: '2px solid #22c55e',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.7), 0 0 30px rgba(34, 197, 94, 0.35)',
          animation: 'slideUpNotif 0.3s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🚨</span>
              <strong style={{ color: '#22c55e', fontSize: '1rem' }}>Instant New Booking Alert!</strong>
            </div>
            <button
              onClick={() => setLiveBookingAlert(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <div style={{ marginTop: '0.65rem', fontSize: '0.86rem', color: '#f8fafc', lineHeight: '1.5' }}>
            <div><strong>Client:</strong> {liveBookingAlert.name}</div>
            <div><strong>Phone:</strong> <a href={`tel:${liveBookingAlert.phone}`} style={{ color: '#efc719' }}>{liveBookingAlert.phone}</a></div>
            <div><strong>Email:</strong> {liveBookingAlert.email || 'N/A'}</div>
            <div><strong>Service:</strong> {liveBookingAlert.package_name || 'Studio Walkthrough'}</div>
            {liveBookingAlert.price && <div><strong>Amount:</strong> ₹{Number(liveBookingAlert.price).toLocaleString('en-IN')}</div>}
          </div>
          <button
            onClick={() => {
              setCurrentTab('bookings');
              setLiveBookingAlert(null);
            }}
            style={{
              marginTop: '0.85rem',
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              background: '#22c55e',
              color: '#0b132b',
              fontWeight: 700,
              fontSize: '0.84rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            📋 View Lead in Bookings Table
          </button>
        </div>
      )}

      {/* Permission alert prompt banner if notifications are blocked or not allowed */}
      {typeof Notification !== 'undefined' && Notification.permission !== 'granted' && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 199, 25, 0.12) 0%, rgba(239, 199, 25, 0.04) 100%)',
          border: '1px solid rgba(239, 199, 25, 0.45)',
          borderRadius: '10px',
          padding: '0.9rem 1.35rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <div>
              <strong style={{ color: '#efc719', fontSize: '0.92rem' }}>Enable Instant Booking Alerts on this device</strong>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.15rem' }}>
                Allow browser notifications to receive instant audio and push alerts on this device whenever a customer registers a booking.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleAdminPush}
            disabled={togglingAdminPush}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.84rem', background: '#efc719', color: '#0b132b', fontWeight: 700 }}
          >
            {togglingAdminPush ? 'Activating...' : '🔔 Turn On Device Alerts'}
          </button>
        </div>
      )}

      {/* Overview mini-stats cards */}
      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 199, 25,0.1)', color: 'var(--accent-orange)', padding: '0.75rem', borderRadius: '8px' }}><Users size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{bookings.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Leads</p>
          </div>
        </div>

        {/* Website Visitors Metric Card */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', border: currentTab === 'analytics' ? '1px solid var(--accent-orange)' : undefined }} onClick={() => setCurrentTab('analytics')} title="Click to view detailed visitor analytics">
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.75rem', borderRadius: '8px' }}><Eye size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{analytics.overview.total_views.toLocaleString('en-IN')}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Visitors ({analytics.overview.today_views} today)</p>
          </div>
        </div>


        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '0.75rem', borderRadius: '8px' }}><FileText size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{blogs.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Published Blogs</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(37,211,102,0.1)', color: '#25D366', padding: '0.75rem', borderRadius: '8px' }}><Image size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{gallery.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gallery Media</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '0.75rem', borderRadius: '8px' }}><Video size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{testimonials.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Testimonials</p>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', padding: '0.75rem', borderRadius: '8px' }}><MapPin size={20} /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem' }}>{locations.length}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Locations</p>
          </div>
        </div>
      </div>

      {/* Tab select header */}
      <div className="admin-tabs-nav tabs-header" style={{ marginBottom: '3rem', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className={`tab-btn ${currentTab === 'bookings' ? 'active' : ''}`} onClick={() => setCurrentTab('bookings')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckSquare size={16} /> Booking Leads ({bookings.filter(b => b.status === 'pending').length} pending)
        </button>
        <button className={`tab-btn ${currentTab === 'analytics' ? 'active' : ''}`} onClick={() => setCurrentTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={16} /> Visitors & Devices ({analytics.devices.mobile.pct}% Mobile)
        </button>
        <button className={`tab-btn ${currentTab === 'push' ? 'active' : ''}`} onClick={() => { setCurrentTab('push'); fetchPushStats(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={16} /> Push Reminders ({pushStats.not_booked || 0} unbooked)
        </button>
        <button className={`tab-btn ${currentTab === 'blogs' ? 'active' : ''}`} onClick={() => setCurrentTab('blogs')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} /> Manage Blogs
        </button>
        <button className={`tab-btn ${currentTab === 'gallery' ? 'active' : ''}`} onClick={() => setCurrentTab('gallery')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image size={16} /> Studio Gallery
        </button>
        <button className={`tab-btn ${currentTab === 'testimonials' ? 'active' : ''}`} onClick={() => setCurrentTab('testimonials')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Video size={16} /> Testimonials
        </button>
        <button className={`tab-btn ${currentTab === 'locations' ? 'active' : ''}`} onClick={() => setCurrentTab('locations')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={16} /> Studio Locations
        </button>
        <button className={`tab-btn ${currentTab === 'settings' ? 'active' : ''}`} onClick={() => setCurrentTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={16} /> Website Settings
        </button>
        <button className={`tab-btn ${currentTab === 'services' ? 'active' : ''}`} onClick={() => setCurrentTab('services')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckSquare size={16} /> Services Content
        </button>
        <button className={`tab-btn ${currentTab === 'franchise' ? 'active' : ''}`} onClick={() => setCurrentTab('franchise')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={16} /> Franchise Content
        </button>
        <a
          href="/fitscalez/crm"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#000', textDecoration: 'none', cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(245,158,11,0.4)', letterSpacing: '0.02em',
          }}
        >
          <Briefcase size={15} /> CRM Dashboard ↗
        </a>
      </div>

      {/* Notifications banner */}
      {notif.msg && (
        <div className="admin-notif" style={{
          position: 'fixed', bottom: '30px', right: '30px', padding: '1rem 2rem', borderRadius: '8px', zIndex: 9999,
          background: notif.type === 'success' ? '#14532d' : '#7f1d1d',
          border: '1px solid',
          borderColor: notif.type === 'success' ? '#22c55e' : '#ef4444',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {notif.msg}
        </div>
      )}

      {/* --- TAB CONTENT AREA --- */}
      <div className="tab-pane">

        {/* TAB 1: BOOKINGS / LEADS */}
        {currentTab === 'bookings' && (() => {
          const isPaidBooking = (b) => (b.payment_status === 'Paid ₹5,000' || b.payment_status === 'success' || (b.amount_paid && Number(b.amount_paid) > 0));
          const isUnpaidBooking = (b) => (!b.payment_status || b.payment_status.includes('Unpaid') || b.payment_status.includes('Pending') || Number(b.amount_paid || 0) === 0);
          const isPendingBooking = (b) => (b.status === 'pending' || !b.status || b.type === 'pending');

          const q = (searchQuery || '').trim().toLowerCase();
          const cleanQDigits = (searchQuery || '').replace(/[^0-9]/g, '');

          const filteredBookings = bookings.filter(b => {
            if (bookingFilter === 'paid' && !isPaidBooking(b)) return false;
            if (bookingFilter === 'unpaid' && !isUnpaidBooking(b)) return false;
            if (bookingFilter === 'pending' && !isPendingBooking(b)) return false;
            if (bookingFilter !== 'all' && bookingFilter !== 'paid' && bookingFilter !== 'unpaid' && bookingFilter !== 'pending' && (b.type || 'inquiry') !== bookingFilter) return false;

            if (!q) return true;

            const name = (b.name || '').toLowerCase();
            const email = (b.email || '').toLowerCase();
            const phone = (b.phone || '').toLowerCase();
            const phoneDigits = (b.phone || '').replace(/[^0-9]/g, '');
            const message = (b.message || '').toLowerCase();
            const pkg = (b.package_name || '').toLowerCase();
            const type = (b.type || '').toLowerCase();
            const budget = (b.budget || '').toLowerCase();
            const payId = (b.razorpay_payment_id || '').toLowerCase();
            const city = (b.city || '').toLowerCase();

            const matchesPhone = phone.includes(q) || (cleanQDigits.length >= 3 && phoneDigits.includes(cleanQDigits));

            return name.includes(q) ||
              matchesPhone ||
              email.includes(q) ||
              message.includes(q) ||
              pkg.includes(q) ||
              type.includes(q) ||
              budget.includes(q) ||
              payId.includes(q) ||
              city.includes(q);
          });

          const totalLeads = filteredBookings.length;
          const totalPages = pageSize === 'all' ? 1 : Math.ceil(totalLeads / Number(pageSize));
          const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
          const startIndex = pageSize === 'all' ? 0 : (safeCurrentPage - 1) * Number(pageSize);
          const paginatedBookings = pageSize === 'all' ? filteredBookings : filteredBookings.slice(startIndex, startIndex + Number(pageSize));

          return (
            <div className="admin-leads-card glass-card" style={{ padding: '2rem 1.5rem', overflowX: 'auto' }}>
              <div className="admin-leads-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: 800 }}>Client Leads & Inquiries</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginTop: '0.25rem' }}>
                    Track all paid bookings, test drive slots, and customer inquiries with real-time search.
                  </p>
                  {/* Public /admin Panel Quick Toggle */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      cursor: 'pointer',
                      background: settings.show_leads_public === '1' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      border: settings.show_leads_public === '1' ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: settings.show_leads_public === '1' ? '#4ade80' : 'var(--text-secondary)',
                      userSelect: 'none',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={isLeadsAllowedInAdmin}
                        onChange={(e) => handleToggleShowLeadsPublic(e.target.checked)}
                        disabled={togglingShowLeadsPublic}
                        style={{ cursor: 'pointer', accentColor: '#22c55e', width: '16px', height: '16px' }}
                      />
                      <span>Allow option to show leads in /admin</span>
                    </label>
                    {isLeadsAllowedInAdmin && (
                      <a
                        href="/admin"
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '0.78rem', color: '#e5b842', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontWeight: 600 }}
                      >
                        <ExternalLink size={12} /> Open /admin Live
                      </a>
                    )}
                  </div>
                </div>

                {/* Calendar Date Range & Excel Download Section */}
                <div className="admin-date-range-controls" style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-muted)' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <Calendar size={15} style={{ color: 'var(--accent-orange)' }} /> Custom Date Range:
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{
                        background: '#0a0a0f',
                        color: '#ffffff',
                        border: '1px solid var(--border-muted)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{
                        background: '#0a0a0f',
                        color: '#ffffff',
                        border: '1px solid var(--border-muted)',
                        padding: '0.35rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        colorScheme: 'dark'
                      }}
                    />
                  </div>

                  <button
                    onClick={() => exportLeadsToExcel('date_range')}
                    style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.25)',
                      color: '#60a5fa',
                      border: '1px solid rgba(96, 165, 250, 0.4)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition-fast)'
                    }}
                    title="Download leads for selected calendar date range in Excel format"
                  >
                    <Download size={15} /> Range (.xlsx)
                  </button>

                  <button
                    onClick={() => exportLeadsToExcel('filtered', filteredBookings)}
                    style={{
                      backgroundColor: 'rgba(239, 199, 25, 0.2)',
                      color: 'var(--accent-orange)',
                      border: '1px solid rgba(250, 232, 164, 0.35)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition-fast)'
                    }}
                    title="Download current filtered / searched leads in Excel format"
                  >
                    <FileSpreadsheet size={15} /> Export Filtered ({filteredBookings.length})
                  </button>

                  <button
                    onClick={() => exportLeadsToExcel('all')}
                    style={{
                      backgroundColor: 'rgba(16, 124, 65, 0.25)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      transition: 'var(--transition-fast)'
                    }}
                    title="Download all leads in Excel sheet format"
                  >
                    <FileSpreadsheet size={15} /> All ({bookings.length})
                  </button>
                </div>
              </div>

              {/* SEARCH BAR & FILTER PILLS */}
              <div className="admin-search-filter" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {/* Real-time Search Input Box */}
                <div className="admin-search-bar" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(250, 232, 164, 0.22)',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  width: '100%',
                  position: 'relative'
                }}>
                  <Search size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="🔍 Search leads by Client Name, Mobile Number, Email, Notes..."
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '0.92rem',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#ffffff',
                        borderRadius: '50%',
                        width: '22px',
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                      title="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0, paddingLeft: '0.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                    {filteredBookings.length} matching
                  </span>
                </div>

                {/* Filter Segments */}
                <div className="admin-filter-pills" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.2rem' }}>
                    Type:
                  </span>
                  {['all', 'paid', 'unpaid', 'pending', 'inquiry', 'purchase', 'franchise', 'career'].map((t) => {
                    let count = bookings.length;
                    if (t === 'paid') count = bookings.filter(isPaidBooking).length;
                    else if (t === 'unpaid') count = bookings.filter(isUnpaidBooking).length;
                    else if (t === 'pending') count = bookings.filter(isPendingBooking).length;
                    else if (t !== 'all') count = bookings.filter(b => (b.type || 'inquiry') === t).length;

                    let activeBg = 'var(--accent-orange)';
                    let activeColor = '#000000';
                    if (t === 'paid') { activeBg = '#22c55e'; activeColor = '#ffffff'; }
                    if (t === 'unpaid') { activeBg = '#ef4444'; activeColor = '#ffffff'; }
                    if (t === 'pending') { activeBg = '#f59e0b'; activeColor = '#000000'; }

                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setBookingFilter(t);
                          setCurrentPage(1);
                        }}
                        style={{
                          background: bookingFilter === t ? activeBg : 'rgba(255,255,255,0.02)',
                          color: bookingFilter === t ? activeColor : 'var(--text-secondary)',
                          border: '1px solid',
                          borderColor: bookingFilter === t ? activeBg : 'var(--border-muted)',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        {t.toUpperCase()} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed var(--border-muted)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    No leads found matching {searchQuery ? `"${searchQuery}"` : 'selected filter'}.
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="btn-secondary"
                      style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', fontSize: '0.82rem' }}
                    >
                      Clear Search Filter
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="admin-table-wrap" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table className="compare-table admin-leads-table" style={{ fontSize: '0.88rem', minWidth: '700px', width: '100%' }}>
                      <thead>
                        <tr>
                          <th className="col-date">Date</th>
                          <th className="col-client">Client Detail</th>
                          <th className="col-type">Lead Type & Package</th>
                          <th className="col-payment">Payment Status</th>
                          <th className="col-notes">Inquiry / Notes</th>
                          <th className="col-status">Status</th>
                          <th className="col-actions" style={{ minWidth: '240px' }}>Admin Visibility &amp; Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBookings.map((b) => {
                          const isPaid = isPaidBooking(b);
                          const paidVal = b.amount_paid || (isPaid ? 5000 : 0);
                          const totalPrice = b.price || 5000;
                          const balVal = b.balance_pending || Math.max(0, totalPrice - paidVal);
                          const cleanPhone = String(b.phone || '').replace(/[^0-9]/g, '');

                          return (
                            <tr key={b.id} style={{ opacity: b.status === 'replied' ? 0.65 : 1 }}>
                              <td className="col-date" style={{ verticalAlign: 'top', minWidth: '95px' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  <Clock size={12} /> {formatDate(b.created_at)}
                                </span>
                              </td>
                              <td className="col-client" style={{ verticalAlign: 'top', minWidth: '180px' }}>
                                <strong style={{ color: '#ffffff', fontSize: '0.92rem' }}>{b.name || 'Anonymous Client'}</strong>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                  {b.email && (
                                    <a
                                      href={`mailto:${b.email}`}
                                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}
                                      title="Send Email"
                                    >
                                      <Mail size={12} /> {b.email}
                                    </a>
                                  )}
                                  {b.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                      <a
                                        href={`tel:${cleanPhone}`}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#ffffff' }}
                                        title="Call Client"
                                      >
                                        <Phone size={12} /> {b.phone}
                                      </a>
                                      {cleanPhone.length >= 10 && (
                                        <a
                                          href={`https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=${encodeURIComponent(`Hi ${b.name || ''}! Thank you for your inquiry with Walk The Plan Studio. How can we assist you with your 1:1 floor plan walk-through?`)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            background: 'rgba(37, 211, 102, 0.15)',
                                            color: '#25D366',
                                            border: '1px solid rgba(37, 211, 102, 0.35)',
                                            padding: '0.15rem 0.4rem',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 600,
                                            textDecoration: 'none'
                                          }}
                                          title="Quick chat on WhatsApp"
                                        >
                                          <MessageCircle size={10} /> WhatsApp
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {b.device_id && (
                                    <div style={{ marginTop: '0.35rem' }}>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          openVisitorInspector({
                                            device_id: b.device_id,
                                            raw_device_id: b.raw_device_id || b.device_id,
                                            visitor_id: b.visitor_id,
                                            ip_address: b.ip_address,
                                            booking: b,
                                            created_at: b.created_at
                                          });
                                        }}
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          background: 'rgba(59, 130, 246, 0.1)',
                                          border: '1px solid rgba(59, 130, 246, 0.3)',
                                          borderRadius: '4px',
                                          padding: '0.15rem 0.45rem',
                                          fontSize: '0.72rem',
                                          color: '#93c5fd',
                                          cursor: 'pointer',
                                          fontWeight: 600,
                                          transition: 'all 0.2s ease'
                                        }}
                                        title="Click to view visitor intelligence & browsing timeline for this device"
                                      >
                                        <Hash size={11} color="#60a5fa" />
                                        <span>{simplifyDeviceId(b.device_id)}</span>
                                        <span style={{ fontSize: '0.66rem', color: '#60a5fa', opacity: 0.85 }}>· Journey ↗</span>
                                      </button>
                                    </div>
                                  )}
                                  {b.platform && (
                                    <div style={{ marginTop: '0.35rem' }}>
                                      {(() => {
                                        const pInfo = getPlatformDetails(b.platform);
                                        return (
                                          <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            background: pInfo.bg,
                                            color: pInfo.color,
                                            border: `1px solid ${pInfo.border}`,
                                            padding: '0.15rem 0.45rem',
                                            borderRadius: '4px',
                                            fontSize: '0.72rem',
                                            fontWeight: 700
                                          }} title={`Customer reached via ${pInfo.name}`}>
                                            <span>{pInfo.icon}</span> via {pInfo.name}
                                            {b.utm_source ? ` (${b.utm_source})` : ''}
                                          </span>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="col-type" style={{ verticalAlign: 'top', minWidth: '130px' }}>
                                <span style={{
                                  background: b.type === 'purchase' || b.type === 'test-drive' ? 'rgba(37,211,102,0.15)' :
                                    b.type === 'franchise' ? 'rgba(59,130,246,0.15)' :
                                      b.type === 'career' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                                  color: b.type === 'purchase' || b.type === 'test-drive' ? '#25D366' :
                                    b.type === 'franchise' ? '#3b82f6' :
                                      b.type === 'career' ? '#a855f7' : 'var(--text-secondary)',
                                  border: '1px solid',
                                  borderColor: b.type === 'purchase' || b.type === 'test-drive' ? 'rgba(37,211,102,0.3)' :
                                    b.type === 'franchise' ? 'rgba(59,130,246,0.3)' :
                                      b.type === 'career' ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)',
                                  padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700
                                }}>
                                  {(b.type || 'inquiry').toUpperCase()}
                                </span>

                                {b.package_name && (
                                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-orange)', marginTop: '0.4rem', fontWeight: 600 }}>
                                    {b.package_name} <br />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total: ₹{totalPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                )}

                                {(() => {
                                  const budgetVal = b.budget || (b.message && b.message.match(/Budget:\s*([^\r\n]+)/) ? b.message.match(/Budget:\s*([^\r\n]+)/)[1].trim() : null);
                                  return budgetVal ? (
                                    <div style={{ marginTop: '0.35rem' }}>
                                      <span style={{
                                        fontSize: '0.72rem',
                                        background: 'rgba(212, 175, 55, 0.12)',
                                        border: '1px solid rgba(212, 175, 55, 0.3)',
                                        color: 'var(--accent-orange)',
                                        padding: '0.15rem 0.45rem',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                        display: 'inline-block'
                                      }}>
                                        Budget: {budgetVal}
                                      </span>
                                    </div>
                                  ) : null;
                                })()}
                              </td>
                              <td className="col-payment" style={{ verticalAlign: 'top', minWidth: '150px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                  color: isPaid ? '#22c55e' : '#eab308',
                                  border: '1px solid',
                                  borderColor: isPaid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.4)',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  marginBottom: '0.3rem'
                                }}>
                                  {isPaid ? 'Paid ₹5,000 Token' : 'Unpaid / Pending'}
                                </span>

                                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                  <div>Paid: <strong style={{ color: isPaid ? '#22c55e' : 'var(--text-muted)' }}>₹{paidVal.toLocaleString('en-IN')}</strong></div>
                                  <div>Balance Due: <strong style={{ color: 'var(--accent-orange)' }}>₹{balVal.toLocaleString('en-IN')}</strong></div>
                                  {b.razorpay_payment_id && (
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                      Tx: <code style={{ color: '#ffffff' }}>{b.razorpay_payment_id}</code>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="col-notes" style={{ verticalAlign: 'top', color: 'var(--text-secondary)', fontSize: '0.85rem', minWidth: '160px', maxWidth: '280px', whiteSpace: 'normal', paddingRight: '1.25rem' }}>
                                {(() => {
                                  const msg = b.message || '';
                                  const limit = 120;
                                  if (!msg) return <em style={{ color: 'var(--text-muted)' }}>No notes</em>;
                                  if (msg.length <= limit) return (
                                    <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.45' }}>
                                      {msg}
                                    </div>
                                  );
                                  return (
                                    <details style={{ cursor: 'pointer', whiteSpace: 'normal' }}>
                                      <summary style={{ listStyle: 'none', wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', lineHeight: '1.45' }}>
                                        {msg.slice(0, limit)}
                                        <span style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>…more</span>
                                      </summary>
                                      <div style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', whiteSpace: 'normal', marginTop: '0.35rem', lineHeight: '1.45' }}>
                                        {msg}
                                      </div>
                                    </details>
                                  );
                                })()}
                              </td>
                              <td className="col-status" style={{ verticalAlign: 'top' }}>
                                <span style={{
                                  background: b.status === 'pending' ? 'rgba(239, 199, 25, 0.15)' : 'rgba(37,211,102,0.15)',
                                  color: b.status === 'pending' ? 'var(--accent-orange)' : '#25D366',
                                  border: '1px solid',
                                  borderColor: b.status === 'pending' ? 'var(--border-color)' : 'rgba(37,211,102,0.3)',
                                  padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600
                                }}>
                                  {(b.status || 'pending').toUpperCase()}
                                </span>
                              </td>
                              <td className="col-actions" style={{ verticalAlign: 'top', whiteSpace: 'nowrap', minWidth: '150px', paddingLeft: '0.75rem' }}>
                                <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                  {/* Checkbox option to show lead in admin panel */}
                                  <label
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.35rem',
                                      cursor: 'pointer',
                                      fontSize: '0.74rem',
                                      fontWeight: 600,
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '5px',
                                      background: (b.show_in_admin !== 0 && b.show_in_admin !== false) ? 'rgba(34, 197, 94, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                                      border: (b.show_in_admin !== 0 && b.show_in_admin !== false) ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
                                      color: (b.show_in_admin !== 0 && b.show_in_admin !== false) ? '#4ade80' : 'var(--text-muted)',
                                      userSelect: 'none',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Check to show this lead in the /admin panel"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={b.show_in_admin !== 0 && b.show_in_admin !== false}
                                      onChange={(e) => toggleLeadShowInAdmin(b.id, e.target.checked)}
                                      style={{ cursor: 'pointer', accentColor: '#22c55e', width: '14px', height: '14px', margin: 0 }}
                                    />
                                    <span>Show in /admin</span>
                                  </label>

                                  <button
                                    onClick={() => toggleBookingStatus(b.id, b.status)}
                                    className="btn-secondary"
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}
                                    title={b.status === 'pending' ? 'Mark as Replied' : 'Mark as Pending'}
                                  >
                                    {b.status === 'pending' ? 'Mark Replied' : 'Mark Pending'}
                                  </button>
                                  <button
                                    onClick={() => deleteBooking(b.id)}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '6px', flexShrink: 0 }}
                                    title="Delete Lead"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION CONTROLS */}
                  {totalLeads > 0 && (
                    <div className="admin-pagination" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-muted)',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <span>
                          Showing {pageSize === 'all' ? `all ${totalLeads}` : `${startIndex + 1}–${Math.min(startIndex + Number(pageSize), totalLeads)} of ${totalLeads}`} leads
                          {searchQuery && ` (matching "${searchQuery}")`}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Per page:</span>
                          <select
                            value={pageSize}
                            onChange={(e) => {
                              setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            style={{
                              background: '#0a0a0f',
                              color: '#ffffff',
                              border: '1px solid var(--border-muted)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem'
                            }}
                          >
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value="all">All ({bookings.length})</option>
                          </select>
                        </div>
                      </div>

                      {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safeCurrentPage <= 1}
                            style={{
                              padding: '0.35rem 0.7rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-muted)',
                              background: safeCurrentPage <= 1 ? 'transparent' : 'rgba(255,255,255,0.06)',
                              color: safeCurrentPage <= 1 ? 'var(--text-dim)' : '#ffffff',
                              cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            <ChevronLeft size={14} /> Prev
                          </button>

                          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 6) pageNum = i + 1;
                            else if (safeCurrentPage <= 3) pageNum = i + 1;
                            else if (safeCurrentPage >= totalPages - 2) pageNum = totalPages - 5 + i;
                            else pageNum = safeCurrentPage - 2 + i;

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: safeCurrentPage === pageNum ? 'var(--accent-orange)' : 'var(--border-muted)',
                                  background: safeCurrentPage === pageNum ? 'var(--accent-orange)' : 'rgba(255,255,255,0.02)',
                                  color: safeCurrentPage === pageNum ? '#000000' : 'var(--text-secondary)',
                                  fontWeight: safeCurrentPage === pageNum ? 700 : 500,
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  minWidth: '32px'
                                }}
                              >
                                {pageNum}
                              </button>
                            );
                          })}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safeCurrentPage >= totalPages}
                            style={{
                              padding: '0.35rem 0.7rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-muted)',
                              background: safeCurrentPage >= totalPages ? 'transparent' : 'rgba(255,255,255,0.06)',
                              color: safeCurrentPage >= totalPages ? 'var(--text-dim)' : '#ffffff',
                              cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            Next <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* TAB 2: MANAGE BLOGS */}
        {currentTab === 'blogs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Blog Publisher form */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ListPlus size={18} /> Write Blog Post</h2>
              <form onSubmit={handleBlogSubmit}>
                <div className="form-group">
                  <label className="form-label">Article Title</label>
                  <input
                    type="text"
                    value={blogForm.title}
                    onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Navigating your bathroom margins"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Excerpt / Short Description</label>
                  <textarea
                    value={blogForm.excerpt}
                    onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '60px' }}
                    placeholder="Provide a 2-sentence summary of this article."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className="form-control"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)' }}
                  >
                    <option value="Planning Tips">Planning Tips</option>
                    <option value="Technology">Technology</option>
                    <option value="Studio News">Studio News</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Author Name</label>
                  <input
                    type="text"
                    value={blogForm.author}
                    onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <input
                    type="file"
                    onChange={(e) => setBlogForm({ ...blogForm, cover_image: e.target.files[0] })}
                    className="form-control"
                    accept="image/*"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Recommended: Landscape layout (e.g. 1200x630 pixels), aspect ratio 1.91:1, max size 2MB.
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label">Article Body Content (HTML Allowed)</label>
                  <textarea
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '220px' }}
                    placeholder="<h3>1. Spacing is key</h3><p>Start writing your rich blog post details here...</p>"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Publish Blog Post
                </button>
              </form>
            </div>

            {/* Existing blogs list */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Articles ({blogs.length})</h2>
              {blogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No articles published yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {blogs.map((b) => (
                    <div key={b.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem', alignItems: 'center' }}>
                      <img src={b.cover_image} alt={b.title} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover', background: '#000000' }} />
                      <div style={{ flex: 1, minWidth: '0' }}>
                        <h4 style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.title}>{b.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.category} • By {b.author}</span>
                      </div>
                      <button
                        onClick={() => setEditingBlog(b)}
                        style={{ background: 'rgba(239, 199, 25, 0.1)', color: 'var(--accent-orange)', border: '1px solid var(--border-color)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px', marginRight: '0.25rem' }}
                        title="Edit Article"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => deleteBlog(b.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                        title="Delete Article"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: MANAGE GALLERY */}
        {currentTab === 'gallery' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Gallery item creation form */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ListPlus size={18} /> Add Gallery Item</h2>
              <form onSubmit={handleGallerySubmit}>
                <div className="form-group">
                  <label className="form-label">Item Title</label>
                  <input
                    type="text"
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Master Bedroom Projection walk"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '60px' }}
                    placeholder="Provide details about what scale element is caught or visualized."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Room Category</label>
                  {!showCustomCategoryInput ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={galleryForm.category}
                        onChange={(e) => {
                          if (e.target.value === '___custom___') {
                            setShowCustomCategoryInput(true);
                            setGalleryForm({ ...galleryForm, category: '' });
                          } else {
                            setGalleryForm({ ...galleryForm, category: e.target.value });
                          }
                        }}
                        className="form-control"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-muted)', flex: 1 }}
                      >
                        <option value="Architect">Architect</option>
                        <option value="Builders">Builders</option>
                        <option value="Enduser">Enduser</option>
                        {[...new Set(gallery.map(g => g.category))]
                          .filter(cat => cat && !['Architect', 'Builders', 'Enduser'].includes(cat))
                          .map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))
                        }
                        <option value="___custom___">+ Add Custom Category...</option>
                      </select>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                        className="form-control"
                        placeholder="Enter custom category (e.g. Living Room)"
                        required
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomCategoryInput(false);
                          setGalleryForm({ ...galleryForm, category: 'Architect' });
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(255,255,255,0.08)',
                          color: '#ffffff',
                          border: '1px solid var(--border-muted)',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Media Type</label>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="mediaType"
                        checked={galleryForm.type === 'photo'}
                        onChange={() => setGalleryForm({ ...galleryForm, type: 'photo', file: null, external_url: '' })}
                      /> Photo Upload
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="mediaType"
                        checked={galleryForm.type === 'video'}
                        onChange={() => setGalleryForm({ ...galleryForm, type: 'video', file: null, external_url: '' })}
                      /> Walk Video URL / File
                    </label>
                  </div>
                </div>

                {galleryForm.type === 'photo' ? (
                  <div className="form-group">
                    <label className="form-label">Photo File Upload</label>
                    <input
                      type="file"
                      onChange={(e) => setGalleryForm({ ...galleryForm, file: e.target.files[0] })}
                      className="form-control"
                      accept="image/*"
                      required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Recommended: High resolution landscape or square (e.g. 1920x1080 or 1080x1080), size limit 3MB.
                    </small>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="form-group">
                      <label className="form-label">Video File Upload (Optional if using URL)</label>
                      <input
                        type="file"
                        onChange={(e) => setGalleryForm({ ...galleryForm, file: e.target.files[0], external_url: '' })}
                        className="form-control"
                        accept="video/*"
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        Recommended: MP4 format, aspect ratio 16:9, max size 15MB.
                      </small>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">External Video URL (.mp4)</label>
                      <input
                        type="url"
                        value={galleryForm.external_url}
                        onChange={(e) => setGalleryForm({ ...galleryForm, external_url: e.target.value, file: null })}
                        className="form-control"
                        placeholder="https://example.com/walkthrough.mp4"
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                        Provide a direct link to an MP4 video hosted elsewhere.
                      </small>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Upload to Gallery
                </button>
              </form>
            </div>

            {/* Existing gallery list */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Gallery Media ({gallery.length})</h2>
              {gallery.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No media uploaded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {gallery.map((g) => (
                    <div key={g.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-muted)' }}>
                        {g.type === 'video' ? (
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-orange)' }}>VIDEO</div>
                        ) : (
                          <img src={g.url} alt={g.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: '0' }}>
                        <h4 style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.title}>{g.title}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.category} • {g.type.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => deleteGallery(g.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: TESTIMONIALS */}
        {currentTab === 'testimonials' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Create Testimonial */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Add New Testimonial</h2>
              <form onSubmit={handleTestimonialSubmit}>
                <div className="form-group">
                  <label className="form-label">Client Name(s)</label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Rohit & Megha Verma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Client Role/Title</label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Homeowners / Principal Architect"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Video Title / Topic</label>
                  <input
                    type="text"
                    value={testimonialForm.title}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, title: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Living Room & Kitchen Scale Review"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Quote</label>
                  <textarea
                    value={testimonialForm.desc}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, desc: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '80px' }}
                    placeholder="e.g. Walking the plan helped us realize our kitchen island left very little pathway space..."
                    required
                  />
                </div>
                <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                  <div className="form-group">
                    <label className="form-label">Testimonial Video File Upload (MP4)</label>
                    <input
                      type="file"
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, video_file: e.target.files[0], external_video_url: '' })}
                      className="form-control"
                      accept="video/mp4,video/*"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Recommended: MP4 format, 9:16 vertical ratio (e.g. 1080x1920) or 16:9 (e.g. 1920x1080), size limit 15MB.
                    </small>
                  </div>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">External Video URL</label>
                    <input
                      type="url"
                      value={testimonialForm.external_video_url}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, external_video_url: e.target.value, video_file: null })}
                      className="form-control"
                      placeholder="https://example.com/video.mp4"
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Provide direct link to an MP4 video hosted elsewhere.
                    </small>
                  </div>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Save Testimonial
                </button>
              </form>
            </div>

            {/* Testimonials List */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Testimonials ({testimonials.length})</h2>
              {testimonials.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No testimonials added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {testimonials.map((t) => (
                    <div key={t.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: '0' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>({t.role})</span></h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-orange)', margin: '0.2rem 0' }}>{t.title}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {t.desc}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{t.video_url}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingTestimonial({ ...t, external_video_url_new: t.video_url.startsWith('/uploads/') ? '' : t.video_url })}
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteTestimonial(t.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: STUDIO LOCATIONS */}
        {currentTab === 'locations' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

            {/* Create Location */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={18} /> Add Studio Location</h2>
              <form onSubmit={handleLocationSubmit}>
                <div className="form-group">
                  <label className="form-label">State Key (Unique name to match map, e.g. TamilNadu)</label>
                  <select
                    value={locationForm.state_key}
                    onChange={(e) => setLocationForm({ ...locationForm, state_key: e.target.value })}
                    className="form-control"
                    style={{ background: 'var(--bg-secondary)', color: '#ffffff' }}
                  >
                    <optgroup label="States (28)">
                      {INDIAN_STATES_AND_UTS.filter(item => item.type === 'State').map(s => (
                        <option key={s.key} value={s.key}>{s.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Union Territories (8)">
                      {INDIAN_STATES_AND_UTS.filter(item => item.type === 'Union Territory').map(ut => (
                        <option key={ut.key} value={ut.key}>{ut.name}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input
                    type="text"
                    value={locationForm.name}
                    onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Tamil Nadu (Madurai)"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={locationForm.city}
                    onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                    className="form-control"
                    placeholder="e.g. Madurai"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    value={locationForm.phone}
                    onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                    className="form-control"
                    placeholder="e.g. +91 97110 22075"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    value={locationForm.address}
                    onChange={(e) => setLocationForm({ ...locationForm, address: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '60px' }}
                    placeholder="Full physical studio address..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Studio Details / Description</label>
                  <textarea
                    value={locationForm.details}
                    onChange={(e) => setLocationForm({ ...locationForm, details: e.target.value })}
                    className="form-control"
                    style={{ minHeight: '80px' }}
                    placeholder="Description of scaling systems, active bays, VR walkthrough equipment..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Studio Photo Upload</label>
                  <input
                    type="file"
                    onChange={(e) => setLocationForm({ ...locationForm, image_file: e.target.files[0] })}
                    className="form-control"
                    accept="image/*"
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Recommended: Landscape layout, aspect ratio 16:10 or 4:3 (e.g. 800x500 or 1200x750 pixels), max 2MB.
                  </small>
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <Plus size={16} /> Save Location
                </button>
              </form>
            </div>

            {/* Locations List */}
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Studio Locations ({locations.length})</h2>
              {locations.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No locations added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {locations.map((l) => (
                    <div key={l.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem', alignItems: 'center' }}>
                      <img src={l.image_url} alt={l.name} style={{ width: '80px', height: '60px', borderRadius: '4px', objectFit: 'cover', background: '#000000', border: '1px solid var(--border-muted)' }} />
                      <div style={{ flex: 1, minWidth: '0' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{l.name} <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>({l.state_key})</span></h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.city} • {l.phone}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.address}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingLocation(l)}
                          style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => deleteLocation(l.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', padding: '0.4rem', borderRadius: '6px' }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: WEBSITE SETTINGS */}
        {currentTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* WhatsApp Support Direct Connect Card */}
            <div className="glass-card" style={{ border: '1px solid rgba(37, 211, 102, 0.3)', background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.06) 0%, rgba(11, 15, 25, 0.85) 100%)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                    <MessageSquare size={15} /> WhatsApp Support Configuration
                  </div>
                  <h2 style={{ fontSize: '1.5rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.4rem 0' }}>
                    Customer WhatsApp Direct Connect
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: '650px', lineHeight: '1.5' }}>
                    Updating this number automatically updates all WhatsApp buttons across the website (Navbar, Footer, Contact sections, and mobile drawer).
                  </p>
                </div>

                {/* Current Active Number Badge */}
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem 1.4rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', minWidth: '220px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Support Number</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#25D366', display: 'block', marginTop: '0.25rem' }}>
                    {settings.whatsapp_number || '+91 97110 22075'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleWhatsAppUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <Phone size={15} color="#25D366" /> Support Phone / WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      className="form-control"
                      placeholder="e.g. +91 97110 22075 or 919711022075"
                      style={{ fontSize: '1.05rem', fontWeight: 600, letterSpacing: '0.02em', background: '#0a0d16' }}
                      required
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block', lineHeight: '1.4' }}>
                      💡 Include country code (e.g. <code>+91</code> for India). The link automatically strips spaces and formatting so customers are directly routed to WhatsApp.
                    </small>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(37, 211, 102, 0.3)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE CLICK-TO-CHAT LINK PREVIEW</span>
                    <code style={{ fontSize: '0.9rem', color: '#25D366', wordBreak: 'break-all', fontFamily: 'monospace', background: 'rgba(37, 211, 102, 0.08)', padding: '0.4rem 0.6rem', borderRadius: '6px' }}>
                      {getWhatsAppLink(whatsappInput)}
                    </code>
                    <div style={{ marginTop: '0.4rem' }}>
                      <a
                        href={getWhatsAppLink(whatsappInput)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: 'rgba(37, 211, 102, 0.4)', color: '#25D366' }}
                      >
                        <ExternalLink size={14} /> Test Link in WhatsApp
                      </a>
                    </div>
                  </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={savingWhatsApp}
                    style={{ minWidth: '220px', justifyContent: 'center', background: '#25D366', borderColor: '#25D366', color: '#000000', fontWeight: 800, padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
                  >
                    {savingWhatsApp ? 'Saving...' : 'Save WhatsApp Number'}
                  </button>
                </div>
              </form>
            </div>

            {/* Secondary Admin Panel (/admin) Configuration Card */}
            <div className="glass-card" style={{
              border: settings.show_leads_public === '1' ? '1px solid rgba(229, 184, 66, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(229, 184, 66, 0.05) 0%, rgba(11, 15, 25, 0.85) 100%)',
              padding: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(229, 184, 66, 0.15)',
                    color: '#e5b842',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(229, 184, 66, 0.3)'
                  }}>
                    <Users size={15} /> Secondary Admin Panel (/admin)
                  </div>
                  <h2 style={{ fontSize: '1.5rem', color: '#ffffff', margin: '0 0 0.4rem 0' }}>
                    Show Leads in Admin Panel (/admin)
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0, maxWidth: '650px', lineHeight: '1.5' }}>
                    Enable this option to display booking inquiries on the secondary public panel at{' '}
                    <a href="/admin" target="_blank" rel="noreferrer" style={{ color: '#e5b842', textDecoration: 'underline', fontWeight: 600 }}>
                      https://walktheplan.in/admin
                    </a>. The panel shows only Date &amp; Time, Name, and Inquiry / Notes with "Powered by Fitscalez" branding.
                  </p>
                </div>

                {/* Checkbox Card Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: isLeadsAllowedInAdmin ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  padding: '0.9rem 1.4rem',
                  borderRadius: '12px',
                  border: isLeadsAllowedInAdmin ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <input
                    type="checkbox"
                    id="settings_show_leads_public"
                    checked={isLeadsAllowedInAdmin}
                    onChange={(e) => handleToggleShowLeadsPublic(e.target.checked)}
                    disabled={togglingShowLeadsPublic}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#22c55e' }}
                  />
                  <label
                    htmlFor="settings_show_leads_public"
                    style={{
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: isLeadsAllowedInAdmin ? '#4ade80' : '#ffffff',
                      margin: 0
                    }}
                  >
                    {isLeadsAllowedInAdmin ? '✓ Allowed: Leads Visible at /admin' : 'Allow option to show leads in /admin'}
                  </label>
                </div>
              </div>
            </div>

            {/* Video Settings Section Header */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.3rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Video size={18} color="var(--accent-orange)" /> Website Background Videos
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Manage looping video clips displayed on key landing pages.
              </p>
            </div>

            {/* Video Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

              {/* Hero Video Form */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video size={18} /> Hero Section Video</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Currently: <span style={{ color: 'var(--accent-orange)', fontFamily: 'monospace' }}>{settings.hero_video}</span>
                </p>

                <form onSubmit={(e) => handleSettingUpdate(e, 'hero_video', heroForm)}>
                  <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="form-group">
                      <label className="form-label">Upload Video File</label>
                      <input
                        type="file"
                        onChange={(e) => setHeroForm({ ...heroForm, file: e.target.files[0], external_url: '' })}
                        className="form-control"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        disabled={uploadingSettingKey === 'hero_video'}
                      />
                      {heroForm.file && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '4px', fontSize: '0.8rem', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🎬 <strong>Selected:</strong> {heroForm.file.name} ({(heroForm.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                        Formats: MP4, WebM, MOV. Max size: 300MB (Recommended under 20MB for fast visitor loading).
                      </small>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">External Video URL</label>
                      <input
                        type="url"
                        value={heroForm.external_url}
                        onChange={(e) => setHeroForm({ ...heroForm, external_url: e.target.value, file: null })}
                        className="form-control"
                        placeholder="https://example.com/hero_bg.mp4"
                        disabled={uploadingSettingKey === 'hero_video'}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={uploadingSettingKey === 'hero_video'}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: uploadingSettingKey === 'hero_video' ? 0.7 : 1 }}
                  >
                    {uploadingSettingKey === 'hero_video' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading Video ({heroForm.file ? (heroForm.file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''})... Please wait
                      </span>
                    ) : (
                      'Save Hero Video'
                    )}
                  </button>
                </form>
              </div>

              {/* Test Drive Video Form */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video size={18} /> Test Drive Section Video</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Currently: <span style={{ color: 'var(--accent-orange)', fontFamily: 'monospace' }}>{settings.test_drive_video}</span>
                </p>

                <form onSubmit={(e) => handleSettingUpdate(e, 'test_drive_video', testDriveForm)}>
                  <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="form-group">
                      <label className="form-label">Upload Video File</label>
                      <input
                        type="file"
                        onChange={(e) => setTestDriveForm({ ...testDriveForm, file: e.target.files[0], external_url: '' })}
                        className="form-control"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        disabled={uploadingSettingKey === 'test_drive_video'}
                      />
                      {testDriveForm.file && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '4px', fontSize: '0.8rem', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🎬 <strong>Selected:</strong> {testDriveForm.file.name} ({(testDriveForm.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                        Formats: MP4, WebM, MOV (9:16 or 16:9). Max size: 300MB.
                      </small>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">External Video URL</label>
                      <input
                        type="url"
                        value={testDriveForm.external_url}
                        onChange={(e) => setTestDriveForm({ ...testDriveForm, external_url: e.target.value, file: null })}
                        className="form-control"
                        placeholder="https://example.com/test_drive.mp4"
                        disabled={uploadingSettingKey === 'test_drive_video'}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={uploadingSettingKey === 'test_drive_video'}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: uploadingSettingKey === 'test_drive_video' ? 0.7 : 1 }}
                  >
                    {uploadingSettingKey === 'test_drive_video' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading Video ({testDriveForm.file ? (testDriveForm.file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''})... Please wait
                      </span>
                    ) : (
                      'Save Test Drive Video'
                    )}
                  </button>
                </form>
              </div>

              {/* About Us Video Form */}
              <div className="glass-card">
                <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Video size={18} /> About Us Section Video</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Currently: <span style={{ color: 'var(--accent-orange)', fontFamily: 'monospace' }}>{settings.about_video}</span>
                </p>

                <form onSubmit={(e) => handleSettingUpdate(e, 'about_video', aboutForm)}>
                  <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="form-group">
                      <label className="form-label">Upload Video File</label>
                      <input
                        type="file"
                        onChange={(e) => setAboutForm({ ...aboutForm, file: e.target.files[0], external_url: '' })}
                        className="form-control"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        disabled={uploadingSettingKey === 'about_video'}
                      />
                      {aboutForm.file && (
                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(230,126,34,0.1)', border: '1px solid rgba(230,126,34,0.3)', borderRadius: '4px', fontSize: '0.8rem', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          🎬 <strong>Selected:</strong> {aboutForm.file.name} ({(aboutForm.file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.35rem', display: 'block' }}>
                        Formats: MP4, WebM, MOV. Max size: 300MB (Recommended under 20MB for fast visitor loading).
                      </small>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">External Video URL</label>
                      <input
                        type="url"
                        value={aboutForm.external_url}
                        onChange={(e) => setAboutForm({ ...aboutForm, external_url: e.target.value, file: null })}
                        className="form-control"
                        placeholder="https://example.com/about_bg.mp4"
                        disabled={uploadingSettingKey === 'about_video'}
                      />
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    disabled={uploadingSettingKey === 'about_video'}
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: uploadingSettingKey === 'about_video' ? 0.7 : 1 }}
                  >
                    {uploadingSettingKey === 'about_video' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Uploading Video ({aboutForm.file ? (aboutForm.file.size / (1024 * 1024)).toFixed(1) + ' MB' : ''})... Please wait
                      </span>
                    ) : (
                      'Save About Video'
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 7: SERVICES CONTENT */}
        {currentTab === 'services' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Active Service Projection Plans ({servicesList.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {servicesList.map((s) => (
                  <div key={s.id} className="glass-card" style={{ border: '1px solid var(--border-muted)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div>
                      {s.badge && (
                        <span style={{ background: 'var(--accent-orange)', color: '#000000', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.5rem' }}>
                          {s.badge}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-orange)' }}>{s.title}</h3>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.subtitle}</h5>
                      <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0.5rem 0' }}>
                        ₹{s.price.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {s.duration}</span>
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1rem' }}>
                        {s.description}
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Included Features:</strong>
                        {s.features.map((feat, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {feat}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingService({
                        ...s,
                        features_raw: s.features.join('\n')
                      })}
                      className="btn-primary"
                      style={{ marginTop: 'auto', justifyContent: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                    >
                      <Edit size={14} /> Edit Plan Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FRANCHISE CONTENT */}
        {currentTab === 'franchise' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Studio Franchise Models ({franchiseList.length})</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {franchiseList.map((f) => (
                  <div key={f.id} className="glass-card" style={{ border: '1px solid var(--border-muted)', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', background: 'rgba(255,255,255,0.01)' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-orange)' }}>{f.title}</h3>
                      <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Estimated Charges & Fees:</h5>
                      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: '0.25rem 0' }}>{f.charges}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Terms & Conditions (T&C):</strong>
                        {f.tc.map((tcItem, idx) => (
                          <div key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✓ {tcItem}</div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingFranchise({
                        ...f,
                        tc_raw: f.tc.join('\n')
                      })}
                      className="btn-primary"
                      style={{ marginTop: 'auto', justifyContent: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                    >
                      <Edit size={14} /> Edit Model Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: VISITOR & DEVICE ANALYTICS */}
        {currentTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Control Header with Refresh Button */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.35rem 1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                  <BarChart3 size={22} color="var(--accent-orange)" /> Website Visitor & Device Analytics
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', margin: 0 }}>
                  Real-time telemetry — visitor counts, device breakdown, location intelligence, traffic sources & daily trends.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  background: 'rgba(34, 197, 94, 0.12)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'pulse 2s ease-in-out infinite' }}></span>
                  Live Telemetry Active
                </span>

                <button
                  onClick={refreshAnalytics}
                  disabled={loadingAnalytics}
                  className="btn-secondary"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: loadingAnalytics ? 'wait' : 'pointer'
                  }}
                  title="Reload real-time analytics data"
                >
                  <RefreshCw size={13} style={{ animation: loadingAnalytics ? 'spin 1s linear infinite' : 'none' }} />
                  {loadingAnalytics ? 'Updating...' : 'Refresh Stats'}
                </button>
              </div>
            </div>

            {/* Analytics Sub-Navigation */}
            <div className="admin-nav-tabs-mobile" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { key: 'overview', label: 'Overview & Devices', icon: <PieChart size={14} /> },
                { key: 'locations', label: 'Location Analytics', icon: <Map size={14} /> },
                { key: 'technology', label: 'Platform Reach & Tech', icon: <Share2 size={14} /> },
                { key: 'activity', label: 'Activity & Visitors', icon: <Activity size={14} /> }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setAnalyticsSubTab(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: analyticsSubTab === tab.key ? 'var(--accent-orange)' : 'var(--border-muted)',
                    background: analyticsSubTab === tab.key ? 'rgba(239, 199, 25, 0.15)' : 'rgba(255,255,255,0.02)',
                    color: analyticsSubTab === tab.key ? 'var(--accent-orange)' : 'var(--text-secondary)',
                    fontWeight: analyticsSubTab === tab.key ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ===== SUB-TAB: OVERVIEW & DEVICES ===== */}
            {analyticsSubTab === 'overview' && (
              <>
                {/* Key Hero Metric Tiles (Verified Humans, Filtered Bots, Acquisition, Growth) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                  {[
                    { label: 'HUMAN PROSPECTS', value: analytics.overview.human_visitors || analytics.overview.total_visitors, icon: <ShieldCheck size={18} />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', sub: `+${(analytics.overview.today_human_visitors || 0).toLocaleString('en-IN')} today`, subColor: '#4ade80' },
                    { label: 'FILTERED BOTS', value: analytics.overview.bot_views || 0, icon: <Bot size={18} />, color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', sub: `${(analytics.overview.bot_visitors || 0).toLocaleString('en-IN')} crawlers filtered`, subColor: '#fb923c' },
                    { label: 'TOP REACH CHANNEL', value: analytics.platforms?.[0]?.platform || 'Direct', icon: <Share2 size={18} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', sub: `${analytics.platforms?.[0]?.pct || 0}% traffic (${analytics.platforms?.[0]?.leads || 0} leads)`, subColor: '#f472b6' },
                    { label: 'TOTAL PAGE VIEWS', value: analytics.overview.total_views, icon: <Eye size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', sub: `+${analytics.overview.today_views.toLocaleString('en-IN')} today`, subColor: '#fbbf24' },
                    { label: 'THIS WEEK', value: analytics.overview.week_views, icon: <TrendingUp size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', sub: `${analytics.overview.week_visitors.toLocaleString('en-IN')} unique`, subColor: '#60a5fa' },
                    { label: 'THIS MONTH', value: analytics.overview.month_views, icon: <Calendar size={18} />, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', sub: `${analytics.overview.month_visitors.toLocaleString('en-IN')} unique`, subColor: '#c084fc' },
                    { label: 'MOBILE USERS', value: `${analytics.devices.mobile.pct}%`, icon: <Smartphone size={18} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', sub: `${analytics.devices.mobile.views.toLocaleString('en-IN')} views`, subColor: '#fbbf24', noBorder: true },
                    { label: 'DESKTOP USERS', value: `${analytics.devices.desktop.pct}%`, icon: <Monitor size={18} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', sub: `${analytics.devices.desktop.views.toLocaleString('en-IN')} views`, subColor: '#60a5fa' },
                    { label: 'AVG VIEWS/USER', value: analytics.overview.avg_views_per_visitor, icon: <Zap size={18} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)', sub: 'pages per visitor', subColor: '#f472b6' },
                    { label: 'AVG SESSIONS', value: analytics.overview.avg_sessions_per_visitor, icon: <Layers size={18} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', sub: 'sessions per user', subColor: '#22d3ee' }
                  ].map((m, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', border: m.noBorder ? `1px solid rgba(245, 158, 11, 0.3)` : undefined }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em' }}>{m.label}</span>
                        <div style={{ background: m.bg, color: m.color, padding: '0.35rem', borderRadius: '7px' }}>{m.icon}</div>
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                        {typeof m.value === 'number' ? m.value.toLocaleString('en-IN') : m.value}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: m.subColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ArrowUpRight size={11} /> {m.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily Trend Chart (CSS-only bar chart) */}
                {analytics.dailyTrend.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.5rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.65rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <TrendingUp size={18} color="#22c55e" /> Daily Traffic Trend
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                          Page views over the last {analytics.dailyTrend.length} days (drag or use navigation handles to explore)
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                        {/* Interactive Navigation Handles */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            type="button"
                            onClick={() => scrollChart(dailyTrendScrollRef, -240)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                            title="Scroll left to see earlier dates"
                          >
                            <ChevronLeft size={14} /> Earlier
                          </button>
                          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />
                          <button
                            type="button"
                            onClick={() => scrollChart(dailyTrendScrollRef, 240)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#f59e0b',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fbbf24'; e.currentTarget.style.background = 'rgba(245,158,11,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.background = 'transparent'; }}
                            title="Scroll right to see latest dates & Today"
                          >
                            Latest <ChevronRight size={14} />
                          </button>
                        </div>

                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                          Peak: {Math.max(...analytics.dailyTrend.map(d => d.views)).toLocaleString('en-IN')} views/day
                        </span>
                      </div>
                    </div>

                    {/* Horizontal scrollable track for smooth touch & mouse dragging */}
                    <div
                      ref={dailyTrendScrollRef}
                      className="admin-chart-scroll-wrap"
                      onMouseDown={handleChartMouseDown(dailyTrendScrollRef)}
                      onMouseLeave={handleChartMouseLeave(dailyTrendScrollRef)}
                      onMouseUp={handleChartMouseUp(dailyTrendScrollRef)}
                      onMouseMove={handleChartMouseMove(dailyTrendScrollRef)}
                      style={{ position: 'relative', marginTop: '1rem' }}
                    >
                      <div style={{ minWidth: analytics.dailyTrend.length > 7 ? `${Math.max(analytics.dailyTrend.length * 44, 420)}px` : '100%', position: 'relative' }}>
                        {/* Background grid lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '175px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.12 }}>
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', width: '100%' }} />
                        </div>

                        {/* Bar columns container with right padding so today is never cut off */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '6px', height: '215px', padding: '0 2.5rem 0 0.75rem', zIndex: 1 }}>
                          {(() => {
                            const maxViews = Math.max(...analytics.dailyTrend.map(d => d.views), 1);
                            return analytics.dailyTrend.map((d, i) => {
                              const heightPct = Math.max(8, Math.round((d.views / maxViews) * 100));
                              const dateObj = new Date(d.date + 'T00:00:00');
                              const dayLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                              const isToday = d.date === getTodayISTString();
                              const isPeak = d.views === maxViews && d.views > 0;

                              return (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    minWidth: 0,
                                    position: 'relative'
                                  }}
                                >
                                  {/* 175px Track Container where height percentage is guaranteed to resolve */}
                                  <div style={{ width: '100%', height: '175px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                                    <div
                                      style={{
                                        width: '100%',
                                        maxWidth: '32px',
                                        height: `${heightPct}%`,
                                        minHeight: '8px',
                                        background: isToday
                                          ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                                          : isPeak
                                            ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)'
                                            : 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
                                        borderRadius: '6px 6px 2px 2px',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        border: isToday ? '1px solid rgba(245,158,11,0.7)' : (isPeak ? '1px solid rgba(56,189,248,0.7)' : '1px solid rgba(59,130,246,0.3)'),
                                        boxShadow: isToday ? '0 0 12px rgba(245,158,11,0.4)' : (isPeak ? '0 0 12px rgba(56,189,248,0.4)' : '0 2px 6px rgba(0,0,0,0.3)')
                                      }}
                                      title={`${dayLabel}: ${d.views} page views, ${d.visitors} unique visitors\nMobile: ${d.mobile || 0} | PC: ${d.desktop || 0} | Tab: ${d.tablet || 0}`}
                                    >
                                      {/* Top peak / today value pill */}
                                      {(isPeak || isToday) && (
                                        <span style={{
                                          position: 'absolute',
                                          top: '-24px',
                                          left: '50%',
                                          transform: 'translateX(-50%)',
                                          fontSize: '0.66rem',
                                          fontWeight: 800,
                                          color: isToday ? '#f59e0b' : '#38bdf8',
                                          whiteSpace: 'nowrap',
                                          background: 'rgba(8, 13, 26, 0.85)',
                                          border: `1px solid ${isToday ? 'rgba(245,158,11,0.4)' : 'rgba(56,189,248,0.4)'}`,
                                          padding: '1px 5px',
                                          borderRadius: '4px',
                                          boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                                        }}>
                                          {d.views}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Date Label */}
                                  <span style={{
                                    marginTop: '8px',
                                    fontSize: '0.65rem',
                                    color: isToday ? 'var(--accent-orange)' : 'var(--text-muted)',
                                    fontWeight: isToday ? 800 : 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                    textAlign: 'center'
                                  }}>
                                    {analytics.dailyTrend.length <= 15 ? dayLabel : dateObj.getDate()}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unique & Returning Visitors Trend Chart (Matches Daily Traffic Trend visual style) */}
                {analytics.dailyTrend.length > 0 && (
                  <div className="glass-card" style={{ padding: '1.75rem' }}>
                    {/* Header with Title, Mode Toggle, Legend and Peak Pill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Users size={18} color="#10b981" /> Unique & Returning Visitors Trend
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>
                          First-time unique audience vs repeat loyal visitors over the last {analytics.dailyTrend.length} days
                        </p>
                      </div>

                      {/* Header controls: Legend, Mode Switcher & Peak Pill */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {/* Legend Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'linear-gradient(180deg, #10b981, #059669)' }} />
                            Unique (New)
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem' }}>•</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'linear-gradient(180deg, #a855f7, #7c3aed)' }} />
                            Old (Returning)
                          </div>
                        </div>

                        {/* View Mode Toggle: Stacked vs Side-by-Side */}
                        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <button
                            type="button"
                            onClick={() => setVisitorChartMode('stacked')}
                            style={{
                              background: visitorChartMode === 'stacked' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
                              color: visitorChartMode === 'stacked' ? '#10b981' : 'var(--text-muted)',
                              border: visitorChartMode === 'stacked' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
                              padding: '0.2rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Stacked
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisitorChartMode('grouped')}
                            style={{
                              background: visitorChartMode === 'grouped' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
                              color: visitorChartMode === 'grouped' ? '#c084fc' : 'var(--text-muted)',
                              border: visitorChartMode === 'grouped' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
                              padding: '0.2rem 0.55rem',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            Side-by-Side
                          </button>
                        </div>

                        {/* Interactive Navigation Handles */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            type="button"
                            onClick={() => scrollChart(visitorTrendScrollRef, -240)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.74rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                            title="Scroll left to see earlier dates"
                          >
                            <ChevronLeft size={14} /> Earlier
                          </button>
                          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />
                          <button
                            type="button"
                            onClick={() => scrollChart(visitorTrendScrollRef, 240)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#38bdf8',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#7dd3fc'; e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'transparent'; }}
                            title="Scroll right to see recent dates & Today"
                          >
                            Latest <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* Peak Pill */}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          Peak: {Math.max(...analytics.dailyTrend.map(d => d.visitors || 0)).toLocaleString('en-IN')} visitors/day
                        </span>
                      </div>
                    </div>

                    {/* Horizontal scrollable track for smooth touch & mouse dragging */}
                    <div
                      ref={visitorTrendScrollRef}
                      className="admin-chart-scroll-wrap"
                      onMouseDown={handleChartMouseDown(visitorTrendScrollRef)}
                      onMouseLeave={handleChartMouseLeave(visitorTrendScrollRef)}
                      onMouseUp={handleChartMouseUp(visitorTrendScrollRef)}
                      onMouseMove={handleChartMouseMove(visitorTrendScrollRef)}
                      style={{ position: 'relative', marginTop: '1rem' }}
                    >
                      <div style={{ minWidth: analytics.dailyTrend.length > 7 ? `${Math.max(analytics.dailyTrend.length * 44, 420)}px` : '100%', position: 'relative' }}>
                        {/* Background dashed grid lines */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '175px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.12 }}>
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px dashed #ffffff', width: '100%' }} />
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', width: '100%' }} />
                        </div>

                        {/* Bar columns container with right padding so today is never cut off */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '6px', height: '215px', padding: '0 2.5rem 0 0.75rem', zIndex: 1 }}>
                          {(() => {
                            const maxVisitors = Math.max(...analytics.dailyTrend.map(d => d.visitors || 0), 1);
                            const maxSingleVal = Math.max(...analytics.dailyTrend.flatMap(d => [d.new_visitors || 0, d.returning_visitors || 0]), 1);

                            return analytics.dailyTrend.map((d, i) => {
                              const totalVis = d.visitors || 0;
                              const newVis = d.new_visitors !== undefined ? d.new_visitors : totalVis;
                              const retVis = d.returning_visitors !== undefined ? d.returning_visitors : 0;
                              const dateObj = new Date(d.date + 'T00:00:00');
                              const dayLabel = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                              const isToday = d.date === getTodayISTString();
                              const isPeak = totalVis === maxVisitors && totalVis > 0;

                              const pctNew = totalVis > 0 ? Math.round((newVis / totalVis) * 100) : 0;
                              const pctRet = totalVis > 0 ? Math.round((retVis / totalVis) * 100) : 0;

                              return (
                                <div
                                  key={i}
                                  style={{
                                    flex: 1,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    minWidth: 0,
                                    position: 'relative'
                                  }}
                                >
                                  {/* 175px Track Container */}
                                  <div style={{ width: '100%', height: '175px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative' }}>
                                    {visitorChartMode === 'stacked' ? (
                                      /* STACKED BAR */
                                      (() => {
                                        const heightPct = Math.max(8, Math.round((totalVis / maxVisitors) * 100));
                                        const newHeightPct = totalVis > 0 ? Math.round((newVis / totalVis) * 100) : 100;
                                        const retHeightPct = 100 - newHeightPct;

                                        return (
                                          <div
                                            style={{
                                              width: '100%',
                                              maxWidth: '32px',
                                              height: `${heightPct}%`,
                                              minHeight: '8px',
                                              borderRadius: '6px 6px 2px 2px',
                                              display: 'flex',
                                              flexDirection: 'column-reverse',
                                              overflow: 'hidden',
                                              transition: 'all 0.3s ease',
                                              cursor: 'pointer',
                                              position: 'relative',
                                              border: isToday
                                                ? '1px solid rgba(245, 158, 11, 0.8)'
                                                : (isPeak ? '1px solid rgba(16, 185, 129, 0.7)' : '1px solid rgba(255,255,255,0.12)'),
                                              boxShadow: isToday
                                                ? '0 0 12px rgba(245, 158, 11, 0.4)'
                                                : (isPeak ? '0 0 12px rgba(16, 185, 129, 0.3)' : '0 2px 6px rgba(0,0,0,0.3)')
                                            }}
                                            title={`${dayLabel} (${d.date})\nTotal Unique Visitors: ${totalVis}\n🟢 Unique (New): ${newVis} (${pctNew}%)\n🟣 Old (Returning): ${retVis} (${pctRet}%)\nTotal Page Views: ${d.views}`}
                                          >
                                            {/* Bottom: Unique / New Visitors (Emerald) */}
                                            <div
                                              style={{
                                                height: `${newHeightPct}%`,
                                                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                                                width: '100%',
                                                transition: 'height 0.3s ease'
                                              }}
                                            />
                                            {/* Top: Old / Returning Visitors (Purple) */}
                                            {retHeightPct > 0 && (
                                              <div
                                                style={{
                                                  height: `${retHeightPct}%`,
                                                  background: 'linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)',
                                                  width: '100%',
                                                  transition: 'height 0.3s ease'
                                                }}
                                              />
                                            )}

                                            {/* Peak or Today pill */}
                                            {(isPeak || isToday) && (
                                              <span style={{
                                                position: 'absolute',
                                                top: '-24px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontSize: '0.66rem',
                                                fontWeight: 800,
                                                color: isToday ? '#f59e0b' : '#10b981',
                                                whiteSpace: 'nowrap',
                                                background: 'rgba(8, 13, 26, 0.9)',
                                                border: `1px solid ${isToday ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`,
                                                padding: '1px 5px',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                                zIndex: 2
                                              }}>
                                                {totalVis}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      /* SIDE-BY-SIDE / GROUPED BARS */
                                      (() => {
                                        const newHeightPct = Math.max(6, Math.round((newVis / maxSingleVal) * 100));
                                        const retHeightPct = Math.max(6, Math.round((retVis / maxSingleVal) * 100));

                                        return (
                                          <div
                                            style={{
                                              display: 'flex',
                                              alignItems: 'flex-end',
                                              gap: '3px',
                                              width: '100%',
                                              maxWidth: '36px',
                                              height: '100%',
                                              justifyContent: 'center',
                                              cursor: 'pointer',
                                              position: 'relative'
                                            }}
                                            title={`${dayLabel} (${d.date})\n🟢 Unique (New): ${newVis} (${pctNew}%)\n🟣 Old (Returning): ${retVis} (${pctRet}%)\nTotal Unique Visitors: ${totalVis}`}
                                          >
                                            {/* New Bar */}
                                            <div
                                              style={{
                                                flex: 1,
                                                maxWidth: '16px',
                                                height: `${newHeightPct}%`,
                                                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                                                borderRadius: '4px 4px 1px 1px',
                                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                                transition: 'all 0.3s ease'
                                              }}
                                            />
                                            {/* Returning Bar */}
                                            <div
                                              style={{
                                                flex: 1,
                                                maxWidth: '16px',
                                                height: `${retHeightPct}%`,
                                                background: 'linear-gradient(180deg, #c084fc 0%, #7c3aed 100%)',
                                                borderRadius: '4px 4px 1px 1px',
                                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                                transition: 'all 0.3s ease'
                                              }}
                                            />

                                            {/* Value Pill for today or peak */}
                                            {(isPeak || isToday) && (
                                              <span style={{
                                                position: 'absolute',
                                                top: '-24px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                fontSize: '0.64rem',
                                                fontWeight: 800,
                                                color: isToday ? '#f59e0b' : '#10b981',
                                                whiteSpace: 'nowrap',
                                                background: 'rgba(8, 13, 26, 0.9)',
                                                border: `1px solid ${isToday ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.4)'}`,
                                                padding: '1px 5px',
                                                borderRadius: '4px',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                                zIndex: 2
                                              }}>
                                                {totalVis}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()
                                    )}
                                  </div>

                                  {/* Date Label */}
                                  <span style={{
                                    marginTop: '8px',
                                    fontSize: '0.65rem',
                                    color: isToday ? 'var(--accent-orange)' : 'var(--text-muted)',
                                    fontWeight: isToday ? 800 : 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    maxWidth: '100%',
                                    textAlign: 'center'
                                  }}>
                                    {analytics.dailyTrend.length <= 15 ? dayLabel : dateObj.getDate()}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Audience Retention & Loyalty Strip (4 Stat Cards) */}
                    <div className="admin-stat-strip-mobile" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '1.5rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid rgba(255,255,255,0.06)'
                    }}>
                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Unique Audience</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                          {(analytics.retention?.total_unique_visitors || analytics.overview.total_visitors || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Distinct visitor profiles</div>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                          First-Time (New)
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                          {(analytics.retention?.one_time_visitors || Math.round((analytics.overview.total_visitors || 0) * 0.6)).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(16, 185, 129, 0.8)', marginTop: '0.2rem' }}>New visitor acquisition</div>
                      </div>

                      <div style={{ background: 'rgba(168, 85, 247, 0.04)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#c084fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#a855f7' }} />
                          Repeat (Old)
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                          {(analytics.retention?.returning_visitors || Math.round((analytics.overview.total_visitors || 0) * 0.4)).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(192, 132, 252, 0.8)', marginTop: '0.2rem' }}>Returning audience</div>
                      </div>

                      <div style={{ background: 'rgba(245, 158, 11, 0.04)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                          Loyalty Rate
                        </div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
                          {analytics.retention?.returning_rate_pct !== undefined ? `${analytics.retention.returning_rate_pct}%` : '41.2%'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(245, 158, 11, 0.8)', marginTop: '0.2rem' }}>Repeat visitor ratio</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Device Breakdown Visualizer */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Device Audience Distribution</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: '0.2rem 0 0 0' }}>Smartphones vs Workstations vs Tablets</p>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '0.25rem 0.65rem', borderRadius: '6px' }}>
                      {analytics.overview.total_views.toLocaleString('en-IN')} Total Hits
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '22px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '100px', display: 'flex', overflow: 'hidden', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.5rem' }}>
                    <div style={{ width: `${Math.max(5, analytics.devices.mobile.pct)}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)', borderRadius: '100px 0 0 100px', transition: 'width 0.6s ease' }} title={`Mobile: ${analytics.devices.mobile.pct}%`} />
                    <div style={{ width: `${Math.max(5, analytics.devices.desktop.pct)}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 0.6s ease' }} title={`Desktop: ${analytics.devices.desktop.pct}%`} />
                    <div style={{ width: `${Math.max(2, analytics.devices.tablet.pct)}%`, background: 'linear-gradient(90deg, #9333ea, #a855f7)', borderRadius: '0 100px 100px 0', transition: 'width 0.6s ease' }} title={`Tablet: ${analytics.devices.tablet.pct}%`} />
                  </div>

                  {/* Device 3 Detail Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    {[
                      { name: 'Mobile Phones', icon: <Smartphone size={18} />, color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.06)', borderColor: 'rgba(245, 158, 11, 0.25)', pctBg: 'rgba(245, 158, 11, 0.2)', data: analytics.devices.mobile, desc: 'Smartphones (iPhone, Android)' },
                      { name: 'Desktop & PC', icon: <Monitor size={18} />, color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.06)', borderColor: 'rgba(59, 130, 246, 0.25)', pctBg: 'rgba(59, 130, 246, 0.2)', pctColor: '#60a5fa', data: analytics.devices.desktop, desc: 'Laptops, Macs & PCs' },
                      { name: 'Tablets & iPads', icon: <Tablet size={18} />, color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.06)', borderColor: 'rgba(168, 85, 247, 0.25)', pctBg: 'rgba(168, 85, 247, 0.2)', pctColor: '#c084fc', data: analytics.devices.tablet, desc: 'Tablets & iPads' }
                    ].map((dev, i) => (
                      <div key={i} style={{ background: dev.bgColor, border: `1px solid ${dev.borderColor}`, borderRadius: '12px', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: dev.color }}>{dev.icon} {dev.name}</span>
                          <span style={{ background: dev.pctBg, color: dev.pctColor || dev.color, fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>{dev.data.pct}%</span>
                        </div>
                        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff' }}>
                          {dev.data.views.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>views</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                          {dev.data.visitors.toLocaleString('en-IN')} unique visitors · {dev.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Visited Pages */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} color="var(--accent-orange)" /> Most Visited Pages
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.topPages.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pageview records yet.</p>
                    ) : (
                      analytics.topPages.map((p, idx) => {
                        const sharePct = analytics.overview.total_views > 0 ? Math.round((p.views / analytics.overview.total_views) * 100) : 0;
                        const pageTitleMap = {
                          '/': 'Home (1:1 Blueprint Test Drive)',
                          '/services': 'Services & Booking Pricing',
                          '/franchise': 'Franchise Partner Program',
                          '/gallery': 'Studio Gallery & Walkthroughs',
                          '/about': 'About Us & Leadership',
                          '/blog': 'Architectural Planning Blogs',
                          '/career': 'Careers & Openings',
                          '/careers': 'Careers & Openings',
                          '/terms': 'Terms & Conditions',
                          '/privacy': 'Privacy Policy',
                          '/refund': 'Refund Policy'
                        };
                        const displayName = pageTitleMap[p.path] || p.path;

                        return (
                          <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-muted)', borderRadius: '8px', padding: '0.8rem 1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>#{idx + 1}</span>
                                <strong style={{ fontSize: '0.86rem', color: '#ffffff' }}>{displayName}</strong>
                              </div>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.72rem', color: '#60a5fa' }}>{(p.unique_visitors || 0).toLocaleString('en-IN')} unique</span>
                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-orange)' }}>{p.views.toLocaleString('en-IN')} views</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${sharePct}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-orange), #f59e0b)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                              </div>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>{sharePct}%</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ===== SUB-TAB: LOCATION ANALYTICS ===== */}
            {analyticsSubTab === 'locations' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                  {/* Top Countries */}
                  <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Globe size={18} color="#22c55e" /> Top Countries
                    </h3>
                    {analytics.locations.countries.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <Globe size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                        <p style={{ fontSize: '0.85rem' }}>Location data will appear as visitors browse your site.</p>
                        <p style={{ fontSize: '0.75rem' }}>IP-based geolocation is processed automatically.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {analytics.locations.countries.map((c, i) => {
                          const maxViews = analytics.locations.countries[0]?.views || 1;
                          const barPct = Math.max(8, Math.round((c.views / maxViews) * 100));
                          const flagMap = { 'India': '🇮🇳', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧', 'Canada': '🇨🇦', 'Australia': '🇦🇺', 'Germany': '🇩🇪', 'France': '🇫🇷', 'UAE': '🇦🇪', 'United Arab Emirates': '🇦🇪', 'Singapore': '🇸🇬', 'Japan': '🇯🇵', 'China': '🇨🇳', 'Brazil': '🇧🇷', 'South Korea': '🇰🇷', 'Netherlands': '🇳🇱', 'Saudi Arabia': '🇸🇦', 'Indonesia': '🇮🇩', 'Russia': '🇷🇺', 'Malaysia': '🇲🇾', 'Thailand': '🇹🇭' };
                          return (
                            <div key={i} style={{ background: 'rgba(34, 197, 94, 0.04)', border: '1px solid rgba(34, 197, 94, 0.15)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span style={{ fontSize: '1.1rem' }}>{flagMap[c.country] || '🌐'}</span> {c.country}
                                </span>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', color: '#4ade80' }}>{c.visitors} unique</span>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#22c55e' }}>{c.views.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${barPct}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Top Cities */}
                  <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={18} color="#f43f5e" /> Top Cities
                    </h3>
                    {analytics.locations.cities.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        <MapPin size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                        <p style={{ fontSize: '0.85rem' }}>City-level visitor data will populate here.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                        {analytics.locations.cities.map((c, i) => {
                          const maxViews = analytics.locations.cities[0]?.views || 1;
                          const barPct = Math.max(8, Math.round((c.views / maxViews) * 100));
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.55rem 0.75rem', background: 'rgba(244, 63, 94, 0.04)', border: '1px solid rgba(244, 63, 94, 0.12)', borderRadius: '8px' }}>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '0.12rem 0.4rem', borderRadius: '4px', fontWeight: 700, minWidth: '22px', textAlign: 'center' }}>#{i + 1}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {c.city}{c.region ? `, ${c.region}` : ''}
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{c.country}</div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f43f5e' }}>{c.views.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{c.visitors} ppl</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Regions */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Map size={18} color="#06b6d4" /> Top States / Regions
                  </h3>
                  {analytics.locations.regions.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem' }}>Region data will appear as traffic builds up.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                      {analytics.locations.regions.map((r, i) => {
                        const maxViews = analytics.locations.regions[0]?.views || 1;
                        const barPct = Math.max(10, Math.round((r.views / maxViews) * 100));
                        return (
                          <div key={i} style={{ background: 'rgba(6, 182, 212, 0.04)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff' }}>{r.region}</span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22d3ee' }}>{r.views.toLocaleString('en-IN')} views</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{r.country} · {r.visitors} unique visitors</div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${barPct}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #22d3ee)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ===== SUB-TAB: PLATFORM REACH & TECH ===== */}
            {analyticsSubTab === 'technology' && (
              <>
                {/* 1. Customer Reach Platforms Breakdown Card */}
                <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                        <Share2 size={20} color="#25D366" /> Customer Reach Platforms &amp; Acquisition Channels
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
                        Real-time visitor tracking across WhatsApp chats, Facebook, Instagram, Google Ads/Search, and Direct links with converted booking leads.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Tracked Channels:</span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>{(analytics.platforms || []).length}</span>
                    </div>
                  </div>

                  {(analytics.platforms || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No platform traffic recorded yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                      {(analytics.platforms || []).map((p, i) => {
                        const pInfo = getPlatformDetails(p.platform);
                        const totalHits = analytics.overview.total_views || 1;
                        const pct = p.pct || Math.round(((p.views || 0) / totalHits) * 100);
                        return (
                          <div key={i} style={{ background: pInfo.bg, border: `1px solid ${pInfo.border}`, borderRadius: '10px', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.94rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span style={{ fontSize: '1.15rem' }}>{pInfo.icon}</span> {pInfo.name}
                              </span>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: pInfo.color, background: 'rgba(0,0,0,0.25)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                {pct}% share
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              <span>{p.views?.toLocaleString('en-IN') || 0} views ({p.visitors?.toLocaleString('en-IN') || 0} unique)</span>
                              {p.leads > 0 ? (
                                <span style={{ color: '#fde047', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckCircle2 size={12} color="#4ade80" /> 🎯 {p.leads} {p.leads === 1 ? 'Lead' : 'Leads'} Booked
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>0 leads booked</span>
                              )}
                            </div>

                            <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.max(6, pct)}%`, height: '100%', background: pInfo.color, borderRadius: '10px', transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Bot Identification & Crawler Telemetry Card */}
                <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                        <Bot size={20} color="#f97316" /> Bot Identification &amp; Automated Crawler Telemetry
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '0.25rem 0 0 0' }}>
                        Search indexers (Googlebot, Bingbot), link preview generators (WhatsApp, Meta), and scrapers detected and isolated from customer conversion metrics.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(249, 115, 22, 0.15)',
                        border: '1px solid rgba(249, 115, 22, 0.35)',
                        color: '#fb923c',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        <Bot size={13} /> {analytics.overview.bot_views || 0} Total Bot Hits
                      </span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#4ade80',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        <ShieldCheck size={13} /> Human Traffic Isolated
                      </span>
                    </div>
                  </div>

                  {(analytics.bots || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0 }}>
                        🛡️ No automated crawlers or scrapers detected recently. 100% of incoming visitors are verified human prospects.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                      {(analytics.bots || []).map((bot, i) => (
                        <div key={i} style={{ background: 'rgba(249, 115, 22, 0.05)', border: '1px solid rgba(249, 115, 22, 0.2)', borderRadius: '8px', padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span>🤖</span> {bot.bot_name}
                            </span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fb923c', background: 'rgba(249, 115, 22, 0.15)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                              {bot.views} crawls
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>{bot.unique_agents} unique agents/IPs</span>
                            <span>Last active: {formatRelativeTime(bot.last_seen)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                  {/* Browser Breakdown */}
                  <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Compass size={18} color="#3b82f6" /> Browser Distribution
                    </h3>
                    {analytics.browsers.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No browser data available yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {analytics.browsers.map((b, i) => {
                          const browserIcons = { 'Chrome': '🌐', 'Safari': '🧭', 'Firefox': '🦊', 'Edge': '🔷', 'Opera': '🔴', 'Mobile Browser': '📱' };
                          const browserColors = { 'Chrome': '#4285f4', 'Safari': '#0fb5ee', 'Firefox': '#ff7139', 'Edge': '#0078d4', 'Opera': '#ff1b2d', 'Mobile Browser': '#f59e0b' };
                          return (
                            <div key={i} style={{ background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span style={{ fontSize: '1rem' }}>{browserIcons[b.browser] || '🌍'}</span> {b.browser}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.visitors} ppl</span>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: browserColors[b.browser] || '#3b82f6', background: 'rgba(59,130,246,0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>{b.pct}%</span>
                                </div>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.max(5, b.pct)}%`, height: '100%', background: browserColors[b.browser] || '#3b82f6', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* OS Breakdown */}
                  <div className="glass-card" style={{ padding: '1.75rem' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Layers size={18} color="#a855f7" /> Operating Systems
                    </h3>
                    {analytics.operatingSystems.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No OS data available yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {analytics.operatingSystems.map((o, i) => {
                          const osIcons = { 'Android': '🤖', 'iOS': '🍎', 'Windows': '🪟', 'macOS': '🖥️', 'Linux': '🐧', 'Chrome OS': '💻', 'Other': '❓' };
                          const osColors = { 'Android': '#3ddc84', 'iOS': '#a2aaad', 'Windows': '#00a4ef', 'macOS': '#a855f7', 'Linux': '#f59e0b', 'Chrome OS': '#4285f4' };
                          return (
                            <div key={i} style={{ background: 'rgba(168, 85, 247, 0.04)', border: '1px solid rgba(168, 85, 247, 0.15)', borderRadius: '8px', padding: '0.7rem 0.9rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                                <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span style={{ fontSize: '1rem' }}>{osIcons[o.os] || '💻'}</span> {o.os || 'Unknown'}
                                </span>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.visitors} ppl</span>
                                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: osColors[o.os] || '#a855f7', background: 'rgba(168,85,247,0.12)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>{o.pct}%</span>
                                </div>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${Math.max(5, o.pct)}%`, height: '100%', background: osColors[o.os] || '#a855f7', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Traffic Sources / Referrers */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Share2 size={18} color="#ec4899" /> Traffic Sources
                  </h3>
                  {analytics.referrers.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No referrer data available yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                      {analytics.referrers.map((r, i) => {
                        const sourceIcons = { 'Direct': '🔗', 'Google Search': '🔍', 'Google': '🔍', 'Instagram / Meta': '📸', 'Instagram': '📸', 'Facebook': '👥', 'Twitter': '🐦', 'LinkedIn': '💼', 'YouTube': '📺', 'WhatsApp': '💬' };
                        const sourceColors = { 'Direct': '#f59e0b', 'Google Search': '#4285f4', 'Google': '#4285f4', 'Instagram / Meta': '#e4405f', 'Instagram': '#e4405f', 'Facebook': '#1877f2', 'Twitter': '#1da1f2', 'LinkedIn': '#0077b5', 'YouTube': '#ff0000', 'WhatsApp': '#25d366' };
                        const maxViews = analytics.referrers[0]?.views || 1;
                        const barPct = Math.max(10, Math.round((r.views / maxViews) * 100));
                        return (
                          <div key={i} style={{ background: 'rgba(236, 72, 153, 0.04)', border: '1px solid rgba(236, 72, 153, 0.12)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontSize: '1rem' }}>{sourceIcons[r.referrer] || '🌐'}</span>
                                {r.referrer}
                              </span>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sourceColors[r.referrer] || '#ec4899' }}>{r.views.toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>{r.visitors} unique visitors · {r.pct}% of traffic</div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${barPct}%`, height: '100%', background: sourceColors[r.referrer] || '#ec4899', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ===== SUB-TAB: ACTIVITY & VISITORS ===== */}
            {analyticsSubTab === 'activity' && (
              <>
                {/* 24-Hour Activity Heatmap */}
                {(() => {
                  const heatmapList = analytics.hourlyHeatmap || new Array(24).fill(0);
                  const maxHourViews = Math.max(...heatmapList, 1);
                  const maxViewsVal = Math.max(...heatmapList, 0);
                  const totalViewsAllHours = heatmapList.reduce((acc, v) => acc + (v || 0), 0);
                  const peakHourIdx = heatmapList.indexOf(maxViewsVal);
                  const peakHourAmPm = peakHourIdx === 0 ? '12:00 AM' : peakHourIdx < 12 ? `${peakHourIdx}:00 AM` : peakHourIdx === 12 ? '12:00 PM' : `${peakHourIdx - 12}:00 PM`;

                  const periods = [
                    {
                      name: 'Late Night',
                      range: '12:00 AM – 5:59 AM',
                      icon: '🌙',
                      color: '#818cf8',
                      hours: [0, 1, 2, 3, 4, 5]
                    },
                    {
                      name: 'Morning',
                      range: '6:00 AM – 11:59 AM',
                      icon: '🌅',
                      color: '#f59e0b',
                      hours: [6, 7, 8, 9, 10, 11]
                    },
                    {
                      name: 'Afternoon',
                      range: '12:00 PM – 5:59 PM',
                      icon: '☀️',
                      color: '#38bdf8',
                      hours: [12, 13, 14, 15, 16, 17]
                    },
                    {
                      name: 'Evening & Night',
                      range: '6:00 PM – 11:59 PM',
                      icon: '🌆',
                      color: '#c084fc',
                      hours: [18, 19, 20, 21, 22, 23]
                    }
                  ];

                  const renderHeatmapPill = (hour, compact = false) => {
                    const views = heatmapList[hour] || 0;
                    const intensity = views / maxHourViews;
                    const bgColor = intensity === 0
                      ? 'rgba(255,255,255,0.03)'
                      : intensity < 0.25 ? 'rgba(59, 130, 246, 0.2)'
                        : intensity < 0.5 ? 'rgba(59, 130, 246, 0.4)'
                          : intensity < 0.75 ? 'rgba(245, 158, 11, 0.5)'
                            : 'rgba(239, 68, 68, 0.65)';
                    const textColor = intensity === 0 ? 'var(--text-muted)' : intensity < 0.5 ? '#60a5fa' : intensity < 0.75 ? '#f59e0b' : '#f87171';
                    const ampm = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
                    const ampmShort = hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`;
                    const isPeak = maxViewsVal > 0 && views === maxViewsVal;

                    return (
                      <div
                        key={hour}
                        className="heatmap-block-pill"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: compact ? '0.15rem' : '0.25rem',
                          padding: compact ? '0.45rem 0.15rem' : '0.55rem 0.35rem',
                          borderRadius: '7px',
                          background: bgColor,
                          border: isPeak ? '1px solid #ef4444' : `1px solid ${intensity > 0.5 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          boxShadow: isPeak ? '0 0 10px rgba(239, 68, 68, 0.35)' : 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'default',
                          minWidth: 0
                        }}
                        title={`${hour}:00 - ${hour}:59 IST\n${views} page views`}
                      >
                        <span style={{ fontSize: compact ? '0.78rem' : '0.9rem', fontWeight: 700, color: textColor, lineHeight: 1.1 }}>{views}</span>
                        <span style={{ fontSize: compact ? '0.56rem' : '0.64rem', color: isPeak ? '#fca5a5' : 'var(--text-muted)', fontWeight: isPeak ? 700 : 500 }}>
                          {compact ? ampmShort : ampm}
                        </span>
                      </div>
                    );
                  };

                  return (
                    <div className="glass-card heatmap-container-card" style={{ padding: '1.35rem 1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                            <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                              <Clock3 size={18} color="#f59e0b" /> 24-Hour Activity Heatmap
                            </h3>
                            {maxViewsVal > 0 && (
                              <span style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                color: '#f87171',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '0.15rem 0.55rem',
                                borderRadius: '20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem'
                              }}>
                                🔥 Peak: {peakHourAmPm} ({maxViewsVal} views)
                              </span>
                            )}
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.25rem 0 0 0' }}>
                            Page views by hour of day (last 7 days, IST timezone)
                          </p>
                        </div>

                        {/* Responsive Mode Switcher */}
                        <div className="heatmap-mode-switcher" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <button
                            onClick={() => setHeatmapMode('blocks')}
                            style={{
                              background: heatmapMode === 'blocks' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                              color: heatmapMode === 'blocks' ? '#fbbf24' : 'var(--text-muted)',
                              border: heatmapMode === 'blocks' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="4 Day Periods (6 hours each) - Optimal for Mobile"
                          >
                            📱 4 Periods (6h)
                          </button>
                          <button
                            onClick={() => setHeatmapMode('split')}
                            style={{
                              background: heatmapMode === 'split' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                              color: heatmapMode === 'split' ? '#fbbf24' : 'var(--text-muted)',
                              border: heatmapMode === 'split' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Split into AM & PM rows (12 hours each)"
                          >
                            ☀️/🌙 AM & PM (12h)
                          </button>
                          <button
                            onClick={() => setHeatmapMode('bar')}
                            style={{
                              background: heatmapMode === 'bar' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                              color: heatmapMode === 'bar' ? '#fbbf24' : 'var(--text-muted)',
                              border: heatmapMode === 'bar' ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid transparent',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '5px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Show continuous 24-hour timeline bar (scrollable)"
                          >
                            ↔️ 24H Full Bar
                          </button>
                        </div>
                      </div>

                      {/* Heatmap Visual Display */}
                      {heatmapMode === 'blocks' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                          {periods.map((p, pIdx) => {
                            const periodTotal = p.hours.reduce((acc, h) => acc + (heatmapList[h] || 0), 0);
                            const periodPct = totalViewsAllHours > 0 ? Math.round((periodTotal / totalViewsAllHours) * 100) : 0;
                            const hasPeak = p.hours.includes(peakHourIdx) && maxViewsVal > 0;

                            return (
                              <div
                                key={pIdx}
                                style={{
                                  background: 'rgba(255,255,255,0.02)',
                                  border: hasPeak ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(255,255,255,0.05)',
                                  borderRadius: '9px',
                                  padding: '0.75rem 0.85rem'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{p.icon}</span>
                                    <div>
                                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: p.color }}>{p.name}</span>
                                      <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>{p.range}</span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{periodTotal} views</span>
                                    <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', display: 'block' }}>{periodPct}% traffic</span>
                                  </div>
                                </div>

                                <div className="heatmap-block-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
                                  {p.hours.map(h => renderHeatmapPill(h, false))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : heatmapMode === 'split' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {/* AM Section (0 - 11) */}
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f59e0b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>☀️ AM Hours (12:00 AM – 11:59 AM)</span>
                              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Morning traffic</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => renderHeatmapPill(h, true))}
                            </div>
                          </div>

                          {/* PM Section (12 - 23) */}
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>🌙 PM Hours (12:00 PM – 11:59 PM)</span>
                              <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Evening traffic</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '4px' }}>
                              {[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(h => renderHeatmapPill(h, true))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            width: '100%',
                            overflowX: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            paddingBottom: '6px'
                          }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '3px', minWidth: '660px' }}>
                              {Array.from({ length: 24 }, (_, i) => i).map(h => renderHeatmapPill(h, true))}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem', textAlign: 'center' }}>
                            👉 Swipe horizontally to view all 24 hours (12 AM to 11 PM)
                          </div>
                        </div>
                      )}

                      {/* Legend */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.85rem', fontSize: '0.68rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>Tap any hour to view IST page views</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>Low</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {['rgba(255,255,255,0.05)', 'rgba(59,130,246,0.2)', 'rgba(59,130,246,0.4)', 'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.6)'].map((c, i) => (
                              <div key={i} style={{ width: '14px', height: '10px', background: c, borderRadius: '2px' }} />
                            ))}
                          </div>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Live Recent Visitors Stream */}
                <div className="glass-card" style={{ padding: '1.75rem' }}>
                  {/* Top Bar with Real-time Status, Counts, Refresh and Search */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, fontWeight: 700 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
                          <Activity size={16} />
                        </span>
                        Live Recent Visitors
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)',
                          color: '#4ade80', fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '20px'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} /> LIVE STREAM (Auto-sync 15s)
                        </span>
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        Real-time visitor telemetry tracking persistent Device IDs, past visits, GPS locations, and hardware specifications.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={refreshAnalytics}
                        disabled={loadingAnalytics}
                        className="btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                        title="Fetch latest visitor activity"
                      >
                        <RefreshCw size={13} className={loadingAnalytics ? 'spin' : ''} />
                        {loadingAnalytics ? 'Syncing...' : 'Refresh'}
                      </button>
                      {(() => {
                        const totalVisitorHits = filteredVisits.length;
                        const totalVisitorPages = visitorPageSize === 'all' ? 1 : Math.ceil(totalVisitorHits / Number(visitorPageSize));
                        const safeVisitorPage = Math.min(Math.max(1, visitorPage), totalVisitorPages || 1);
                        return (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {totalVisitorHits > 0 ? (
                              <>Page <strong style={{ color: 'var(--accent-orange)' }}>{safeVisitorPage}</strong> of {totalVisitorPages} · <strong style={{ color: '#ffffff' }}>{totalVisitorHits}</strong> total hits</>
                            ) : (
                              <>Latest <strong style={{ color: '#ffffff' }}>0</strong> hits</>
                            )}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Filter and Search Toolbar */}
                  <div className="admin-filter-bar-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {/* Filter Pills */}
                    <div className="admin-filter-pills-mobile" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {[
                        { key: 'all', label: `All (${analytics.recentVisits.length})` },
                        { key: 'humans', label: `👤 Humans (${analytics.recentVisits.filter(x => !x.is_bot).length})` },
                        { key: 'bots', label: `🤖 Bots (${analytics.recentVisits.filter(x => x.is_bot).length})` },
                        { key: 'whatsapp', label: `💬 WhatsApp (${analytics.recentVisits.filter(x => (x.platform || '').toLowerCase() === 'whatsapp').length})` },
                        { key: 'facebook', label: `👥 Facebook (${analytics.recentVisits.filter(x => (x.platform || '').toLowerCase() === 'facebook').length})` },
                        { key: 'instagram', label: `📸 Instagram (${analytics.recentVisits.filter(x => (x.platform || '').toLowerCase() === 'instagram').length})` },
                        { key: 'google', label: `🔍 Google (${analytics.recentVisits.filter(x => (x.platform || '').toLowerCase().includes('google')).length})` },
                        { key: 'booked', label: `🎯 Booked Form (${(analytics.recentVisits || []).filter(x => !!getVisitorBooking(x)).length})` },
                        { key: 'new', label: `🟢 1st Visit (${analytics.recentVisits.filter(x => !x.past_visits || x.past_visits === 0).length})` },
                        { key: 'returning', label: `🔁 Returning (${analytics.recentVisits.filter(x => x.past_visits > 0).length})` },
                        { key: 'mobile', label: '📱 Mobile' },
                        { key: 'desktop', label: '💻 Desktop' },
                        { key: 'tablet', label: '📟 Tablet' }
                      ].map(pill => {
                        const active = visitorDeviceFilter === pill.key;
                        return (
                          <button
                            key={pill.key}
                            onClick={() => {
                              setVisitorDeviceFilter(pill.key);
                              setVisitorPage(1);
                            }}
                            style={{
                              background: active ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                              border: `1px solid ${active ? 'var(--accent-orange)' : 'rgba(255, 255, 255, 0.08)'}`,
                              color: active ? '#fbbf24' : 'var(--text-secondary)',
                              padding: '0.35rem 0.7rem',
                              borderRadius: '6px',
                              fontSize: '0.74rem',
                              fontWeight: active ? 700 : 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {pill.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Input */}
                    <div className="admin-search-input-mobile" style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '360px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        value={visitorSearch}
                        onChange={(e) => {
                          setVisitorSearch(e.target.value);
                          setVisitorPage(1);
                        }}
                        placeholder="Search Device, Platform, City, IP, Bot..."
                        style={{
                          width: '100%',
                          padding: '0.4rem 0.75rem 0.4rem 2rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '6px',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          outline: 'none'
                        }}
                      />
                      {visitorSearch && (
                        <button
                          onClick={() => {
                            setVisitorSearch('');
                            setVisitorPage(1);
                          }}
                          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const totalVisitorHits = filteredVisits.length;
                    const totalVisitorPages = visitorPageSize === 'all' ? 1 : Math.ceil(totalVisitorHits / Number(visitorPageSize));
                    const safeVisitorPage = Math.min(Math.max(1, visitorPage), totalVisitorPages || 1);
                    const visitorStartIndex = visitorPageSize === 'all' ? 0 : (safeVisitorPage - 1) * Number(visitorPageSize);
                    const paginatedVisits = visitorPageSize === 'all' ? filteredVisits : filteredVisits.slice(visitorStartIndex, visitorStartIndex + Number(visitorPageSize));

                    return (
                      <>
                        {/* Visitor Stream List */}
                        <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingRight: '4px' }}>
                          {paginatedVisits.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.06)' }}>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                                {visitorSearch || visitorDeviceFilter !== 'all' ? 'No visitors match the active search/filter criteria.' : 'Awaiting initial visitor activity...'}
                              </p>
                            </div>
                          ) : (
                            paginatedVisits.map((v) => {
                              const isMob = v.device_type === 'mobile';
                              const isTab = v.device_type === 'tablet';
                              const locationStr = [v.city, v.region, v.country].filter(Boolean).join(', ');
                              const countryFlag = getCountryFlag(v.country);
                              const devId = simplifyDeviceId(v.device_id || v.visitor_id);
                              const pastCount = typeof v.past_visits === 'number' ? v.past_visits : 0;
                              const isNewVisitor = pastCount === 0;
                              const visitorBooking = getVisitorBooking(v);

                              return (
                                <div
                                  key={v.id}
                                  onClick={() => openVisitorInspector(v)}
                                  className="admin-visitor-card"
                                  title="Click to view complete Device Profile and Visit History"
                                >
                                  {/* Left: Device Icon & Details */}
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                                    <span style={{
                                      width: '38px', height: '38px',
                                      borderRadius: '10px',
                                      background: isMob ? 'rgba(245, 158, 11, 0.12)' : (isTab ? 'rgba(168, 85, 247, 0.12)' : 'rgba(59, 130, 246, 0.12)'),
                                      color: isMob ? '#f59e0b' : (isTab ? '#a855f7' : '#3b82f6'),
                                      border: `1px solid ${isMob ? 'rgba(245, 158, 11, 0.25)' : (isTab ? 'rgba(168, 85, 247, 0.25)' : 'rgba(59, 130, 246, 0.25)')}`,
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                      marginTop: '2px'
                                    }}>
                                      {isMob ? <Smartphone size={18} /> : (isTab ? <Tablet size={18} /> : <Monitor size={18} />)}
                                    </span>

                                    {/* Details Stack */}
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      {/* Row 1: Page Title + Platform Badge + Bot/Human Badge + Campaign + Device ID Badge + Past Visit Badge + Booked Lead Badge */}
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {v.path === '/' ? 'Home Page' : v.path}
                                        </span>

                                        {/* Acquisition Platform Badge */}
                                        {(() => {
                                          const pInfo = getPlatformDetails(v.platform);
                                          return (
                                            <span style={{
                                              background: pInfo.bg,
                                              color: pInfo.color,
                                              border: `1px solid ${pInfo.border}`,
                                              borderRadius: '4px',
                                              padding: '0.15rem 0.45rem',
                                              fontSize: '0.68rem',
                                              fontWeight: 700,
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '3px'
                                            }} title={`Customer reached via ${pInfo.name}`}>
                                              <span>{pInfo.icon}</span> {pInfo.name}
                                            </span>
                                          );
                                        })()}

                                        {/* Bot vs Human Classification Badge */}
                                        {v.is_bot ? (
                                          <span style={{
                                            background: 'rgba(249, 115, 22, 0.16)',
                                            color: '#fb923c',
                                            border: '1px solid rgba(249, 115, 22, 0.4)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.45rem',
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }} title={`Automated Bot / Search Crawler: ${v.bot_name || 'Generic Bot'}`}>
                                            🤖 Bot: {v.bot_name || 'Crawler'}
                                          </span>
                                        ) : (
                                          <span style={{
                                            background: 'rgba(34, 197, 94, 0.12)',
                                            color: '#4ade80',
                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.45rem',
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }} title="Verified Human Visitor">
                                            👤 Human
                                          </span>
                                        )}

                                        {/* Marketing Campaign / Ad Tag */}
                                        {(v.utm_campaign || v.utm_source) && (
                                          <span style={{
                                            background: 'rgba(234, 179, 8, 0.12)',
                                            color: '#fde047',
                                            border: '1px solid rgba(234, 179, 8, 0.3)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.45rem',
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }} title="Campaign / Source">
                                            🎯 {v.utm_campaign || v.utm_source}
                                          </span>
                                        )}

                                        {/* Device ID Badge with 1-click Copy */}
                                        <div
                                          onClick={(e) => copyToClipboard(devId, 'dev_' + v.id, e)}
                                          style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '0.15rem 0.45rem',
                                            background: 'rgba(59, 130, 246, 0.08)',
                                            border: '1px solid rgba(59, 130, 246, 0.25)',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            fontSize: '0.72rem',
                                            color: '#93c5fd',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            transition: 'background 0.2s ease'
                                          }}
                                          title="Click to copy Device ID"
                                        >
                                          <Hash size={11} color="#60a5fa" />
                                          <span>{devId}</span>
                                          {copiedId === 'dev_' + v.id ? (
                                            <Check size={11} color="#4ade80" />
                                          ) : (
                                            <Copy size={11} style={{ opacity: 0.6 }} />
                                          )}
                                        </div>

                                        {/* Past Visits Indicator */}
                                        {isNewVisitor ? (
                                          <span style={{
                                            background: 'rgba(34, 197, 94, 0.12)',
                                            color: '#4ade80',
                                            border: '1px solid rgba(34, 197, 94, 0.3)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.45rem',
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }}>
                                            🟢 1st Visit (New)
                                          </span>
                                        ) : (
                                          <span style={{
                                            background: 'rgba(168, 85, 247, 0.14)',
                                            color: '#c084fc',
                                            border: '1px solid rgba(168, 85, 247, 0.32)',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.45rem',
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '3px'
                                          }}>
                                            🔁 Visit #{pastCount + 1} ({pastCount} past)
                                          </span>
                                        )}

                                        {/* Booked Lead Indicator Badge */}
                                        {visitorBooking && (
                                          <span style={{
                                            background: 'linear-gradient(135deg, rgba(239, 199, 25, 0.18), rgba(34, 197, 94, 0.2))',
                                            border: '1px solid rgba(239, 199, 25, 0.45)',
                                            color: '#fde047',
                                            borderRadius: '4px',
                                            padding: '0.15rem 0.5rem',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            boxShadow: '0 0 10px rgba(239, 199, 25, 0.2)'
                                          }}>
                                            <CheckCircle2 size={12} color="#4ade80" /> 🎯 Booked: {visitorBooking.name} ({visitorBooking.package_name || visitorBooking.type || 'Lead'})
                                          </span>
                                        )}
                                      </div>

                                      {/* Row 2: Device Specs & Telemetry */}
                                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{(v.device_type || 'mobile').toUpperCase()}</span>
                                        <span>·</span>
                                        <span>{v.browser || 'Web'}</span>
                                        {v.os && <><span>·</span><span>{v.os}</span></>}
                                        {v.screen_resolution && <><span>·</span><span style={{ opacity: 0.85 }}>{v.screen_resolution}</span></>}
                                        {v.isp && <><span>·</span><span style={{ color: '#38bdf8' }}>📡 {v.isp}</span></>}
                                        {v.referrer && v.referrer !== 'Direct' && (
                                          <>
                                            <span>·</span>
                                            <span style={{ color: '#f472b6' }}>via {v.referrer}</span>
                                          </>
                                        )}
                                        {v.ip_address && (
                                          <>
                                            <span>·</span>
                                            <span
                                              onClick={(e) => copyToClipboard(v.ip_address, 'ip_' + v.id, e)}
                                              style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '0.1rem 0.35rem',
                                                borderRadius: '3px',
                                                color: 'var(--text-secondary)',
                                                cursor: 'pointer'
                                              }}
                                              title="Click to copy IP"
                                            >
                                              🌐 {v.ip_address}
                                              {copiedId === 'ip_' + v.id ? <Check size={10} color="#4ade80" /> : <Copy size={9} style={{ opacity: 0.6 }} />}
                                            </span>
                                          </>
                                        )}
                                      </div>

                                      {/* Row 3: Location + Clickable "See Location" Button */}
                                      {locationStr && (
                                        <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                                          <span style={{ fontSize: '0.72rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            📍 {countryFlag} {locationStr}
                                          </span>

                                          {/* Interactive See Location Button */}
                                          <button
                                            onClick={(e) => { e.stopPropagation(); openVisitorInspector(v); }}
                                            style={{
                                              background: 'rgba(59, 130, 246, 0.12)',
                                              border: '1px solid rgba(59, 130, 246, 0.3)',
                                              color: '#60a5fa',
                                              borderRadius: '4px',
                                              padding: '0.14rem 0.5rem',
                                              fontSize: '0.68rem',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.3rem',
                                              cursor: 'pointer',
                                              fontWeight: 600,
                                              transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                                              e.currentTarget.style.color = '#93c5fd';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)';
                                              e.currentTarget.style.color = '#60a5fa';
                                            }}
                                            title="Open live location & interactive map in Detail window"
                                          >
                                            <MapPin size={11} /> 📍 See Location & Map
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Timestamps & Inspection */}
                                  <div
                                    className="admin-visitor-card-meta"
                                    style={{
                                      textAlign: 'right',
                                      flexShrink: 0,
                                      marginLeft: '0.5rem',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'flex-end',
                                      gap: '0.25rem'
                                    }}
                                  >
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                                        {formatDate(v.created_at)}
                                      </div>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                        {formatRelativeTime(v.created_at)}
                                      </div>

                                      {/* Last Visit / Session Information */}
                                      {(() => {
                                        if (!v.last_visit_at || !v.past_visits) {
                                          return (
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.15rem' }}>
                                              First recorded visit
                                            </div>
                                          );
                                        }

                                        const curTime = new Date(ensureUtcIso(v.created_at)).getTime();
                                        const priorTime = new Date(ensureUtcIso(v.last_visit_at)).getTime();
                                        const diffMin = Math.abs(curTime - priorTime) / 60000;

                                        // If visited within 15 mins, it is part of the ongoing session
                                        if (diffMin < 15) {
                                          return (
                                            <div
                                              style={{
                                                fontSize: '0.66rem',
                                                color: '#38bdf8',
                                                marginTop: '0.2rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem',
                                                fontWeight: 600
                                              }}
                                              title={`Continuous browsing session (${(v.past_visits || 0) + 1} pageviews total)`}
                                            >
                                              <span style={{
                                                width: '5px',
                                                height: '5px',
                                                borderRadius: '50%',
                                                backgroundColor: '#38bdf8',
                                                display: 'inline-block',
                                                boxShadow: '0 0 5px #38bdf8'
                                              }}></span>
                                              Active Session (hit #{(v.past_visits || 0) + 1})
                                            </div>
                                          );
                                        }

                                        // Prior session from an earlier time or past date
                                        return (
                                          <div
                                            style={{
                                              fontSize: '0.68rem',
                                              color: '#f59e0b',
                                              marginTop: '0.2rem',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '0.25rem'
                                            }}
                                            title={`Prior session recorded on ${formatDate(v.last_visit_at)}`}
                                          >
                                            <Clock size={11} color="#f59e0b" /> Prior: {formatRelativeTime(v.last_visit_at)}
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    <button
                                      onClick={(e) => { e.stopPropagation(); openVisitorInspector(v); }}
                                      style={{
                                        marginTop: '0.25rem',
                                        background: visitorBooking ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)',
                                        border: visitorBooking ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '6px',
                                        color: visitorBooking ? '#4ade80' : '#ffffff',
                                        fontSize: '0.74rem',
                                        fontWeight: 600,
                                        padding: '0.28rem 0.65rem',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = visitorBooking ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255,255,255,0.12)'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = visitorBooking ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255,255,255,0.06)'; }}
                                      title="Open complete visitor dossier & journey details"
                                    >
                                      <Search size={12} /> 🔍 Details
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* VISITOR PAGINATION CONTROLS */}
                        {totalVisitorHits > 0 && (
                          <div className="admin-pagination" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '1.25rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border-muted)',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                              <span>
                                Showing <strong style={{ color: '#ffffff' }}>
                                  {visitorPageSize === 'all' ? `all ${totalVisitorHits}` : `${visitorStartIndex + 1}–${Math.min(visitorStartIndex + Number(visitorPageSize), totalVisitorHits)} of ${totalVisitorHits}`}
                                </strong> visitors
                                {visitorSearch && <span> (matching &ldquo;{visitorSearch}&rdquo;)</span>}
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span>Per page:</span>
                                <select
                                  value={visitorPageSize}
                                  onChange={(e) => {
                                    setVisitorPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                    setVisitorPage(1);
                                  }}
                                  style={{
                                    background: '#0a0a0f',
                                    color: '#ffffff',
                                    border: '1px solid var(--border-muted)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value={15}>15</option>
                                  <option value={25}>25</option>
                                  <option value={50}>50</option>
                                  <option value={100}>100</option>
                                  <option value={200}>200</option>
                                  <option value="all">All ({totalVisitorHits})</option>
                                </select>
                              </div>
                            </div>

                            {totalVisitorPages > 1 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => setVisitorPage(1)}
                                  disabled={safeVisitorPage <= 1}
                                  style={{
                                    padding: '0.35rem 0.6rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--border-muted)',
                                    borderRadius: '6px',
                                    color: safeVisitorPage <= 1 ? 'var(--text-muted)' : '#ffffff',
                                    cursor: safeVisitorPage <= 1 ? 'not-allowed' : 'pointer',
                                    fontSize: '0.78rem',
                                    opacity: safeVisitorPage <= 1 ? 0.4 : 1
                                  }}
                                  title="First Page"
                                >
                                  «
                                </button>

                                <button
                                  onClick={() => setVisitorPage(p => Math.max(1, p - 1))}
                                  disabled={safeVisitorPage <= 1}
                                  style={{
                                    padding: '0.35rem 0.6rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--border-muted)',
                                    borderRadius: '6px',
                                    color: safeVisitorPage <= 1 ? 'var(--text-muted)' : '#ffffff',
                                    cursor: safeVisitorPage <= 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.78rem',
                                    opacity: safeVisitorPage <= 1 ? 0.4 : 1
                                  }}
                                  title="Previous Page"
                                >
                                  <ChevronLeft size={14} />
                                </button>

                                {(() => {
                                  const pages = [];
                                  let startP = Math.max(1, safeVisitorPage - 2);
                                  let endP = Math.min(totalVisitorPages, startP + 4);
                                  if (endP - startP < 4) {
                                    startP = Math.max(1, endP - 4);
                                  }

                                  if (startP > 1) {
                                    pages.push(
                                      <button
                                        key={1}
                                        onClick={() => setVisitorPage(1)}
                                        style={{
                                          padding: '0.35rem 0.65rem',
                                          background: 'rgba(255,255,255,0.04)',
                                          border: '1px solid var(--border-muted)',
                                          borderRadius: '6px',
                                          color: '#ffffff',
                                          cursor: 'pointer',
                                          fontSize: '0.78rem'
                                        }}
                                      >
                                        1
                                      </button>
                                    );
                                    if (startP > 2) {
                                      pages.push(<span key="dots-start" style={{ color: 'var(--text-muted)', padding: '0 0.2rem' }}>...</span>);
                                    }
                                  }

                                  for (let p = startP; p <= endP; p++) {
                                    const isCurr = p === safeVisitorPage;
                                    pages.push(
                                      <button
                                        key={p}
                                        onClick={() => setVisitorPage(p)}
                                        style={{
                                          padding: '0.35rem 0.65rem',
                                          background: isCurr ? 'var(--accent-orange)' : 'rgba(255,255,255,0.04)',
                                          border: isCurr ? '1px solid var(--accent-orange)' : '1px solid var(--border-muted)',
                                          borderRadius: '6px',
                                          color: isCurr ? '#000000' : '#ffffff',
                                          fontWeight: isCurr ? 700 : 500,
                                          cursor: 'pointer',
                                          fontSize: '0.78rem',
                                          minWidth: '28px',
                                          textAlign: 'center'
                                        }}
                                      >
                                        {p}
                                      </button>
                                    );
                                  }

                                  if (endP < totalVisitorPages) {
                                    if (endP < totalVisitorPages - 1) {
                                      pages.push(<span key="dots-end" style={{ color: 'var(--text-muted)', padding: '0 0.2rem' }}>...</span>);
                                    }
                                    pages.push(
                                      <button
                                        key={totalVisitorPages}
                                        onClick={() => setVisitorPage(totalVisitorPages)}
                                        style={{
                                          padding: '0.35rem 0.65rem',
                                          background: 'rgba(255,255,255,0.04)',
                                          border: '1px solid var(--border-muted)',
                                          borderRadius: '6px',
                                          color: '#ffffff',
                                          cursor: 'pointer',
                                          fontSize: '0.78rem'
                                        }}
                                      >
                                        {totalVisitorPages}
                                      </button>
                                    );
                                  }

                                  return pages;
                                })()}

                                <button
                                  onClick={() => setVisitorPage(p => Math.min(totalVisitorPages, p + 1))}
                                  disabled={safeVisitorPage >= totalVisitorPages}
                                  style={{
                                    padding: '0.35rem 0.6rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--border-muted)',
                                    borderRadius: '6px',
                                    color: safeVisitorPage >= totalVisitorPages ? 'var(--text-muted)' : '#ffffff',
                                    cursor: safeVisitorPage >= totalVisitorPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '0.78rem',
                                    opacity: safeVisitorPage >= totalVisitorPages ? 0.4 : 1
                                  }}
                                  title="Next Page"
                                >
                                  <ChevronRight size={14} />
                                </button>

                                <button
                                  onClick={() => setVisitorPage(totalVisitorPages)}
                                  disabled={safeVisitorPage >= totalVisitorPages}
                                  style={{
                                    padding: '0.35rem 0.6rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid var(--border-muted)',
                                    borderRadius: '6px',
                                    color: safeVisitorPage >= totalVisitorPages ? 'var(--text-muted)' : '#ffffff',
                                    cursor: safeVisitorPage >= totalVisitorPages ? 'not-allowed' : 'pointer',
                                    fontSize: '0.78rem',
                                    opacity: safeVisitorPage >= totalVisitorPages ? 0.4 : 1
                                  }}
                                  title="Last Page"
                                >
                                  »
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </>
            )}

          </div>
        )}

        {/* TAB: PUSH NOTIFICATION REMINDERS */}
        {currentTab === 'push' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Control Header with Refresh and Status */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.5rem 1.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0, color: '#f8fafc' }}>
                  <Bell size={22} color="#efc719" /> Daily Booking Reminder Push Notifications
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0 }}>
                  Automated background device reminders for visitors who browsed the website but haven't booked an appointment.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => fetchPushStats()}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.82rem' }}
                >
                  <RefreshCw size={14} /> Refresh Stats
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPushReminders}
                  disabled={sendingPush || (pushStats.not_booked || 0) === 0}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    background: 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                    color: '#0b132b',
                    fontWeight: 700,
                    opacity: (pushStats.not_booked || 0) === 0 ? 0.6 : 1,
                    cursor: (pushStats.not_booked || 0) === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Send size={14} /> {sendingPush ? 'Sending Reminders...' : 'Send Reminders Now'}
                </button>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              {/* Card 1: 100% Website Reach (All Past & New Visitors) */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #efc719', background: 'linear-gradient(135deg, rgba(239, 199, 25, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#efc719', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>100% Website Reach</span>
                    <h3 style={{ fontSize: '1.9rem', margin: '0.35rem 0 0', color: '#ffffff' }}>
                      {pushStats.total_past_visitors || analytics.overview?.total_visitors || 1526}
                    </h3>
                  </div>
                  <div style={{ background: 'rgba(239, 199, 25, 0.15)', color: '#efc719', padding: '0.65rem', borderRadius: '10px' }}>
                    <Globe size={22} />
                  </div>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  All past & returning visitor devices (reaches 100% via Live In-App Notification)
                </p>
              </div>

              {/* Card 2: Registered Push Devices */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Device Push Subscribers</span>
                    <h3 style={{ fontSize: '1.9rem', margin: '0.35rem 0 0', color: '#ffffff' }}>{pushStats.total_subscribers || 0}</h3>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '0.65rem', borderRadius: '10px' }}>
                    <Smartphone size={22} />
                  </div>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Visitors who permitted device push notifications (delivers OS alerts)
                </p>
              </div>

              {/* Card 3: Pending Unbooked Visitors */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Unbooked</span>
                    <h3 style={{ fontSize: '1.9rem', margin: '0.35rem 0 0', color: '#f59e0b' }}>{pushStats.not_booked || 0}</h3>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.65rem', borderRadius: '10px' }}>
                    <Bell size={22} />
                  </div>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Subscribers receiving automated daily reminder sequence
                </p>
              </div>

              {/* Card 4: Converted / Booked */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #22c55e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Converted / Booked</span>
                    <h3 style={{ fontSize: '1.9rem', margin: '0.35rem 0 0', color: '#22c55e' }}>{pushStats.has_booked || 0}</h3>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '0.65rem', borderRadius: '10px' }}>
                    <CheckCircle2 size={22} />
                  </div>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Booked appointment — permanently excluded from reminders
                </p>
              </div>

              {/* Card 5: Live Site Notification Status */}
              <div className="glass-card" style={{ padding: '1.5rem', borderLeft: pushStats.site_notification?.enabled ? '4px solid #22c55e' : '4px solid #64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site-Wide Announcement</span>
                    <h3 style={{ fontSize: '1.35rem', margin: '0.5rem 0 0', color: pushStats.site_notification?.enabled ? '#22c55e' : '#94a3b8' }}>
                      {pushStats.site_notification?.enabled ? '● Live on Site' : '○ Inactive'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleSiteNotification}
                    disabled={togglingSiteNotif}
                    style={{
                      background: pushStats.site_notification?.enabled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                      color: pushStats.site_notification?.enabled ? '#fca5a5' : '#4ade80',
                      border: '1px solid currentColor',
                      borderRadius: '8px',
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: togglingSiteNotif ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {pushStats.site_notification?.enabled ? 'Turn Off' : 'Turn On'}
                  </button>
                </div>
                <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Reaches 100% of visitors (even if push is blocked/not enabled)
                </p>
              </div>
            </div>

            {/* Custom Push Broadcast Composer — Multi-Channel Dispatch */}
            <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(239, 199, 25, 0.4)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Send size={20} color="#efc719" /> Broadcast Notification (Send to Devices &amp; Website at Any Time)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', margin: 0 }}>
                    Compose and dispatch an immediate notification. Reaches 100% of website visitors (past visitors returning &amp; non-subscribers) AND sends direct background push alerts to subscribed devices.
                  </p>
                </div>

                {/* Target Audience Pill Toggle */}
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-muted)' }}>
                  <button
                    type="button"
                    onClick={() => setCustomBroadcast(prev => ({ ...prev, target_audience: 'unbooked' }))}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '7px',
                      background: customBroadcast.target_audience === 'unbooked' ? '#efc719' : 'transparent',
                      color: customBroadcast.target_audience === 'unbooked' ? '#0b132b' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🟡 Unbooked Visitors ({pushStats.not_booked || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomBroadcast(prev => ({ ...prev, target_audience: 'all' }))}
                    style={{
                      padding: '0.45rem 0.95rem',
                      borderRadius: '7px',
                      background: customBroadcast.target_audience === 'all' ? '#3b82f6' : 'transparent',
                      color: customBroadcast.target_audience === 'all' ? '#ffffff' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔵 All Devices ({pushStats.total_subscribers || 0})
                  </button>
                </div>
              </div>

              {/* Quick Template Chips */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                  Quick Fill Templates:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    {
                      label: '🏠 1:1 Scale Blueprints',
                      title: '🏠 Walk Your Floor Plan at 1:1 Scale!',
                      body: 'Experience your future home before construction begins. Book a blueprint projection session in Gurugram, Dehradun, Varanasi, Hyderabad & Madurai!',
                      url: '/contact'
                    },
                    {
                      label: '✨ ₹5,000 Token Deposit',
                      title: '✨ Special: Reserve Slot with ₹5,000 Token',
                      body: 'Reserve your Walk The Plan studio slot with just ₹5,000 token deposit. Walk through your blueprints with real moveable furniture!',
                      url: '/contact'
                    },
                    {
                      label: '📐 Avoid Costly Rework',
                      title: '📐 Don\'t Build Blind — Spot Layout Errors Early',
                      body: 'Over 35% of homeowners face costly demolition rework. Test room clearances, door swings & corridors before pouring concrete!',
                      url: '/services'
                    },
                    {
                      label: '🏗️ Save ₹3.5L to ₹15L',
                      title: '🏗️ Save ₹3.5L–₹15L in Construction Rework',
                      body: 'Spot structural layout problems before construction begins. Book your 1:1 scale studio projection session now!',
                      url: '/services'
                    }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomBroadcast(prev => ({
                        ...prev,
                        title: preset.title,
                        body: preset.body,
                        url: preset.url
                      }))}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px',
                        background: 'rgba(239, 199, 25, 0.08)',
                        border: '1px solid rgba(239, 199, 25, 0.25)',
                        color: '#f8fafc',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 199, 25, 0.2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 199, 25, 0.08)'}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form & Live Preview Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', alignItems: 'start' }}>
                {/* Form Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Notification Title ({customBroadcast.title.length}/60 chars)
                    </label>
                    <input
                      type="text"
                      value={customBroadcast.title}
                      onChange={e => setCustomBroadcast(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. 🏠 Walk Your Floor Plan Today!"
                      className="form-control"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-muted)', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Notification Message Body ({customBroadcast.body.length}/180 chars)
                    </label>
                    <textarea
                      rows={3}
                      value={customBroadcast.body}
                      onChange={e => setCustomBroadcast(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Enter the notification message text..."
                      className="form-control"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-muted)', color: '#ffffff', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                        When User Clicks: Destination Page
                      </label>
                      <select
                        value={customBroadcast.url}
                        onChange={e => setCustomBroadcast(prev => ({ ...prev, url: e.target.value }))}
                        className="form-control"
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-muted)', color: '#ffffff' }}
                      >
                        <option value="/contact">📅 /contact (Book Appointment)</option>
                        <option value="/services">📐 /services (Pricing &amp; Plans)</option>
                        <option value="/gallery">🎬 /gallery (Walkthrough Videos)</option>
                        <option value="/">🏠 / (Home Page)</option>
                        <option value="/franchise">🏢 /franchise (Franchise Opportunities)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                        Send Mode
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-muted)', cursor: 'pointer', fontSize: '0.82rem', color: '#f8fafc' }}>
                        <input
                          type="checkbox"
                          checked={customBroadcast.force_immediate}
                          onChange={e => setCustomBroadcast(prev => ({ ...prev, force_immediate: e.target.checked }))}
                          style={{ accentColor: '#efc719' }}
                        />
                        <span>⚡ Send Any Time (Instant)</span>
                      </label>
                    </div>
                  </div>

                  {/* Multi-Channel Delivery Checkboxes */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      Delivery Channels (Who to Reach):
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                      {/* Channel 1: Site-Wide Banner (100% of Visitors & Non-Subscribers) */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.75rem 0.95rem',
                        borderRadius: '10px',
                        background: customBroadcast.publish_to_site ? 'rgba(239, 199, 25, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: customBroadcast.publish_to_site ? '1px solid rgba(239, 199, 25, 0.45)' : '1px solid var(--border-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="checkbox"
                          checked={customBroadcast.publish_to_site}
                          onChange={e => setCustomBroadcast(prev => ({ ...prev, publish_to_site: e.target.checked }))}
                          style={{ accentColor: '#efc719', marginTop: '3px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#efc719' }}>
                            🌐 Post to Website (100% Reach)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>
                            Shows live banner on walktheplan.in to all {pushStats.total_past_visitors || analytics.overview?.total_visitors || 1526}+ visitors &amp; non-subscribers.
                          </div>
                        </div>
                      </label>

                      {/* Channel 2: Device Background Push */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        padding: '0.75rem 0.95rem',
                        borderRadius: '10px',
                        background: customBroadcast.send_device_push ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: customBroadcast.send_device_push ? '1px solid rgba(59, 130, 246, 0.45)' : '1px solid var(--border-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                        <input
                          type="checkbox"
                          checked={customBroadcast.send_device_push}
                          onChange={e => setCustomBroadcast(prev => ({ ...prev, send_device_push: e.target.checked }))}
                          style={{ accentColor: '#3b82f6', marginTop: '3px' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#60a5fa' }}>
                            📲 Device OS Push (Subscribers)
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '2px', lineHeight: '1.4' }}>
                            Sends direct screen push alert to {customBroadcast.target_audience === 'all' ? `${pushStats.total_subscribers || 0} registered devices` : `${pushStats.not_booked || 0} unbooked devices`} (even when browser is closed).
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleTriggerPushReminders(customBroadcast)}
                      disabled={sendingPush || (!customBroadcast.title && !customBroadcast.body)}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '0.85rem 1.5rem',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                        color: '#0b132b',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: (sendingPush || (!customBroadcast.title && !customBroadcast.body)) ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(239, 199, 25, 0.3)'
                      }}
                    >
                      <Send size={16} />
                      <span>{sendingPush ? 'Broadcasting Notification...' : '🚀 Dispatch Broadcast Notification Now'}</span>
                    </button>
                  </div>
                </div>

                {/* Previews: Device & Website Live Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Live Device Notification Preview Card */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      📱 Device Screen Push Preview (OS Alert):
                    </label>
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(239, 199, 25, 0.45)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(239, 199, 25, 0.1)',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img src="/favicon.png" alt="WTP" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Walk The Plan Studio · Device Push</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Just now</span>
                      </div>

                      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                        {customBroadcast.title || '🏠 Walk Your Floor Plan Today!'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.83rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                        {customBroadcast.body || 'Book your 1:1 scale blueprint projection session today! Walk through your future home before construction begins.'}
                      </p>

                      <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-start' }}>
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '6px',
                          background: 'rgba(239, 199, 25, 0.15)',
                          border: '1px solid rgba(239, 199, 25, 0.4)',
                          color: '#efc719',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}>
                          📅 Book Appointment
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Live Website Announcement Preview */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.35rem' }}>
                      🌐 Website Banner Preview (Seen by 100% of Visitors &amp; Non-Subscribers):
                    </label>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(11, 19, 43, 0.98))',
                      border: '1px solid rgba(239, 199, 25, 0.55)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#efc719', background: 'rgba(239,199,25,0.18)', padding: '2px 6px', borderRadius: '4px' }}>
                          ● LIVE ANNOUNCEMENT
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                          {customBroadcast.title || '🏠 Walk Your Floor Plan Today!'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                        {customBroadcast.body || 'Book your 1:1 scale blueprint projection session today! Experience your future home before construction begins.'}
                      </p>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ background: '#efc719', color: '#0b132b', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                          Explore / Book Studio Session →
                        </span>
                        <span style={{ background: 'rgba(255,255,255,0.08)', color: '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem' }}>
                          🔔 Get Direct Device Alerts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Site-Wide Live Notification Control Card */}
            <div
              className="glass-card"
              style={{
                padding: '1.75rem',
                border: pushStats.site_notification?.enabled ? '1px solid rgba(34, 197, 94, 0.45)' : '1px solid var(--border-muted)',
                background: pushStats.site_notification?.enabled
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'rgba(15, 23, 42, 0.5)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ maxWidth: '680px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <div
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: pushStats.site_notification?.enabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: pushStats.site_notification?.enabled ? '#4ade80' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Globe size={14} />
                      <span>{pushStats.site_notification?.enabled ? '● Live Banner Visible on Website' : '○ Website Banner Hidden'}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      (Delivers to 100% of visitors without requiring browser push permission)
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#f8fafc' }}>
                    Current Website Announcement Banner
                  </h3>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    <strong>Title:</strong> {pushStats.site_notification?.title || 'None'} <br />
                    <strong>Message:</strong> {pushStats.site_notification?.body || 'None'}
                  </p>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Reaches all {pushStats.total_past_visitors || analytics.overview?.total_visitors || 1526}+ tracked visitors and non-subscribers whenever they visit walktheplan.in
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleToggleSiteNotification}
                    disabled={togglingSiteNotif}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: pushStats.site_notification?.enabled ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                      border: pushStats.site_notification?.enabled ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
                      color: pushStats.site_notification?.enabled ? '#fca5a5' : '#0b132b',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: togglingSiteNotif ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Globe size={15} />
                    <span>{pushStats.site_notification?.enabled ? 'Hide from Website' : 'Show on Website'}</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{
                      padding: '0.65rem 1.15rem',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      textDecoration: 'none'
                    }}
                    title="Open website in new tab to see how the announcement appears to visitors"
                  >
                    <ExternalLink size={14} />
                    <span>View on Website</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Admin Real-Time Lead Alert Device Panel */}
            <div
              className="glass-card"
              style={{
                padding: '1.75rem',
                border: adminPushEnabled ? '1px solid rgba(34, 197, 94, 0.45)' : '1px solid rgba(239, 199, 25, 0.45)',
                background: adminPushEnabled
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 199, 25, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
                <div style={{ maxWidth: '650px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <div
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        background: adminPushEnabled ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 199, 25, 0.2)',
                        color: adminPushEnabled ? '#4ade80' : '#efc719',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Bell size={14} />
                      <span>{adminPushEnabled ? '● Device Alerts Active' : '○ Device Alerts Inactive'}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      ({pushStats.admin_devices || 0} admin device{(pushStats.admin_devices || 0) === 1 ? '' : 's'} registered)
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', color: '#f8fafc' }}>
                    Real-Time Lead Alerts for Admin Panel Logins
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    Whenever a customer submits an appointment, pays a ₹5,000 token, or fills out a contact inquiry, your device will receive an <strong>instant push notification alert</strong> with customer name, phone number, and package details.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleResetAndSendPush}
                    disabled={resettingAdminPush || togglingAdminPush}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: resettingAdminPush ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)',
                      transition: 'all 0.2s ease'
                    }}
                    title="Reset all admin devices and re-activate instant lead alerts with a test notification"
                  >
                    <RefreshCw size={15} className={resettingAdminPush ? 'animated-float' : ''} />
                    <span>{resettingAdminPush ? 'Resetting & Sending...' : '🔄 Reset & Send Notification'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleAdminPush}
                    disabled={togglingAdminPush || resettingAdminPush}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: adminPushEnabled ? 'rgba(239, 68, 68, 0.15)' : 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                      border: adminPushEnabled ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
                      color: adminPushEnabled ? '#fca5a5' : '#0b132b',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: togglingAdminPush ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Bell size={15} />
                    <span>{adminPushEnabled ? 'Disable on This Device' : '🔔 Enable on This Device'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTestAdminAlert}
                    disabled={testingAdminAlert}
                    className="btn-secondary"
                    style={{
                      padding: '0.65rem 1.15rem',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                    title="Send a sample lead alert push notification to test device receipt"
                  >
                    <Send size={14} />
                    <span>{testingAdminAlert ? 'Sending Test...' : 'Test Lead Alert'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dispatch Result Alert */}
            {pushResult && (
              <div className="glass-card" style={{ padding: '1.25rem 1.5rem', border: '1px solid #22c55e', background: 'rgba(34, 197, 94, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={20} color="#22c55e" />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#22c55e', fontSize: '0.95rem' }}>Push Notification Dispatch Complete</h4>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                      <strong>{pushResult.sent}</strong> successfully sent to user devices · <strong>{pushResult.failed}</strong> failed · <strong>{pushResult.expired_removed || 0}</strong> expired subscriptions cleaned from database.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cron & Delivery Architecture Card */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <Zap size={18} color="#efc719" /> Automated Reminder Schedule &amp; Logic
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#efc719', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock3 size={15} /> Daily Automated Schedule
                  </div>
                  <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                    Runs automatically <strong>every day at 10:00 AM IST</strong> (04:30 UTC) in the backend via <code>node-cron</code>. No manual action required.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldCheck size={15} /> 1 Notification Per Day Cap
                  </div>
                  <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                    Each device receives strictly <strong>max 1 reminder per 24 hours</strong>. When a notification is delivered, <code>last_notified_at</code> updates to prevent spamming.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={15} /> Automatic Booking Exclusion
                  </div>
                  <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                    As soon as a visitor books an appointment (or pays token deposit), their device is updated to <strong>has_booked = 1</strong> and reminders immediately stop.
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Repeat size={15} /> Covers All Past Visitors
                  </div>
                  <div style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                    Every visitor who subscribed in the past (yesterday, last week, or months ago) continues receiving 1 daily reminder every day until they book!
                  </div>
                </div>
              </div>
            </div>

            {/* Rotating Messages Preview */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <MessageSquare size={18} color="#efc719" /> Rotating Daily Notification Messages
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                Messages rotate automatically based on the day of the year so repeat visitors receive fresh, engaging reminders:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[
                  {
                    day: 'Template 1',
                    title: '🏠 Walk Your Floor Plan Today!',
                    body: "You visited Walk The Plan but haven't booked yet. Experience your future home at real 1:1 scale before construction — Book your studio session now!",
                    url: '/contact',
                    tag: 'Booking Reminder'
                  },
                  {
                    day: 'Template 2',
                    title: "📐 Don't Build Blind — Walk It First!",
                    body: 'Over 35% of homes face costly demolition rework. Book a 1:1 blueprint projection session and catch layout mistakes before they cost you lakhs.',
                    url: '/services',
                    tag: 'Mistake Prevention'
                  },
                  {
                    day: 'Template 3',
                    title: '🎯 Your Dream Home Awaits — Book a Session',
                    body: 'Walk through your blueprint at life-size scale with real furniture. Our studios in Gurugram, Dehradun, Varanasi, Hyderabad & Madurai are ready for you!',
                    url: '/contact',
                    tag: 'Studio Availability'
                  },
                  {
                    day: 'Template 4',
                    title: '✨ Special: ₹5,000 Token Books Your Session',
                    body: 'Reserve your Walk The Plan studio slot with just ₹5,000. See your villa, apartment or duplex floor plan projected at full 100% scale!',
                    url: '/contact',
                    tag: 'Token Offer'
                  },
                  {
                    day: 'Template 5',
                    title: '🏗️ Save ₹3.5L–₹15L in Construction Rework',
                    body: "Spot layout problems before pouring concrete. Walk The Plan's 1:1 projection studio lets you test doors, corridors & furniture clearances at real scale.",
                    url: '/services',
                    tag: 'Cost Savings'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem 1.25rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{item.title}</span>
                      <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(239, 199, 25, 0.15)', color: '#efc719', fontWeight: 600 }}>
                        {item.tag}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45' }}>
                      {item.body}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.72rem', color: '#38bdf8' }}>
                      <span>Opens: {item.url}</span> · <span>Includes "📅 Book Appointment" Action Button</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Blog Editing Modal */}
      {editingBlog && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setEditingBlog(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20} color="var(--accent-orange)" /> Edit Blog Post</h2>

            <form onSubmit={handleBlogUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Article Title</label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Excerpt / Short Description</label>
                <textarea
                  value={editingBlog.excerpt}
                  onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '60px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Category</label>
                  <select
                    value={editingBlog.category}
                    onChange={(e) => setEditingBlog({ ...editingBlog, category: e.target.value })}
                    className="form-control"
                    style={{ background: 'var(--bg-secondary)', color: '#ffffff' }}
                  >
                    <option value="Planning Tips">Planning Tips</option>
                    <option value="Technology">Technology</option>
                    <option value="Studio News">Studio News</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Author Name</label>
                  <input
                    type="text"
                    value={editingBlog.author}
                    onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cover Image (Leave empty to keep current)</label>
                <input
                  type="file"
                  onChange={(e) => setEditingBlog({ ...editingBlog, cover_image_file: e.target.files[0] })}
                  className="form-control"
                  accept="image/*"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Article Body Content (HTML Allowed)</label>
                <textarea
                  value={editingBlog.content}
                  onChange={(e) => setEditingBlog({ ...editingBlog, content: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '200px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingBlog(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Editing Modal */}
      {editingTestimonial && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setEditingTestimonial(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20} color="var(--accent-orange)" /> Edit Testimonial</h2>

            <form onSubmit={handleTestimonialUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Client Name(s)</label>
                <input
                  type="text"
                  value={editingTestimonial.name}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Client Role/Title</label>
                <input
                  type="text"
                  value={editingTestimonial.role}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Video Title / Topic</label>
                <input
                  type="text"
                  value={editingTestimonial.title}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description / Quote</label>
                <textarea
                  value={editingTestimonial.desc}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, desc: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              <div style={{ border: '1px solid var(--border-muted)', padding: '1rem', borderRadius: '6px', background: 'rgba(255,255,255,0.01)' }}>
                <div className="form-group">
                  <label className="form-label">Update Video File Upload (Leave empty to keep current)</label>
                  <input
                    type="file"
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, video_file_new: e.target.files[0], external_video_url_new: '' })}
                    className="form-control"
                    accept="video/mp4,video/*"
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Recommended: MP4 format, aspect ratio 9:16 or 16:9, max size 15MB.
                  </small>
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.5rem 0' }}>— OR —</div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Update External Video URL</label>
                  <input
                    type="url"
                    value={editingTestimonial.external_video_url_new}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, external_video_url_new: e.target.value, video_file_new: null })}
                    className="form-control"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingTestimonial(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Studio Location Editing Modal */}
      {editingLocation && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setEditingLocation(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20} color="var(--accent-orange)" /> Edit Studio Location</h2>

            <form onSubmit={handleLocationUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">State Key (Unique name to match map)</label>
                <select
                  value={editingLocation.state_key}
                  onChange={(e) => setEditingLocation({ ...editingLocation, state_key: e.target.value })}
                  className="form-control"
                  style={{ background: 'var(--bg-secondary)', color: '#ffffff' }}
                >
                  {editingLocation.state_key && !INDIAN_STATES_AND_UTS.some(i => i.key === editingLocation.state_key) && (
                    <option value={editingLocation.state_key}>{editingLocation.state_key}</option>
                  )}
                  <optgroup label="States (28)">
                    {INDIAN_STATES_AND_UTS.filter(item => item.type === 'State').map(s => (
                      <option key={s.key} value={s.key}>{s.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories (8)">
                    {INDIAN_STATES_AND_UTS.filter(item => item.type === 'Union Territory').map(ut => (
                      <option key={ut.key} value={ut.key}>{ut.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={editingLocation.city}
                  onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  value={editingLocation.phone}
                  onChange={(e) => setEditingLocation({ ...editingLocation, phone: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Address</label>
                <textarea
                  value={editingLocation.address}
                  onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '60px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Studio Details / Description</label>
                <textarea
                  value={editingLocation.details}
                  onChange={(e) => setEditingLocation({ ...editingLocation, details: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Studio Photo (Leave empty to keep current)</label>
                <input
                  type="file"
                  onChange={(e) => setEditingLocation({ ...editingLocation, image_file_new: e.target.files[0] })}
                  className="form-control"
                  accept="image/*"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Recommended: Landscape layout, aspect ratio 16:10 or 4:3 (e.g. 800x500 or 1200x750 pixels), max 2MB.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingLocation(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Plan Editing Modal */}
      {editingService && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setEditingService(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20} color="var(--accent-orange)" /> Edit Service Plan</h2>

            <form onSubmit={handleServiceUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Service Plan Title</label>
                <input
                  type="text"
                  value={editingService.title}
                  onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Subtitle (Visualization Details)</label>
                <input
                  type="text"
                  value={editingService.subtitle}
                  onChange={(e) => setEditingService({ ...editingService, subtitle: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Price (INR)</label>
                  <input
                    type="number"
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Duration (e.g. 1 Hour, 3-5 Hours)</label>
                  <input
                    type="text"
                    value={editingService.duration}
                    onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Promotion Badge (e.g. Most Popular - Leave empty if none)</label>
                <input
                  type="text"
                  value={editingService.badge}
                  onChange={(e) => setEditingService({ ...editingService, badge: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Plan Description</label>
                <textarea
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '80px' }}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Plan Features (One feature per line)</label>
                <textarea
                  value={editingService.features_raw}
                  onChange={(e) => setEditingService({ ...editingService, features_raw: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '100px' }}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingService(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Franchise Model Editing Modal */}
      {editingFranchise && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(7, 10, 18, 0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '600px', border: '1px solid var(--border-color)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setEditingFranchise(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              title="Close Panel"
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit size={20} color="var(--accent-orange)" /> Edit Franchise Model</h2>

            <form onSubmit={handleFranchiseUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Franchise Model Title</label>
                <input
                  type="text"
                  value={editingFranchise.title}
                  onChange={(e) => setEditingFranchise({ ...editingFranchise, title: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estimated Charges & Fees</label>
                <input
                  type="text"
                  value={editingFranchise.charges}
                  onChange={(e) => setEditingFranchise({ ...editingFranchise, charges: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Terms & Conditions (One T&C per line)</label>
                <textarea
                  value={editingFranchise.tc_raw}
                  onChange={(e) => setEditingFranchise({ ...editingFranchise, tc_raw: e.target.value })}
                  className="form-control"
                  style={{ minHeight: '150px' }}
                  placeholder="T&C 1&#10;T&C 2&#10;T&C 3"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditingFranchise(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Device & Visitor Intelligence Modal */}
      {inspectingVisitor && createPortal((() => {
        const b = inspectingVisitor.booking || getVisitorBooking(inspectingVisitor);
        const devId = simplifyDeviceId(inspectingVisitor.device_id || inspectingVisitor.visitor_id);
        const isNew = (!inspectingVisitor.past_visits || inspectingVisitor.past_visits === 0);
        const totalVisits = inspectingVisitor.total_visits || ((inspectingVisitor.past_visits || 0) + 1);
        const locationStr = [inspectingVisitor.city, inspectingVisitor.region, inspectingVisitor.country].filter(Boolean).join(', ');
        const countryFlag = getCountryFlag(inspectingVisitor.country);
        const mapQuery = inspectingVisitor.latitude && inspectingVisitor.longitude
          ? `${inspectingVisitor.latitude},${inspectingVisitor.longitude}`
          : (locationStr || 'India');
        const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=12&ie=UTF8&iwloc=&output=embed`;
        const mapDirectUrl = inspectingVisitor.latitude && inspectingVisitor.longitude
          ? `https://maps.google.com/?q=${inspectingVisitor.latitude},${inspectingVisitor.longitude}`
          : (locationStr ? `https://maps.google.com/?q=${encodeURIComponent(locationStr)}` : 'https://maps.google.com');
        const deviceType = (inspectingVisitor.device_type || 'Mobile').charAt(0).toUpperCase() + (inspectingVisitor.device_type || 'Mobile').slice(1);

        return (
          <div className="visitor-modal-backdrop" onClick={() => setInspectingVisitor(null)}>
            <div className="visitor-modal-dialog" onClick={(e) => e.stopPropagation()}>
              {/* Pinned Header */}
              <div className="visitor-modal-header">
                <div className="visitor-modal-header-info">
                  <div className="visitor-modal-header-badges">
                    <span style={{
                      padding: '0.28rem 0.6rem',
                      borderRadius: '6px',
                      background: inspectingVisitor.device_type === 'mobile' ? 'rgba(245, 158, 11, 0.15)' : (inspectingVisitor.device_type === 'tablet' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.15)'),
                      color: inspectingVisitor.device_type === 'mobile' ? '#f59e0b' : (inspectingVisitor.device_type === 'tablet' ? '#a855f7' : '#3b82f6'),
                      fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                    }}>
                      {inspectingVisitor.device_type === 'mobile' ? <Smartphone size={14} /> : (inspectingVisitor.device_type === 'tablet' ? <Tablet size={14} /> : <Monitor size={14} />)}
                      {deviceType.toUpperCase()}
                    </span>

                    {b ? (
                      <span style={{
                        background: 'linear-gradient(135deg, rgba(239, 199, 25, 0.2), rgba(34, 197, 94, 0.2))',
                        border: '1px solid rgba(239, 199, 25, 0.45)',
                        color: '#fde047',
                        borderRadius: '6px',
                        padding: '0.28rem 0.6rem',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        boxShadow: '0 0 12px rgba(239, 199, 25, 0.18)'
                      }}>
                        <CheckCircle2 size={13} color="#4ade80" /> 🎯 BOOKING SUBMITTED: {b.name}
                      </span>
                    ) : (
                      <span style={{
                        background: isNew ? 'rgba(34, 197, 94, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                        color: isNew ? '#4ade80' : '#c084fc',
                        borderRadius: '6px',
                        padding: '0.28rem 0.6rem',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}>
                        {isNew ? '🌟 New Prospect' : '🔁 Returning Prospect'}
                      </span>
                    )}

                    {/* Platform Badge */}
                    {(() => {
                      const pInfo = getPlatformDetails(inspectingVisitor.platform);
                      return (
                        <span style={{
                          padding: '0.28rem 0.6rem',
                          borderRadius: '6px',
                          background: pInfo.bg,
                          color: pInfo.color,
                          border: `1px solid ${pInfo.border}`,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }} title={`Customer reached via ${pInfo.name}`}>
                          <span>{pInfo.icon}</span> {pInfo.name}
                        </span>
                      );
                    })()}

                    {/* Bot / Human Badge */}
                    {(() => {
                      const botInfo = getBotDetails(inspectingVisitor);
                      return (
                        <span style={{
                          padding: '0.28rem 0.6rem',
                          borderRadius: '6px',
                          background: botInfo.bg,
                          color: botInfo.color,
                          border: `1px solid ${botInfo.border}`,
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }} title={botInfo.name}>
                          <span>{botInfo.icon}</span> {botInfo.label}
                        </span>
                      );
                    })()}
                  </div>

                  <h2 className="visitor-modal-title">
                    Visitor &amp; Device Intelligence
                  </h2>
                  <p className="visitor-modal-subtitle">
                    Deep-dive hardware specifications, session history, live geolocation map, and booking record.
                  </p>
                </div>

                <div className="visitor-modal-header-actions">
                  {/* 1-Click Top Copy Dossier Action */}
                  <button
                    type="button"
                    onClick={() => copyDossier(inspectingVisitor)}
                    className="visitor-copy-btn"
                    style={{
                      background: copiedId === 'dossier_copy' ? '#16a34a' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '7px',
                      padding: '0.45rem 0.85rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.25)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    title="Copy ready-to-share dossier for WhatsApp, Slack, or Email"
                  >
                    {copiedId === 'dossier_copy' ? <Check size={14} color="#ffffff" /> : <Share2 size={14} />}
                    <span>{copiedId === 'dossier_copy' ? 'Dossier Copied!' : '📋 Copy Dossier'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingVisitor(null)}
                    className="visitor-close-btn"
                    title="Close Inspector (Esc)"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Dedicated Smooth Scrollable Body (Guarantees no section will ever be squashed) */}
              <div className="visitor-modal-body" ref={visitorModalBodyRef}>

                {/* Quick Metrics Strip */}
                <div className="visitor-modal-stat-grid">
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Device ID</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#60a5fa', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.2rem' }}>
                      <span>{devId}</span>
                      <button
                        onClick={() => copyToClipboard(devId, 'modal_dev')}
                        style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0 }}
                        title="Copy Device ID"
                      >
                        {copiedId === 'modal_dev' ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Sessions</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#4ade80', marginTop: '0.2rem' }}>
                      {totalVisits} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{totalVisits === 1 ? 'session' : 'sessions'}</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Visitor Status</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isNew ? '#4ade80' : '#c084fc', marginTop: '0.25rem' }}>
                      {isNew ? '🌟 New Visitor' : '🔁 Returning Visitor'}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Last Active</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                      {formatRelativeTime(inspectingVisitor.created_at)}
                    </div>
                  </div>
                </div>

                {/* 💼 Submitted Lead Info Section (Show device who filled the booking form) */}
                {b ? (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(34, 197, 94, 0.08))',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    borderRadius: '10px',
                    padding: '1.25rem',
                    boxShadow: '0 0 20px rgba(234, 179, 8, 0.08)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={18} color="#4ade80" />
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fef08a' }}>
                          💼 Submitted Booking & Lead Inquiry
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          background: 'rgba(234, 179, 8, 0.2)',
                          color: '#fef08a',
                          border: '1px solid rgba(234, 179, 8, 0.4)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px'
                        }}>
                          #WTP-{b.id}
                        </span>
                        <span style={{
                          background: b.payment_status === 'Paid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: b.payment_status === 'Paid' ? '#4ade80' : '#93c5fd',
                          border: '1px solid',
                          borderColor: b.payment_status === 'Paid' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px'
                        }}>
                          {(b.payment_status || 'Inquiry Received').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="visitor-lead-grid">
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Prospect Name & Client</span>
                        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>👤 {b.name}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Phone Number</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                          <a href={`tel:${b.phone}`} style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
                            📞 {b.phone}
                          </a>
                          {b.phone && (
                            <a
                              href={`https://wa.me/${String(b.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${b.name}, thank you for contacting Fitscalez Walkthrough!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: 'rgba(37, 211, 102, 0.15)',
                                border: '1px solid rgba(37, 211, 102, 0.35)',
                                color: '#25D366',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              WhatsApp ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Email Address</span>
                        <a href={`mailto:${b.email}`} style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}>
                          📧 {b.email || 'N/A'}
                        </a>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Service / Package</span>
                        <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>
                          🎯 {b.package_name || b.type || 'Custom Walkthrough'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Preferred Date & Slot</span>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>
                          📅 {b.booking_date || 'Flexible'}{b.time_slot ? ` at ${b.time_slot}` : ''}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Budget / Quoted Price</span>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                          💰 {b.budget || (b.price ? `₹${Number(b.price).toLocaleString('en-IN')}` : 'Standard')}
                        </span>
                      </div>
                    </div>

                    {b.message && (
                      <div style={{ marginTop: '0.85rem', background: 'rgba(0,0,0,0.25)', borderRadius: '6px', padding: '0.65rem 0.85rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', marginBottom: '0.2rem' }}>Message / Project Requirements</span>
                        <p style={{ margin: 0, color: '#f1f5f9', fontSize: '0.82rem', fontStyle: 'italic', lineHeight: 1.45, wordBreak: 'break-word' }}>"{b.message}"</p>
                      </div>
                    )}

                    <div style={{ marginTop: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <span>Submitted On: {formatDate(b.created_at)} ({formatRelativeTime(b.created_at)})</span>
                      <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Verified Device Lead</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>ℹ️</span>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>Active Browsing Prospect (No contact/booking form submitted yet)</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>This prospect is browsing your website. If they submit any inquiry form, their details will automatically link to this device profile.</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>Unconverted Visitor</span>
                  </div>
                )}

                {/* 🎯 Customer Reach Platform & Bot Telemetry Section */}
                <div style={{
                  background: 'rgba(236, 72, 153, 0.04)',
                  border: '1px solid rgba(236, 72, 153, 0.22)',
                  borderRadius: '10px',
                  padding: '1.25rem'
                }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                    <Share2 size={16} color="#ec4899" /> Customer Acquisition &amp; Attribution
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Customer Reach Platform</span>
                      {(() => {
                        const pInfo = getPlatformDetails(inspectingVisitor.platform);
                        return (
                          <span style={{
                            marginTop: '0.25rem',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: pInfo.bg,
                            color: pInfo.color,
                            border: `1px solid ${pInfo.border}`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '5px',
                            fontWeight: 700,
                            fontSize: '0.84rem'
                          }}>
                            <span>{pInfo.icon}</span> {pInfo.name}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Traffic Classification</span>
                      {(() => {
                        const botInfo = getBotDetails(inspectingVisitor);
                        return (
                          <span style={{
                            marginTop: '0.25rem',
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            background: botInfo.bg,
                            color: botInfo.color,
                            border: `1px solid ${botInfo.border}`,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '5px',
                            fontWeight: 700,
                            fontSize: '0.84rem'
                          }}>
                            <span>{botInfo.icon}</span> {botInfo.label}
                          </span>
                        );
                      })()}
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Marketing Campaign (UTM)</span>
                      <span style={{ marginTop: '0.25rem', display: 'block', color: inspectingVisitor.utm_campaign ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.84rem' }}>
                        {inspectingVisitor.utm_campaign || 'None (Direct / Organic)'}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>UTM Source &amp; Medium</span>
                      <span style={{ marginTop: '0.25rem', display: 'block', color: '#ffffff', fontWeight: 600, fontSize: '0.84rem' }}>
                        {[inspectingVisitor.utm_source, inspectingVisitor.utm_medium].filter(Boolean).join(' · ') || 'Organic / Unspecified'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 📍 Interactive Live Map Section */}
                <div className="visitor-map-card" style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '1rem', overflow: 'hidden', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <MapPin size={16} color="#3b82f6" />
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#ffffff' }}>Interactive Live Map</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({locationStr || 'Approximate Pin'})</span>
                    </div>
                    <a
                      href={mapDirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        color: '#60a5fa',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        textDecoration: 'none'
                      }}
                    >
                      Open in Google Maps ↗
                    </a>
                  </div>
                  <div className="visitor-map-frame">
                    <iframe
                      title="Visitor Location Map"
                      src={mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0, width: '100%', height: '100%', minHeight: '220px', display: 'block' }}
                      loading="lazy"
                      tabIndex="-1"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span>📍 Approximate physical location pin (IP Geolocation accuracy: ~5–15 km)</span>
                    {inspectingVisitor.latitude && inspectingVisitor.longitude && (
                      <span style={{ color: '#93c5fd', fontFamily: 'monospace' }}>GPS: {Number(inspectingVisitor.latitude).toFixed(4)}, {Number(inspectingVisitor.longitude).toFixed(4)}</span>
                    )}
                  </div>
                </div>

                {/* 🌍 Geolocation & Network Section */}
                <div style={{ background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                    <Globe size={16} color="#3b82f6" /> Geolocation & Network
                  </h4>

                  <div className="visitor-geo-grid">
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>City & State / Region</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{[inspectingVisitor.city, inspectingVisitor.region].filter(Boolean).join(', ') || 'Unknown'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Country</span>
                      <span style={{ color: '#ffffff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span>{countryFlag}</span>
                        <span>{inspectingVisitor.country || 'Unknown'}</span>
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Public IP Address</span>
                      <span style={{ color: '#ffffff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: 'monospace' }}>{inspectingVisitor.ip_address || 'Not Recorded'}</span>
                        {inspectingVisitor.ip_address && (
                          <button
                            onClick={() => copyToClipboard(inspectingVisitor.ip_address, 'modal_ip')}
                            style={{ background: 'transparent', border: 'none', color: '#93c5fd', cursor: 'pointer', padding: 0 }}
                            title="Copy IP Address"
                          >
                            {copiedId === 'modal_ip' ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                          </button>
                        )}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Internet Service Provider (ISP)</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                        📡 {inspectingVisitor.isp || 'Broadband / Cellular Provider'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 💻 Device & Hardware Section */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                    <Monitor size={16} color="#a855f7" /> Device & Hardware Specifications
                  </h4>

                  <div className="visitor-device-grid">
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Simple Device ID</span>
                      <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace' }}>{devId}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Device Type</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{deviceType}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Screen Resolution</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{inspectingVisitor.screen_resolution || 'Standard Viewport'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Operating System</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{inspectingVisitor.os || 'Unknown OS'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Web Browser</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{inspectingVisitor.browser || 'Web Browser'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Traffic Referrer</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{inspectingVisitor.referrer || 'Direct Traffic'}</span>
                    </div>
                  </div>
                </div>

                {/* 🔁 Visit History Section */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                    <History size={16} color="#f59e0b" /> Visit History
                  </h4>

                  <div className="visitor-history-grid">
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Total Sessions Count</span>
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>
                        {totalVisits} {totalVisits === 1 ? 'visit' : 'visits'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Visitor Status</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '0.15rem 0.45rem', borderRadius: '4px',
                        fontSize: '0.75rem', fontWeight: 700,
                        background: isNew ? 'rgba(34, 197, 94, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                        color: isNew ? '#4ade80' : '#c084fc'
                      }}>
                        {isNew ? '🌟 New Visitor' : '🔁 Returning Visitor'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>First Seen Date & Time</span>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>
                        {formatDate(inspectingVisitor.first_visit_at || inspectingVisitor.created_at)}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>Last Active Date & Time</span>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {formatDate(inspectingVisitor.created_at)} ({formatRelativeTime(inspectingVisitor.created_at)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🧭 Browsing Journey Timeline */}
                <div>
                  <h4 style={{ margin: '0 0 0.65rem 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ffffff' }}>
                    <Compass size={16} color="#10b981" /> Browsing Journey Timeline
                  </h4>

                  {loadingDeviceHistory ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading journey timeline...</p>
                  ) : deviceHistory.length === 0 ? (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Current session: <strong>{inspectingVisitor.path === '/' ? 'Home Page (/)' : inspectingVisitor.path}</strong> ({formatDate(inspectingVisitor.created_at)})
                    </div>
                  ) : (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {deviceHistory.map((item, idx) => (
                        <div key={item.id || idx} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem',
                          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '6px', padding: '0.5rem 0.75rem', fontSize: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                            <span style={{ color: 'var(--accent-orange)', fontWeight: 700, flexShrink: 0 }}>#{deviceHistory.length - idx}</span>
                            <span style={{ color: '#ffffff', fontWeight: 600, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {item.path === '/' ? 'Home Page (/)' : item.path}
                            </span>
                            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>· {item.browser || 'Web'}</span>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', flexShrink: 0 }}>
                            {formatDate(item.created_at)} ({formatRelativeTime(item.created_at)})
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ready-to-Share Summary Template Preview Box */}
                <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      📋 Ready-to-Share Summary (WhatsApp, Slack & Email)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyDossier(inspectingVisitor)}
                      style={{
                        background: copiedId === 'dossier_copy' ? '#16a34a' : 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#ffffff',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {copiedId === 'dossier_copy' ? <Check size={13} /> : <Copy size={13} />}
                      {copiedId === 'dossier_copy' ? 'Copied to Clipboard!' : 'Copy Summary Text'}
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '0.75rem',
                    background: '#070a12',
                    borderRadius: '6px',
                    color: '#94a3b8',
                    fontSize: '0.72rem',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    fontFamily: 'Consolas, Monaco, monospace',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {generateVisitorDossier(inspectingVisitor, deviceHistory)}
                  </pre>
                </div>

              </div> {/* Close visitor-modal-body */}

              {/* Pinned Footer Actions */}
              <div className="visitor-modal-footer">
                <button
                  type="button"
                  onClick={() => copyDossier(inspectingVisitor)}
                  className="btn-primary"
                  style={{ padding: '0.55rem 1.35rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', borderRadius: '6px' }}
                >
                  {copiedId === 'dossier_copy' ? <Check size={14} /> : <Share2 size={14} />}
                  <span>{copiedId === 'dossier_copy' ? 'Dossier Copied!' : '📋 Copy Dossier (WhatsApp / Slack)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingVisitor(null)}
                  className="btn-secondary"
                  style={{ padding: '0.55rem 1.35rem', fontSize: '0.82rem' }}
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        );
      })(), document.body)}



    </div>
  );
};

export default AdminDashboard;
