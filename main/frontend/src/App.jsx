import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from '@shared/components/Navbar';
import Footer from '@shared/components/Footer';
import DynamicBackground from '@shared/components/DynamicBackground';
import ScrollToTopButton from '@shared/components/ScrollToTopButton';
import InstantLeadModal from '@shared/components/InstantLeadModal';
import PageProgressBar from '@shared/components/PageProgressBar';
import BlueprintLoader from '@shared/components/BlueprintLoader';
import NotificationPrompt from '@shared/components/NotificationPrompt';
import SiteNotificationBanner from '@shared/components/SiteNotificationBanner';
import { SettingsProvider, useSettings } from '@shared/context/SettingsContext';
import { initPushNotifications } from '@shared/utils/pushNotifications';

// 1. Website Module
import Home from '@website/pages/Home';
const About = lazy(() => import('@website/pages/About'));
const Services = lazy(() => import('@website/pages/Services'));
const Franchise = lazy(() => import('@website/pages/Franchise'));
const Gallery = lazy(() => import('@website/pages/Gallery'));
const Blog = lazy(() => import('@website/pages/Blog'));
const BlogPost = lazy(() => import('@website/pages/BlogPost'));
const Career = lazy(() => import('@website/pages/Career'));
const TermsConditions = lazy(() => import('@website/pages/legal/TermsConditions'));
const PrivacyPolicy = lazy(() => import('@website/pages/legal/PrivacyPolicy'));
const LegalTabbedPages = lazy(() => import('@website/pages/legal/LegalTabbedPages'));

// 2. Admin Module
const AdminLogin = lazy(() => import('@admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@admin/pages/AdminDashboard'));
const FitscalezAdmin = lazy(() => import('@admin/pages/FitscalezAdmin'));
const PublicLeadsPanel = lazy(() => import('@admin/pages/PublicLeadsPanel'));

// 3. 3D Projection Studio
const ProjectionStudio = lazy(() => import('@studio/ProjectionStudio'));

const ScrollToTop = () => {
  const { pathname, state } = useLocation();
  useEffect(() => {
    if (state && state.scrollTo) {
      const element = document.getElementById(state.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState({}, document.title);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
};

const useScrollReveal = () => {
  const location = useLocation();
  useEffect(() => {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealElements.forEach(el => observer.observe(el));
    return () => { revealElements.forEach(el => observer.unobserve(el)); };
  }, [location.pathname]);
};

const usePageTracker = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/fitscalez') || path.startsWith('/projection')) return;
    try {
      let devId = localStorage.getItem('wtp_device_id');
      if (!devId || !/^DEV-\d{4,5}$/i.test(devId)) {
        let num;
        if (devId && /[0-9a-fA-F]+/i.test(devId)) {
          let hash = 0;
          for (let i = 0; i < devId.length; i++) hash = ((hash << 5) - hash + devId.charCodeAt(i)) | 0;
          num = 1000 + (Math.abs(hash) % 9000);
        } else {
          num = Math.floor(1000 + Math.random() * 9000);
        }
        devId = `DEV-${num}`;
        localStorage.setItem('wtp_device_id', devId);
      }
      let vid = localStorage.getItem('wtp_vid');
      if (!vid) {
        vid = 'v_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('wtp_vid', vid);
      }
      let sid = sessionStorage.getItem('wtp_sid');
      if (!sid) {
        sid = 's_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('wtp_sid', sid);
      }
      let visitCount = parseInt(localStorage.getItem('wtp_visit_count') || '0', 10);
      let lastVisitAt = localStorage.getItem('wtp_last_visit_at');
      if (!sessionStorage.getItem('wtp_session_active')) {
        sessionStorage.setItem('wtp_session_active', '1');
        visitCount += 1;
        localStorage.setItem('wtp_visit_count', String(visitCount));
        localStorage.setItem('wtp_last_visit_at', new Date().toISOString());
      }
      const ua = navigator.userAgent || '';
      const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isMobile = !isTablet && (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua) || (window.innerWidth <= 768 && 'ontouchstart' in window));
      const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
      let browser = 'Chrome';
      if (/edg/i.test(ua)) browser = 'Edge';
      else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
      else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
      else if (/opera|opr\//i.test(ua)) browser = 'Opera';
      let os = 'Other';
      if (/windows/i.test(ua)) os = 'Windows';
      else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
      else if (/android/i.test(ua)) os = 'Android';
      else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
      else if (/linux/i.test(ua)) os = 'Linux';
      const search = window.location.search || '';
      const urlParams = new URLSearchParams(search);
      const urlUtmSource = urlParams.get('utm_source') || urlParams.get('source') || urlParams.get('ref') || '';
      const urlUtmMedium = urlParams.get('utm_medium') || '';
      const urlUtmCampaign = urlParams.get('utm_campaign') || urlParams.get('campaign') || '';
      const refLower = (document.referrer || '').toLowerCase();
      const sLower = search.toLowerCase();
      const srcLower = urlUtmSource.toLowerCase();
      let detectedPlatform = 'Direct';
      if (refLower.includes('whatsapp') || sLower.includes('whatsapp') || srcLower === 'whatsapp' || /WhatsApp\//i.test(ua)) detectedPlatform = 'WhatsApp';
      else if (refLower.includes('facebook') || sLower.includes('fbclid') || srcLower === 'facebook' || /FBAN|FBAV/i.test(ua)) detectedPlatform = 'Facebook';
      else if (refLower.includes('instagram') || sLower.includes('igshid') || srcLower === 'instagram') detectedPlatform = 'Instagram';
      else if (sLower.includes('gclid') || (srcLower === 'google' && (urlUtmMedium === 'cpc' || urlUtmMedium === 'ppc'))) detectedPlatform = 'Google Ads';
      else if (refLower.includes('google.') || srcLower === 'google') detectedPlatform = 'Google Search';
      else if (refLower.includes('youtube.com') || srcLower === 'youtube') detectedPlatform = 'YouTube';
      else if (refLower.includes('linkedin.com') || srcLower === 'linkedin') detectedPlatform = 'LinkedIn';
      else if (document.referrer && !refLower.includes(window.location.hostname)) {
        try { detectedPlatform = `Referral (${new URL(document.referrer).hostname.replace(/^www\./, '')})`; } catch { detectedPlatform = 'Referral'; }
      }
      if (detectedPlatform !== 'Direct') {
        localStorage.setItem('wtp_platform', detectedPlatform);
        if (urlUtmSource) localStorage.setItem('wtp_utm_source', urlUtmSource);
        if (urlUtmCampaign) localStorage.setItem('wtp_utm_campaign', urlUtmCampaign);
      } else if (!localStorage.getItem('wtp_platform')) {
        localStorage.setItem('wtp_platform', 'Direct');
      }
      const activePlatform = (detectedPlatform !== 'Direct') ? detectedPlatform : (localStorage.getItem('wtp_platform') || 'Direct');
      const payload = JSON.stringify({
        device_id: devId, visitor_id: vid, session_id: sid, path,
        device_type: deviceType, browser, os,
        screen_resolution: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
        referrer: document.referrer || 'Direct', platform: activePlatform,
        utm_source: urlUtmSource || localStorage.getItem('wtp_utm_source') || '',
        utm_medium: urlUtmMedium,
        utm_campaign: urlUtmCampaign || localStorage.getItem('wtp_utm_campaign') || '',
        search, is_webdriver: navigator.webdriver === true,
        visit_count: visitCount, last_visit_at: lastVisitAt
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
      } else {
        fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch (e) {}
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (sessionStorage.getItem('wtp_push_init')) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem('wtp_push_init', '1');
      initPushNotifications();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
};

// Enterprise Handoff to Sales CRM Portal
const CRMHandoff = () => {
  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const defaultCrmUrl = isLocal ? 'http://localhost:5174' : 'https://frontend-ilot.vercel.app';
    const crmBase = import.meta.env.VITE_CRM_URL || defaultCrmUrl;
    window.location.replace(`${crmBase}/crm/login`);
  }, []);

  return <BlueprintLoader />;
};

const AppContent = () => {
  useScrollReveal();
  usePageTracker();
  const location = useLocation();
  const { isLeadModalOpen, leadModalStudio, openLeadModal, closeLeadModal } = useSettings();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/fitscalez') || location.pathname.startsWith('/projection') || location.pathname.startsWith('/crm');

  useEffect(() => {
    if (isAdminRoute) return;
    try {
      const hasSeenFirstVisitPopup = localStorage.getItem('wtp_auto_appointment_shown');
      const hasBooked = localStorage.getItem('wtp_has_booked') === '1';
      if (!hasSeenFirstVisitPopup && !hasBooked) {
        localStorage.setItem('wtp_auto_appointment_shown', '1');
        const timer = setTimeout(() => { openLeadModal('Gurugram HQ'); }, 600);
        return () => clearTimeout(timer);
      }
    } catch (e) {}
  }, [isAdminRoute, openLeadModal]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
      <PageProgressBar />
      <ScrollToTop />
      {!isAdminRoute && <Navbar onOpenBooking={() => openLeadModal()} />}
      <main
        key={location.pathname}
        className="page-change-wrapper"
        style={{ flex: 1, paddingTop: isAdminRoute ? '0' : '80px', display: 'flex', flexDirection: 'column' }}
      >
        <Suspense fallback={<BlueprintLoader />}>
          <Routes>
            <Route path="/" element={<Home onOpenBooking={openLeadModal} />} />
            <Route path="/about" element={<About onOpenBooking={openLeadModal} />} />
            <Route path="/services" element={<Services onOpenBooking={openLeadModal} />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<LegalTabbedPages />} />
            <Route path="/shipping" element={<LegalTabbedPages />} />
            <Route path="/careers" element={<Career />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/fitscalez" element={<FitscalezAdmin />} />
            <Route path="/fitscalez/login" element={<Navigate to="/fitscalez" replace />} />
            <Route path="/fitscalez/crm" element={<CRMHandoff />} />
            <Route path="/crm" element={<CRMHandoff />} />
            <Route path="/crm/*" element={<CRMHandoff />} />
            <Route path="/login" element={<Navigate to="/fitscalez" replace />} />
            <Route path="/admin" element={<PublicLeadsPanel />} />
            <Route path="/contact" element={<Home forceContactScroll={true} onOpenBooking={openLeadModal} />} />
            <Route path="/projection" element={<ProjectionStudio />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer onOpenBooking={openLeadModal} />}
      {!isAdminRoute && <ScrollToTopButton />}
      {!isAdminRoute && <SiteNotificationBanner />}
      {!isAdminRoute && <NotificationPrompt />}
      {!isAdminRoute && (
        <InstantLeadModal
          isOpen={isLeadModalOpen}
          onClose={closeLeadModal}
          initialStudio={leadModalStudio}
        />
      )}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <SettingsProvider>
        <DynamicBackground />
        <AppContent />
      </SettingsProvider>
    </Router>
  );
};

export default App;

